from rest_framework import serializers
from .models import Cart, CartItem
from meals.serializers import MealSerializer
from meals.models import Meal

class CartItemSerializer(serializers.ModelSerializer):
    meal = MealSerializer(read_only=True)
    meal_id = serializers.PrimaryKeyRelatedField(queryset=Meal.objects.all(), source='meal', write_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'meal', 'meal_id', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'created_at']
