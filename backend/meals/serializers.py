from rest_framework import serializers
from .models import Meal, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class MealSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    def get_image_url(self, obj):
        return obj.image or None
        
    class Meta:
        model = Meal
        fields = [
            'id',
            'title',
            'description',
            'price',
            'category',
            'image_url'
        ]