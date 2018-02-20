from django.conf import settings
from django.conf.urls import url, include
from django.views.generic import RedirectView
from django.contrib import admin
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token


urlpatterns = [
    url(r'^api/admin/', admin.site.urls),
    url(r'^api/jwt/token/', obtain_jwt_token),
    url(r'^api/jwt/refresh/', refresh_jwt_token),
    url(r'^api/v1/', include('api.urls')),
]

# troubleshooting tool
if settings.DEBUG and not settings.TESTING:
    import debug_toolbar
    urlpatterns = [
        url(r'^__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns

