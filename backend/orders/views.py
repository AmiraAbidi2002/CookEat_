from rest_framework import viewsets
from .models import Order, OrderItem
from cart.models import Cart
from .serializers import OrderSerializer, OrderItemSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from permissionsapp.permissions import IsUserOrAdminReadOnly
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate, TruncMonth
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from meals.models import Meal, Category

class OrderItemViewSet(viewsets.ModelViewSet):

    serializer_class = OrderItemSerializer

    permission_classes = [IsUserOrAdminReadOnly]


    def get_queryset(self):

        return OrderItem.objects.filter(
            order__user=self.request.user
        )




class OrderViewSet(viewsets.ModelViewSet):

    serializer_class = OrderSerializer

    permission_classes = [IsUserOrAdminReadOnly]

     
    def get_queryset(self):

        user = self.request.user
        if user.is_staff and self.request.query_params.get('all') == 'true':
          return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=user).order_by('-created_at')

    def partial_update(self, request, *args, **kwargs):
        # Autoriser seulement la mise à jour du statut
        allowed_fields = {'status'}
        if not allowed_fields.issuperset(request.data.keys()):
            return Response(
                {"error": "Seul le champ 'status' peut être modifié"},
                status=400
            )
        return super().partial_update(request, *args, **kwargs)
    def perform_create(self, serializer):

        serializer.save(
            user=self.request.user
        )

    
    @action(detail=False, methods=['post'])

    def create_from_cart(self, request):
        total = 0
        cart, created = Cart.objects.get_or_create(
            user=request.user
        )


        if not cart.items.exists():

            return Response(
                {"error": "Cart empty"},
                status=400
            )


        order = Order.objects.create(
            user=request.user
        )


        for item in cart.items.all(): 
            total += item.meal.price * item.quantity
            OrderItem.objects.create(
                order=order,
                meal=item.meal,
                quantity=item.quantity
            )

        delivery_fee = request.data.get('delivery_fee', 7)
        
        order.total_price = total +delivery_fee
        order.save()
        cart.items.all().delete()

        serializer = OrderSerializer(order)

        return Response(serializer.data)
   


@api_view(['GET'])
@permission_classes([IsAdminUser])
def stats_view(request):

    total_revenue = Order.objects.filter(
        status__in=['delivered', 'paid']
    ).aggregate(total=Sum('total_price'))['total'] or 0

    fourteen_days_ago = datetime.now() - timedelta(days=14)

    revenue_by_day = (
        Order.objects
        .filter(status__in=['delivered', 'paid'], created_at__gte=fourteen_days_ago)
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(revenue=Sum('total_price'), orders=Count('id'))
        .order_by('day')
    )

    orders_by_status = (
        Order.objects
        .values('status')
        .annotate(count=Count('id'))
    )

    top_meals = (
        OrderItem.objects
        .values('meal__title')
        .annotate(total_quantity=Sum('quantity'))
        .order_by('-total_quantity')[:5]
    )

    today = datetime.now().date()

    revenue_today = Order.objects.filter(
        created_at__date=today,
        status__in=['delivered', 'paid']
    ).aggregate(total=Sum('total_price'))['total'] or 0

    return Response({
        "total_revenue": float(total_revenue),
        "revenue_today": float(revenue_today),
        "total_orders": Order.objects.count(),
        "total_meals": Meal.objects.count(),
        "total_categories": Category.objects.count(),

        "revenue_by_day": [
            {
                "day": item["day"].strftime("%d/%m"),
                "revenue": float(item["revenue"])
            }
            for item in revenue_by_day
        ],

        "orders_by_status": list(orders_by_status),

        "top_meals": [
            {
                "name": item["meal__title"],
                "quantity": item["total_quantity"]
            }
            for item in top_meals
        ]
    })