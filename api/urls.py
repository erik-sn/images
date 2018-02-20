from rest_framework.routers import DefaultRouter
from django.conf.urls import url

from api import views

urlpatterns = [
    url(r'^pulse/', views.pulse),
]

router = DefaultRouter()
router.register(r'users', views.UserView, base_name='users')
router.register(r'searches', views.SearchView, base_name='searches')
router.register(r'images', views.ImageView, base_name='images')

urlpatterns += router.urls
