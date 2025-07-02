from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, LocationViewSet
# from .views import UserViewSet, LocationViewSet
# from .views import get_all_users, get_user, create_user, update_user, delete_user
from .views import get_all_businesses, get_business, create_business, update_business, delete_business
#from .views import get_all_locations, get_location, create_location, update_location, delete_location
from .views import get_all_investibles, get_investible, create_investible,update_investible, delete_investibles
from .views import MarkerViewSet

router = DefaultRouter()
router.register(r'user', UserViewSet, basename='user')
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'markers', MarkerViewSet)

urlpatterns = [
    # User URLs
    path('api/', include(router.urls)),
    # path('users/', get_all_users, name='get_all_users'),
    # path('users/<int:pk>/', get_user, name='get_user'), #Search
    # path('users/add/', create_user, name='create_user'),
    # path('users/update/<int:pk>/', update_user, name='update_user'),
    # path('users/delete/<int:pk>/', delete_user, name='delete_user'),

    # Business URLs
    path('businesses/', get_all_businesses, name='get_all_businesses'),
    path('businesses/<int:pk>/', get_business, name='get_business'), #Search
    path('businesses/add/', create_business, name='create_business'),
    path('businesses/update/<int:pk>/', update_business, name='update_business'),
    path('businesses/delete/<int:pk>/', delete_business, name='delete_business'),

    # Location URLs
    # path('locations/', get_all_locations, name='get_all_locations'),
    # path('locations/<int:pk>/', get_location, name='get_location'), #Search
    # path('locations/add/', create_location, name='create_location'),
    # path('locations/update/<int:pk>/', update_location, name='update_location'),
    # path('locations/delete/<int:pk>/', delete_location, name='delete_location'),


    # Investible URLs
    path('investibles/', get_all_investibles, name='get_all_investibles'),
    path('investibles/<int:pk>/', get_investible, name='get_investible'), #Search
    path('investibles/add/', create_investible, name='create_investible'),
    path('investibles/update/<int:pk>/', update_investible, name='update_investible'),
    path('investibles/delete/<int:pk>/', delete_investibles, name='delete_investibles'),

]