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


class RegionGroupListSerializer(serializers.ModelSerializer):
    capacity = serializers.IntegerField()

    class Meta:
        model = RegionGroup
        fields = ('id', 'name', 'capacity')


class RegionDetailSerializer(serializers.ModelSerializer):
    group = RegionGroupSerializer(many=False, read_only=True)

    class Meta:
        model = Region
        fields = ('id', 'name', 'group', 'capacity')


class RegionGroupDetailSerializer(serializers.ModelSerializer):
    regions = RegionSerializer(many=True, read_only=True)
    capacity = serializers.IntegerField()

    class Meta:
        model = RegionGroup
        fields = ('id', 'name', 'regions', 'capacity')


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
    time_id = serializers.IntegerField()
    region_group_id = serializers.IntegerField()


class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInfo
        fields = ('fingerprint_id', 'face_id')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'user_info')


class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserToken
        fields = ('token', 'expires_at')


class DeviceUserSerializer(serializers.ModelSerializer):
    user_info = UserInfoSerializer()

    class Meta:
        model = User
        fields = ('id', 'username', 'user_info')


class DeviceReservationSerializer(serializers.ModelSerializer):
    user = DeviceUserSerializer()
    region = RegionSerializer()
    time = TimesliceSerializer()

    class Meta:
        model = Reservation
        fields = ('id', 'region', 'time', 'user')


class DeviceModifySerializer(serializers.ModelSerializer):
    fingerprint_id = serializers.IntegerField(
        help_text='更新后指纹 ID', required=False)
    token = serializers.IntegerField(help_text='用户一次性验证 Token', required=False)
    user_id = serializers.IntegerField(help_text='入座用户 ID')
