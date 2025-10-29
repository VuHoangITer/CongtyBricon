from app import db
from datetime import datetime


# ==================== CATEGORY MODEL ====================
class Category(db.Model):
    """Model danh mục sản phẩm"""
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    image = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship với Product
    products = db.relationship('Product', backref='category', lazy='dynamic')

    def __repr__(self):
        return f'<Category {self.name}>'


# ==================== PRODUCT MODEL ====================
class Product(db.Model):
    """Model sản phẩm"""
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, default=0)
    old_price = db.Column(db.Float)
    image = db.Column(db.String(255))
    images = db.Column(db.Text)  # JSON string chứa nhiều ảnh
    is_featured = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    views = db.Column(db.Integer, default=0)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Legacy SEO fields
    image_alt_text = db.Column(db.String(255))
    image_title = db.Column(db.String(255))
    image_caption = db.Column(db.Text)

    # Thông tin kỹ thuật
    composition = db.Column(db.JSON)  # Thành phần: list hoặc string
    production = db.Column(db.Text)  # Quy trình sản xuất
    application = db.Column(db.JSON)  # Ứng dụng: list
    expiry = db.Column(db.String(200))  # Hạn sử dụng
    packaging = db.Column(db.String(500))  # Quy cách đóng gói
    colors = db.Column(db.JSON)  # Màu sắc: list
    technical_specs = db.Column(db.JSON)  # Thông số kỹ thuật: dict
    standards = db.Column(db.String(200))  # Tiêu chuẩn

    def __repr__(self):
        return f'<Product {self.name}>'

    def get_media_seo_info(self):
        """
        Lấy thông tin SEO từ Media Library dựa vào image path

        Priority:
        1. Tìm Media record theo image URL
        2. Fallback về thông tin legacy từ Product nếu không tìm thấy
        3. Fallback về tên Product nếu không có gì
        """
        if not self.image:
            return None

        # Import helper function
        from app.models.helpers import get_media_by_image_url

        # Tìm Media record
        media = get_media_by_image_url(self.image)

        if media:
            return {
                'alt_text': media.alt_text or self.name,
                'title': media.title or self.name,
                'caption': media.caption
            }

        # Fallback: dùng thông tin legacy từ Product (nếu có)
        return {
            'alt_text': self.image_alt_text or self.name,
            'title': self.image_title or self.name,
            'caption': self.image_caption
        }