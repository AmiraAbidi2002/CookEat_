from rest_framework import serializers
from .models import Order, OrderItem
from meals.serializers import MealSerializer
from django.contrib.auth import get_user_model

User = get_user_model()
class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
class OrderItemSerializer(serializers.ModelSerializer):
    meal = MealSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'meal', 'quantity']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = UserMiniSerializer(read_only=True)
    class Meta:
        model = Order
        fields = ['id', 'user', 'status','total_price', 'created_at', 'items']
