# Generated manually to add missing template fields
from django.db import migrations, models


def add_fields_if_not_exist(apps, schema_editor):
    """Add fields only if they don't exist. Idempotent: ignores DuplicateColumn."""
    with schema_editor.connection.cursor() as cursor:
        # Drop unique constraint first (PostgreSQL: constraint has same name as index)
        cursor.execute("""
            SELECT conname FROM pg_constraint
            WHERE conrelid = 'templates'::regclass AND contype = 'u'
            AND conname LIKE 'templates_slug%%'
        """)
        constraints = cursor.fetchall()
        for (conname,) in constraints:
            try:
                cursor.execute('ALTER TABLE templates DROP CONSTRAINT IF EXISTS "{}"'.format(conname))
            except Exception as e:
                print("Error dropping constraint {}: {}".format(conname, e))
        # Drop any remaining index on slug
        cursor.execute("""
            SELECT indexname FROM pg_indexes
            WHERE schemaname = current_schema() AND tablename = 'templates' AND indexname LIKE 'templates_slug%%'
        """)
        indexes = cursor.fetchall()
        for (index_name,) in indexes:
            try:
                cursor.execute('DROP INDEX IF EXISTS "{}"'.format(index_name))
            except Exception as e:
                print("Error dropping index {}: {}".format(index_name, e))
        
# Generated manually to add missing template fields
from django.db import migrations, models


def add_fields_if_not_exist(apps, schema_editor):
    """Add fields only if they don't exist. Idempotent (works on any PostgreSQL)."""
    with schema_editor.connection.cursor() as cursor:
        # Drop unique constraint first (PostgreSQL: constraint has same name as index)
        cursor.execute("""
            SELECT conname FROM pg_constraint
            WHERE conrelid = 'templates'::regclass AND contype = 'u'
            AND conname LIKE 'templates_slug%%'
        """)
        constraints = cursor.fetchall()
        for (conname,) in constraints:
            try:
                cursor.execute('ALTER TABLE templates DROP CONSTRAINT IF EXISTS "{}"'.format(conname))
            except Exception as e:
                print("Error dropping constraint {}: {}".format(conname, e))
        # Drop any remaining index on slug
        cursor.execute("""
            SELECT indexname FROM pg_indexes
            WHERE schemaname = current_schema() AND tablename = 'templates' AND indexname LIKE 'templates_slug%%'
        """)
        indexes = cursor.fetchall()
        for (index_name,) in indexes:
            try:
                cursor.execute('DROP INDEX IF EXISTS "{}"'.format(index_name))
            except Exception as e:
                print("Error dropping index {}: {}".format(index_name, e))
        # Add each column only if missing (DO block for compatibility with PG < 9.6)
        for col_name, col_type in [
            ("html_content", "TEXT"),
            ("css_content", "TEXT"),
            ("preview_image", "VARCHAR(100)"),
        ]:
            # Use literal in DO block to avoid injection; col_name is from our list
            safe_name = col_name.replace('"', '""')
            cursor.execute(
                """
                DO $mig$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema = current_schema() AND table_name = 'templates' AND column_name = %s
                    ) THEN
                        EXECUTE 'ALTER TABLE templates ADD COLUMN "' || %s || '" ' || %s;
                    END IF;
                END $mig$;
                """,
                [col_name, safe_name, col_type],
            )


def remove_fields_if_exist(apps, schema_editor):
    """Remove fields if they exist (for reverse migration)"""
    with schema_editor.connection.cursor() as cursor:
        for field_name in ['html_content', 'css_content', 'preview_image']:
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = current_schema() AND table_name='templates' AND column_name=%s
            """, [field_name])
            if cursor.fetchone():
                cursor.execute('ALTER TABLE templates DROP COLUMN "{}"'.format(field_name))


class Migration(migrations.Migration):

    dependencies = [
        ('media', '20251127_010759_add_template_variables'),
    ]

    operations = [
        migrations.RunPython(add_fields_if_not_exist, remove_fields_if_exist),
        # Make slug not unique (for multi-tenant) - only if unique constraint exists
        # Note: The unique index will be dropped by migration 20251210_fix_template_slug_index
        migrations.AlterField(
            model_name='template',
            name='slug',
            field=models.SlugField(max_length=255),
        ),
    ]

