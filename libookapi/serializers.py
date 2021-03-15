from rest_framework import serializers
from .models import *


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ('id', 'name', 'group', 'capacity')


class RegionGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegionGroup
        fields = ('id', 'name')


class RegionDetailSerializer(serializers.ModelSerializer):
    group = RegionGroupSerializer(many=False, read_only=True)

    class Meta:
        model = Region
        fields = ('id', 'name', 'group', 'capacity')


class RegionGroupDetailSerializer(serializers.ModelSerializer):
    regions = RegionSerializer(many=True, read_only=True)

    class Meta:
        model = RegionGroup
        fields = ('id', 'name', 'regions')


class TimesliceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timeslice
        fields = ('id', 'from_time', 'to_time')


class ReservationDetailSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    region = RegionDetailSerializer(many=False, read_only=True)
    time = TimesliceSerializer(many=False, read_only=True)

    class Meta:
        model = Reservation
        fields = ('id', 'region', 'time')


class ReservationSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )
    id = serializers.ReadOnlyField()

    class Meta:
        model = Reservation
        fields = ('id', 'region', 'time', 'user')


class ErrorSerializer(serializers.Serializer):
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


class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInfo
        fields = []


class UserSerializer(serializers.ModelSerializer):
    user_info = UserInfoSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'user_info')
