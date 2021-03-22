from authlib.integrations.django_client import OAuth, OAuthError
from authlib.oidc.core import CodeIDToken
from authlib.jose import jwt
from django.http import HttpResponse, JsonResponse
from django.urls import include, path, reverse
from rest_framework import status
from django.conf import settings
from django.contrib.auth import login
from django.shortcuts import redirect
from django.contrib.auth.models import User
import requests
import random
import string

oauth = OAuth()
oauth.register(
    name='jaccount',
    client_id=settings.AUTHLIB_OAUTH_CLIENTS['jaccount']['client_id'],
    client_secret=settings.AUTHLIB_OAUTH_CLIENTS['jaccount']['client_secret'],
    access_token_url='https://jaccount.sjtu.edu.cn/oauth2/token',
    authorize_url='https://jaccount.sjtu.edu.cn/oauth2/authorize',
    api_base_url='https://api.sjtu.edu.cn/',
    client_kwargs={
        "scope": "openid",
        "token_endpoint_auth_method": "client_secret_basic",
        "token_placement": "header"
    }
)

oauth.register(
    name='github',
    client_id=settings.AUTHLIB_OAUTH_CLIENTS['github']['client_id'],
    client_secret=settings.AUTHLIB_OAUTH_CLIENTS['github']['client_secret'],
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email'}
)


def login_with(request, email, username):
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=username, email=email, password=''.join(
                random.choices(string.ascii_uppercase + string.digits, k=32)))
    login(request, user)


def login_jaccount(request):
    redirect_uri = request.build_absolute_uri(reverse('auth_jaccount'))
    return oauth.jaccount.authorize_redirect(request, redirect_uri)


def login_github(request):
    redirect_uri = request.build_absolute_uri(reverse('auth_github'))
    return oauth.github.authorize_redirect(request, redirect_uri)


def auth_jaccount(request):
    client = oauth.jaccount
    token = client.authorize_access_token(request)
    claims = jwt.decode(token.get('id_token'),
                        client.client_secret, claims_cls=CodeIDToken)
    login_with(request, claims['sub'] +
               "@sjtu.edu.cn", "sjtu-" + claims['sub'])
    return redirect('/')


def auth_github(request):
    try:
        client = oauth.github
        token = client.authorize_access_token(request)
    except OAuthError as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    user = requests.get('https://api.github.com/user',
                        headers={'Authorization': f'token {token["access_token"]}'}).json()
    login_with(request, user.get('email'), "github-" + user['login'])
    return redirect('/')


urlpatterns = [
    path('api/auth/github/login/', login_github, name='login_github'),
    path('api/auth/github/auth/', auth_github, name='auth_github'),
    path('api/auth/jaccount/login/', login_jaccount, name='login_jaccount'),
    path('api/auth/jaccount/auth/', auth_jaccount, name='auth_jaccount')
]
