# Generated manually to fix template slug index issue
from django.db import migrations


def drop_slug_constraint_or_index(apps, schema_editor):
    """Drop the templates_slug unique constraint or index if it exists.
    In PostgreSQL, UNIQUE creates a constraint; we must drop the constraint, not the index.
    """
    with schema_editor.connection.cursor() as cursor:
        # Get table OID for current schema (tenant or public)
        cursor.execute("SELECT 'templates'::regclass::oid")
        oid = cursor.fetchone()[0]
        if oid is None:
            return
        # Try dropping the constraint first (created by unique=True on slug)
        cursor.execute("""
            SELECT conname FROM pg_constraint
            WHERE conrelid = %s AND contype = 'u'
            AND conname LIKE 'templates_slug%%'
        """, [oid])
        constraints = cursor.fetchall()
        for (conname,) in constraints:
            try:
                cursor.execute('ALTER TABLE templates DROP CONSTRAINT IF EXISTS "{}"'.format(conname))
            except Exception as e:
                print("Error dropping constraint {}: {}".format(conname, e))
        # Then drop any remaining index on slug
        cursor.execute("""
            SELECT indexname FROM pg_indexes
            WHERE schemaname = current_schema() AND tablename = 'templates'
            AND indexname LIKE 'templates_slug%%'
        """)
        indexes = cursor.fetchall()
        for (index_name,) in indexes:
            try:
                cursor.execute('DROP INDEX IF EXISTS "{}"'.format(index_name))
            except Exception as e:
                print("Error dropping index {}: {}".format(index_name, e))


def reverse_drop_index(apps, schema_editor):
    """Reverse migration - do nothing as we can't recreate the exact index"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('media', '20251128_add_template_fields'),
    ]

    operations = [
        migrations.RunPython(drop_slug_constraint_or_index, reverse_drop_index),
    ]

