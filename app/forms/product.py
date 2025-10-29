# ==================== FORM DANH MỤC ====================
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, TextAreaField, FloatField, BooleanField, SelectField, SubmitField
from wtforms.validators import DataRequired, Length, Optional, InputRequired, NumberRange
from app.models.product import Category

class CategoryForm(FlaskForm):
    """Form quản lý danh mục"""
    name = StringField('Tên danh mục', validators=[
        DataRequired(message='Vui lòng nhập tên danh mục'),
        Length(min=2, max=100)
    ])
    slug = StringField('Slug (URL)', validators=[
        DataRequired(message='Vui lòng nhập slug'),
        Length(min=2, max=100)
    ])
    description = TextAreaField('Mô tả', validators=[Optional()])
    image = FileField('Hình ảnh', validators=[
        FileAllowed(['jpg', 'png', 'jpeg', 'gif', 'webp'], 'Chỉ chấp nhận ảnh!')
    ])
    is_active = BooleanField('Kích hoạt')
    submit = SubmitField('Lưu danh mục')


# ==================== FORM SẢN PHẨM ====================
class ProductForm(FlaskForm):
    """Form quản lý sản phẩm"""
    name = StringField('Tên sản phẩm', validators=[
        DataRequired(message='Vui lòng nhập tên sản phẩm'),
        Length(min=2, max=200)
    ])
    slug = StringField('Slug (URL)', validators=[
        DataRequired(message='Vui lòng nhập slug'),
        Length(min=2, max=200)
    ])
    description = TextAreaField('Mô tả sản phẩm', validators=[Optional()])
    price = FloatField('Giá bán', validators=[
        InputRequired(message='Vui lòng nhập giá'),
        NumberRange(min=0, message='Giá phải >= 0')
    ])
    old_price = FloatField('Giá cũ', validators=[Optional(), NumberRange(min=0)])
    category_id = SelectField('Danh mục', coerce=int, validators=[
        DataRequired(message='Vui lòng chọn danh mục')
    ])
    image = FileField('Hình ảnh chính', validators=[
        FileAllowed(['jpg', 'png', 'jpeg', 'gif', 'webp'], 'Chỉ chấp nhận ảnh!')
    ])
    is_featured = BooleanField('Sản phẩm nổi bật')
    is_active = BooleanField('Kích hoạt', default=True)
    # ========== THÔNG TIN KỸ THUẬT ==========

    # Thành phần (textarea → list khi lưu)
    composition = TextAreaField('Thành phần',
                                validators=[Optional()],
                                render_kw={'rows': 4,
                                           'placeholder': 'Nhập mỗi thành phần trên 1 dòng\nVí dụ:\nXi măng Portland\nCát thạch anh'})

    # Quy trình sản xuất (text thuần)
    production = TextAreaField('Quy trình sản xuất',
                               validators=[Optional()],
                               render_kw={'rows': 5, 'placeholder': 'Mô tả quy trình sản xuất chi tiết'})

    # Ứng dụng (textarea → list khi lưu)
    application = TextAreaField('Ứng dụng',
                                validators=[Optional()],
                                render_kw={'rows': 4,
                                           'placeholder': 'Nhập mỗi ứng dụng trên 1 dòng\nVí dụ:\nDán gạch ceramic\nDán đá ốp tường'})

    # Hạn sử dụng (string)
    expiry = StringField('Hạn sử dụng',
                         validators=[Optional(), Length(max=200)],
                         render_kw={'placeholder': 'VD: 12 tháng kể từ ngày sản xuất'})

    # Quy cách đóng gói (string)
    packaging = TextAreaField('Quy cách đóng gói',
                            validators=[Optional(), Length(max=500)],
                            render_kw={'placeholder': 'VD: Bao 25kg, Thùng 20kg'})

    # Màu sắc (textarea → list khi lưu)
    colors = TextAreaField('Màu sắc có sẵn',
                           validators=[Optional()],
                           render_kw={'rows': 3,
                                      'placeholder': 'Nhập mỗi màu trên 1 dòng\nVí dụ:\nTrắng\nXám\nVàng chanh'})

    # Tiêu chuẩn (string)
    standards = StringField('Tiêu chuẩn',
                            validators=[Optional(), Length(max=200)],
                            render_kw={'placeholder': 'VD: TCVN 7957:2008, ISO 9001'})

    # Thông số kỹ thuật (textarea → dict khi lưu)
    # Format: "Tên thông số: Giá trị" (mỗi dòng)
    technical_specs = TextAreaField('Thông số kỹ thuật',
                                    validators=[Optional()],
                                    render_kw={'rows': 6,
                                               'placeholder': 'Nhập theo định dạng: Tên thông số: Giá trị\nVí dụ:\nĐộ bám dính: ≥ 1.0 MPa\nĐộ mịn: ≤ 45 µm\npH: 6.5-8.5'})

    submit = SubmitField('Lưu sản phẩm')

    def __init__(self, *args, **kwargs):
        super(ProductForm, self).__init__(*args, **kwargs)
        # Load danh mục vào dropdown
        self.category_id.choices = [(0, '-- Chọn danh mục --')] + [
            (c.id, c.name) for c in Category.query.filter_by(is_active=True).all()
        ]