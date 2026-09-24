#!/usr/bin/env python3
"""Crée un projet HuberaPress par produit (landing éditable, style WordPress)."""
from django.core.management.base import BaseCommand
from django_tenants.utils import schema_context
from projects.models import Project, ProjectPage
from tenants.models import Tenant

SITES = [
    {"slug": "hubera-id", "name": "Hubera ID", "domain": "id.hubera.cloud", "login": "/migrate.html", "admin": "/migrate.html"},
    {"slug": "hubera-mail", "name": "Hubera Mail", "domain": "mail.hubera.cloud", "login": "/app/mail/", "admin": "/4dm1n"},
    {"slug": "hubera-drive", "name": "Hubera Drive", "domain": "drive.hubera.cloud", "login": "/app/drive/", "admin": "/4dm1n"},
    {"slug": "hubera-pass", "name": "Hubera Pass", "domain": "pass.hubera.cloud", "login": "/app/pass", "admin": "/4dm1n"},
    {"slug": "hubera-calendar", "name": "Hubera Calendar", "domain": "calendar.hubera.cloud", "login": "/app/calendar", "admin": "/4dm1n"},
    {"slug": "hubera-contacts", "name": "Hubera Contacts", "domain": "contacts.hubera.cloud", "login": "/app/contacts", "admin": "/4dm1n"},
    {"slug": "hubera-notes", "name": "Hubera Notes", "domain": "notes.hubera.cloud", "login": "/app/notes", "admin": "/4dm1n"},
    {"slug": "hubera-photos", "name": "Hubera Photos", "domain": "photos.hubera.cloud", "login": "/app/photos", "admin": "/4dm1n"},
    {"slug": "hubera-office", "name": "Hubera Office", "domain": "office.hubera.cloud", "login": "/app", "admin": "/4dm1n"},
    {"slug": "hubera-maps", "name": "Hubera Maps", "domain": "maps.hubera.cloud", "login": "/app/", "admin": "/app/"},
    {"slug": "hubera-music", "name": "Hubera Music", "domain": "music.hubera.cloud", "login": "/app", "admin": "/app"},
    {"slug": "hubera-fuel", "name": "Hubera Fuel", "domain": "fuel.hubera.cloud", "login": "/auth", "admin": "/admin"},
    {"slug": "hubera-jobs", "name": "Hubera Jobs", "domain": "jobs.hubera.cloud", "login": "/login", "admin": "/backoffice"},
    {"slug": "hubera-budget", "name": "Hubera Budget", "domain": "budget.hubera.cloud", "login": "/app/", "admin": "/app/"},
    {"slug": "hubera-tasks", "name": "Hubera Tasks", "domain": "tasks.hubera.cloud", "login": "/app/", "admin": "/app/"},
    {"slug": "hubera-stream", "name": "Hubera Stream", "domain": "stream.hubera.cloud", "login": "/app/", "admin": "/app/"},
    {"slug": "hubera-press", "name": "HuberaPress", "domain": "press.hubera.cloud", "login": "/login", "admin": "/admin/dashboard"},
    {"slug": "hubera-vtcbuilder", "name": "VTCBuilder", "domain": "vtcbuilder.hubera.cloud", "login": "/login", "admin": "/admin/dashboard"},
]


class Command(BaseCommand):
    help = "Initialise les projets landing Hubera (un site Press par app web)"

    def handle(self, *args, **options):
        public = Tenant.objects.filter(schema_name="public").first()
        if not public:
            self.stderr.write("Tenant public introuvable")
            return
        created = 0
        with schema_context("public"):
            for site in SITES:
                proj, was = Project.objects.get_or_create(
                    slug=site["slug"],
                    defaults={
                        "name": site["name"],
                        "description": f"Landing {site['name']} — {site['domain']}",
                        "is_system_project": True,
                        "tenant": public,
                        "status": "active",
                        "domain": site["domain"],
                        "metadata": {
                            "kind": "hubera-product-landing",
                            "login": site["login"],
                            "admin": site["admin"],
                            "host": site["domain"],
                        },
                    },
                )
                if not was:
                    proj.domain = site["domain"]
                    proj.metadata = {**(proj.metadata or {}), **{
                        "kind": "hubera-product-landing",
                        "login": site["login"],
                        "admin": site["admin"],
                        "host": site["domain"],
                    }}
                    proj.save(update_fields=["domain", "metadata", "updated_at"])
                else:
                    created += 1
                ProjectPage.objects.get_or_create(
                    project=proj,
                    page_slug="home",
                    page_type="public",
                    defaults={"order": 1},
                )
                self.stdout.write(f"{'créé' if was else 'ok'} {proj.slug} → {site['domain']}")
        self.stdout.write(self.style.SUCCESS(f"Landings HuberaPress prêtes ({created} nouveaux)"))
