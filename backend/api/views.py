from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import User, Location, Business, Investible
from .serializers import UserSerializer, LocationSerializer, LocationDetailSerializer, BusinessSerializer, InvestibleSerializer
from rest_framework import viewsets
from rest_framework.views import APIView


#CRUD Users
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer


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


@api_view(['DELETE']) # Delete investibles
def delete_investibles(request, pk): 
    try:
        user = User.objects.get(investible_id=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=400)
    
    user.delete()
    return Response({'message': 'User deleted successfully'}, status=200)


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


@api_view(['DELETE']) # Delete business
def delete_business(request, pk): 
    try:
        user = User.objects.get(business_id=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=400)
    
    user.delete()
    return Response({'message': 'User deleted successfully'}, status=200)