from flask import render_template, request, redirect, url_for
from app.main import main_bp
from app import db
from app.models.content import Blog, FAQ
from app.models.settings import get_setting
from sqlalchemy import or_
from sqlalchemy.orm import joinedload, load_only


@main_bp.route('/tin-tuc')
def blog():
    """Trang danh sách blog"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')

    # Query
    query = (Blog.query
             .options(
        joinedload(Blog.author_obj),
        load_only(
            Blog.id, Blog.slug, Blog.title, Blog.excerpt, Blog.image,
            Blog.created_at, Blog.updated_at, Blog.views, Blog.author, Blog.is_featured
        )
    )
             .filter_by(is_active=True)
             )

    # Search
    if search:
        query = query.filter(
            or_(
                Blog.title.ilike(f'%{search}%'),
                Blog.excerpt.ilike(f'%{search}%')
            )
        )

    # Sắp xếp mới nhất
    query = query.order_by(Blog.created_at.desc())

    # Phân trang
    per_page = 9

    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    blogs = pagination.items

    # Bài viết nổi bật sidebar
    featured_blogs = (Blog.query
                      .options(load_only(Blog.slug, Blog.title, Blog.created_at, Blog.views, Blog.image))
                      .filter_by(is_featured=True, is_active=True)
                      ).limit(5).all()

    return render_template('public/tin_tuc/blogs.html',
                           blogs=blogs,
                           pagination=pagination,
                           featured_blogs=featured_blogs,
                           current_search=search)


@main_bp.route('/tin-tuc/<slug>')
def blog_detail(slug):
    """Trang chi tiết blog"""
    blog = (Blog.query
            .options(joinedload(Blog.author_obj))
            .filter_by(slug=slug, is_active=True)
            ).first_or_404()

    # Tăng lượt xem
    blog.views += 1
    db.session.commit()

    # Bài viết liên quan
    related_blogs = (Blog.query
                     .options(load_only(Blog.slug, Blog.title, Blog.created_at, Blog.image))
                     .filter(Blog.id != blog.id, Blog.is_active == True)
                     .order_by(Blog.created_at.desc())
                     ).limit(3).all()

    return render_template('public/tin_tuc/blog_detail.html',
                           blog=blog,
                           related_blogs=related_blogs)


@main_bp.route('/cau-hoi-thuong-gap')
def faq():
    """Trang câu hỏi thường gặp"""
    faqs = FAQ.query.filter_by(is_active=True).order_by(FAQ.order).all()
    return render_template('public/faq.html', faqs=faqs)
