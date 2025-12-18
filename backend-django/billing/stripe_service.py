"""
Stripe service for payment processing
"""
import stripe
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import Subscription, Invoice, Payment, PricingPlan
from tenants.models import Tenant

# Configure Stripe
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')


class StripeService:
    """Service for interacting with Stripe API"""
    
    @staticmethod
    def create_customer(tenant: Tenant, email: str) -> str:
        """
        Create a Stripe customer for a tenant
        Returns Stripe customer ID
        """
        try:
            customer = stripe.Customer.create(
                email=email,
                name=tenant.name,
                metadata={
                    'tenant_id': tenant.id,
                    'tenant_slug': tenant.slug,
                }
            )
            return customer.id
        except stripe.error.StripeError as e:
            raise Exception(f"Error création client Stripe: {str(e)}")
    
    @staticmethod
    def create_subscription(
        tenant: Tenant,
        pricing_plan: PricingPlan,
        billing_cycle: str = 'monthly',
        payment_method_id: str = None,
        trial_days: int = 14
    ) -> dict:
        """
        Create a Stripe subscription
        Returns Stripe subscription object
        """
        try:
            # Get or create Stripe customer
            if not tenant.subscription or not tenant.subscription.stripe_customer_id:
                customer_id = StripeService.create_customer(tenant, tenant.email)
            else:
                customer_id = tenant.subscription.stripe_customer_id
            
            # Calculate price based on billing cycle
            if billing_cycle == 'yearly' and pricing_plan.price_yearly:
                amount = int(pricing_plan.price_yearly * 100)  # Convert to cents
            else:
                amount = int(pricing_plan.price_monthly * 100)
            
            # Create or get price
            stripe_price_id = StripeService.get_or_create_price(
                pricing_plan,
                billing_cycle,
                amount
            )
            
            # Create subscription
            subscription_params = {
                'customer': customer_id,
                'items': [{'price': stripe_price_id}],
                'payment_behavior': 'default_incomplete',
                'payment_settings': {'save_default_payment_method': 'on_subscription'},
                'expand': ['latest_invoice.payment_intent'],
            }
            
            # Add trial period if trial_days > 0
            if trial_days > 0:
                subscription_params['trial_period_days'] = trial_days
                subscription_params['trial_settings'] = {
                    'end_behavior': {'missing_payment_method': 'cancel'}
                }
            
            # Add payment method if provided
            if payment_method_id:
                subscription_params['default_payment_method'] = payment_method_id
            
            subscription = stripe.Subscription.create(**subscription_params)
            
            return {
                'subscription_id': subscription.id,
                'customer_id': customer_id,
                'client_secret': subscription.latest_invoice.payment_intent.client_secret if subscription.latest_invoice.payment_intent else None,
                'status': subscription.status,
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Error création abonnement Stripe: {str(e)}")
    
    @staticmethod
    def get_or_create_price(pricing_plan: PricingPlan, billing_cycle: str, amount: int) -> str:
        """
        Get or create a Stripe Price for a pricing plan
        Returns Stripe price ID
        """
        # Try to find existing price
        try:
            prices = stripe.Price.list(
                lookup_keys=[f"{pricing_plan.slug}_{billing_cycle}"],
                limit=1
            )
            if prices.data:
                return prices.data[0].id
        except:
            pass
        
        # Create new price
        try:
            currency = pricing_plan.currency.lower()
            recurring = {
                'interval': 'month' if billing_cycle == 'monthly' else 'year',
            }
            
            price = stripe.Price.create(
                unit_amount=amount,
                currency=currency,
                recurring=recurring,
                product_data={
                    'name': pricing_plan.name,
                    'description': pricing_plan.description or '',
                },
                lookup_key=f"{pricing_plan.slug}_{billing_cycle}",
            )
            return price.id
        except stripe.error.StripeError as e:
            raise Exception(f"Error création prix Stripe: {str(e)}")
    
    @staticmethod
    def cancel_subscription(subscription: Subscription) -> dict:
        """
        Cancel a Stripe subscription
        """
        try:
            if not subscription.stripe_subscription_id:
                raise Exception("Pas d'ID Stripe pour cet abonnement")
            
            stripe_subscription = stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                cancel_at_period_end=True
            )
            
            return {
                'status': stripe_subscription.status,
                'cancel_at_period_end': stripe_subscription.cancel_at_period_end,
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Error annulation abonnement: {str(e)}")
    
    @staticmethod
    def reactivate_subscription(subscription: Subscription) -> dict:
        """
        Reactivate a cancelled subscription
        """
        try:
            if not subscription.stripe_subscription_id:
                raise Exception("Pas d'ID Stripe pour cet abonnement")
            
            stripe_subscription = stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                cancel_at_period_end=False
            )
            
            return {
                'status': stripe_subscription.status,
                'cancel_at_period_end': stripe_subscription.cancel_at_period_end,
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Error réactivation abonnement: {str(e)}")
    
    @staticmethod
    def update_subscription_plan(subscription: Subscription, new_plan: PricingPlan, billing_cycle: str = None) -> dict:
        """
        Update subscription to a new plan
        """
        try:
            if not subscription.stripe_subscription_id:
                raise Exception("Pas d'ID Stripe pour cet abonnement")
            
            # Get new price ID
            if billing_cycle is None:
                billing_cycle = subscription.billing_cycle
            
            if billing_cycle == 'yearly' and new_plan.price_yearly:
                amount = int(new_plan.price_yearly * 100)
            else:
                amount = int(new_plan.price_monthly * 100)
            
            new_price_id = StripeService.get_or_create_price(new_plan, billing_cycle, amount)
            
            # Get current subscription
            stripe_subscription = stripe.Subscription.retrieve(subscription.stripe_subscription_id)
            
            # Update subscription
            updated_subscription = stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                items=[{
                    'id': stripe_subscription['items']['data'][0].id,
                    'price': new_price_id,
                }],
                proration_behavior='create_prorations',
            )
            
            return {
                'subscription_id': updated_subscription.id,
                'status': updated_subscription.status,
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Error mise à jour abonnement: {str(e)}")
    
    @staticmethod
    def create_payment_intent(amount: Decimal, currency: str = 'EUR', customer_id: str = None) -> dict:
        """
        Create a Stripe Payment Intent
        """
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency=currency.lower(),
                customer=customer_id,
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            return {
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id,
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Error création Payment Intent: {str(e)}")
    
    @staticmethod
    def attach_payment_method(customer_id: str, payment_method_id: str) -> dict:
        """
        Attach a payment method to a customer
        """
        try:
            payment_method = stripe.PaymentMethod.attach(
                payment_method_id,
                customer=customer_id,
            )
            return {
                'payment_method_id': payment_method.id,
                'type': payment_method.type,
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Error attachement payment method: {str(e)}")
    
    @staticmethod
    def get_payment_methods(customer_id: str) -> list:
        """
        Get all payment methods for a customer
        """
        try:
            payment_methods = stripe.PaymentMethod.list(
                customer=customer_id,
                type='card',
            )
            return [
                {
                    'id': pm.id,
                    'type': pm.type,
                    'card': {
                        'brand': pm.card.brand,
                        'last4': pm.card.last4,
                        'exp_month': pm.card.exp_month,
                        'exp_year': pm.card.exp_year,
                    } if pm.card else None,
                }
                for pm in payment_methods.data
            ]
        except stripe.error.StripeError as e:
            raise Exception(f"Error récupération payment methods: {str(e)}")
    
    @staticmethod
    def create_setup_intent(customer_id: str) -> dict:
        """
        Create a Stripe Setup Intent to collect payment method without charging
        Returns setup intent with client_secret
        """
        try:
            setup_intent = stripe.SetupIntent.create(
                customer=customer_id,
                payment_method_types=['card'],
                usage='off_session',  # For future payments
            )
            return {
                'client_secret': setup_intent.client_secret,
                'setup_intent_id': setup_intent.id,
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Error création Setup Intent: {str(e)}")
    
    @staticmethod
    def attach_payment_method_to_subscription(
        subscription: Subscription,
        payment_method_id: str
    ) -> dict:
        """
        Attach a payment method to a subscription for future payments
        """
        try:
            if not subscription.stripe_customer_id:
                raise Exception("Pas de customer Stripe pour cet abonnement")
            
            # Attach payment method to customer
            StripeService.attach_payment_method(subscription.stripe_customer_id, payment_method_id)
            
            # Set as default payment method for customer
            stripe.Customer.modify(
                subscription.stripe_customer_id,
                invoice_settings={
                    'default_payment_method': payment_method_id,
                }
            )
            
            # If subscription exists in Stripe, update it
            if subscription.stripe_subscription_id:
                stripe.Subscription.modify(
                    subscription.stripe_subscription_id,
                    default_payment_method=payment_method_id,
                )
            
            return {
                'success': True,
                'payment_method_id': payment_method_id,
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Error attachement payment method: {str(e)}")

