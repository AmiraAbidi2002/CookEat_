from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):

    """
    Meals & Categories

    User :
        GET seulement

    Admin :
        CRUD
    """

    def has_permission(self, request, view):

        # Tout le monde peut lire
        if request.method in SAFE_METHODS:
            return True

        # Seul admin modifie
        return request.user.is_authenticated and request.user.is_staff



class IsUserOrAdminReadOnly(BasePermission):

    """
    Cart & Orders

    User :
        CRUD sur ses données

    Admin :
        Lecture seulement
    """

    def has_permission(self, request, view):

        # Admin → seulement GET
        if request.user.is_staff:
            return request.method in SAFE_METHODS

        # User connecté
        return request.user.is_authenticated



    def has_object_permission(self, request, view, obj):

        # Admin → seulement lecture
        if request.user.is_staff:
            return request.method in SAFE_METHODS

        # User → ses objets seulement
        return obj.user == request.user