# Generated manually for analytics app

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('tenants', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserAction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action_type', models.CharField(choices=[('page_view', 'Page View'), ('page_create', 'Page Created'), ('page_edit', 'Page Edited'), ('page_delete', 'Page Deleted'), ('block_add', 'Block Added'), ('block_edit', 'Block Edited'), ('block_delete', 'Block Deleted'), ('block_click', 'Block Clicked'), ('service_create', 'Service Created'), ('service_edit', 'Service Edited'), ('service_delete', 'Service Deleted'), ('booking_create', 'Booking Created'), ('booking_edit', 'Booking Edited'), ('booking_delete', 'Booking Deleted'), ('template_use', 'Template Used'), ('button_click', 'Button Clicked'), ('form_submit', 'Form Submitted'), ('login', 'User Login'), ('logout', 'User Logout'), ('register', 'User Registration'), ('subscription_create', 'Subscription Created'), ('subscription_update', 'Subscription Updated'), ('payment_success', 'Payment Succeeded'), ('payment_failed', 'Payment Failed'), ('feature_use', 'Feature Used'), ('project_create', 'Project Created'), ('project_edit', 'Project Edited'), ('project_delete', 'Project Deleted'), ('cta_click', 'CTA Clicked'), ('other', 'Other')], max_length=50)),
                ('action_name', models.CharField(help_text="Human-readable action name", max_length=255)),
                ('resource_type', models.CharField(blank=True, help_text="Type of resource (e.g., 'page', 'block', 'service')", max_length=100)),
                ('resource_id', models.IntegerField(blank=True, help_text='ID of the resource', null=True)),
                ('metadata', models.JSONField(blank=True, default=dict, help_text='Additional metadata about the action')),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('tenant', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='actions', to='tenants.tenant')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='actions', to='tenants.user')),
            ],
            options={
                'db_table': 'user_actions',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='FeatureUsage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('feature_name', models.CharField(max_length=100)),
                ('usage_count', models.IntegerField(default=0)),
                ('last_used_at', models.DateTimeField(blank=True, null=True)),
                ('first_used_at', models.DateTimeField(auto_now_add=True)),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='feature_usages', to='tenants.tenant')),
            ],
            options={
                'db_table': 'feature_usages',
                'ordering': ['-usage_count'],
                'unique_together': {('tenant', 'feature_name')},
            },
        ),
        migrations.AddIndex(
            model_name='useraction',
            index=models.Index(fields=['-created_at'], name='user_action_created_idx'),
        ),
        migrations.AddIndex(
            model_name='useraction',
            index=models.Index(fields=['action_type', '-created_at'], name='user_action_type_created_idx'),
        ),
        migrations.AddIndex(
            model_name='useraction',
            index=models.Index(fields=['user', '-created_at'], name='user_action_user_created_idx'),
        ),
        migrations.AddIndex(
            model_name='useraction',
            index=models.Index(fields=['tenant', '-created_at'], name='user_action_tenant_created_idx'),
        ),
        migrations.AddIndex(
            model_name='useraction',
            index=models.Index(fields=['resource_type', 'resource_id'], name='user_action_resource_idx'),
        ),
        migrations.AddIndex(
            model_name='featureusage',
            index=models.Index(fields=['tenant', '-usage_count'], name='feature_usage_tenant_usage_idx'),
        ),
        migrations.AddIndex(
            model_name='featureusage',
            index=models.Index(fields=['feature_name', '-usage_count'], name='feature_usage_feature_usage_idx'),
        ),
    ]

