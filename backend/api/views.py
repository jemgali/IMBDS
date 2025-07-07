from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from .models import User, Business, Investible, Report, Marker
from .serializers import UserSerializer, BusinessSerializer, InvestibleSerializer, MarkerSerializer, ReportSerializer
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
# TOKEN
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password


# TOKEN
@api_view(['POST'])
@permission_classes([])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    print(f"Login attempt: username={username}, password={password}")  # Debugging
    user = authenticate(request, username=username, password=password)

    if user is not None:
        print(f"Authenticated user: {user.username}, role: {user.user_role}")  # Debugging
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = Response({
            "message": "Login successful",
            "access": access_token,
        }, status=status.HTTP_200_OK)

        # Pull config from SIMPLE_JWT
        cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE", "access_token")
        cookie_secure = settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE", False)
        cookie_httponly = settings.SIMPLE_JWT.get("AUTH_COOKIE_HTTP_ONLY", True)
        cookie_samesite = settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", "Lax")
        access_token_lifetime = int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())
        refresh_token_lifetime = int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds())

        # Set Access Token in Cookie
        response.set_cookie(
            key=cookie_name,
            value=access_token,
            httponly=cookie_httponly,
            secure=cookie_secure,
            samesite=cookie_samesite,
            max_age=access_token_lifetime
        )

        # Optionally set Refresh Token in Cookie too
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=cookie_httponly,
            secure=cookie_secure,
            samesite=cookie_samesite,
            max_age=refresh_token_lifetime
        )

        return response
    else:
        print("Invalid credentials or user not active")  # Debugging
        return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    response = Response({'message': 'Logged out successfully'}, status=200)
    
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    
    # Optional: also set expired manually (double safety)
    response.set_cookie('access_token', '', expires=0, httponly=True)
    response.set_cookie('refresh_token', '', expires=0, httponly=True)

    return response

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    refresh_token = request.COOKIES.get('refresh_token')
    if not refresh_token:
        return Response({'error': 'No refresh token'}, status=401)

    try:
        cookie_secure = settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE", False)
        cookie_httponly = settings.SIMPLE_JWT.get("AUTH_COOKIE_HTTP_ONLY", True)
        cookie_samesite = settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", "Lax")
        access_token_lifetime = int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())

        refresh = RefreshToken(refresh_token)
        access = str(refresh.access_token)

        res = Response({'access': access}, status=200)
        res.set_cookie(
            'access_token',
            access,
            httponly=cookie_httponly,
            samesite=cookie_samesite,
            secure=cookie_secure,
            max_age=access_token_lifetime, # 👈 Make it persist
            path="/"
        )

        return res
    except Exception:
        return Response({'detail': 'Invalid refresh token'}, status=403)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({
        "authenticated": True,
        "user": {
            "username": request.user.username,
            "user_role": request.user.user_role,
        }
    })

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


# BUSINESS
@api_view(['GET'])
@permission_classes([IsAuthenticated]) # Protect this view
def get_all_businesses(request):
    businesses = Business.objects.all()
    serializer = BusinessSerializer(businesses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated]) # Protect this view
def get_business(request, pk):
    try:
        business = Business.objects.get(business_id=pk)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = BusinessSerializer(business)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated]) # Protect this view
def create_business(request):
    # Define required fields for creating a business
    required_fields = ['bsns_name', 'bsns_address', 'industry']
    missing_fields = [field for field in required_fields if not request.data.get(field)]
    if missing_fields:
        return Response(
            {'error': 'The following fields are required:', 'missing_fields': missing_fields},
            status=status.HTTP_400_BAD_REQUEST
        )
    serializer = BusinessSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response({'error': 'Invalid data.', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH']) # Allow both PUT (full update) and PATCH (partial update)
@permission_classes([IsAuthenticated]) # Protect this view
def update_business(request, pk):
    try:
        business = Business.objects.get(business_id=pk)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=status.HTTP_404_NOT_FOUND)
    # Use partial=True to allow PATCH requests to update only specified fields
    serializer = BusinessSerializer(business, data=request.data, partial=True)
    if serializer.is_valid():
        # Check if there are any changes by comparing the original data with the validated data
        original_data = BusinessSerializer(business).data
        updated_data = serializer.validated_data
        changes_made = any(original_data.get(field) != updated_data.get(field) for field in updated_data)
        if not changes_made:
            return Response({'message': 'No changes made'}, status=status.HTTP_200_OK)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid data.', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['DELETE'])
# @permission_classes([IsAuthenticated]) # Protect this view
# def delete_business(request, pk):
#     try:
#         business = Business.objects.get(business_id=pk)
#     except Business.DoesNotExist:
#         return Response({'error': 'Business not found'}, status=status.HTTP_404_NOT_FOUND)
#     business.delete()
#     return Response({'message': 'Business deleted successfully'}, status=status.HTTP_204_NO_CONTENT) # 204 No Content for successful deletion


#CRUD Reports
class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def create(self, request, *args, **kwargs):
        print(request.data)  
        return super().create(request, *args, **kwargs)


# USERS
@api_view(['GET'])
def get_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_user(request):
    # Define required fields
    required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
    missing_fields = [field for field in required_fields if not request.data.get(field)]

    # Check for missing fields
    if missing_fields:
        return Response(
            {'error': 'The following fields are required:', 'missing_fields': missing_fields},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Hash the password before saving
    # password = request.data.get('password')
    # request.data['password'] = make_password(password)  # Replace the plain password with the hashed one

    # Create the user
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()  # Save the user instance
        return Response(serializer.data, status=status.HTTP_201_CREATED)  # Return response with user data
    else:
        # Return detailed validation errors
        return Response({'error': 'Invalid data.', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_user(request, pk):
    try:
        user = User.objects.get(id=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    # If the password is provided, hash it before updating
    password = request.data.get('password')
    if password:
        request.data['password'] = make_password(password)  # Hash the password

    # Partial update allows fields to be optional
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        # Check if there are any changes by comparing the original data with the validated data
        original_data = serializer.instance.__dict__.copy()
        updated_data = serializer.validated_data

        # Remove fields that are not part of the model (like _state)
        original_data.pop('_state', None)

        # Check if any field has changed
        changes_made = any(original_data.get(field) != updated_data.get(field) for field in updated_data)

        if not changes_made:
            return Response({'message': 'No changes made'}, status=status.HTTP_200_OK)

        serializer.save()
        # Fetch the updated user data and serialize it
        updated_user = User.objects.get(id=pk)
        updated_user_serializer = UserSerializer(updated_user)
        return Response(updated_user_serializer.data, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid data.', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['DELETE'])
# def delete_user(request, pk):
#     try:
#         user = User.objects.get(id=pk)
#     except User.DoesNotExist:
#         return Response({'error': 'User not found'}, status = 404)

#     user.delete()
#     return Response({'message': 'User deleted successfully'}, status = 200)

#CRUD Users
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


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
