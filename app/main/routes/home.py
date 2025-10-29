from http.client import error

from flask import render_template
from app.main import main_bp
from app.models import Settings
from app.models.product import Product
from app.models.media import Banner, Project
from app.models.content import Blog
from sqlalchemy.orm import load_only
from app.models.settings import get_setting


@main_bp.route('/')
def index():
    """Trang chủ"""
    # Lấy banners đang active
    banners = Banner.query.filter_by(is_active=True).order_by(Banner.order).all()

    # Lấy sản phẩm nổi bật (featured)
    featured_products = Product.query.filter_by(
        is_featured=True,
        is_active=True
    ).limit(6).all()

    # Lấy sản phẩm mới nhất
    latest_products = Product.query.filter_by(
        is_active=True
    ).order_by(Product.created_at.desc()).limit(6).all()

    # Lấy tin tức nổi bật
    featured_blogs = (Blog.query
                      .options(load_only(Blog.slug, Blog.title, Blog.created_at, Blog.image))
                      .filter_by(is_featured=True, is_active=True)
                      ).limit(3).all()

    featured_projects = Project.query.filter_by(is_featured=True, is_active=True).order_by(
        Project.created_at.desc()).limit(6).all()

    return render_template('public/index.html',
                           banners=banners,
                           featured_products=featured_products,
                           latest_products=latest_products,
                           featured_blogs=featured_blogs,
                           featured_projects=featured_projects)


@main_bp.route('/gioi-thieu')
def about():
    """Trang giới thiệu"""
    return render_template('public/about.html')


@main_bp.route('/chinh-sach', defaults={'policy_slug': None})
@main_bp.route('/chinh-sach/<policy_slug>')
def policy(policy_slug):
    """
    Hiển thị trang chính sách.
    Nếu có policy_slug, chỉ hiển thị chính sách đó.
    Nếu không, hiển thị chính sách đầu tiên có nội dung.
    """
    # Lấy tất cả các cài đặt chính sách từ DB
    all_policies_settings = {
        'dieu-khoan-dich-vu': {
            'name': 'Điều khoản dịch vụ',
            'icon': 'bi-file-earmark-text',
            'content': get_setting('terms_of_service', '')
        },
        'van-chuyen': {
            'name': 'Chính sách vận chuyển',
            'icon': 'bi-truck',
            'content': get_setting('shipping_policy', '')
        },
        'doi-tra': {
            'name': 'Chính sách đổi trả',
            'icon': 'bi-arrow-repeat',
            'content': get_setting('return_policy', '')
        },
        'bao-hanh': {
            'name': 'Chính sách bảo hành',
            'icon': 'bi-shield-check',
            'content': get_setting('warranty_policy', '')
        },
        'bao-mat': {
            'name': 'Chính sách bảo mật',
            'icon': 'bi-lock',
            'content': get_setting('privacy_policy', '')
        }
    }

    # Chỉ giữ lại các chính sách có nội dung
    available_policies = {
        slug: data for slug, data in all_policies_settings.items() if data['content']
    }

    # Nếu không có chính sách nào, hiển thị trang trống
    if not available_policies:
        return render_template('public/policy.html', policies={}, active_policy_slug=None, active_policy_data=None)

    # Nếu không có slug nào được cung cấp, chọn slug đầu tiên làm mặc định
    if policy_slug is None:
        active_policy_slug = next(iter(available_policies))
    else:
        active_policy_slug = policy_slug

    active_policy_data = available_policies[active_policy_slug]

    return render_template(
        'public/policy.html',
        policies=available_policies,
        active_policy_slug=active_policy_slug,
        active_policy_data=active_policy_data
    )
