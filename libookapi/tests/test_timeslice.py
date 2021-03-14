import pytest
from django.test import Client
from tzlocal import get_localzone
from datetime import date, datetime, timedelta

from ..models import Timeslice
from ..serializers import TimesliceSerializer


@pytest.mark.django_db
def test_get_timeslice():
    """创建的时间片可以通过接口进行范围查询"""
    tz = get_localzone()
    timeslice1 = Timeslice(
        from_time=tz.localize(datetime(2021, 3, 13, 8, 0, 0)),
        to_time=tz.localize(datetime(2021, 3, 13, 9, 0, 0)))
    timeslice1.save()
    timeslice2 = Timeslice(
        from_time=tz.localize(datetime(2021, 3, 13, 9, 0, 0)),
        to_time=tz.localize(datetime(2021, 3, 13, 10, 0, 0)))
    timeslice2.save()
    timeslice3 = Timeslice(
        from_time=tz.localize(datetime(2021, 3, 12, 9, 0, 0)),
        to_time=tz.localize(datetime(2021, 3, 12, 10, 0, 0)))
    timeslice3.save()

    client = Client()
    response = client.get(f'/api/timeslices/', {'from_time__gt': tz.localize(datetime(
        2021, 3, 13, 0, 0, 0)), 'from_time__lt': tz.localize(datetime(2021, 3, 14, 0, 0, 0))})
    assert response.status_code == 200
    assert response.json() == [
        TimesliceSerializer(timeslice1).data,
        TimesliceSerializer(timeslice2).data]