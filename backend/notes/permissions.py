from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrReadOnly(BasePermission):
    """
    Nesne üzerinde sadece sahibinin değişiklik yapmasına izin verir,
    ancak adminler her zaman tam yetkiye sahiptir.
    """
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True

        return obj.owner == request.user
