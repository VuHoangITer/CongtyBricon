"""
Import tất cả models
"""
from app.models.user import User
from app.models.rbac import Role, Permission
from app.models.content import Blog, FAQ
from app.models.product import Category, Product
from app.models.media import Banner, Media, Project
from app.models.job import Job
from app.models.quiz import Quiz, Question, Answer, QuizAttempt, UserAnswer
from app.models.contact import Contact
from app.models.settings import Settings, get_setting, set_setting

__all__ = [
    # Auth
    'User', 'Role', 'Permission',
    # Content
    'Blog', 'FAQ',
    # Product
    'Category', 'Product',
    # Media
    'Banner', 'Media', 'Project',
    # Job
    'Job',
    # Quiz
    'Quiz', 'Question', 'Answer', 'QuizAttempt', 'UserAnswer',
    # Contact
    'Contact',
    # Settings
    'Settings', 'get_setting', 'set_setting'
]
