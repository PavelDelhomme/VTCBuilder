"""
Unit tests for Billing models
"""
import pytest
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from django_tenants.utils import schema_context
from billing.models import PricingPlan, Subscription, Invoice, Payment, PaymentMethod
from tenants.models import Tenant


@pytest.mark.django_db
@pytest.mark.model
class TestPricingPlan:
    """Tests for PricingPlan model"""

    def test_create_pricing_plan(self):
        """Test creating a pricing plan"""
        plan = PricingPlan.objects.create(
            name='Starter Plan',
            slug='starter',
            description='Basic plan',
            price_monthly=Decimal('19.99'),
            price_yearly=Decimal('199.99'),
            currency='EUR',
            max_sites=1,
            max_users=2,
            max_storage_gb=5,
            is_active=True,
            is_featured=False,
            order=1
        )
        assert plan.name == 'Starter Plan'
        assert plan.slug == 'starter'
        assert plan.price_monthly == Decimal('19.99')
        assert plan.is_active is True
        assert plan.order == 1

    def test_pricing_plan_str(self):
        """Test string representation"""
        plan = PricingPlan.objects.create(
            name='Business Plan',
            slug='business',
            price_monthly=Decimal('49.99')
        )
        assert str(plan) == 'Business Plan'

    def test_pricing_plan_ordering(self):
        """Test pricing plan ordering"""
        plan1 = PricingPlan.objects.create(
            name='Plan 1',
            slug='plan-1',
            price_monthly=Decimal('10.00'),
            order=2
        )
        plan2 = PricingPlan.objects.create(
            name='Plan 2',
            slug='plan-2',
            price_monthly=Decimal('20.00'),
            order=1
        )
        plans = list(PricingPlan.objects.all())
        assert plans[0] == plan2  # Lower order first
        assert plans[1] == plan1


@pytest.mark.django_db
@pytest.mark.model
class TestSubscription:
    """Tests for Subscription model"""

    @pytest.fixture
    def tenant(self):
        """Create a test tenant"""
        with schema_context('public'):
            return Tenant.objects.create(
                name='Test Tenant',
                email='test@tenant.com',
                slug='test-tenant'
            )

    @pytest.fixture
    def plan(self):
        """Create a test pricing plan"""
        return PricingPlan.objects.create(
            name='Test Plan',
            slug='test-plan',
            price_monthly=Decimal('29.99')
        )

    def test_create_subscription(self, tenant, plan):
        """Test creating a subscription"""
        now = timezone.now()
        subscription = Subscription.objects.create(
            tenant=tenant,
            plan=plan,
            status='trial',
            billing_cycle='monthly',
            trial_start=now,
            trial_end=now + timedelta(days=14),
            current_period_start=now,
            current_period_end=now + timedelta(days=30)
        )
        assert subscription.tenant == tenant
        assert subscription.plan == plan
        assert subscription.status == 'trial'
        assert subscription.billing_cycle == 'monthly'

    def test_subscription_is_trial(self, tenant, plan):
        """Test is_trial method"""
        now = timezone.now()
        subscription = Subscription.objects.create(
            tenant=tenant,
            plan=plan,
            status='trial',
            current_period_start=now,
            current_period_end=now + timedelta(days=30),
            trial_end=now + timedelta(days=7)
        )
        assert subscription.is_trial() is True

        subscription.status = 'active'
        subscription.save()
        assert subscription.is_trial() is False

    def test_subscription_str(self, tenant, plan):
        """Test string representation"""
        subscription = Subscription.objects.create(
            tenant=tenant,
            plan=plan,
            current_period_start=timezone.now(),
            current_period_end=timezone.now() + timedelta(days=30)
        )
        assert str(subscription) == f'{tenant.name} - {plan.name}'


@pytest.mark.django_db
@pytest.mark.model
class TestInvoice:
    """Tests for Invoice model"""

    @pytest.fixture
    def tenant(self):
        with schema_context('public'):
            return Tenant.objects.create(
                name='Test Tenant',
                email='test@tenant.com',
                slug='test-tenant'
            )

    @pytest.fixture
    def plan(self):
        return PricingPlan.objects.create(
            name='Test Plan',
            slug='test-plan',
            price_monthly=Decimal('29.99')
        )

    @pytest.fixture
    def subscription(self, tenant, plan):
        now = timezone.now()
        return Subscription.objects.create(
            tenant=tenant,
            plan=plan,
            current_period_start=now,
            current_period_end=now + timedelta(days=30)
        )

    def test_create_invoice(self, subscription):
        """Test creating an invoice"""
        invoice = Invoice.objects.create(
            subscription=subscription,
            tenant=subscription.tenant,
            invoice_number='INV-001',
            status='draft',
            subtotal=Decimal('29.99'),
            tax=Decimal('5.99'),
            total=Decimal('35.98'),
            currency='EUR',
            issue_date=timezone.now().date(),
            due_date=(timezone.now() + timedelta(days=30)).date()
        )
        assert invoice.invoice_number == 'INV-001'
        assert invoice.status == 'draft'
        assert invoice.total == Decimal('35.98')
        assert invoice.tenant == subscription.tenant

    def test_invoice_str(self, subscription):
        """Test string representation"""
        invoice = Invoice.objects.create(
            subscription=subscription,
            tenant=subscription.tenant,
            invoice_number='INV-001',
            status='draft',
            subtotal=Decimal('29.99'),
            tax=Decimal('0.00'),
            total=Decimal('29.99'),
            currency='EUR',
            issue_date=timezone.now().date(),
            due_date=(timezone.now() + timedelta(days=30)).date()
        )
        assert 'INV-001' in str(invoice)
        assert subscription.tenant.name in str(invoice)


@pytest.mark.django_db
@pytest.mark.model
class TestPayment:
    """Tests for Payment model"""

    @pytest.fixture
    def tenant(self):
        with schema_context('public'):
            return Tenant.objects.create(
                name='Test Tenant',
                email='test@tenant.com',
                slug='test-tenant'
            )

    @pytest.fixture
    def plan(self):
        return PricingPlan.objects.create(
            name='Test Plan',
            slug='test-plan',
            price_monthly=Decimal('29.99')
        )

    @pytest.fixture
    def subscription(self, tenant, plan):
        now = timezone.now()
        return Subscription.objects.create(
            tenant=tenant,
            plan=plan,
            current_period_start=now,
            current_period_end=now + timedelta(days=30)
        )

    @pytest.fixture
    def invoice(self, subscription):
        return Invoice.objects.create(
            subscription=subscription,
            tenant=subscription.tenant,
            invoice_number='INV-001',
            status='open',
            subtotal=Decimal('29.99'),
            tax=Decimal('0.00'),
            total=Decimal('29.99'),
            currency='EUR',
            issue_date=timezone.now().date(),
            due_date=(timezone.now() + timedelta(days=30)).date()
        )

    def test_create_payment(self, invoice):
        """Test creating a payment"""
        payment = Payment.objects.create(
            invoice=invoice,
            tenant=invoice.tenant,
            amount=Decimal('29.99'),
            currency='EUR',
            status='succeeded',
            method='card'
        )
        assert payment.invoice == invoice
        assert payment.amount == Decimal('29.99')
        assert payment.status == 'succeeded'
        assert payment.method == 'card'

