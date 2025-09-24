# MultipleFiles/views.py

from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from .models import User, Business, Investible, Report, Marker
from .serializers import UserSerializer, BusinessSerializer, InvestibleSerializer, MarkerSerializer, ReportSerializer
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated # Import AllowAny
# TOKEN
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password


# TOKEN (These views should remain protected or have specific permissions)
@api_view(['POST'])
@permission_classes([AllowAny]) # Login view should allow any
def login_view(request):
    # ... (login_view content remains the same) ...
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
@permission_classes([IsAuthenticated]) # Logout should require authentication
def logout_view(request):
    # ... (logout_view content remains the same) ...
    response = Response({'message': 'Logged out successfully'}, status=200)
    
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    
    # Optional: also set expired manually (double safety)
    response.set_cookie('access_token', '', expires=0, httponly=True)
    response.set_cookie('refresh_token', '', expires=0, httponly=True)

    return response

@api_view(['POST'])
@permission_classes([AllowAny]) # Refresh token view should allow any
def refresh_token_view(request):
    # ... (refresh_token_view content remains the same) ...
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
@permission_classes([IsAuthenticated]) # Protected view should require authentication
def protected_view(request):
    # ... (protected_view content remains the same) ...
    return Response({
        "authenticated": True,
        "user": {
            "username": request.user.username,
            "user_role": request.user.user_role,
        }
    })

class MarkerViewSet(viewsets.ModelViewSet):
    queryset = Marker.objects.all()
    serializer_class = MarkerSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs, partial=True)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        business = instance.business
        investible = instance.invst  # ✅ ADD INVESTIBLE CLEANUP

        self.perform_destroy(instance)

        if business and not business.business_markers.exists():
            business.delete()
            
        if investible and not investible.investment_markers.exists():  # ✅ SAME PATTERN
            investible.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

#CRUD Business
class BusinessViewSet(viewsets.ModelViewSet):
    queryset = Business.objects.all()
    serializer_class = BusinessSerializer

    # --- MODIFIED PERMISSIONS HERE ---
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve']: # Allow anyone to view (GET) businesses
            permission_classes = [AllowAny]
        else: # For create, update, destroy, require authentication
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    # --- END MODIFIED PERMISSIONS ---


# BUSINESS (These function-based views also need permission_classes)
@api_view(['GET'])
@permission_classes([AllowAny]) # Allow any for public access
def get_all_businesses(request):
    businesses = Business.objects.all()
    serializer = BusinessSerializer(businesses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny]) # Allow any for public access
def get_business(request, pk):
    try:
        business = Business.objects.get(business_id=pk)
    except Business.DoesNotExist:
        return Response({'error': 'Business not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = BusinessSerializer(business)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated]) # Creating a business should likely require authentication
def create_business(request):
    # ... (create_business content remains the same) ...
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
@permission_classes([IsAuthenticated]) # Updating a business should likely require authentication
def update_business(request, pk):
    # ... (update_business content remains the same) ...
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

#CRUD Investible - ✅ ADD THIS (same pattern as BusinessViewSet)
class InvestibleViewSet(viewsets.ModelViewSet):
    queryset = Investible.objects.all()
    serializer_class = InvestibleSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    # ✅ ADD THIS to allow partial updates like MarkerViewSet
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs, partial=True)

#CRUD Reports (These should likely remain protected)
class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated] # Keep protected

    def create(self, request, *args, **kwargs):
        print(request.data)  
        return super().create(request, *args, **kwargs)


# USERS (These should likely remain protected, except for create_user)
@api_view(['GET'])
@permission_classes([IsAuthenticated]) # Getting all users should be protected
def get_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny]) # Allowing anyone to create a user (e.g., for registration)
def create_user(request):
    # ... (create_user content remains the same) ...
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
@permission_classes([IsAuthenticated]) # Updating a user should be protected
def update_user(request, pk):
    # ... (update_user content remains the same) ...
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


#CRUD Users (This ViewSet will inherit the global IsAuthenticated unless specified)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    

#CRUD Investibles (These function-based views also need permission_classes)
@api_view(['GET']) # Fetch all investibles
@permission_classes([AllowAny]) # Allow any for public access
def get_all_investibles(request):
    investibles = Investible.objects.all()
    serializer = InvestibleSerializer(investibles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET']) # Search investible
@permission_classes([AllowAny]) # Allow any for public access
def get_investible(request, pk):
    try:
        investible = Investible.objects.get(investible_id=pk)
    except Investible.DoesNotExist:
        return Response({'error': 'Investible not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = InvestibleSerializer(investible)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST']) # Add investible
@permission_classes([IsAuthenticated]) 
def create_investible(request):
    # ADD VALIDATION LIKE create_business
    required_fields = ['invst_location', 'invst_description']  # ADD THIS
    missing_fields = [field for field in required_fields if not request.data.get(field)]  # ADD THIS
    if missing_fields:  # ADD THIS
        return Response(  # ADD THIS
            {'error': 'The following fields are required:', 'missing_fields': missing_fields},  # ADD THIS
            status=status.HTTP_400_BAD_REQUEST  # ADD THIS
        )  # ADD THIS
    
    serializer = InvestibleSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT']) # Update investible
@permission_classes([IsAuthenticated]) # Updating an investible should likely require authentication
def update_investible(request, pk):
    # ... (update_investible content remains the same) ...
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
@permission_classes([IsAuthenticated]) # Deleting an investible should likely require authentication
def delete_investibles(request, pk): 
    # FIX: Change User to Investible
    try:
        investible = Investible.objects.get(investible_id=pk)  # CHANGE THIS LINE
    except Investible.DoesNotExist:  # CHANGE THIS LINE
        return Response({'error': 'Investible not found'}, status=400)  # CHANGE THIS LINE
    
    investible.delete()  # CHANGE THIS LINE
    return Response({'message': 'Investible deleted successfully'}, status=200)  # CHANGE THIS LINE
