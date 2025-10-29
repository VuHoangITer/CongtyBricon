from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, TextAreaField, BooleanField, FloatField, SubmitField
from wtforms.validators import DataRequired, Length, Optional

# ==================== FORM BLOG ====================
class BlogForm(FlaskForm):
    """Form quản lý tin tức/blog với SEO optimization"""

    # Basic fields
    title = StringField('Tiêu đề', validators=[
        DataRequired(message='Vui lòng nhập tiêu đề'),
        Length(min=5, max=200)
    ])
    slug = StringField('Slug (URL)', validators=[
        DataRequired(message='Vui lòng nhập slug'),
        Length(min=5, max=200)
    ])
    excerpt = TextAreaField('Mô tả ngắn', validators=[Optional()])
    content = TextAreaField('Nội dung', validators=[
        DataRequired(message='Vui lòng nhập nội dung')
    ])
    image = FileField('Hình ảnh', validators=[
        FileAllowed(['jpg', 'png', 'jpeg', 'gif', 'webp'], 'Chỉ chấp nhận ảnh!')
    ])
    author = StringField('Tác giả', validators=[Optional(), Length(max=100)])
    is_featured = BooleanField('Tin nổi bật')
    is_active = BooleanField('Kích hoạt')
    submit = SubmitField('Lưu bài viết')

# ==================== FORM FAQ ====================
class FAQForm(FlaskForm):
    """Form quản lý câu hỏi thường gặp"""
    question = StringField('Câu hỏi', validators=[
        DataRequired(message='Vui lòng nhập câu hỏi'),
        Length(min=5, max=255)
    ])
    answer = TextAreaField('Câu trả lời', validators=[
        DataRequired(message='Vui lòng nhập câu trả lời')
    ])
    order = FloatField('Thứ tự', validators=[Optional()])
    is_active = BooleanField('Kích hoạt')
    submit = SubmitField('Lưu FAQ')