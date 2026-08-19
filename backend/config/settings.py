"""
Django settings for the SkillMatch backend.

SkillMatch has no relational domain data — CognoDB (a graph database) is the
single source of truth for users, skills, jobs, companies and every
relationship between them. Django is used here purely as a web/API
framework: routing, request parsing, serialization and validation. There is
intentionally no Django ORM model backing any domain entity, and no
relational database is configured.
"""

import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-insecure-key-change-me")
DEBUG = os.environ.get("DJANGO_DEBUG", "false").lower() == "true"

ALLOWED_HOSTS = [h.strip() for h in os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",") if h.strip()]

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "accounts",
    "skills",
    "jobs",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "core.middleware.GraphUnavailableMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {"context_processors": []},
    },
]

# No relational database is used for domain data. A local sqlite file is
# kept only because Django's app registry expects a DATABASES setting to
# exist; nothing ever writes to it.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "unused.sqlite3",
    }
}

CORS_ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
CORS_ALLOW_ALL_ORIGINS = os.environ.get("CORS_ALLOW_ALL_ORIGINS", "false").lower() == "true"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["accounts.auth.GraphJWTAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticatedOrReadOnly"],
    "EXCEPTION_HANDLER": "core.exceptions.graph_aware_exception_handler",
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    # We don't use django.contrib.auth (users are graph nodes, see accounts/auth.py),
    # so fall back to plain None instead of DRF's default AnonymousUser import.
    "UNAUTHENTICATED_USER": None,
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- CognoDB (graph database) connection -----------------------------------
COGNODB_URI = os.environ.get("COGNODB_URI", "")
COGNODB_USER = os.environ.get("COGNODB_USER", "cognodb")
COGNODB_PASSWORD = os.environ.get("COGNODB_PASSWORD", "")

# --- Auth --------------------------------------------------------------
JWT_SECRET = os.environ.get("JWT_SECRET", SECRET_KEY)
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TTL = timedelta(hours=int(os.environ.get("JWT_ACCESS_TTL_HOURS", "24")))
