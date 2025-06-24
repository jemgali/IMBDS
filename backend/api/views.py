from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import User, Location, Business, Investible
from .serializers import UserSerializer, LocationSerializer, LocationDetailSerializer, BusinessSerializer, InvestibleSerializer


#CRUD Users
@api_view(['GET']) # Fetch all users
def get_all_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET']) # Search user
def get_user(request, pk):
    try:
        user = User.objects.get(user_id=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST']) # Add user
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT']) # Update user
def update_user(request, pk):
    try:
        user = User.objects.get(user_id=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(user, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#CRUD Locations
@api_view(['GET']) #Fetch all location
def get_all_locations(request):
    locations = Location.objects.all()
    serializer = LocationDetailSerializer(locations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET']) #Search
def get_location(request, pk):
    try:
        location = Location.objects.get(location_id=pk)
    except Location.DoesNotExist:
        return Response({'error': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = LocationDetailSerializer(location)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST']) #Add
def create_location(request):
    serializer = LocationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT']) # Update
def update_location(request, pk):
    try:
        location = Location.objects.get(location_id=pk)
    except Location.DoesNotExist:
        return Response({'error': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = LocationSerializer(location, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#CRUD Investibles
@api_view(['GET']) # Fetch all investibles
def get_all_investibles(request):
    investibles = Investible.objects.all()
    serializer = InvestibleSerializer(investibles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET']) # Search investible
def get_investible(request, pk):
    try:
        investible = Investible.objects.get(investible_id=pk)
    except Investible.DoesNotExist:
        return Response({'error': 'Investible not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = InvestibleSerializer(investible)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST']) # Add investible
def create_investible(request):
    serializer = InvestibleSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT']) # Update investible
def update_investible(request, pk):
    try:
        investible = Investible.objects.get(investible_id=pk)
    except Investible.DoesNotExist:
        return Response({'error': 'Investible not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = InvestibleSerializer(investible, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#CRUD Businesses
@api_view(['GET']) # Fetch all businesses
def get_all_businesses(request):
    businesses = Business.objects.all()
    serializer = BusinessSerializer(businesses, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET']) # Search business
def get_business(request, pk):
    try:
        business = Business.objects.get(business_id=pk)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = BusinessSerializer(business)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST']) # Add business
def create_business(request):
    serializer = BusinessSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT']) # Update business
def update_business(request, pk):
    try:
        business = Business.objects.get(business_id=pk)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = BusinessSerializer(business, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)