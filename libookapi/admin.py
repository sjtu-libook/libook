from django.contrib import admin

from .models import *


class UserAdmin(admin.ModelAdmin):
    list_display = ('sid', 'name')


class RegionAdmin(admin.ModelAdmin):
    list_display = ('name', 'capacity')


class RegionGroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')


class TimesliceAdmin(admin.ModelAdmin):
    list_display = ('from_time', 'to_time')


class ReservationAdmin(admin.ModelAdmin):
    list_display = ('user', 'region', 'time')


admin.site.register(User, UserAdmin)
admin.site.register(Region, RegionAdmin)
admin.site.register(RegionGroup, RegionGroupAdmin)
admin.site.register(Timeslice, TimesliceAdmin)
admin.site.register(Reservation, ReservationAdmin)
