from django.shortcuts import render
import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets, permissions, views, generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Count, F
from django.utils import timezone
from django.db import IntegrityError
from datetime import timedelta
import random
import string

from ..serializers import *
from ..models import *


class TokenView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses=TokenSerializer(),
    )
    def get(self, request, format=None):
        """
        获取当前用户的一次性验证 Token
        """
        token = UserToken.objects.filter(user=request.user)
        if len(token) > 0:
            token_object = token[0]
            now = timezone.now()
            if now > token_object.expires_at:
                return Response("no token", status=status.HTTP_404_NOT_FOUND)
            else:
                return Response(TokenSerializer(token_object).data)
        else:
            return Response("no token", status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        responses=TokenSerializer(),
    )
    def post(self, request, format=None):
        """
        刷新 Token
        """
        UserToken.objects.filter(user=request.user).delete()
        token = UserToken.objects.create(
            user=request.user,
            expires_at=timezone.now() + timedelta(hours=1),
            token=''.join(random.choices(string.digits, k=6)))
        return Response(TokenSerializer(token).data, status=status.HTTP_201_CREATED)
