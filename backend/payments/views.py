import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from orders.models import Order

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreatePaymentView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        order_id = request.data.get("order_id")

        order = Order.objects.get(
            id=order_id,
            user=request.user
        )

        amount = int(order.total_price * 100)
        if amount < 50:
          return Response(
        {"error": "Minimum amount is $0.50"},
        status=400
    )
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='usd',
            payment_method_types=['card']
        )
        print("total price", order.total_price)
        print("amount", int(order.total_price*100))
        return Response({
            "client_secret": intent.client_secret
        })