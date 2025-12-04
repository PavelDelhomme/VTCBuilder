# Generated manually
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('media', '0001_initial'),
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='media',
            name='project',
            field=models.ForeignKey(
                blank=True,
                help_text="Projet auquel ce média est lié (null = média global)",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='media_files',
                to='projects.project'
            ),
        ),
    ]

