import pytest
import json
from rest_framework.test import APIClient
from datetime import datetime
from pytz import timezone
from ..models import *


@pytest.mark.django_db
def test_batch_reservation():
    """可以批量预约"""
    # TODO: 加入重复预约、超过限制等错误情况的测试

    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=100, group=group)
    tz = timezone('Asia/Shanghai')
    timeslice1 = Timeslice.objects.create(
        from_time=tz.localize(datetime(2021, 3, 13, 8, 0, 0)),
        to_time=tz.localize(datetime(2021, 3, 13, 9, 0, 0)))
    timeslice2 = Timeslice.objects.create(
        from_time=tz.localize(datetime(2021, 3, 13, 9, 0, 0)),
        to_time=tz.localize(datetime(2021, 3, 13, 10, 0, 0)))
    user = User.objects.create(username="Alex Chi")

    client = APIClient()
    client.force_authenticate(user=user)

    reservations = [{"region": region.id, "time": timeslice1.id},
                    {"region": region.id, "time": timeslice2.id}]
    response = client.post(f'/api/reservations/batch',
                           json.dumps(reservations),
                           content_type='application/json'
                           )
    assert response.json() == [{"id": 1, "region": region.id, "time": timeslice1.id},
                               {"id": 2, "region": region.id, "time": timeslice2.id}]
    assert response.status_code == 201
