"""
Serializers for media models
"""
import time
from rest_framework import serializers
from .models import Media, Template


class MediaSerializer(serializers.ModelSerializer):
    """Serializer for Media model"""
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    url = serializers.SerializerMethodField()
    file_extension = serializers.ReadOnlyField()
    is_image = serializers.ReadOnlyField()
    is_video = serializers.ReadOnlyField()
    is_audio = serializers.ReadOnlyField()
    is_document = serializers.ReadOnlyField()

    class Meta:
        model = Media
        fields = [
            'id', 'tenant', 'tenant_name', 'project', 'project_name', 'name', 'file_name', 'mime_type',
            'path', 'disk', 'size', 'collection', 'alt_text', 'order',
            'metadata', 'url', 'file_extension', 'is_image', 'is_video',
            'is_audio', 'is_document', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_url(self, obj):
        """Get the full URL for the media file"""
        return obj.url


class MediaUploadSerializer(serializers.ModelSerializer):
    """Serializer for media upload"""
    file = serializers.FileField(write_only=True, required=True)
    project_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Media
        fields = [
            'file', 'name', 'collection', 'alt_text', 'project_id'
        ]

    def create(self, validated_data):
        """Create media from uploaded file"""
        import os
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile
        from django.utils.text import slugify
        from django.conf import settings
        
        file = validated_data.pop('file')
        
        # Generate file info
        file_name = file.name
        file_size = file.size
        mime_type = file.content_type or 'application/octet-stream'
        
        # Generate name if not provided
        name = validated_data.get('name') or os.path.splitext(file_name)[0]
        
        # Determine collection from mime type if not provided
        collection = validated_data.get('collection', 'other')
        if not collection or collection == 'other':
            if mime_type.startswith('image/'):
                collection = 'images'
            elif mime_type.startswith('video/'):
                collection = 'videos'
            elif mime_type.startswith('audio/'):
                collection = 'audio'
            elif mime_type.startswith('application/') or mime_type.startswith('text/'):
                collection = 'documents'
            else:
                collection = 'other'
        
        # Generate path for storage
        # Use tenant ID if available, otherwise use 'default'
        tenant = validated_data.get('tenant')
        tenant_prefix = f'tenant_{tenant.id}' if tenant else 'default'
        safe_name = slugify(name) or 'file'
        timestamp = int(time.time())
        file_extension = os.path.splitext(file_name)[1]
        storage_path = f'media/{tenant_prefix}/{timestamp}_{safe_name}{file_extension}'
        
        # Save file to storage
        try:
            # Read file content
            file_content = file.read()
            file.seek(0)  # Reset file pointer
            
            # Save to default storage
            saved_path = default_storage.save(storage_path, ContentFile(file_content))
            
            # Get project if project_id provided
            project = None
            project_id = validated_data.get('project_id')
            if project_id:
                try:
                    from projects.models import Project
                    project = Project.objects.get(id=project_id)
                except Project.DoesNotExist:
                    pass  # Si le projet n'existe pas, on continue sans projet
            
            # Create Media record
            media = Media.objects.create(
                tenant=tenant,
                project=project,
                name=name,
                file_name=file_name,
                mime_type=mime_type,
                path=saved_path,
                disk='local',
                size=file_size,
                collection=collection,
                alt_text=validated_data.get('alt_text', ''),
                order=validated_data.get('order', 0),
                metadata={}
            )
            
            return media
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error saving file: {e}", exc_info=True)
            raise serializers.ValidationError(f'Erreur lors de la sauvegarde du fichier: {str(e)}')


class MediaListSerializer(serializers.ModelSerializer):
    """Simplified serializer for media listings"""
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    url = serializers.SerializerMethodField()
    file_extension = serializers.ReadOnlyField()

    class Meta:
        model = Media
        fields = [
            'id', 'tenant', 'tenant_name', 'project', 'project_name', 'name', 'file_name',
            'mime_type', 'size', 'collection', 'url', 'file_extension',
            'created_at'
        ]

    def get_url(self, obj):
        """Get the full URL for the media file"""
        return obj.url


class TemplateSerializer(serializers.ModelSerializer):
    """Serializer for Template model"""
    
    def create(self, validated_data):
        """Auto-generate slug if not provided"""
        if not validated_data.get('slug') and validated_data.get('name'):
            from django.utils.text import slugify
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Auto-generate slug if name changed and slug not provided"""
        if 'name' in validated_data and not validated_data.get('slug') and not instance.slug:
            from django.utils.text import slugify
            validated_data['slug'] = slugify(validated_data['name'])
        return super().update(instance, validated_data)

    class Meta:
        model = Template
        fields = [
            'id', 'name', 'slug', 'description', 'preview_image',
            'structure', 'default_settings',
            'html_content', 'css_content', 'variables',
            'category', 'is_premium', 'price', 'is_active',
            'usage_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usage_count', 'created_at', 'updated_at']


class TemplateListSerializer(serializers.ModelSerializer):
    """Simplified serializer for template listings"""

    class Meta:
        model = Template
        fields = [
            'id', 'name', 'slug', 'description', 'preview_image',
            'category', 'is_premium', 'price', 'is_active', 'usage_count'
        ]
        read_only_fields = ['id', 'usage_count']


class TemplateUsageSerializer(serializers.ModelSerializer):
    """Serializer for template usage tracking"""

    class Meta:
        model = Template
        fields = ['id', 'usage_count']
        read_only_fields = ['id']
