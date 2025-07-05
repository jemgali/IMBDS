from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, MarkerViewSet, ReportViewSet, BusinessViewSet
from .views import (get_all_investibles, get_investible, create_investible,update_investible, delete_investibles,
                    get_users, create_user, update_user, login_view, logout_view, refresh_token_view, protected_view
                    )

router = DefaultRouter()
router.register(r'user', UserViewSet, basename='user')
router.register(r'markers', MarkerViewSet)
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'businesses', BusinessViewSet)

urlpatterns = [
    path('users/', get_users, name='get_users'),
    path('users/create/', create_user, name='create_user'),
    path('users/update/<int:pk>/', update_user, name='update_user'),
    # TOKEN
    path('login/', login_view),
    path('logout/', logout_view),
    path('refresh/', refresh_token_view),
    path('protected/', protected_view),
    
    # User URLs
    path('', include(router.urls)),
    
    # Investible URLs
    path('investibles/', get_all_investibles, name='get_all_investibles'),
    path('investibles/<int:pk>/', get_investible, name='get_investible'), #Search
    path('investibles/add/', create_investible, name='create_investible'),
    path('investibles/update/<int:pk>/', update_investible, name='update_investible'),
    path('investibles/delete/<int:pk>/', delete_investibles, name='delete_investibles'),

]