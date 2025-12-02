
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    path("api/auth/", include("dj_rest_auth.urls")),
    
    # api/ ile başlayan tüm istekleri notes uygulamasının urls.py dosyasına yönlendir
    path("api/", include("notes.urls")),

    path("", TemplateView.as_view(template_name="index.html"))

]
