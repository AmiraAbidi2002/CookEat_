from rest_framework import viewsets
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from permissionsapp.permissions import IsUserOrAdminReadOnly


class CartItemViewSet(viewsets.ModelViewSet):

    serializer_class = CartItemSerializer

    permission_classes = [IsUserOrAdminReadOnly]


    def get_queryset(self):

        return CartItem.objects.filter(
            cart__user=self.request.user
        )


    def perform_create(self, serializer):

        cart, created = Cart.objects.get_or_create(
            user=self.request.user
        )

        serializer.save(cart=cart)




class CartViewSet(viewsets.ModelViewSet):

    serializer_class = CartSerializer

    permission_classes = [IsUserOrAdminReadOnly]


    def get_queryset(self):

        return Cart.objects.filter(
            user=self.request.user
        )


    def perform_create(self, serializer):

        serializer.save(
            user=self.request.user
        )


    @action(detail=False, methods=['get'])

    def mycart(self, request):

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        serializer = CartSerializer(cart)

        return Response(serializer.data)