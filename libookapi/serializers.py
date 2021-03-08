from rest_framework import serializers
from .models import RegionGroup, Region, Reservation


class RegionGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegionGroup
        fields = ('id', 'name')


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ('id', 'name', 'group', 'capacity')


class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ('id', 'user', 'region', 'time', 'created_at', 'updated_at')
