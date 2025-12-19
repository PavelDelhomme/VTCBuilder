# Generated migration for adding UUID field to Project model

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0005_allow_page_in_multiple_projects'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, help_text='UUID unique pour le projet (utilisé dans les URLs)', unique=True),
        ),
    ]

