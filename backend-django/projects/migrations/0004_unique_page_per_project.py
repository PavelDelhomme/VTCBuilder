# Generated migration to ensure a page can only be in one project
from django.db import migrations, models


def remove_duplicate_pages(apps, schema_editor):
    """Supprimer les pages en double, garder seulement la première occurrence"""
    ProjectPage = apps.get_model('projects', 'ProjectPage')
    
    # Trouver les pages en double (même page_slug + page_type dans plusieurs projets)
    seen = {}
    duplicates = []
    
    for page in ProjectPage.objects.all().order_by('id'):
        key = (page.page_slug, page.page_type)
        if key in seen:
            duplicates.append(page.id)
        else:
            seen[key] = page.id
    
    # Supprimer les doublons
    if duplicates:
        ProjectPage.objects.filter(id__in=duplicates).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0003_add_soft_delete_to_project'),
    ]

    operations = [
        # Supprimer les pages en double avant d'appliquer la contrainte
        migrations.RunPython(remove_duplicate_pages, migrations.RunPython.noop),
        # Supprimer l'ancienne contrainte unique
        migrations.AlterUniqueTogether(
            name='projectpage',
            unique_together=set(),
        ),
        # Ajouter la nouvelle contrainte unique : une page (slug + type) ne peut être que dans un seul projet
        migrations.AlterUniqueTogether(
            name='projectpage',
            unique_together={('page_slug', 'page_type')},
        ),
    ]

