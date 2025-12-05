# Generated migration for soft delete
from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0002_add_is_active_to_project_page'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='is_deleted',
            field=models.BooleanField(default=False, help_text='Projet supprimé (dans la corbeille)'),
        ),
        migrations.AddField(
            model_name='project',
            name='deleted_at',
            field=models.DateTimeField(blank=True, help_text='Date de suppression', null=True),
        ),
    ]

