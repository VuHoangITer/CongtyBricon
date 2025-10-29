from app import db
from datetime import datetime


# ==================== BLOG MODEL ====================
class Blog(db.Model):
    """Model tin tức / blog với SEO optimization"""
    __tablename__ = 'blogs'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    excerpt = db.Column(db.Text)
    content = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(255))
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    author = db.Column(db.String(100))
    is_featured = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    views = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Legacy image SEO fields (giữ lại để tương thích)
    image_alt_text = db.Column(db.String(255))
    image_title = db.Column(db.String(255))
    image_caption = db.Column(db.Text)

    # SEO fields
    meta_title = db.Column(db.String(70))  # SEO title tag (50-60 ký tự tối ưu)
    meta_description = db.Column(db.String(160))  # Meta description (120-160 ký tự)
    meta_keywords = db.Column(db.String(255))  # Keywords (optional, ít quan trọng)

    def __repr__(self):
        return f'<Blog {self.title}>'

    @property
    def created_at_vn(self):
        """Lấy created_at theo múi giờ Việt Nam"""
        from app.utils import utc_to_vn
        return utc_to_vn(self.created_at)

    @property
    def updated_at_vn(self):
        """Lấy updated_at theo múi giờ Việt Nam"""
        from app.utils import utc_to_vn
        return utc_to_vn(self.updated_at)

    def get_media_seo_info(self):
        """
        Lấy thông tin SEO từ Media Library cho Blog

        Priority:
        1. Media Library
        2. Legacy fields từ Blog
        3. Fallback về title/excerpt
        """
        if not self.image:
            return None

        from app.models.helpers import get_media_by_image_url
        media = get_media_by_image_url(self.image)

        if media:
            return {
                'alt_text': media.alt_text or self.title,
                'title': media.title or self.title,
                'caption': media.caption or self.excerpt
            }

        # Fallback: dùng legacy fields
        return {
            'alt_text': self.image_alt_text or self.title,
            'title': self.image_title or self.title,
            'caption': self.image_caption or self.excerpt
        }


# ==================== FAQ MODEL ====================
class FAQ(db.Model):
    """Model câu hỏi thường gặp"""
    __tablename__ = 'faqs'

    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(255), nullable=False)
    answer = db.Column(db.Text, nullable=False)
    order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<FAQ {self.question[:50]}>'