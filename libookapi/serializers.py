from rest_framework import serializers
from .models import *


class RegionGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegionGroup
        fields = ('id', 'name')


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ('id', 'name', 'group', 'capacity')


class TimesliceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timeslice
        fields = ('id', 'from_time', 'to_time')


class ReservationDetailSerializer(serializers.ModelSerializer):
    region = RegionSerializer(many=False, read_only=True)
    time = TimesliceSerializer(many=False, read_only=True)

    class Meta:
        model = Reservation
        fields = ('id', 'region', 'time')


class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ('region', 'time')


class ResultSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField(max_length=200)


class RegionReservationSerializer(serializers.Serializer):
    reserved = serializers.IntegerField()
    time_id = serializers.IntegerField()
    region_id = serializers.IntegerField()


class RegionGroupReservationSerializer(serializers.Serializer):
    reserved = serializers.IntegerField()
    capacity = serializers.IntegerField()
    time_id = serializers.IntegerField()
    region_group_id = serializers.IntegerField()
