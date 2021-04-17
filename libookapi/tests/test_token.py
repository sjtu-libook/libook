import pytest
import json
from rest_framework.test import APIClient
from datetime import datetime
from pytz import timezone
from ..models import *


@pytest.mark.django_db
def test_generate_token():
    """可以批量预定"""
    # TODO: 加入重复预定、超过限制等错误情况的测试

    user = User.objects.create(username="Alex Chi")

    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(f'/api/tokens/')
    token = response.json()
    assert response.status_code == 201

    response = client.get(f'/api/tokens/')
    assert response.json() == token
    assert response.status_code == 200
