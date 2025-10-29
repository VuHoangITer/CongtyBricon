"""
📂 Admin Routes Package
Import tất cả route modules để auto-register vào admin_bp

⚠️ Thứ tự import QUAN TRỌNG để tránh circular dependency:
1. Auth routes (không phụ thuộc gì)
2. Dashboard (chỉ phụ thuộc models)
3. CRUD routes (có thể phụ thuộc utils)
4. Settings (cuối cùng vì có thể phụ thuộc nhiều thứ)
"""

# ==================== 1. AUTHENTICATION ====================
from . import auth              # 🔐 Login, Logout, Check lockout

# ==================== 2. DASHBOARD ====================
from . import dashboard         # 📊 Dashboard & Welcome page

# ==================== 3. CONTENT MANAGEMENT ====================
from . import categories        # 📁 Categories CRUD
from . import products          # 🛍️ Products CRUD (có technical specs)
from . import banners           # 🎨 Banners CRUD (desktop + mobile)
from . import blogs             # 📝 Blogs CRUD + SEO
from . import faqs              # ❓ FAQs CRUD
from . import projects          # 🏗️ Projects CRUD
from . import jobs              # 💼 Jobs/Careers CRUD
from . import quiz              # 💼 Quiz CRUD

# ==================== 4. USER & CONTACT MANAGEMENT ====================
from . import users             # 👥 Users CRUD với RBAC
from . import contacts          # 📧 Contact messages

# ==================== 5. MEDIA & ASSETS ====================
from . import media             # 🖼️ Media Library + SEO + Albums
from . import ckeditor          # ✏️ CKEditor Image Upload API

# ==================== 6. SYSTEM & PERMISSIONS ====================
from . import roles             # 🔑 Roles & Permissions RBAC
from . import settings          # ⚙️ System Settings + Sitemap/Robots


# ✅ Export để dễ debug và kiểm tra
__all__ = [
    'auth',
    'dashboard',
    'categories',
    'products',
    'banners',
    'blogs',
    'faqs',
    'projects',
    'jobs',
    'quiz',
    'users',
    'contacts',
    'media',
    'ckeditor',
    'roles',
    'settings',
]