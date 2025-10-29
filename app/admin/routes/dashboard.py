"""
📊 Enhanced Dashboard & Welcome Routes
- Dashboard: Cho Admin/Editor với analytics đầy đủ
- Welcome: Cho User thường
"""

from flask import render_template, redirect, url_for, jsonify
from flask_login import login_required, current_user
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app import db
from app.models.product import Product, Category
from app.models.content import Blog, FAQ
from app.models.contact import Contact
from app.models.media import Media, Banner, Project
from app.models.job import Job
from app.models.quiz import Quiz, QuizAttempt
from app.decorators import permission_required
from app.admin import admin_bp
from app.utils import get_vn_now

# ==================== DASHBOARD ====================
@admin_bp.route('/dashboard')
@permission_required('view_dashboard')
def dashboard():
    """
    Dashboard đầy đủ - CHỈ cho Admin & Editor
    Với analytics nâng cao và biểu đồ
    """
    # Kiểm tra quyền - chỉ Admin/Editor vào được
    if not current_user.has_any_permission('manage_users', 'manage_products', 'manage_categories'):
        return redirect(url_for('admin.welcome'))

    # ==================== BASIC STATS ====================
    stats = {
        'products': Product.query.count(),
        'categories': Category.query.count(),
        'blogs': Blog.query.count(),
        'contacts_unread': Contact.query.filter_by(is_read=False).count(),
        'projects': Project.query.count(),
        'faqs': FAQ.query.filter_by(is_active=True).count(),
        'jobs': Job.query.filter_by(is_active=True).count(),
        'media': Media.query.count(),
        'quizzes': Quiz.query.filter_by(is_active=True).count(),
    }

    # ==================== TREND CALCULATIONS ====================
    now = get_vn_now()
    last_month_start = now.replace(day=1) - timedelta(days=1)
    last_month_start = last_month_start.replace(day=1)
    this_month_start = now.replace(day=1)

    def calculate_trend(model, date_field='created_at'):
        """Tính % tăng/giảm so với tháng trước"""
        this_month = model.query.filter(
            getattr(model, date_field) >= this_month_start
        ).count()

        last_month = model.query.filter(
            getattr(model, date_field) >= last_month_start,
            getattr(model, date_field) < this_month_start
        ).count()

        if last_month == 0:
            return 100 if this_month > 0 else 0

        trend = ((this_month - last_month) / last_month) * 100
        return round(trend, 1)

    trends = {
        'products': calculate_trend(Product),
        'blogs': calculate_trend(Blog),
        'contacts': calculate_trend(Contact),
        'projects': calculate_trend(Project),
    }

    # ==================== RECENT ITEMS ====================
    recent_products = Product.query.order_by(desc(Product.created_at)).limit(5).all()
    recent_contacts = Contact.query.order_by(desc(Contact.created_at)).limit(5).all()
    recent_blogs = Blog.query.order_by(desc(Blog.created_at)).limit(5).all()

    # ==================== ACTIVITY TIMELINE ====================
    # Combine recent activities from different models
    activities = []

    # Products
    for p in Product.query.order_by(desc(Product.created_at)).limit(3).all():
        activities.append({
            'type': 'product',
            'icon': 'bi-box-seam',
            'color': 'warning',
            'title': f'Sản phẩm mới: {p.name}',
            'time': p.created_at,
            'link': url_for('admin.edit_product', id=p.id)
        })

    # Blogs
    for b in Blog.query.order_by(desc(Blog.created_at)).limit(3).all():
        activities.append({
            'type': 'blog',
            'icon': 'bi-newspaper',
            'color': 'info',
            'title': f'Bài viết mới: {b.title}',
            'time': b.created_at,
            'link': url_for('admin.edit_blog', id=b.id)
        })

    # Contacts
    for c in Contact.query.order_by(desc(Contact.created_at)).limit(3).all():
        activities.append({
            'type': 'contact',
            'icon': 'bi-envelope',
            'color': 'danger' if not c.is_read else 'secondary',
            'title': f'Liên hệ từ: {c.name}',
            'time': c.created_at,
            'link': url_for('admin.view_contact', id=c.id)
        })

    # Sort by time and take top 10
    activities.sort(key=lambda x: x['time'], reverse=True)
    activities = activities[:10]

    # ==================== TOP PERFORMERS ====================
    top_products = Product.query.order_by(desc(Product.views)).limit(5).all()
    top_blogs = Blog.query.order_by(desc(Blog.views)).limit(5).all()

    # ==================== CATEGORY DISTRIBUTION ====================
    category_stats = db.session.query(
        Category.name,
        func.count(Product.id).label('count')
    ).outerjoin(Product).group_by(Category.id, Category.name).all()

    # ==================== BLOG VIEWS CHART (7 days) ====================
    seven_days_ago = now - timedelta(days=7)
    blog_views_data = []

    for i in range(7):
        date = seven_days_ago + timedelta(days=i)
        # Đơn giản hóa: lấy số blog created trong ngày đó
        count = Blog.query.filter(
            func.date(Blog.created_at) == date.date()
        ).count()
        blog_views_data.append({
            'date': date.strftime('%d/%m'),
            'count': count
        })

    # ==================== CONTACT STATS (4 weeks) - CẢI TIẾN ====================
    def get_week_label(weeks_ago):
        """Tạo nhãn tuần với khoảng ngày cụ thể"""
        # Tính ngày bắt đầu tuần (Thứ 2)
        week_start = now - timedelta(days=now.weekday() + (weeks_ago * 7))
        # Ngày kết thúc tuần (Chủ nhật)
        week_end = week_start + timedelta(days=6)

        return f"{week_start.strftime('%d/%m')} - {week_end.strftime('%d/%m')}"

    contact_weekly = []

    for i in range(4):
        # Tính khoảng thời gian của tuần
        week_start = now - timedelta(days=now.weekday() + ((3-i) * 7))
        week_end = week_start + timedelta(days=7)

        # Đếm số liên hệ trong tuần đó
        count = Contact.query.filter(
            Contact.created_at >= week_start,
            Contact.created_at < week_end
        ).count()

        contact_weekly.append({
            'week': get_week_label(3-i),  # Tạo nhãn dạng "21/10 - 27/10"
            'count': count
        })

    return render_template('admin/dashboard.html',
                         stats=stats,
                         trends=trends,
                         recent_products=recent_products,
                         recent_contacts=recent_contacts,
                         recent_blogs=recent_blogs,
                         activities=activities,
                         top_products=top_products,
                         top_blogs=top_blogs,
                         category_stats=category_stats,
                         blog_views_data=blog_views_data,
                         contact_weekly=contact_weekly)


# ==================== WELCOME USER ====================
@admin_bp.route('/welcome')
@login_required
def welcome():
    """Trang chào mừng cho User thường"""
    if current_user.has_any_permission('manage_users', 'manage_products', 'manage_categories'):
        return redirect(url_for('admin.dashboard'))

    total_contacts = 0
    if current_user.has_any_permission('view_contacts', 'manage_contacts'):
        total_contacts = Contact.query.filter_by(is_read=False).count()

    return render_template('admin/auth/welcome.html', total_contacts=total_contacts)