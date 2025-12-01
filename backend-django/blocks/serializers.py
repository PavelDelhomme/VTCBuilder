"""
Serializers for Block models
"""
from rest_framework import serializers
from .models import BlockType, BlockTemplate, CallToAction


class CallToActionSerializer(serializers.ModelSerializer):
    """Serializer for CallToAction"""
    
    class Meta:
        model = CallToAction
        fields = [
            'id', 'name', 'label', 'description', 'type',
            'default_text', 'default_url', 'styles', 'config',
            'is_active', 'is_global',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BlockTypeSerializer(serializers.ModelSerializer):
    """Serializer for BlockType"""
    # Use read_only for available_plans to avoid queryset requirement at class definition
    available_plans = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True  # Read-only to avoid queryset requirement
    )
    plan_names = serializers.SerializerMethodField()
    # Separate field for writing
    available_plan_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    
    # Call-to-actions
    call_to_actions = CallToActionSerializer(many=True, read_only=True)
    call_to_action_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = BlockType
        fields = [
            'id', 'name', 'label', 'icon', 'category',
            'description', 'schema', 'default_styles',
            'render_template', 'call_to_action', 
            'call_to_actions', 'call_to_action_ids',
            'available_plans', 'available_plan_ids', 'plan_names',
            'is_active', 'order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Handle available_plan_ids and call_to_action_ids on create"""
        plan_ids = validated_data.pop('available_plan_ids', None)
        cta_ids = validated_data.pop('call_to_action_ids', None)
        instance = super().create(validated_data)
        if plan_ids:
            from billing.models import PricingPlan
            instance.available_plans.set(PricingPlan.objects.filter(id__in=plan_ids))
        if cta_ids:
            instance.call_to_actions.set(CallToAction.objects.filter(id__in=cta_ids))
        return instance
    
    def update(self, instance, validated_data):
        """Handle available_plan_ids and call_to_action_ids on update"""
        plan_ids = validated_data.pop('available_plan_ids', None)
        cta_ids = validated_data.pop('call_to_action_ids', None)
        instance = super().update(instance, validated_data)
        if plan_ids is not None:
            from billing.models import PricingPlan
            instance.available_plans.set(PricingPlan.objects.filter(id__in=plan_ids))
        if cta_ids is not None:
            instance.call_to_actions.set(CallToAction.objects.filter(id__in=cta_ids))
        return instance
    
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

