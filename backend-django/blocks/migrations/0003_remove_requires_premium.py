# Generated migration to remove requires_premium field

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('blocks', '0002_replace_premium_with_plans_and_add_cta'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='blocktype',
            name='requires_premium',
        ),
    ]
