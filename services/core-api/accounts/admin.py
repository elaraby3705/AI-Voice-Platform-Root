from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OneTimePassword


# ---------------------------------------------------------
# 1. User Admin (Customized for Email Auth)
# ---------------------------------------------------------
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Ordering and searching based on email instead of username
    ordering = ('email',)
    list_display = ('email', 'first_name', 'last_name', 'is_active', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')

    # Edit User Screen: Remove the default username field
    fieldsets = (
        ('Login Credentials', {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )

    # Add User Screen: Remove the default username field
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password'),
        }),
    )


# ---------------------------------------------------------
# 2. OTP Admin (For Monitoring Verification Codes)
# ---------------------------------------------------------
@admin.register(OneTimePassword)
class OneTimePasswordAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'created_at', 'is_active_code')
    search_fields = ('user__email', 'code')
    readonly_fields = ('created_at',)

    # Helper function to display a boolean icon (check/cross) if the code is still valid
    def is_active_code(self, obj):
        return obj.is_valid()

    is_active_code.boolean = True
    is_active_code.short_description = 'Valid (Under 5 mins)'