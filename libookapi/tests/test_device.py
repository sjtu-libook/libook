import pytest
from rest_framework.test import APIClient
from django.utils.timezone import now
from datetime import timedelta
from assertpy import assert_that
from ..models import *


@pytest.mark.django_db
def test_get_device():
    """嵌入式设备可以获取当前位置相关的信息"""
    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=100, group=group)
    device = Device.objects.create(api_key="2333333", region=region)
    time = Timeslice.objects.create(
        from_time=now(), to_time=now() + timedelta(hours=1))
    user = User.objects.create(username="Alex Chi")
    user_info = UserInfo.objects.create(
        user=user, fingerprint_id=1, face_id=None)
    reservation = Reservation.objects.create(
        user=user, time=time, region=region)
    client = APIClient()
    response = client.get(
        f'/api/devices/{device.id}', {"api_key": device.api_key})
    assert response.status_code == 200
    result = response.json()
    assert result[0]['id'] == reservation.id
    assert result[0]['user']['id'] == user.id
    assert result[0]['user']['user_info']['fingerprint_id'] == 1
    response = client.get(
        f'/api/devices/{device.id}', {"api_key": device.api_key, "fake": True})
    assert response.status_code == 200
    result = response.json()
    assert result[0]['id'] == reservation.id
    assert result[0]['user']['id'] == user.id
    assert result[0]['user']['user_info']['fingerprint_id'] == 1


@pytest.mark.django_db
def test_get_device_failed():
    """API Key 错误将无法获取信息"""
    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=100, group=group)
    device = Device.objects.create(api_key="2333333", region=region)
    time = Timeslice.objects.create(
        from_time=now(), to_time=now() + timedelta(hours=1))
    user = User.objects.create(username="Alex Chi")
    reservation = Reservation.objects.create(
        user=user, time=time, region=region)
    client = APIClient()
    response = client.get(
        f'/api/devices/{device.id}', {"api_key": "233333"})
    assert response.status_code == 401
