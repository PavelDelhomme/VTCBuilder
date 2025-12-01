"""
Management command to create default templates with HTML, CSS and variables
"""
from django.core.management.base import BaseCommand
from django_tenants.utils import tenant_context
from tenants.models import Tenant
from media.models import Template


class Command(BaseCommand):
    help = 'Create default templates with HTML, CSS and variables'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🎨 Création des templates par défaut...\n'))

        # Get or create reference tenant
        tenant = Tenant.objects.filter(slug='reference-tenant').first()
        if not tenant:
            tenant, created = Tenant.objects.get_or_create(
                slug='reference-tenant',
                defaults={
                    'name': 'Reference Tenant',
                    'email': 'reference@vtcbuilder.com',
                    'status': 'active',
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✅ Tenant de référence créé: {tenant.name}'))

        with tenant_context(tenant):
            templates_data = [
                {
                    'name': 'Template VTC Minimaliste',
                    'slug': 'vtc-minimaliste',
                    'description': 'Template minimaliste pour entreprises VTC avec design épuré',
                    'category': 'vtc',
                    'is_premium': False,
                    'html_content': '''<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{site_title}}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    {% if logo_url %}
                    <img src="{{logo_url}}" alt="{{company_name}}" class="logo-img">
                    {% else %}
                    <h1 class="logo-text">{{company_name}}</h1>
                    {% endif %}
                </div>
                <nav class="nav">
                    <a href="#home" class="nav-link">Accueil</a>
                    <a href="#services" class="nav-link">Services</a>
                    <a href="#about" class="nav-link">À propos</a>
                    <a href="#contact" class="nav-link">Contact</a>
                </nav>
                <div class="header-cta">
                    <a href="tel:{{phone_number}}" class="btn btn-primary">{{phone_number}}</a>
                </div>
            </div>
        </div>
    </header>

    <main>
        <!-- Hero Section -->
        <section id="home" class="hero">
            <div class="container">
                <div class="hero-content">
                    <h1 class="hero-title">{{hero_title}}</h1>
                    <p class="hero-subtitle">{{hero_subtitle}}</p>
                    <div class="hero-cta">
                        <a href="#contact" class="btn btn-primary btn-large">Réserver maintenant</a>
                        <a href="tel:{{phone_number}}" class="btn btn-secondary btn-large">Appeler</a>
                    </div>
                </div>
            </div>
        </section>

        <!-- Services Section -->
        <section id="services" class="services">
            <div class="container">
                <h2 class="section-title">Nos Services</h2>
                <div class="services-grid">
                    {% block services_content %}
                    <div class="service-card">
                        <h3>Transport Aéroport</h3>
                        <p>Service de transport vers et depuis les aéroports</p>
                    </div>
                    {% endblock %}
                </div>
            </div>
        </section>

        <!-- About Section -->
        <section id="about" class="about">
            <div class="container">
                <h2 class="section-title">À propos</h2>
                <p class="about-text">{{about_text}}</p>
            </div>
        </section>

        <!-- Contact Section -->
        <section id="contact" class="contact">
            <div class="container">
                <h2 class="section-title">Contactez-nous</h2>
                <div class="contact-info">
                    <p><strong>Téléphone:</strong> <a href="tel:{{phone_number}}">{{phone_number}}</a></p>
                    <p><strong>Email:</strong> <a href="mailto:{{email}}">{{email}}</a></p>
                    {% if address %}
                    <p><strong>Adresse:</strong> {{address}}</p>
                    {% endif %}
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; {{current_year}} {{company_name}}. Tous droits réservés.</p>
        </div>
    </footer>
</body>
</html>''',
                    'css_content': '''/* Template VTC Minimaliste - Styles */
:root {
    --primary-color: {{primary_color}};
    --secondary-color: {{secondary_color}};
    --text-color: #333333;
    --bg-color: #ffffff;
    --light-bg: #f5f5f5;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: {{font_family}}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--text-color);
    line-height: 1.6;
    background-color: var(--bg-color);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header */
.header {
    background: var(--bg-color);
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
}

.logo-img {
    height: 50px;
    width: auto;
}

.logo-text {
    font-size: 1.5rem;
    color: var(--primary-color);
    font-weight: bold;
}

.nav {
    display: flex;
    gap: 2rem;
}

.nav-link {
    text-decoration: none;
    color: var(--text-color);
    font-weight: 500;
    transition: color 0.3s;
}

.nav-link:hover {
    color: var(--primary-color);
}

/* Buttons */
.btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s;
    border: none;
    cursor: pointer;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
}

.btn-secondary {
    background-color: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
}

.btn-secondary:hover {
    background-color: var(--primary-color);
    color: white;
}

.btn-large {
    padding: 1rem 2rem;
    font-size: 1.1rem;
}

/* Hero Section */
.hero {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    padding: 6rem 0;
    text-align: center;
}

.hero-title {
    font-size: 3rem;
    margin-bottom: 1rem;
    font-weight: bold;
}

.hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.hero-cta {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

/* Sections */
section {
    padding: 4rem 0;
}

.section-title {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 3rem;
    color: var(--primary-color);
}

/* Services */
.services {
    background-color: var(--light-bg);
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.service-card {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: transform 0.3s;
}

.service-card:hover {
    transform: translateY(-5px);
}

.service-card h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

/* About */
.about-text {
    max-width: 800px;
    margin: 0 auto;
    font-size: 1.1rem;
    line-height: 1.8;
    text-align: center;
}

/* Contact */
.contact {
    background-color: var(--light-bg);
}

.contact-info {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
}

.contact-info p {
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

.contact-info a {
    color: var(--primary-color);
    text-decoration: none;
}

.contact-info a:hover {
    text-decoration: underline;
}

/* Footer */
.footer {
    background-color: #2c3e50;
    color: white;
    text-align: center;
    padding: 2rem 0;
}

/* Responsive */
@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: 1rem;
    }

    .nav {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }

    .hero-title {
        font-size: 2rem;
    }

    .hero-subtitle {
        font-size: 1rem;
    }

    .hero-cta {
        flex-direction: column;
        align-items: center;
    }

    .services-grid {
        grid-template-columns: 1fr;
    }
}''',
                    'variables': {
                        'site_title': {
                            'type': 'string',
                            'default': 'VTC - Transport de qualité',
                            'description': 'Titre du site (balise <title>)'
                        },
                        'company_name': {
                            'type': 'string',
                            'default': 'VTC Pro',
                            'description': 'Nom de l\'entreprise'
                        },
                        'logo_url': {
                            'type': 'string',
                            'default': '',
                            'description': 'URL du logo (laisser vide pour afficher le nom)'
                        },
                        'phone_number': {
                            'type': 'string',
                            'default': '+33 1 23 45 67 89',
                            'description': 'Numéro de téléphone'
                        },
                        'email': {
                            'type': 'string',
                            'default': 'contact@vtcpro.fr',
                            'description': 'Adresse email'
                        },
                        'address': {
                            'type': 'string',
                            'default': '',
                            'description': 'Adresse complète (optionnel)'
                        },
                        'hero_title': {
                            'type': 'string',
                            'default': 'Transport VTC de qualité',
                            'description': 'Titre principal de la section hero'
                        },
                        'hero_subtitle': {
                            'type': 'string',
                            'default': 'Votre confort et votre ponctualité sont nos priorités',
                            'description': 'Sous-titre de la section hero'
                        },
                        'about_text': {
                            'type': 'html',
                            'default': 'Nous sommes une entreprise de transport VTC dédiée à votre satisfaction. Avec des années d\'expérience, nous offrons un service professionnel et fiable.',
                            'description': 'Texte de présentation de l\'entreprise'
                        },
                        'primary_color': {
                            'type': 'string',
                            'default': '#3B82F6',
                            'description': 'Couleur primaire (hex)'
                        },
                        'secondary_color': {
                            'type': 'string',
                            'default': '#10B981',
                            'description': 'Couleur secondaire (hex)'
                        },
                        'font_family': {
                            'type': 'string',
                            'default': 'Inter',
                            'description': 'Police de caractères'
                        },
                        'current_year': {
                            'type': 'string',
                            'default': '2025',
                            'description': 'Année actuelle pour le copyright'
                        }
                    }
                },
                {
                    'name': 'Template VTC Moderne',
                    'slug': 'vtc-moderne',
                    'description': 'Template moderne avec animations et design contemporain',
                    'category': 'vtc',
                    'is_premium': False,
                    'html_content': '''<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{site_title}}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    {% if logo_url %}
                    <img src="{{logo_url}}" alt="{{company_name}}" class="logo-img">
                    {% else %}
                    <h1 class="logo-text">{{company_name}}</h1>
                    {% endif %}
                </div>
                <nav class="nav">
                    <a href="#home" class="nav-link">Accueil</a>
                    <a href="#services" class="nav-link">Services</a>
                    <a href="#fleet" class="nav-link">Flotte</a>
                    <a href="#contact" class="nav-link">Contact</a>
                </nav>
                <a href="tel:{{phone_number}}" class="btn btn-primary">{{phone_number}}</a>
            </div>
        </div>
    </header>

    <main>
        <section id="home" class="hero">
            <div class="container">
                <div class="hero-content">
                    <h1 class="hero-title">{{hero_title}}</h1>
                    <p class="hero-subtitle">{{hero_subtitle}}</p>
                    <div class="hero-cta">
                        <a href="#contact" class="btn btn-primary btn-large">Réserver</a>
                    </div>
                </div>
            </div>
        </section>

        <section id="services" class="services">
            <div class="container">
                <h2 class="section-title">Nos Services</h2>
                {% block services_content %}{% endblock %}
            </div>
        </section>

        <section id="contact" class="contact">
            <div class="container">
                <h2 class="section-title">Contact</h2>
                <div class="contact-grid">
                    <div class="contact-item">
                        <strong>Téléphone:</strong> <a href="tel:{{phone_number}}">{{phone_number}}</a>
                    </div>
                    <div class="contact-item">
                        <strong>Email:</strong> <a href="mailto:{{email}}">{{email}}</a>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; {{current_year}} {{company_name}}</p>
        </div>
    </footer>
</body>
</html>''',
                    'css_content': '''/* Template VTC Moderne */
:root {
    --primary: {{primary_color}};
    --secondary: {{secondary_color}};
}

body {
    font-family: {{font_family}}, sans-serif;
    margin: 0;
    padding: 0;
}

.header {
    background: white;
    box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    padding: 1rem 0;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.hero {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    padding: 8rem 0;
    text-align: center;
}

.hero-title {
    font-size: 3.5rem;
    margin-bottom: 1rem;
}

.btn {
    padding: 1rem 2rem;
    border-radius: 50px;
    text-decoration: none;
    display: inline-block;
    transition: transform 0.3s;
}

.btn:hover {
    transform: scale(1.05);
}

.btn-primary {
    background: white;
    color: var(--primary);
}

.section-title {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: var(--primary);
}

.services, .contact {
    padding: 5rem 0;
}

.footer {
    background: #2c3e50;
    color: white;
    text-align: center;
    padding: 2rem 0;
}''',
                    'variables': {
                        'site_title': {'type': 'string', 'default': 'VTC Moderne', 'description': 'Titre du site'},
                        'company_name': {'type': 'string', 'default': 'VTC Premium', 'description': 'Nom entreprise'},
                        'logo_url': {'type': 'string', 'default': '', 'description': 'URL logo'},
                        'phone_number': {'type': 'string', 'default': '+33 1 23 45 67 89', 'description': 'Téléphone'},
                        'email': {'type': 'string', 'default': 'contact@vtcpremium.fr', 'description': 'Email'},
                        'hero_title': {'type': 'string', 'default': 'Transport Premium', 'description': 'Titre hero'},
                        'hero_subtitle': {'type': 'string', 'default': 'Excellence et confort', 'description': 'Sous-titre'},
                        'primary_color': {'type': 'string', 'default': '#6366F1', 'description': 'Couleur primaire'},
                        'secondary_color': {'type': 'string', 'default': '#8B5CF6', 'description': 'Couleur secondaire'},
                        'font_family': {'type': 'string', 'default': 'Poppins', 'description': 'Police'},
                        'current_year': {'type': 'string', 'default': '2025', 'description': 'Année'}
                    }
                },
                {
                    'name': 'Template VTC Classique',
                    'slug': 'vtc-classique',
                    'description': 'Template classique et professionnel',
                    'category': 'vtc',
                    'is_premium': False,
                    'html_content': '''<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>{{site_title}}</title>
</head>
<body>
    <header>
        <h1>{{company_name}}</h1>
        <nav>
            <a href="#home">Accueil</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
        </nav>
        <p>Téléphone: <a href="tel:{{phone_number}}">{{phone_number}}</a></p>
    </header>
    <main>
        <section id="home">
            <h2>{{hero_title}}</h2>
            <p>{{hero_subtitle}}</p>
        </section>
        <section id="services">
            <h2>Nos Services</h2>
            {% block services_content %}{% endblock %}
        </section>
        <section id="contact">
            <h2>Contact</h2>
            <p>Email: <a href="mailto:{{email}}">{{email}}</a></p>
        </section>
    </main>
    <footer>
        <p>&copy; {{current_year}} {{company_name}}</p>
    </footer>
</body>
</html>''',
                    'css_content': '''body {
    font-family: {{font_family}}, serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    border-bottom: 2px solid {{primary_color}};
    padding: 20px 0;
}

h1 {
    color: {{primary_color}};
}

a {
    color: {{primary_color}};
}''',
                    'variables': {
                        'site_title': {'type': 'string', 'default': 'VTC Classique', 'description': 'Titre'},
                        'company_name': {'type': 'string', 'default': 'VTC Tradition', 'description': 'Nom'},
                        'phone_number': {'type': 'string', 'default': '+33 1 23 45 67 89', 'description': 'Téléphone'},
                        'email': {'type': 'string', 'default': 'contact@vtctradition.fr', 'description': 'Email'},
                        'hero_title': {'type': 'string', 'default': 'Transport professionnel', 'description': 'Titre hero'},
                        'hero_subtitle': {'type': 'string', 'default': 'Service fiable et ponctuel', 'description': 'Sous-titre'},
                        'primary_color': {'type': 'string', 'default': '#1E40AF', 'description': 'Couleur primaire'},
                        'font_family': {'type': 'string', 'default': 'Georgia', 'description': 'Police'},
                        'current_year': {'type': 'string', 'default': '2025', 'description': 'Année'}
                    }
                }
            ]

            created_count = 0
            updated_count = 0

            for template_data in templates_data:
                # Use defer to avoid loading fields that might not exist yet
                try:
                    template = Template.objects.only('id', 'slug', 'name').get(slug=template_data['slug'])
                    created = False
                except Template.DoesNotExist:
                    # Create new template using raw SQL to avoid field issues
                    from django.db import connection
                    with connection.cursor() as cursor:
                        # Check which fields exist
                        cursor.execute("""
                            SELECT column_name 
                            FROM information_schema.columns 
                            WHERE table_name='templates' AND table_schema=current_schema()
                        """)
                        existing_columns = {row[0] for row in cursor.fetchall()}
                        
                        # Build INSERT query with only existing columns
                        fields_to_insert = ['name', 'slug', 'description', 'category', 'is_premium', 'is_active']
                        values_to_insert = [
                            template_data['name'],
                            template_data['slug'],
                            template_data['description'],
                            template_data['category'],
                            template_data['is_premium'],
                            True,
                        ]
                        
                        # Add structure if it exists (required field)
                        if 'structure' in existing_columns:
                            import json
                            fields_to_insert.append('structure')
                            values_to_insert.append(json.dumps({}))
                        
                        # Add default_settings if it exists
                        if 'default_settings' in existing_columns:
                            import json
                            fields_to_insert.append('default_settings')
                            values_to_insert.append(json.dumps({}))
                        
                        # Add price if it exists (required field)
                        if 'price' in existing_columns:
                            fields_to_insert.append('price')
                            values_to_insert.append(template_data.get('price', 0))
                        
                        if 'html_content' in existing_columns:
                            fields_to_insert.append('html_content')
                            values_to_insert.append(template_data['html_content'])
                        
                        if 'css_content' in existing_columns:
                            fields_to_insert.append('css_content')
                            values_to_insert.append(template_data['css_content'])
                        
                        if 'variables' in existing_columns:
                            import json
                            fields_to_insert.append('variables')
                            values_to_insert.append(json.dumps(template_data['variables']))
                        
                        placeholders = ', '.join(['%s'] * len(values_to_insert))
                        fields_str = ', '.join(fields_to_insert)
                        
                        cursor.execute(f"""
                            INSERT INTO templates ({fields_str})
                            VALUES ({placeholders})
                            RETURNING id
                        """, values_to_insert)
                        
                        template_id = cursor.fetchone()[0]
                        template = Template.objects.only('id', 'slug', 'name').get(id=template_id)
                    created = True

                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ Template créé: {template.name}')
                    )
                else:
                    # Update existing template with HTML, CSS and variables if missing
                    from django.db import connection
                    with connection.cursor() as cursor:
                        cursor.execute("""
                            SELECT column_name 
                            FROM information_schema.columns 
                            WHERE table_name='templates' AND table_schema=current_schema()
                        """)
                        existing_columns = {row[0] for row in cursor.fetchall()}
                        
                        updates = []
                        values = []
                        
                        # Check and update html_content
                        if 'html_content' in existing_columns:
                            cursor.execute("SELECT html_content FROM templates WHERE id = %s", [template.id])
                            current_html = cursor.fetchone()[0]
                            if not current_html:
                                updates.append('html_content = %s')
                                values.append(template_data['html_content'])
                        
                        # Check and update css_content
                        if 'css_content' in existing_columns:
                            cursor.execute("SELECT css_content FROM templates WHERE id = %s", [template.id])
                            current_css = cursor.fetchone()[0]
                            if not current_css:
                                updates.append('css_content = %s')
                                values.append(template_data['css_content'])
                        
                        # Check and update variables
                        if 'variables' in existing_columns:
                            cursor.execute("SELECT variables FROM templates WHERE id = %s", [template.id])
                            current_vars = cursor.fetchone()[0]
                            import json
                            if not current_vars or current_vars == '{}' or current_vars == {}:
                                updates.append('variables = %s::jsonb')
                                values.append(json.dumps(template_data['variables']))
                        
                        if updates:
                            values.append(template.id)
                            cursor.execute(f"""
                                UPDATE templates 
                                SET {', '.join(updates)}
                                WHERE id = %s
                            """, values)
                            updated_count += 1
                            self.stdout.write(
                                self.style.WARNING(f'🔄 Template mis à jour: {template.name}')
                            )

            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✅ Terminé: {created_count} templates créés, {updated_count} templates mis à jour'
                )
            )

