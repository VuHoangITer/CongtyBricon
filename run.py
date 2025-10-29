import os

from app import create_app, db
from app.models import User, Category, Product, Banner, Blog, FAQ, Contact

# 🔥 TỐI ƯU: Lấy config từ environment variable
config_name = os.environ.get('FLASK_ENV', 'production')
app = create_app()


@app.shell_context_processor
def make_shell_context():
    """Tạo shell context để dễ dàng test với flask shell"""
    return {
        'db': db,
        'User': User,
        'Category': Category,
        'Product': Product,
        'Banner': Banner,
        'Blog': Blog,
        'FAQ': FAQ,
        'Contact': Contact
    }


@app.cli.command()
def init_db():
    """Lệnh khởi tạo database (không seed data)"""
    print("Đang tạo database...")
    db.create_all()
    print("✓ Khởi tạo database thành công!")
    print("ℹ Để seed dữ liệu mẫu, chạy: python seed/seed_data.py")


if __name__ == '__main__':
    # Development mode
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=True
    )
