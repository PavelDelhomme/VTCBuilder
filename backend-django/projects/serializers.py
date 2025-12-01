"""
Serializers for Project models
"""
from rest_framework import serializers
from .models import Project, ProjectPage
from tenants.serializers import TenantSerializer


class ProjectPageSerializer(serializers.ModelSerializer):
    """Serializer for ProjectPage"""
    
    class Meta:
        model = ProjectPage
        fields = [
            'id', 'project', 'page_slug', 'page_type', 
            'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project"""
    tenant = TenantSerializer(read_only=True)
    tenant_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    pages_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'slug', 'description', 'tenant', 'tenant_id',
            'is_system_project', 'status', 'domain', 'metadata',
            'pages_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_pages_count(self, obj):
        """Get count of pages in this project"""
        return obj.pages.count()
    
    def create(self, validated_data):
        """Create project with tenant_id handling"""
        tenant_id = validated_data.pop('tenant_id', None)
        if tenant_id:
            from tenants.models import Tenant
            validated_data['tenant'] = Tenant.objects.get(id=tenant_id)
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update project with tenant_id handling"""
        tenant_id = validated_data.pop('tenant_id', None)
        if tenant_id is not None:
            if tenant_id:
                from tenants.models import Tenant
                validated_data['tenant'] = Tenant.objects.get(id=tenant_id)
            else:
                validated_data['tenant'] = None
        return super().update(instance, validated_data)


class ProjectDetailSerializer(ProjectSerializer):
    """Detailed serializer with pages"""
    pages = ProjectPageSerializer(many=True, read_only=True)
    
    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['pages']

