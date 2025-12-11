# Generated manually to fix template slug index issue
from django.db import migrations


def drop_index_if_exists(apps, schema_editor):
    """Drop the templates_slug index if it exists"""
    db_alias = schema_editor.connection.alias
    with schema_editor.connection.cursor() as cursor:
        # Check if index exists (PostgreSQL)
        cursor.execute("""
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename = 'templates' 
            AND indexname LIKE 'templates_slug%'
        """)
        indexes = cursor.fetchall()
        
        for index in indexes:
            index_name = index[0]
            try:
                cursor.execute(f"DROP INDEX IF EXISTS {index_name}")
                print(f"Dropped index: {index_name}")
            except Exception as e:
                print(f"Error dropping index {index_name}: {e}")


def reverse_drop_index(apps, schema_editor):
    """Reverse migration - do nothing as we can't recreate the exact index"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('media', '20251128_add_template_fields'),
    ]

    operations = [
        migrations.RunPython(drop_index_if_exists, reverse_drop_index),
    ]

