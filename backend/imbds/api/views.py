from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import User, Business, Investible, Report, Marker
from .serializers import UserSerializer, BusinessSerializer, InvestibleSerializer,MarkerSerializer,  ReportSerializer
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

#CRUD Markers
class MarkerViewSet(viewsets.ModelViewSet):
    queryset = Marker.objects.all()
    serializer_class = MarkerSerializer

    # ✅ Fix: allow partial updates (for drag updates)
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs, partial=True)

    # ✅ Fix: delete associated business if no markers remain
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        business = instance.business

        self.perform_destroy(instance)

        if business and not business.business_markers.exists():
            business.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

#CRUD Business
class BusinessViewSet(viewsets.ModelViewSet):
    queryset = Business.objects.all()
    serializer_class = BusinessSerializer

#CRUD Reports
class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def create(self, request, *args, **kwargs):
        print(request.data)  
        return super().create(request, *args, **kwargs)


#CRUD Users
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# def create(self, request, *args, **kwargs):
#     print(request.data)  # <-- Add this to see incoming data
#     return super().create(request, *args, **kwargs)

# @api_view(['GET']) # Fetch all users
# def get_all_users(request):
#     users = User.objects.all()
#     serializer = UserSerializer(users, many=True)
#     return Response(serializer.data, status=status.HTTP_200_OK)

# @api_view(['GET']) # Search user
# def get_user(request, pk):
#     try:
#         user = User.objects.get(user_id=pk)
#     except User.DoesNotExist:
#         return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

#     serializer = UserSerializer(user)
#     return Response(serializer.data, status=status.HTTP_200_OK)

# @api_view(['POST']) # Add user
# def create_user(request):
#     serializer = UserSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['PUT']) # Update user
# def update_user(request, pk):
#     try:
#         user = User.objects.get(user_id=pk)
#     except User.DoesNotExist:
#         return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

#     serializer = UserSerializer(user, data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_200_OK)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['DELETE']) # Delete user
# def delete_user(request, pk): 
#     try:
#         user = User.objects.get(user_id=pk)
#     except User.DoesNotExist:
#         return Response({'error': 'User not found'}, status=400)
    
#     user.delete()
#     return Response({'message': 'User deleted successfully'}, status=200)



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
# @api_view(['GET']) # Fetch all businesses
# def get_all_businesses(request):
#     businesses = Business.objects.all()
#     serializer = BusinessSerializer(businesses, many=True)
#     return Response(serializer.data, status=status.HTTP_200_OK)

# @api_view(['GET']) # Search business
# def get_business(request, pk):
#     try:
#         business = Business.objects.get(business_id=pk)
#     except Business.DoesNotExist:
#         return Response({'error': 'Business not found'}, status=status.HTTP_404_NOT_FOUND)

#     serializer = BusinessSerializer(business)
#     return Response(serializer.data, status=status.HTTP_200_OK)

# @api_view(['POST']) # Add business
# def create_business(request):
#     serializer = BusinessSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['PUT']) # Update business
# def update_business(request, pk):
#     try:
#         business = Business.objects.get(business_id=pk)
#     except Business.DoesNotExist:
#         return Response({'error': 'Business not found'}, status=status.HTTP_404_NOT_FOUND)

#     serializer = BusinessSerializer(business, data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_200_OK)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['DELETE']) # Delete business
# def delete_business(request, pk): 
#     try:
#         user = User.objects.get(business_id=pk)
#     except User.DoesNotExist:
#         return Response({'error': 'User not found'}, status=400)
    
#     user.delete()
#     return Response({'message': 'User deleted successfully'}, status=200)