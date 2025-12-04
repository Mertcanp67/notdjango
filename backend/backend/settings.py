from pathlib import Path
import os
import dj_database_url
import google.generativeai as genai




BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = "django-insecure-DEV-ONLY-CHANGE-ME"
DEBUG = True
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "taggit",

    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",

    "dj_rest_auth",
    "django.contrib.sites",
    "allauth",
    "allauth.account",
    "dj_rest_auth.registration",
    "allauth.socialaccount",

    "notes",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware',
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",  
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR.parent / "frontend/dist"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'myproject_db',      
        'USER': 'postgres',          
        'PASSWORD': '123456', 
        'HOST': 'localhost',      
        'PORT': '',                  
    }   
}

database_url = os.environ.get("DATABASE_URL")
if database_url:
    DATABASES["default"]=dj_database_url.parse(
        database_url,
        conn_max_age=600,
        conn_health_checks=True,
    )

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = "tr-tr"
TIME_ZONE = "Europe/Istanbul"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATICFILES_DIRS = [
    BASE_DIR.parent / 'frontend' / 'dist' / 'assets',
]
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
}

# dj-rest-auth with allauth registration
REST_AUTH = {
    "REGISTER_SERIALIZER": "dj_rest_auth.registration.serializers.RegisterSerializer",
}


CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",   
    "http://127.0.0.1:5174",   
    "https://notdjango.onrender.com",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://notdjango.onrender.com",
]

CORS_ALLOW_CREDENTIALS = True


SITE_ID = 1
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

ACCOUNT_EMAIL_VERIFICATION = "none"
ACCOUNT_AUTHENTICATION_METHOD = "username_email"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = True

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage" 

WHITENOISE_ROOT = BASE_DIR.parent / 'frontend' / 'dist'

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SAMESITE = 'None'

# GÜVENLİK DÜZELTMESİ: API Anahtarını asla koda yazmayın.
# Bunun yerine Render.com'daki Ortam Değişkenlerinden (Environment Variables) okuyun.
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

# Google AI kütüphanesini uygulama başlangıcında bir kez yapılandır.
if GOOGLE_API_KEY:
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        print("Google Generative AI başarıyla yapılandırıldı.")
    except Exception as e:
        # Yapılandırma başarısız olursa, sunucu loglarına kritik bir hata yazdır.
        print(f"KRİTİK HATA: Google Generative AI yapılandırılamadı: {e}")
else:
    # API anahtarı hiç ayarlanmamışsa uyar.
    print("UYARI: GOOGLE_API_KEY ortam değişkeni ayarlanmamış. AI özellikleri çalışmayacak.")