from rest_framework.permissions import BasePermission

class IsProjectMember(BasePermission):
    """
    Custom permission to allow access if the user is the owner,
    the manager, or a member of the project team.
    """
    def has_object_permission(self, request, view, obj):
        # 1. Check if the object is a Project
        # 2. Check if the user is the owner
        # 3. Check if the user is the manager
        # 4. Check if the user is in the team
        return (
            obj.owner == request.user or
            obj.manager == request.user or
            request.user in obj.team.all()
        )