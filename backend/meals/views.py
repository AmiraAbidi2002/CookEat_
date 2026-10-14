from .models import Meal, Category
from .serializers import MealSerializer, CategorySerializer
from permissionsapp.permissions import IsAdminOrReadOnly
from rest_framework import viewsets, filters


class MealViewSet(viewsets.ModelViewSet):

    queryset = Meal.objects.all()
    def get_queryset(self):
        return Meal.objects.all()
    serializer_class = MealSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

    permission_classes = [IsAdminOrReadOnly]
    def get_serializer_context(self):
        # Passe la request au serializer pour construire l'URL complète
        context = super().get_serializer_context()
        context['request'] = self.request
        return context



class CategoryViewSet(viewsets.ModelViewSet):

    queryset = Category.objects.all()

    serializer_class = CategorySerializer

    permission_classes = [IsAdminOrReadOnly]