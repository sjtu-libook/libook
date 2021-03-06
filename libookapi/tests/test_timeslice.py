import pytest
from rest_framework.test import APIClient
from pytz import timezone
from datetime import date, datetime, timedelta

from ..models import Timeslice
from ..serializers import TimesliceSerializer


@pytest.mark.django_db
def test_get_timeslice():
    """创建的时间片可以通过接口进行范围查询"""
    tz = timezone('Asia/Shanghai')
    timeslice1 = Timeslice.objects.create(
        from_time=tz.localize(datetime(2021, 3, 13, 8, 0, 0)),
        to_time=tz.localize(datetime(2021, 3, 13, 9, 0, 0)))
    timeslice2 = Timeslice.objects.create(
        from_time=tz.localize(datetime(2021, 3, 13, 9, 0, 0)),
        to_time=tz.localize(datetime(2021, 3, 13, 10, 0, 0)))
    timeslice3 = Timeslice.objects.create(
        from_time=tz.localize(datetime(2021, 3, 12, 9, 0, 0)),
        to_time=tz.localize(datetime(2021, 3, 12, 10, 0, 0)))

    client = APIClient()
    response = client.get(f'/api/timeslices/', {
        'from_time__gte': tz.localize(datetime(2021, 3, 13, 0, 0, 0)),
        'from_time__lte': tz.localize(datetime(2021, 3, 14, 0, 0, 0))})
    assert response.status_code == 200
    assert response.json() == [
        TimesliceSerializer(timeslice1).data,
        TimesliceSerializer(timeslice2).data]
