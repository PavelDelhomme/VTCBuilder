"""
Project models for VTCBuilder - Group pages and tenants into projects/sites
"""
from django.db import models
from django.utils.text import slugify
from tenants.models import Tenant


class Project(models.Model):
    """
    Project/Site model to group pages and tenants
    Similar to WordPress multisite - each project is like a site
    """
    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('inactive', 'Inactif'),
        ('archived', 'Archivé'),
    ]
    
    # Basic Info
    name = models.CharField(max_length=255, help_text="Nom du projet/site")
    slug = models.SlugField(unique=True, help_text="Slug unique pour le projet")
    description = models.TextField(blank=True, help_text="Description du projet")
    
    # Owner (tenant or system)
    tenant = models.ForeignKey(
        Tenant, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        help_text="Tenant propriétaire du projet (null = projet système/public)"
    )
    is_system_project = models.BooleanField(
        default=False,
        help_text="Projet système (pages publiques VTCBuilder)"
    )
    
    # Settings
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='active'
    )
    
    # Domain/URL (optional)
    domain = models.CharField(
        max_length=255, 
        blank=True,
        help_text="Domaine personnalisé (ex: mon-site.com)"
    )
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    # Soft delete
    is_deleted = models.BooleanField(
        default=False,
        help_text="Projet supprimé (dans la corbeille)"
    )
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date de suppression"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']
        verbose_name = 'Projet'
        verbose_name_plural = 'Projets'
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        
        # Si le projet est désactivé, désactiver toutes ses pages
        if self.pk:  # Projet existant
            old_instance = Project.objects.get(pk=self.pk)
            if old_instance.status == 'active' and self.status != 'active':
                # Projet désactivé : désactiver toutes les pages
                ProjectPage.objects.filter(project=self).update(is_active=False)
            elif old_instance.status != 'active' and self.status == 'active':
                # Projet réactivé : les pages restent dans leur état actuel
                # (on ne les réactive pas automatiquement)
                pass
        
        super().save(*args, **kwargs)


class ProjectPage(models.Model):
    """
    Page within a project
    Links a page (from public_pages or tenant pages) to a project
    """
    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE,
        related_name='pages'
    )
    
    # Page reference (can be public page slug or tenant page ID)
    page_slug = models.CharField(
        max_length=255,
        help_text="Slug de la page (pour pages publiques) ou ID (pour pages tenant)"
    )
    page_type = models.CharField(
        max_length=20,
        choices=[
            ('public', 'Page Publique'),
            ('tenant', 'Page Tenant'),
        ],
        default='public'
    )
    
    # Order within project
    order = models.IntegerField(default=0)
    
    # Active status
    is_active = models.BooleanField(
        default=True,
        help_text="Page active dans le projet (affichée sur le site)"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'project_pages'
        ordering = ['order', '-created_at']
        # Une page ne peut être que dans un seul projet (page_slug + page_type unique)
        unique_together = [('page_slug', 'page_type')]
        verbose_name = 'Page de Projet'
        verbose_name_plural = 'Pages de Projet'
    
    def __str__(self):
        return f"{self.project.name} - {self.page_slug}"

