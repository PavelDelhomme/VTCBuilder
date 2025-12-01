"""
Serializers for Block models
"""
from rest_framework import serializers
from .models import BlockType, BlockTemplate


class BlockTypeSerializer(serializers.ModelSerializer):
    """Serializer for BlockType"""
    available_plans = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=False,
        required=False,
        allow_empty=True
    )
    plan_names = serializers.SerializerMethodField()
    
    class Meta:
        model = BlockType
        fields = [
            'id', 'name', 'label', 'icon', 'category',
            'description', 'schema', 'default_styles',
            'call_to_action', 'available_plans', 'plan_names',
            'is_active', 'order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set queryset for available_plans dynamically to avoid import issues
        try:
            from billing.models import PricingPlan
            self.fields['available_plans'].queryset = PricingPlan.objects.all()
        except Exception:
            # If PricingPlan is not available yet, use read_only
            self.fields['available_plans'].read_only = True
    
    def get_plan_names(self, obj):
        """Return list of plan names for this block"""
        return [plan.name for plan in obj.available_plans.all()]


class BlockTemplateSerializer(serializers.ModelSerializer):
    """Serializer for BlockTemplate"""
    
    class Meta:
        model = BlockTemplate
        fields = [
            'id', 'tenant', 'name', 'description',
            'block_type', 'block_data', 'block_styles',
            'block_settings', 'is_global', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

