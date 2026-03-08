from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project

User = get_user_model()


# ---------------------------------------------------------
# 1. User Basic Serializer (For nested display)
# ---------------------------------------------------------
class UserBasicSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer to return basic user details
    instead of just the ID for frontend rendering.
    """

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']


# ---------------------------------------------------------
# 2. Project Serializer (Enterprise Grade)
# ---------------------------------------------------------
class ProjectSerializer(serializers.ModelSerializer):
    # Read-only nested serializers to display user details in the response
    owner_details = UserBasicSerializer(source='owner', read_only=True)
    manager_details = UserBasicSerializer(source='manager', read_only=True)
    team_details = UserBasicSerializer(source='team', many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            # Core Identifiers
            'id', 'name', 'slug', 'description',

            # AI & Analytics Layer
            'ai_summary', 'completion_percentage', 'risk_level', 'tags',

            # Classification
            'status', 'priority',

            # Financials
            'allocated_budget', 'spent_budget', 'estimated_hours',

            # Team & Relationships
            'owner', 'owner_details',
            'manager', 'manager_details',
            'team', 'team_details',

            # Timeline & Audit
            'start_date', 'target_end_date', 'actual_end_date',
            'is_archived', 'created_at', 'updated_at'
        ]

        # System-managed fields that should not be altered via API requests
        # Note: 'owner' is kept read-only as requested, assuming it is set in the View.
        read_only_fields = ['id', 'slug', 'owner', 'created_at', 'updated_at']

    # ---------------------------------------------------------
    # 3. Custom Validation (Business Logic)
    # ---------------------------------------------------------
    def validate(self, data):
        """
        Ensure logical data integrity before saving.
        """
        start_date = data.get('start_date')
        target_end_date = data.get('target_end_date')

        # Ensure target end date is not logically placed before start date
        if start_date and target_end_date and start_date > target_end_date:
            raise serializers.ValidationError({
                "target_end_date": "Target end date cannot be before the start date."
            })

        return data