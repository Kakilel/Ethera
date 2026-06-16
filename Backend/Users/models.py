#type:ignore
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
import uuid
from datetime import timedelta

class CustomUserManager(BaseUserManager):

    def create_user(self, email, username=None, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)

        if not username:
            username = email.split("@")[0]

        user = self.model(
            email=email,
            username=username,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_verified", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")

        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(email, username, password, **extra_fields)

class CustomUser(AbstractUser):

    # identity core
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)

    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    phone = models.CharField(max_length=20, blank=True)

    # security layer
    is_verified = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)

    # login intelligence
    login_attempts = models.PositiveIntegerField(default=0)
    last_failed_login = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)

    # activity tracking
    last_activity = models.DateTimeField(null=True, blank=True)

    # password safety
    password_changed_at = models.DateTimeField(null=True, blank=True)

    # system state
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    # =========================
    # 🔐 AUTH LOGIC METHODS
    # =========================

    def mark_login_success(self):
        """Reset login state after successful login"""
        self.login_attempts = 0
        self.last_activity = timezone.now()
        self.is_locked = False
        self.save(update_fields=[
            "login_attempts",
            "last_activity",
            "is_locked"
        ])

    def mark_login_failed(self):
        """Track failed login attempts and auto-lock account"""
        self.login_attempts += 1
        self.last_failed_login = timezone.now()

        if self.login_attempts >= 5:
            self.is_locked = True

        self.save(update_fields=[
            "login_attempts",
            "last_failed_login",
            "is_locked"
        ])

    def unlock_account(self):
        """Manual or admin unlock"""
        self.login_attempts = 0
        self.is_locked = False
        self.save(update_fields=["login_attempts", "is_locked"])

    def mark_verified(self):
        """Centralized verification update"""
        self.is_verified = True
        self.save(update_fields=["is_verified"])

    def update_activity(self):
        """Track user activity anywhere"""
        self.last_activity = timezone.now()
        self.save(update_fields=["last_activity"])

class EmailVerification(models.Model):

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='email_verifications'
    )

    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    is_used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def mark_used(self):
        self.is_used = True
        self.save(update_fields=["is_used"])

    def verify_user(self):
        """Single source of truth for verification"""
        self.user.mark_verified()
        self.mark_used()

    def __str__(self):
        return f"Verification for {self.user.email}"

    class Meta:
        ordering = ['-created_at']

class PasswordReset(models.Model):

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='password_resets'
    )

    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    is_used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=1)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def mark_used(self):
        self.is_used = True
        self.save(update_fields=["is_used"])

    def reset_password(self, new_password):
        """Central password reset logic"""
        self.user.set_password(new_password)
        self.user.password_changed_at = timezone.now()
        self.user.save(update_fields=["password", "password_changed_at"])
        self.mark_used()

    def __str__(self):
        return f"Password reset for {self.user.email}"

    class Meta:
        ordering = ['-created_at']          