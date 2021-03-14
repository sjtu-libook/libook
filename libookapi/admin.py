from django.contrib import admin

from .models import *


class UserInfoAdmin(admin.ModelAdmin):
    list_display = ('fingerprint_id', 'face_id', 'user')


class RegionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'capacity', 'group')


class RegionGroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')


class TimesliceAdmin(admin.ModelAdmin):
    list_display = ('id', 'from_time', 'to_time')


class ReservationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'region', 'time', 'created_at', 'updated_at')


class DeviceAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_key', 'region')


class UserTokenAdmin(admin.ModelAdmin):
    list_display = ('id', 'token', 'user', 'expires_at')


admin.site.register(UserInfo, UserInfoAdmin)
admin.site.register(Region, RegionAdmin)
admin.site.register(RegionGroup, RegionGroupAdmin)
admin.site.register(Timeslice, TimesliceAdmin)
admin.site.register(Reservation, ReservationAdmin)
admin.site.register(Device, DeviceAdmin)
admin.site.register(UserToken, UserTokenAdmin)
