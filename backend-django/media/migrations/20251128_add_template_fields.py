# Generated manually to add missing template fields
from django.db import migrations, models


def add_fields_if_not_exist(apps, schema_editor):
    """Add fields only if they don't exist"""
    db_alias = schema_editor.connection.alias
    with schema_editor.connection.cursor() as cursor:
        # First, drop any existing unique index on slug if it exists
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
            except Exception as e:
                print(f"Error dropping index {index_name}: {e}")
        
        # Check if html_content exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='templates' AND column_name='html_content'
        """)
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE templates ADD COLUMN html_content TEXT")
        
        # Check if css_content exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='templates' AND column_name='css_content'
        """)
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE templates ADD COLUMN css_content TEXT")
        
        # Check if preview_image exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='templates' AND column_name='preview_image'
        """)
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE templates ADD COLUMN preview_image VARCHAR(100)")


def remove_fields_if_exist(apps, schema_editor):
    """Remove fields if they exist (for reverse migration)"""
    db_alias = schema_editor.connection.alias
    with schema_editor.connection.cursor() as cursor:
        for field_name in ['html_content', 'css_content', 'preview_image']:
            cursor.execute(f"""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='templates' AND column_name='{field_name}'
            """)
            if cursor.fetchone():
                cursor.execute(f"ALTER TABLE templates DROP COLUMN {field_name}")


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

