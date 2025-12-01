"""
Migration to add variables field to Template model
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('media', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='template',
            name='variables',
            field=models.JSONField(blank=True, default=dict, help_text='Variables disponibles dans le template (ex: {{company_name}}, {{logo_url}})'),
        ),
    ]
