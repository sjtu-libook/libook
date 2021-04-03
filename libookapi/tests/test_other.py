import pytest
from rest_framework.test import APIClient
from django.utils.timezone import now
from datetime import timedelta
from assertpy import assert_that
from ..models import *
import os


@pytest.mark.django_db
def test_frontend():
    """不存在的页面应当重定向到前端"""
    client = APIClient()
    response = client.get(f'/test')
    assert response.status_code == 200


@pytest.mark.django_db
def test_user():
    """可以获取当前用户"""
    client = APIClient()
    response = client.get(f'/api/users/self')
    assert response.status_code == 401
    client = APIClient()
    user = User.objects.create(username="Alex Chi")
    client.force_authenticate(user=user)
    response = client.get(f'/api/users/self')
    assert response.status_code == 200
    result = response.json()
    assert result['username'] == user.username
    assert result['id'] == user.id


@pytest.mark.django_db
def test_version():
    """可以获取 git revision"""
    os.environ.setdefault('GIT_REV', 'default_git_rev')
    client = APIClient()
    response = client.get(f'/api/version')
    assert response.status_code == 200
    assert response.json() == 'default_git_rev'
