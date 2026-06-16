from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "product_title",
        "variant_name",
        "quantity",
        "price",
    )

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "status",
        "total_price",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "id",
        "user__id",
        "user__email",
    )

    ordering = ("-created_at",)

    inlines = [OrderItemInline]

    readonly_fields = (
        "total_price",
        "created_at",
    )

    fieldsets = (
        ("Order Info", {
            "fields": ("user", "session_id", "status", "total_price")
        }),
        ("Timestamps", {
            "fields": ("created_at",)
        }),
    )   