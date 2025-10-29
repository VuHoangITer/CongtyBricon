from flask import render_template, request, redirect, url_for, flash
from app.main import main_bp
from app import db
from app.models.product import Product, Category
from app.models.settings import get_setting
from sqlalchemy.orm import joinedload, load_only
from jinja2 import Template
from datetime import datetime, timedelta


@main_bp.route('/san-pham')
@main_bp.route('/loai-san-pham/<category_slug>')
def products(category_slug=None):
    """Trang danh sách sản phẩm với filter"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    sort = request.args.get('sort', 'latest')

    # Xử lý backward compatibility cho URL cũ
    old_category_id = request.args.get('category', type=int)
    if old_category_id:
        category = Category.query.get(old_category_id)
        if category and category.is_active:
            # Redirect 301 (permanent) đến URL mới với slug
            return redirect(url_for('main.products',
                                    category_slug=category.slug,
                                    search=search if search else None,
                                    sort=sort if sort != 'latest' else None,
                                    page=page if page > 1 else None),
                            code=301)
        elif not category:
            # Category không tồn tại, chuyển về trang products chung
            flash('Danh mục không tồn tại.', 'warning')
            return redirect(url_for('main.products'))

    # Redirect URL cũ /products sang /san-pham
    if request.path == '/products' or request.path.startswith('/products/category/'):
        # Lấy category_slug từ path cũ nếu có
        old_path_parts = request.path.split('/')
        if len(old_path_parts) > 3 and old_path_parts[2] == 'category':
            old_slug = old_path_parts[3]
            return redirect(url_for('main.products',
                                    category_slug=old_slug,
                                    search=search if search else None,
                                    sort=sort if sort != 'latest' else None,
                                    page=page if page > 1 else None),
                            code=301)
        else:
            return redirect(url_for('main.products',
                                    search=search if search else None,
                                    sort=sort if sort != 'latest' else None,
                                    page=page if page > 1 else None),
                            code=301)

    # Query cơ bản
    query = Product.query.options(joinedload(Product.category)).filter_by(is_active=True)
    current_category = None

    # Filter theo danh mục slug
    if category_slug:
        current_category = Category.query.filter_by(
            slug=category_slug,
            is_active=True
        ).first_or_404()
        query = query.filter_by(category_id=current_category.id)

    # Search theo tên
    if search:
        query = query.filter(Product.name.ilike(f'%{search}%'))

    # Sắp xếp
    if sort == 'latest':
        query = query.order_by(Product.created_at.desc())
    elif sort == 'price_asc':
        query = query.order_by(Product.price.asc())
    elif sort == 'price_desc':
        query = query.order_by(Product.price.desc())
    elif sort == 'popular':
        query = query.order_by(Product.views.desc())

    # Phân trang
    per_page = 6

    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    products = pagination.items
    categories = Category.query.filter_by(is_active=True).all()

    return render_template('public/san_pham/products.html',
                           products=products,
                           categories=categories,
                           pagination=pagination,
                           current_category=current_category,
                           current_search=search,
                           current_sort=sort)


@main_bp.route('/san-pham/<slug>')
def product_detail(slug):
    """Trang chi tiết sản phẩm với render động meta description"""
    product = Product.query.options(joinedload(Product.category)) \
        .filter_by(slug=slug, is_active=True).first_or_404()

    # Tăng lượt xem
    product.views += 1
    db.session.commit()

    # Lấy sản phẩm liên quan (cùng danh mục)
    related_products = Product.query.options(joinedload(Product.category)) \
        .filter(
        Product.category_id == product.category_id,
        Product.id != product.id,
        Product.is_active == True
    ).limit(4).all()

    # ✅ XỬ LÝ META DESCRIPTION ĐỘNG
    rendered_meta_description = None

    # Lấy template từ settings
    meta_template = get_setting('product_meta_description', '')

    if meta_template and ('{{' in meta_template or '{%' in meta_template):
        try:
            # Render template với context đầy đủ
            template = Template(meta_template)
            rendered_meta_description = template.render(
                product=product,
                get_setting=get_setting
            )
        except Exception as e:
            # Fallback: Simple string replace nếu template lỗi
            print(f"⚠️ Lỗi render meta template: {e}")
            rendered_meta_description = meta_template.replace('{{ product.name }}', product.name or '')
            rendered_meta_description = rendered_meta_description.replace(
                '{{ get_setting(\'website_name\', \'BRICON VIỆT NAM\') }}',
                get_setting('website_name', 'BRICON VIỆT NAM'))
    elif meta_template:
        # Template không có biến động
        rendered_meta_description = meta_template
    else:
        # Fallback mặc định nếu không có template
        rendered_meta_description = f"Mua {product.name} chất lượng cao từ {get_setting('website_name', 'BRICON VIỆT NAM')} với giá tốt nhất."

    return render_template('public/san_pham/product_detail.html',
                           product=product,
                           related_products=related_products,
                           rendered_meta_description=rendered_meta_description,
                           now=datetime.now(),
                           timedelta=timedelta)