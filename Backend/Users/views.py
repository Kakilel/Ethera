from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives

from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    LogoutSerializer,
)

from .models import EmailVerification

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save(is_active=False)

        # 📩 create verification token
        token_obj = EmailVerification.objects.create(user=user)

        verification_link = f"{settings.FRONTEND_URL}/auth/verify-email/{token_obj.token}/"

        html_content = render_to_string(
            "emails/verify_email.html",
            {
                "username": user.username,
                "verification_link":verification_link,
            }
        )

        email = EmailMultiAlternatives(
            subject = "Verify your Ethera account",
            body = "Verify your email",
            from_email = settings.DEFAULT_FROM_EMAIL,
            to = [user.email],
        )

        email.attach_alternative(html_content,"text/html")
        try:
            email.send()
            print("\n" + "=" * 60)
            print("EMAIL VERIFICATION LINK")
            print("=" * 60)
            print(verification_link)
            print("=" * 60 + "\n")

        except Exception as e:
            print("EMAIL ERROR:",e)    



class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            verification = EmailVerification.objects.get(token=token)
            if verification.is_used:
                return Response(
                    {"message":"Email already verified"},
                    status=status.HTTP_200_OK
                )
            

            # ⏳ expiry check
            if verification.is_expired():
                return Response(
                    {"error": "Verification link has expired"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 🧠 single source of truth (MODEL)
            verification.verify_user()
            return Response(
                {"message": "Email verified successfully! You can now log in."},
                status=status.HTTP_200_OK
            )
            

        except EmailVerification.DoesNotExist:
            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )
        

class ResendVerificationEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)

            if user.is_verified:
                return Response(
                    {"error": "Email is already verified"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # create fresh token
            token_obj = EmailVerification.objects.create(user=user)

            verification_link = (
                f"{settings.FRONTEND_URL}/auth/verify-email/{token_obj.token}/"
            )

            html_content = render_to_string(
                "emails/verify_email.html",
                {
                    "username": user.username,
                    "verification_link": verification_link,
                }
            )

            email_message = EmailMultiAlternatives(
                subject="Verify your Ethera account",
                body="Verify your email",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
            )

            email_message.attach_alternative(html_content, "text/html")
            
            email_message.send()

            return Response(
                {"message": "Verification email resent successfully"},
                status=status.HTTP_200_OK
            )

        except User.DoesNotExist:
            return Response(
                {"error": "User with this email does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response({"message": "Logged out successfully"})
        
class MeView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # 🧠 update activity tracking
        user.last_activity = timezone.now()
        user.save(update_fields=["last_activity"])

        return Response({
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_verified": user.is_verified,
                "is_banned": user.is_banned,
                "is_locked": user.is_locked,
            }
        })        