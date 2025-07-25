from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, MarkerViewSet, ReportViewSet, BusinessViewSet
# from .views import get_all_users, get_user, create_user, update_user, delete_user
# from .views import get_all_businesses, get_business, create_business, update_business, delete_business
from .views import get_all_investibles, get_investible, create_investible,update_investible, delete_investibles


router = DefaultRouter()
router.register(r'user', UserViewSet, basename='user')
router.register(r'markers', MarkerViewSet)
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'businesses', BusinessViewSet)

urlpatterns = [
    # User URLs
    path('api/', include(router.urls)),
    # path('users/', get_all_users, name='get_all_users'),
    # path('users/<int:pk>/', get_user, name='get_user'), #Search
    # path('users/add/', create_user, name='create_user'),
    # path('users/update/<int:pk>/', update_user, name='update_user'),
    # path('users/delete/<int:pk>/', delete_user, name='delete_user'),

    # Business URLs
    # path('businesses/', get_all_businesses, name='get_all_businesses'),
    # path('businesses/<int:pk>/', get_business, name='get_business'), #Search
    # path('businesses/add/', create_business, name='create_business'),
    # path('businesses/update/<int:pk>/', update_business, name='update_business'),
    # path('businesses/delete/<int:pk>/', delete_business, name='delete_business'),

    # Investible URLs
    path('investibles/', get_all_investibles, name='get_all_investibles'),
    path('investibles/<int:pk>/', get_investible, name='get_investible'), #Search
    path('investibles/add/', create_investible, name='create_investible'),
    path('investibles/update/<int:pk>/', update_investible, name='update_investible'),
    path('investibles/delete/<int:pk>/', delete_investibles, name='delete_investibles'),

]