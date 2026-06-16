from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .models import EmailVerification
from django.db.models import Q

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        identifier = (attrs.get("email") or "").lower().strip()
        password = attrs.get("password")
        request = self.context.get("request")

        user_obj = User.objects.filter(
            Q(email__iexact=identifier) |
            Q(username__iexact=identifier)
        ).first()


        user = None

        if user_obj:
            user = authenticate(
                request=request,
                email=user_obj.email,
                password=password
            )


        # ❌ invalid credentials
        if not user:
            if user_obj:
                user_obj.mark_login_failed()

            raise serializers.ValidationError({
                "detail": "Invalid credentials"
            })

        # ❌ state checks
        if user.is_banned:
            raise serializers.ValidationError({"detail": "Account has been banned"})

        if user.is_locked:
            raise serializers.ValidationError({"detail": "Account is locked"})

        if not user.is_active:
            raise serializers.ValidationError({"detail": "Account is inactive"})

        if not user.is_verified:
            raise serializers.ValidationError({"detail": "Email not verified"})

        # ✅ success hooks
        user.mark_login_success()
        user.update_activity()

        refresh = RefreshToken.for_user(user)

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),

            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_verified": user.is_verified,
                "is_locked": user.is_locked,
                "is_banned": user.is_banned,
            }
        }
        

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "first_name",
            "last_name",
            "phone",
            "password"
        ]

    def validate_email(self, value):
        value = value.lower().strip()

        existing_user = User.objects.filter(
            email__iexact=value
        ).first()

        if existing_user:
            if not existing_user.is_verified:
                raise serializers.ValidationError(
                    "Email exists but is not verified"
                )
            
            raise serializers.ValidationError(
                "Email is already registered"
            )
        return value
    
    # USERNAME VALIDATION
    def validate_username(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Username must be at least 3 characters."
            )

        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "Username is already taken."
            )

        return value

    # PHONE VALIDATION
    def validate_phone(self, value):
        if value and User.objects.filter(phone=value).exists():
            raise serializers.ValidationError(
                "Phone number already in use."
            )

        return value


    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            username=validated_data.get("username"),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            phone=validated_data.get("phone", ""),
            is_verified=False,
            is_active=True
        )


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)

    def validate(self, attrs):
        self.token = attrs["refresh"]
        return attrs

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.token)
            token.blacklist()
        except Exception as e:
            print("BLACKLIST ERROR:", str(e))

            raise serializers.ValidationError({
                "detail": "Invalid or expired token"
            })  

class SendEmailVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower().strip()

    def save(self):
        user = User.objects.filter(
            email__iexact=self.validated_data["email"]
        ).first()

        # always silent fail (prevents user enumeration)
        if not user:
            return None

        if user.is_verified:
            raise serializers.ValidationError("User already verified")

        token = EmailVerification.objects.create(user=user)
        return token
    
class EmailSerializer(serializers.Serializer):
    token = serializers.UUIDField()

    def save(self):
        record = EmailVerification.objects.filter(
            token=self.validated_data["token"]
        ).first()

        if not record:
            raise serializers.ValidationError("Invalid token")

        if record.is_used:
            raise serializers.ValidationError("Token already used")

        if record.is_expired():
            raise serializers.ValidationError("Token expired")

        record.verify_user()
        return record.user   