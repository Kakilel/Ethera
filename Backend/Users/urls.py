from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    VerifyEmailView,
    LogoutView,
    MeView,
    ResendVerificationEmailView
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("verify-email/<uuid:token>/", VerifyEmailView.as_view(), name="verify_email"),
    path("resend-verification/",ResendVerificationEmailView.as_view(),name="resend-verification",),
    path("logout/", LogoutView.as_view(), name="logout"),

    # 👤 useful missing endpoint (you already have the view)
    path("me/", MeView.as_view(), name="me"),
]