"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from orders.views import stats_view

from users.views import UserViewSet ,  RegisterView , CustomTokenObtainPairView
from meals.views import MealViewSet, CategoryViewSet
from cart.views import CartViewSet, CartItemViewSet
from orders.views import OrderViewSet, OrderItemViewSet
from django.conf.urls.static import static
from django.conf import settings
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)



router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'meals', MealViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'cart', CartViewSet,basename='cart')
router.register(r'cart-items', CartItemViewSet,basename='cart-items')
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'order-items', OrderItemViewSet, basename='order-items')

urlpatterns = [
     path('admin/', admin.site.urls),
    path('api/register/', RegisterView.as_view(), name='register'),
   path('api/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
    path('api/stats/', stats_view),
    path('api/payment/', include('payments.urls')),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
