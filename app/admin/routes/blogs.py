"""
📝 Blogs Management Routes
Quản lý tin tức/blog với SEO optimization đầy đủ

FEATURES:
- WYSIWYG Editor (CKEditor) với upload ảnh inline
- SEO Score real-time (API endpoint)
- Focus Keyword tracking
- Reading time auto-calculate
- Meta tags optimization
- SEO checklist với recommendations

SEO FIELDS:
- focus_keyword: Từ khóa chính (để tính SEO score)
- meta_title: SEO title (50-60 ký tự tối ưu)
- meta_description: Meta description (120-160 ký tự)
- meta_keywords: Keywords (optional, ít quan trọng)

SEO SCORING (100 điểm):
1. Title SEO (20đ): Độ dài + có keyword
2. Meta Description (15đ): Độ dài + có keyword
3. Focus Keyword (25đ): Mật độ + vị trí + heading
4. Content Length (15đ): Số từ (tối thiểu 500)
5. Image SEO (10đ): Alt text có keyword
6. Internal Links (10đ): Link đến bài khác
7. Structure (5đ): Headings (H2, H3, ...)

🔒 Permissions:
- view_blogs: Xem danh sách
- create_blog: Tạo bài mới
- edit_all_blogs: Sửa tất cả bài
- delete_blog: Xóa bài

📝 AUTO FEATURES:
- Reading time tự động tính (200 từ/phút)
- Word count tự động
- SEO score cache 1 giờ (để tránh tính lại mỗi lần load)

API ENDPOINTS:
- POST /admin/api/check-blog-seo: Check SEO real-time khi đang viết
"""

from flask import render_template, request, flash, redirect, url_for, jsonify
from app import db
from app.models.content import Blog
from app.forms.content import BlogForm
from app.decorators import permission_required
from app.admin import admin_bp
from app.admin.utils.helpers import get_image_from_form
from flask_login import login_user, logout_user, login_required, current_user



# ==================== LIST ====================
@admin_bp.route('/blogs')
@permission_required('view_blogs')
def blogs():
    """
    📋 Danh sách blog
    - Phân trang 20 items/page
    - Sắp xếp theo created_at (mới nhất)
    - Hiển thị SEO score badge
    """
    page = request.args.get('page', 1, type=int)
    blogs = Blog.query.order_by(Blog.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    return render_template('admin/tin_tuc/blogs.html', blogs=blogs)



# ==================== ADD ====================
@admin_bp.route('/blogs/add', methods=['GET', 'POST'])
@permission_required('create_blog')
def add_blog():
    form = BlogForm()

    if form.validate_on_submit():
        image_path = get_image_from_form(form.image, 'image', folder='blogs')

        blog = Blog(
            title=form.title.data,
            slug=form.slug.data,
            excerpt=form.excerpt.data,
            content=form.content.data,
            image=image_path,
            author=form.author.data or current_user.username,
            is_featured=form.is_featured.data,
            is_active=form.is_active.data,
        )

        db.session.add(blog)
        db.session.commit()

        flash('✓ Đã thêm bài viết thành công!', 'success')

        return redirect(url_for('admin.blogs'))

    return render_template('admin/tin_tuc/blog_form.html', form=form, title='Thêm bài viết')



# ==================== EDIT ====================
@admin_bp.route('/blogs/edit/<int:id>', methods=['GET', 'POST'])
@permission_required('edit_all_blogs')
def edit_blog(id):
    blog = Blog.query.get_or_404(id)
    form = BlogForm(obj=blog)

    if form.validate_on_submit():
        new_image = get_image_from_form(form.image, 'image', folder='blogs')
        if new_image:
            blog.image = new_image

        blog.title = form.title.data
        blog.slug = form.slug.data
        blog.excerpt = form.excerpt.data
        blog.content = form.content.data
        blog.author = form.author.data
        blog.is_featured = form.is_featured.data
        blog.is_active = form.is_active.data

        db.session.commit()

        flash('✓ Đã cập nhật bài viết thành công!', 'success')

        return redirect(url_for('admin.blogs'))

    return render_template('admin/tin_tuc/blog_form.html', form=form, title='Sửa bài viết', blog=blog)


# ==================== DELETE ====================
@admin_bp.route('/blogs/delete/<int:id>')
@permission_required('delete_blog')
def delete_blog(id):
    """
    🗑️ Xóa blog

    Note: Không xóa ảnh (giữ trong Media Library)
    """
    blog = Blog.query.get_or_404(id)
    db.session.delete(blog)
    db.session.commit()

    flash('Đã xóa bài viết thành công!', 'success')
    return redirect(url_for('admin.blogs'))
