"""
Quản lý phân quyền RBAC (Role-Based Access Control)
"""

from flask import render_template, request, flash, redirect, url_for
from app import db
from app.models.rbac import Role, Permission
from app.forms.user import RoleForm, PermissionForm
from app.decorators import permission_required
from app.admin import admin_bp
from app.models.user import User


# ==================== ROLES: LIST ====================
@admin_bp.route('/roles')
@permission_required('manage_roles')
def roles():
    """📋 Danh sách roles"""
    roles = Role.query.order_by(Role.priority.desc()).all()

    stats = {
        'total_roles': Role.query.count(),
        'total_permissions': Permission.query.count(),
        'total_users': User.query.count(),
        'active_roles': Role.query.filter_by(is_active=True).count()
    }

    return render_template('admin/phan_quyen/roles.html', roles=roles, stats=stats)


# ==================== ROLES: ADD ====================
@admin_bp.route('/roles/add', methods=['GET', 'POST'])
@permission_required('manage_roles')
def add_role():
    """➕ Thêm role mới"""
    form = RoleForm()

    if form.validate_on_submit():
        existing = Role.query.filter_by(name=form.name.data).first()
        if existing:
            flash('Tên role đã tồn tại!', 'danger')
            return render_template('admin/phan_quyen/role_form.html', form=form, title='Thêm vai trò')

        role = Role(
            name=form.name.data,
            display_name=form.display_name.data,
            description=form.description.data,
            priority=form.priority.data,
            color=form.color.data,
            is_active=form.is_active.data
        )

        db.session.add(role)
        db.session.commit()

        flash(f'Đã tạo vai trò "{role.display_name}" thành công!', 'success')
        return redirect(url_for('admin.roles'))

    return render_template('admin/phan_quyen/role_form.html', form=form, title='Thêm vai trò')


# ==================== ROLES: EDIT ====================
@admin_bp.route('/roles/edit/<int:id>', methods=['GET', 'POST'])
@permission_required('manage_roles')
def edit_role(id):
    """✏️ Sửa role"""
    role = Role.query.get_or_404(id)
    form = RoleForm(obj=role)

    if form.validate_on_submit():
        if role.name in ['admin', 'user'] and form.name.data != role.name:
            flash('Không thể đổi tên role hệ thống!', 'danger')
            return render_template('admin/phan_quyen/role_form.html', form=form, title='Sửa vai trò', role=role)

        role.name = form.name.data
        role.display_name = form.display_name.data
        role.description = form.description.data
        role.priority = form.priority.data
        role.color = form.color.data
        role.is_active = form.is_active.data

        db.session.commit()

        flash(f'Đã cập nhật vai trò "{role.display_name}" thành công!', 'success')
        return redirect(url_for('admin.roles'))

    return render_template('admin/phan_quyen/role_form.html', form=form, title='Sửa vai trò', role=role)


# ==================== ROLES: DELETE ====================
@admin_bp.route('/roles/delete/<int:id>')
@permission_required('manage_roles')
def delete_role(id):
    """🗑️ Xóa role"""
    role = Role.query.get_or_404(id)

    if role.name in ['admin', 'user']:
        flash('Không thể xóa role hệ thống!', 'danger')
        return redirect(url_for('admin.roles'))

    if role.users.count() > 0:
        flash(f'Không thể xóa role có {role.users.count()} người dùng!', 'danger')
        return redirect(url_for('admin.roles'))

    db.session.delete(role)
    db.session.commit()

    flash(f'Đã xóa vai trò "{role.display_name}" thành công!', 'success')
    return redirect(url_for('admin.roles'))


# ==================== ROLES: EDIT PERMISSIONS ====================
@admin_bp.route('/roles/<int:id>/permissions', methods=['GET', 'POST'])
@permission_required('manage_roles')
def edit_role_permissions(id):
    """Chỉnh sửa permissions của role"""
    role = Role.query.get_or_404(id)

    all_permissions = Permission.query.filter_by(is_active=True).order_by(
        Permission.category, Permission.name
    ).all()

    perms_by_category = {}
    for perm in all_permissions:
        cat = perm.category or 'other'
        if cat not in perms_by_category:
            perms_by_category[cat] = []
        perms_by_category[cat].append(perm)

    current_perm_ids = [p.id for p in role.permissions.all()]

    if request.method == 'POST':
        selected_perm_ids = request.form.getlist('permissions')
        selected_perm_ids = [int(pid) for pid in selected_perm_ids]

        role.permissions = []

        for perm_id in selected_perm_ids:
            perm = Permission.query.get(perm_id)
            if perm:
                role.add_permission(perm)

        db.session.commit()

        flash(f'Đã cập nhật quyền cho vai trò "{role.display_name}"', 'success')
        return redirect(url_for('admin.roles'))

    return render_template('admin/phan_quyen/edit_role_permissions.html',
                           role=role,
                           perms_by_category=perms_by_category,
                           current_perm_ids=current_perm_ids)


# ==================== PERMISSIONS: LIST ====================
@admin_bp.route('/permissions')
@permission_required('manage_roles')
def permissions():
    """Danh sách permissions"""
    all_permissions = Permission.query.order_by(Permission.category, Permission.name).all()

    perms_by_category = {}
    for perm in all_permissions:
        cat = perm.category or 'other'
        if cat not in perms_by_category:
            perms_by_category[cat] = []
        perms_by_category[cat].append(perm)

    return render_template('admin/phan_quyen/permissions.html', perms_by_category=perms_by_category)


# ==================== PERMISSIONS: ADD ====================
@admin_bp.route('/permissions/add', methods=['GET', 'POST'])
@permission_required('manage_roles')
def add_permission():
    """Thêm permission mới"""
    form = PermissionForm()

    if form.validate_on_submit():
        existing = Permission.query.filter_by(name=form.name.data).first()
        if existing:
            flash('Tên permission đã tồn tại!', 'danger')
            return render_template('admin/phan_quyen/permission_form.html', form=form, title='Thêm quyền')

        perm = Permission(
            name=form.name.data,
            display_name=form.display_name.data,
            description=form.description.data,
            category=form.category.data,
            icon=form.icon.data or 'bi-key',
            is_active=form.is_active.data
        )

        db.session.add(perm)
        db.session.commit()

        flash(f'Đã tạo quyền "{perm.display_name}" thành công!', 'success')
        return redirect(url_for('admin.permissions'))

    return render_template('admin/phan_quyen/permission_form.html', form=form, title='Thêm quyền')


# ==================== PERMISSIONS: EDIT ====================
@admin_bp.route('/permissions/edit/<int:id>', methods=['GET', 'POST'])
@permission_required('manage_roles')
def edit_permission(id):
    """✏️ Sửa permission"""
    perm = Permission.query.get_or_404(id)
    form = PermissionForm(obj=perm)

    if form.validate_on_submit():
        # Kiểm tra trùng tên (ngoại trừ chính nó)
        existing = Permission.query.filter_by(name=form.name.data).first()
        if existing and existing.id != perm.id:
            flash('Tên permission đã tồn tại!', 'danger')
            return render_template('admin/phan_quyen/permission_form.html', form=form, title='Sửa quyền', perm=perm)

        perm.name = form.name.data
        perm.display_name = form.display_name.data
        perm.description = form.description.data
        perm.category = form.category.data
        perm.icon = form.icon.data or 'bi-key'
        perm.is_active = form.is_active.data

        db.session.commit()

        flash(f'Đã cập nhật quyền "{perm.display_name}" thành công!', 'success')
        return redirect(url_for('admin.permissions'))

    return render_template('admin/phan_quyen/permission_form.html', form=form, title='Sửa quyền', perm=perm)


# ==================== PERMISSIONS: DELETE ====================
@admin_bp.route('/permissions/delete/<int:id>')
@permission_required('manage_roles')
def delete_permission(id):
    """🗑️ Xóa permission"""
    perm = Permission.query.get_or_404(id)

    # Kiểm tra permission có đang được dùng không
    if perm.roles.count() > 0:
        flash(f'Không thể xóa permission "{perm.display_name}" vì đang được {perm.roles.count()} roles sử dụng!', 'danger')
        return redirect(url_for('admin.permissions'))

    db.session.delete(perm)
    db.session.commit()

    flash(f'Đã xóa permission "{perm.display_name}" thành công!', 'success')
    return redirect(url_for('admin.permissions'))