# permissions.py
from rest_framework.permissions import BasePermission

class IsProjectOwner(BasePermission):
    """
    Allows access only if the authentication user owns the Project
    """
    def has_object_permission(self,request, view, obj ):
        return obj.owner == request.user
    