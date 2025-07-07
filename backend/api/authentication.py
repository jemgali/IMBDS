# MultipleFiles/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Try to get the access token from the cookie
        # FIX: Use .get() method with a default value instead of direct key access with a tuple
        cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE", "access_token")
        raw_token = request.COOKIES.get(cookie_name)

        if raw_token is None:
            return None # No token in cookie, let other authentication classes handle it

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except AuthenticationFailed:
            # If access token is invalid, raise AuthenticationFailed.
            # The frontend (AuthContext) will then decide to call the refresh endpoint.
            raise AuthenticationFailed('Access token invalid or expired', code='token_not_valid')

