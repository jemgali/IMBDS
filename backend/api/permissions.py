from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminOrEmployee(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.user_role in ['Admin', 'Employee']
        )

class IsAdminOrEmployeeReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_authenticated:
            if request.user.user_role == 'Admin':
                return True
            if request.user.user_role == 'Employee' and request.method in SAFE_METHODS:
                return True
        return False

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_role == 'Admin'

class IsStaffOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.user_role in ['Admin', 'Employee'])

class IsSelfOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.user_role == 'Admin' or obj == request.user