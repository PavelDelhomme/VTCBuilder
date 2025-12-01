"""
Serializers for billing models
"""
from rest_framework import serializers
from .models import PricingPlan, Subscription, Invoice, Payment, PaymentMethod, InvoiceTemplate
from tenants.serializers import TenantSerializer
from tenants.models import Tenant


class PricingPlanSerializer(serializers.ModelSerializer):
    """Serializer for PricingPlan"""
    
    class Meta:
        model = PricingPlan
        fields = [
            'id', 'name', 'slug', 'description',
            'price_monthly', 'price_yearly', 'currency',
            'max_sites', 'max_users', 'max_storage_gb', 'features',
            'is_active', 'is_featured', 'order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Auto-generate slug if not provided"""
        from django.utils.text import slugify
        if not validated_data.get('slug'):
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for Subscription with detailed information"""
    plan = PricingPlanSerializer(read_only=True)
    plan_id = serializers.PrimaryKeyRelatedField(
        queryset=PricingPlan.objects.all(),
        source='plan',
        write_only=True,
        required=False
    )
    tenant = TenantSerializer(read_only=True)
    tenant_id = serializers.PrimaryKeyRelatedField(
        queryset=Tenant.objects.all(),
        source='tenant',
        write_only=True,
        required=False,
        allow_null=True
    )
    # Include related invoices count and summary
    invoices_count = serializers.SerializerMethodField()
    unpaid_invoices_count = serializers.SerializerMethodField()
    total_invoiced = serializers.SerializerMethodField()
    total_paid = serializers.SerializerMethodField()
    unpaid_amount = serializers.SerializerMethodField()
    last_invoice_date = serializers.SerializerMethodField()
    last_payment_date = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'tenant', 'tenant_id', 'plan', 'plan_id',
            'status', 'billing_cycle',
            'trial_start', 'trial_end',
            'current_period_start', 'current_period_end',
            'cancelled_at',
            'stripe_subscription_id', 'stripe_customer_id',
            'invoices_count', 'unpaid_invoices_count',
            'total_invoiced', 'total_paid', 'unpaid_amount',
            'last_invoice_date', 'last_payment_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'trial_start', 'trial_end', 
                          'current_period_start', 'current_period_end', 'cancelled_at']
    
    def get_invoices_count(self, obj):
        """Get total number of invoices"""
        return obj.invoices.count()
    
    def get_unpaid_invoices_count(self, obj):
        """Get number of unpaid invoices"""
        return obj.invoices.filter(status__in=['open', 'draft']).count()
    
    def get_total_invoiced(self, obj):
        """Get total amount invoiced"""
        from django.db.models import Sum
        total = obj.invoices.aggregate(Sum('total'))['total__sum']
        return float(total) if total else 0.0
    
    def get_total_paid(self, obj):
        """Get total amount paid"""
        from django.db.models import Sum
        total = obj.invoices.filter(status='paid').aggregate(Sum('total'))['total__sum']
        return float(total) if total else 0.0
    
    def get_unpaid_amount(self, obj):
        """Get total unpaid amount"""
        from django.db.models import Sum
        total = obj.invoices.filter(status__in=['open', 'draft']).aggregate(Sum('total'))['total__sum']
        return float(total) if total else 0.0
    
    def get_last_invoice_date(self, obj):
        """Get date of last invoice"""
        last_invoice = obj.invoices.order_by('-created_at').first()
        return last_invoice.created_at.isoformat() if last_invoice else None
    
    def get_last_payment_date(self, obj):
        """Get date of last successful payment"""
        from billing.models import Payment
        last_payment = Payment.objects.filter(
            invoice__subscription=obj,
            status='succeeded'
        ).order_by('-paid_at').first()
        return last_payment.paid_at.isoformat() if last_payment and last_payment.paid_at else None


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for Invoice"""
    subscription = SubscriptionSerializer(read_only=True)
    tenant = TenantSerializer(read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'subscription', 'tenant',
            'invoice_number', 'status',
            'subtotal', 'tax', 'total', 'currency',
            'issue_date', 'due_date', 'paid_at',
            'stripe_invoice_id', 'pdf_url',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment"""
    invoice = InvoiceSerializer(read_only=True)
    tenant = TenantSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'invoice', 'tenant',
            'amount', 'currency', 'status', 'method',
            'stripe_payment_intent_id',
            'paid_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer for PaymentMethod"""
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'name', 'method_type', 'description',
            'is_active', 'is_enabled', 'requires_validation',
            'settings', 'icon', 'order',
            'fee_percentage', 'fee_fixed',
            'min_amount', 'max_amount',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InvoiceTemplateSerializer(serializers.ModelSerializer):
    """Serializer for InvoiceTemplate"""
    
    class Meta:
        model = InvoiceTemplate
        fields = [
            'id', 'name', 'description',
            'html_template', 'css_styles', 'js_script',
            'is_default', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Ensure only one default template"""
        if data.get('is_default'):
            # If setting as default, unset other defaults
            InvoiceTemplate.objects.filter(is_default=True).update(is_default=False)
        return data

