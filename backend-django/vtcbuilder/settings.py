"""
Django settings for VTCBuilder project.
"""

import os
import warnings
from pathlib import Path
from decouple import config
from datetime import timedelta

# Suppress pkg_resources deprecation warnings
warnings.filterwarnings('ignore', category=UserWarning, message='.*pkg_resources.*')

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Security
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*').split(',')

# Application definition
SHARED_APPS = [
    'django_tenants',  # Must be first
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'guardian',

    # Local apps (shared)
    'tenants',
    'billing',
    'settings_app',
    'blocks',
    'projects',
    'analytics',
    'security',
]

TENANT_APPS = [
    # Tenant-specific apps
    'pages',
    'services',
    'bookings',
    'media',
]

INSTALLED_APPS = SHARED_APPS + TENANT_APPS

MIDDLEWARE = [
    'django_tenants.middleware.main.TenantMainMiddleware',  # Réactivé pour gérer correctement les schémas des tenants
    'django.middleware.security.SecurityMiddleware',
    'vtcbuilder.cors_middleware.CORSAlwaysMiddleware',  # CORS en premier - AVANT tout autre middleware
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'security.middleware.WAFMiddleware',  # WAF - Must be early in the chain
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'tenants.middleware.UserStatusMiddleware',  # Check user status (suspended/inactive)
    'api.middleware.SuppressExpected401Middleware',  # Suppress expected 401 logs
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'vtcbuilder.urls'
PUBLIC_SCHEMA_URLCONF = 'vtcbuilder.urls_public'

# Disable APPEND_SLASH to avoid redirect issues with POST requests
APPEND_SLASH = False

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'vtcbuilder.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',
        'NAME': config('DB_NAME', default='vtcbuilder'),
        'USER': config('DB_USER', default='vtcbuilder_user'),
        'PASSWORD': config('DB_PASSWORD', default='vtcbuilder_password'),
        'HOST': config('DB_HOST', default='postgres'),
        'PORT': config('DB_PORT', default='5432'),
        'OPTIONS': {
            'sslmode': 'disable',
        },
        'TEST': {
            'NAME': config('TEST_DB_NAME', default='vtcbuilder_test'),
            'ENGINE': 'django_tenants.postgresql_backend',
            'USER': config('DB_USER', default='vtcbuilder_user'),
            'PASSWORD': config('DB_PASSWORD', default='vtcbuilder_password'),
            'HOST': config('DB_HOST', default='postgres'),
            'PORT': config('DB_PORT', default='5432'),
            'OPTIONS': {
                'sslmode': 'disable',
            }
        }
    }
}

DATABASE_ROUTERS = ['django_tenants.routers.TenantSyncRouter']

# Tenant settings
TENANT_MODEL = 'tenants.Tenant'
TENANT_DOMAIN_MODEL = 'tenants.Domain'

# Configuration pour que le middleware utilise le schéma public par défaut
# quand aucun tenant n'est trouvé (pour les routes API)
SHOW_PUBLIC_IF_NO_TENANT_FOUND = True

# Custom User Model
AUTH_USER_MODEL = 'tenants.User'

# Authentication backends
AUTHENTICATION_BACKENDS = [
    'tenants.backends.EmailBackend',  # Email authentication first
    'django.contrib.auth.backends.ModelBackend',
    'guardian.backends.ObjectPermissionBackend',
]

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Europe/Paris'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 15,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'EXCEPTION_HANDLER': 'api.exceptions.custom_exception_handler',
    'EXCEPTION_HANDLER': 'api.exceptions.custom_exception_handler',
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS Settings
# En développement, autoriser tous les origines localhost et sous-domaines
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True  # Autoriser tous les origines en développement
    # Also allow all localhost subdomains
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r"^http(s)?://.*\.localhost:\d+$",  # Tous les sous-domaines localhost
        r"^http(s)?://localhost:\d+$",  # localhost direct
        r"^http(s)?://127\.0\.0\.1:\d+$",  # 127.0.0.1
        r"^http(s)?://192\.168\.1\.134:\d+$",  # IP réseau local 192.168.1.134
    ]
else:
    # En production, lister explicitement les origines autorisées
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:9494",
        "http://127.0.0.1:9494",
        "http://localhost:9495",
        "http://127.0.0.1:9495",
        "http://192.168.1.134:9494",
        "http://192.168.1.134:9495",
        "http://api.localhost:9400",
    ]
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r"^https://.*\.vtcbuilder\.com$",  # Tous les sous-domaines en production
    ]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
# Autoriser toutes les méthodes
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Session Configuration (for impersonation)
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_NAME = 'vtcbuilder_sessionid'
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = not DEBUG  # Only in production
SESSION_COOKIE_SAMESITE = 'Lax'

# Guardian settings
GUARDIAN_MONKEY_PATCH = False

# Cache Configuration - Optimisation mémoire
# Configuration compatible avec Django 5.0 et redis-py 5.0.1
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://redis:6379/1'),  # DB 1 pour le cache
        'KEY_PREFIX': 'vtcbuilder',
        'TIMEOUT': 300,  # 5 minutes par défaut
        'MAX_ENTRIES': 1000,  # Limiter le nombre d'entrées en mémoire
    }
}

# Celery
CELERY_BROKER_URL = config('REDIS_URL', default='redis://redis:6379/0')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://redis:6379/0')

# Stripe
STRIPE_PUBLIC_KEY = config('STRIPE_PUBLIC_KEY', default='')
STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY', default='')

# Google Maps
GOOGLE_MAPS_API_KEY = config('GOOGLE_MAPS_API_KEY', default='')

# Email Configuration
# Use SMTP backend if credentials are provided, otherwise use console backend for development
EMAIL_HOST = config('EMAIL_HOST', default='')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_USE_SSL = config('EMAIL_USE_SSL', default=False, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@vtcbuilder.com')
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:9494')

# Automatically choose backend based on configuration
# Force SMTP if variables are set, otherwise use console
if EMAIL_HOST and EMAIL_HOST_USER and EMAIL_HOST_PASSWORD:
    # Production: Use SMTP backend (OVH Mail, Gmail, etc.)
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    # Debug: Log email configuration
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"EMAIL BACKEND: SMTP configured - Host: {EMAIL_HOST}:{EMAIL_PORT}, User: {EMAIL_HOST_USER}")
else:
    # Development: Use console backend (emails printed in console)
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    import logging
    logger = logging.getLogger(__name__)
    logger.warning(f"EMAIL BACKEND: Console (SMTP not configured - HOST={EMAIL_HOST}, USER={EMAIL_HOST_USER})")

# Logging Configuration
# Créer le répertoire de logs s'il n'existe pas (avec gestion d'erreur)
import os
LOGS_DIR = BASE_DIR / 'logs'
LOGS_ENABLED = True
try:
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    # Tester l'écriture dans le répertoire
    test_file = LOGS_DIR / '.test_write'
    test_file.touch()
    test_file.unlink()
    os.chmod(LOGS_DIR, 0o755)
except (OSError, PermissionError) as e:
    # Si on ne peut pas créer/utiliser le répertoire, désactiver le logging fichier
    LOGS_ENABLED = False
    import logging
    logging.warning(f"Impossible d'utiliser le répertoire de logs: {e}. Utilisation du handler console uniquement.")

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'suppress_expected_401': {
            '()': 'api.middleware.SuppressExpected401LogFilter',
        },
    },
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            '()': 'api.middleware.Suppress401Handler',  # Use custom handler that suppresses 401
            'filters': ['suppress_expected_401'],
            'formatter': 'simple',
        },
        'null': {
            'class': 'logging.NullHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING' if not DEBUG else 'INFO',  # Optimisation: Réduire les logs en dev
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'WARNING' if not DEBUG else 'INFO',  # Optimisation: Moins de logs
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'ERROR',  # Optimisation: Ne logger que les erreurs SQL
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console', 'file'] if LOGS_ENABLED else ['console'],
            'level': 'ERROR',  # Optimisation: Seulement les erreurs
            'propagate': False,
            'filters': ['suppress_expected_401'],
        },
        'rest_framework': {
            'handlers': ['console'],
            'level': 'WARNING',  # Log warnings but filter 401 for expected endpoints
            'propagate': False,
            'filters': ['suppress_expected_401'],
        },
        'django.server': {
            'handlers': ['console'],
            'level': 'WARNING' if not DEBUG else 'INFO',  # Optimisation: Moins de logs
            'propagate': False,
            'filters': ['suppress_expected_401'],
        },
        # Suppress logs from django.utils.log for 401 errors
        'django.utils.log': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
            'filters': ['suppress_expected_401'],
        },
    },
}

