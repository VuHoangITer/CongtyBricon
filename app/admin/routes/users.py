"""
👥 Users Management Routes
"""
from flask import render_template, request, flash, redirect, url_for
from flask_login import current_user
from app import db
from app.models.user import User
from app.forms.user import UserForm
from app.decorators import permission_required
from app.admin import admin_bp
from app.models.rbac import Role

# ==================== QUẢN LÝ NGƯỜI DÙNG ====================
@admin_bp.route('/users')
@permission_required('view_users')  # ✅ Xem danh sách user
def users():
    """Danh sách người dùng với filter theo role"""
    role_filter = request.args.get('role', '')

    query = User.query
    if role_filter:
        role_obj = Role.query.filter_by(name=role_filter).first()
        if role_obj:
            query = query.filter_by(role_id=role_obj.id)

    users = query.order_by(User.created_at.desc()).all()
    return render_template('admin/nguoi_dung/users.html', users=users)


@admin_bp.route('/users/add', methods=['GET', 'POST'])
@permission_required('manage_users')  # ✅ Quản lý users
def add_user():
    """Thêm người dùng mới"""
    form = UserForm()

    if form.validate_on_submit():
        user = User(
            username=form.username.data,
            email=form.email.data,
            role_id=form.role_id.data
        )

        if form.password.data:
            user.set_password(form.password.data)
        else:
            flash('Vui lòng nhập mật khẩu!', 'danger')
            return render_template('admin/nguoi_dung/user_form.html', form=form, title='Thêm người dùng')

        db.session.add(user)
        db.session.commit()

        flash(f'Đã thêm người dùng "{user.username}" với vai trò "{user.role_display_name}"!', 'success')
        return redirect(url_for('admin.users'))

    return render_template('admin/nguoi_dung/user_form.html', form=form, title='Thêm người dùng')


@admin_bp.route('/users/edit/<int:id>', methods=['GET', 'POST'])
@permission_required('manage_users')  # ✅ Quản lý users
def edit_user(id):
    """Sửa người dùng"""
    user = User.query.get_or_404(id)
    form = UserForm(user=user, obj=user)

    if form.validate_on_submit():
        user.username = form.username.data
        user.email = form.email.data
        user.role_id = form.role_id.data

        if form.password.data:
            user.set_password(form.password.data)

        db.session.commit()

        flash(f'Đã cập nhật người dùng "{user.username}"!', 'success')
        return redirect(url_for('admin.users'))

    return render_template('admin/nguoi_dung/user_form.html', form=form, title='Sửa người dùng')


@admin_bp.route('/users/delete/<int:id>')
@permission_required('manage_users')  # ✅ Quản lý users
def delete_user(id):
    """Xóa người dùng"""
    if id == current_user.id:
        flash('Không thể xóa tài khoản của chính mình!', 'danger')
        return redirect(url_for('admin.users'))

    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()

    flash('Đã xóa người dùng thành công!', 'success')
    return redirect(url_for('admin.users'))
