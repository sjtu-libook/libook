"""libook URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from rest_framework import routers
from libookapi import views
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from . import logins

router = routers.DefaultRouter()
router.register(r'region_groups', views.RegionGroupView, 'region_groups')
router.register(r'regions', views.RegionView, 'regions')
router.register(r'reservations', views.ReservationView, 'reservations')
router.register(r'timeslices', views.TimesliceView, 'timeslices')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/users/self', views.UserView.as_view(), name='users'),
    path('api/reservations/batch', views.BatchReservationView.as_view(),
         name='batch_reservation'),
    path('api/reservations/by_region_group',
         views.QueryRegionGroupReservationView.as_view(), name='batch_query_region_group'),
    path('api/reservations/by_region',
         views.QueryRegionReservationView.as_view(), name='batch_query_region'),
    path('api/region_groups/<int:id>/detail',
         views.RegionGroupDetailView.as_view(), name='region_group_detail'),
    path('api/devices/<int:id>', views.DeviceView.as_view(), name='device'),
    path('api/tokens/', views.TokenView.as_view(), name='token'),
    # Authentication
    path('api/auth/', include('rest_framework.urls')),
    *logins.urlpatterns,
    # REST API Schemas
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/',
         SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/',
         SpectacularRedocView.as_view(url_name='schema'), name='redoc')
]

if not settings.DEBUG:
    urlpatterns.append(re_path(r'^', views.FrontendAppView.as_view()))
