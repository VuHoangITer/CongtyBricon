"""
🛍️ Products Management Routes
- List products
- Add/Edit/Delete products
- Hỗ trợ thông tin kỹ thuật (composition, technical_specs, ...)

🔒 Permissions:
- view_products: Xem sản phẩm
- manage_products: CRUD sản phẩm
"""

from flask import render_template, request, flash, redirect, url_for
from app import db
from app.models.product import Product
from app.forms.product import ProductForm
from app.decorators import permission_required
from app.admin import admin_bp
from app.admin.utils.helpers import get_image_from_form

# ==================== QUẢN LÝ SẢN PHẨM ====================
@admin_bp.route('/products')
@permission_required('view_products')  # ✅ Xem sản phẩm
def products():
    """Danh sách sản phẩm"""
    page = request.args.get('page', 1, type=int)
    products = Product.query.order_by(Product.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    return render_template('admin/san_pham/products.html', products=products)


@admin_bp.route('/products/add', methods=['GET', 'POST'])
@permission_required('manage_products')
def add_product():
    """Thêm sản phẩm mới với thông tin kỹ thuật"""
    form = ProductForm()

    if form.validate_on_submit():
        # ========== XỬ LÝ HÌNH ẢNH ==========
        image_path = get_image_from_form(form.image, 'image', folder='products')

        # ========== TẠO SẢN PHẨM MỚI ==========
        product = Product(
            name=form.name.data,
            slug=form.slug.data,
            description=form.description.data,
            price=form.price.data,
            old_price=form.old_price.data,
            category_id=form.category_id.data,
            image=image_path,
            is_featured=form.is_featured.data,
            is_active=form.is_active.data
        )

        # ========== ✅ XỬ LÝ THÔNG TIN KỸ THUẬT ==========

        # 1. Thành phần (composition) - chuyển textarea thành list
        if form.composition.data:
            composition_lines = [line.strip() for line in form.composition.data.split('\n') if line.strip()]
            product.composition = composition_lines  # Lưu dạng JSON array

        # 2. Quy trình sản xuất (production) - lưu text thuần
        product.production = form.production.data if form.production.data else None

        # 3. Ứng dụng (application) - chuyển textarea thành list
        if form.application.data:
            application_lines = [line.strip() for line in form.application.data.split('\n') if line.strip()]
            product.application = application_lines  # Lưu dạng JSON array

        # 4. Hạn sử dụng (expiry) - string
        product.expiry = form.expiry.data if form.expiry.data else None

        # 5. Quy cách đóng gói (packaging) - string
        product.packaging = form.packaging.data if form.packaging.data else None

        # 6. Màu sắc (colors) - chuyển textarea thành list
        if form.colors.data:
            colors_lines = [line.strip() for line in form.colors.data.split('\n') if line.strip()]
            product.colors = colors_lines  # Lưu dạng JSON array

        # 7. Tiêu chuẩn (standards) - string
        product.standards = form.standards.data if form.standards.data else None

        # 8. Thông số kỹ thuật (technical_specs) - parse "key: value" thành dict
        if form.technical_specs.data:
            specs_dict = {}
            for line in form.technical_specs.data.split('\n'):
                line = line.strip()
                if ':' in line:
                    key, value = line.split(':', 1)
                    specs_dict[key.strip()] = value.strip()
            product.technical_specs = specs_dict if specs_dict else None  # Lưu dạng JSON object

        # ========== LƯU VÀO DATABASE ==========
        try:
            db.session.add(product)
            db.session.commit()
            flash(f'✅ Đã thêm sản phẩm "{product.name}" thành công!', 'success')
            return redirect(url_for('admin.products'))
        except Exception as e:
            db.session.rollback()
            flash(f'❌ Lỗi lưu sản phẩm: {str(e)}', 'danger')

    return render_template('admin/san_pham/product_form.html', form=form, title='Thêm sản phẩm')


@admin_bp.route('/products/edit/<int:id>', methods=['GET', 'POST'])
@permission_required('manage_products')
def edit_product(id):
    """Sửa sản phẩm với thông tin kỹ thuật"""
    product = Product.query.get_or_404(id)
    form = ProductForm(obj=product)

    if form.validate_on_submit():
        # ========== XỬ LÝ HÌNH ẢNH ==========
        new_image = get_image_from_form(form.image, 'image', folder='products')
        if new_image:
            product.image = new_image

        # ========== CẬP NHẬT THÔNG TIN CƠ BẢN ==========
        product.name = form.name.data
        product.slug = form.slug.data
        product.description = form.description.data
        product.price = form.price.data
        product.old_price = form.old_price.data
        product.category_id = form.category_id.data
        product.is_featured = form.is_featured.data
        product.is_active = form.is_active.data

        # ========== ✅ CẬP NHẬT THÔNG TIN KỸ THUẬT ==========

        # 1. Thành phần
        if form.composition.data:
            composition_lines = [line.strip() for line in form.composition.data.split('\n') if line.strip()]
            product.composition = composition_lines
        else:
            product.composition = None

        # 2. Quy trình sản xuất
        product.production = form.production.data if form.production.data else None

        # 3. Ứng dụng
        if form.application.data:
            application_lines = [line.strip() for line in form.application.data.split('\n') if line.strip()]
            product.application = application_lines
        else:
            product.application = None

        # 4-7. Các trường text đơn giản
        product.expiry = form.expiry.data if form.expiry.data else None
        product.packaging = form.packaging.data if form.packaging.data else None
        product.standards = form.standards.data if form.standards.data else None

        # 8. Màu sắc
        if form.colors.data:
            colors_lines = [line.strip() for line in form.colors.data.split('\n') if line.strip()]
            product.colors = colors_lines
        else:
            product.colors = None

        # 9. Thông số kỹ thuật
        if form.technical_specs.data:
            specs_dict = {}
            for line in form.technical_specs.data.split('\n'):
                line = line.strip()
                if ':' in line:
                    key, value = line.split(':', 1)
                    specs_dict[key.strip()] = value.strip()
            product.technical_specs = specs_dict if specs_dict else None
        else:
            product.technical_specs = None

        # ========== LƯU VÀO DATABASE ==========
        try:
            db.session.commit()
            flash(f'✅ Đã cập nhật sản phẩm "{product.name}" thành công!', 'success')
            return redirect(url_for('admin.products'))
        except Exception as e:
            db.session.rollback()
            flash(f'❌ Lỗi cập nhật: {str(e)}', 'danger')

    # ========== ✅ LOAD DỮ LIỆU KHI EDIT (GET REQUEST) ==========
    if request.method == 'GET':
        # Load thông tin cơ bản (đã có sẵn từ obj=product)

        # Load thông tin kỹ thuật - CHUYỂN TỪ JSON SANG TEXT

        # Composition (list → textarea)
        if product.composition:
            if isinstance(product.composition, list):
                form.composition.data = '\n'.join(product.composition)
            else:
                form.composition.data = product.composition

        # Production (text)
        form.production.data = product.production

        # Application (list → textarea)
        if product.application:
            if isinstance(product.application, list):
                form.application.data = '\n'.join(product.application)
            else:
                form.application.data = product.application

        # Expiry, Packaging, Standards (string)
        form.expiry.data = product.expiry
        form.packaging.data = product.packaging
        form.standards.data = product.standards

        # Colors (list → textarea)
        if product.colors:
            if isinstance(product.colors, list):
                form.colors.data = '\n'.join(product.colors)
            else:
                form.colors.data = product.colors

        # Technical specs (dict → textarea với format "key: value")
        if product.technical_specs:
            if isinstance(product.technical_specs, dict):
                specs_lines = [f"{k}: {v}" for k, v in product.technical_specs.items()]
                form.technical_specs.data = '\n'.join(specs_lines)
            else:
                form.technical_specs.data = product.technical_specs

    return render_template('admin/san_pham/product_form.html', form=form, title=f'Sửa sản phẩm: {product.name}', product=product)


@admin_bp.route('/products/delete/<int:id>')
@permission_required('manage_products')  # ✅ Quản lý sản phẩm
def delete_product(id):
    """Xóa sản phẩm"""
    product = Product.query.get_or_404(id)
    db.session.delete(product)
    db.session.commit()

    flash('Đã xóa sản phẩm thành công!', 'success')
    return redirect(url_for('admin.products'))