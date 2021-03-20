from django.http import HttpResponse, JsonResponse
from django.urls import include, path
from authlib.integrations.django_client import OAuth
from loginpass import create_django_urlpatterns
from loginpass import Twitter, GitHub, Google
from django.contrib.auth import login
from django.shortcuts import redirect
from django.contrib.auth.models import User
import random
import string

oauth = OAuth()
backends = [GitHub]


def handle_authorize(request, remote, token, user_info):
    username = "github-" + user_info['preferred_username']
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=username, password=''.join(
                random.choices(string.ascii_uppercase + string.digits, k=32)))
    login(request, user)
    return redirect('/')


urlpatterns = []
for backend in backends:
    oauth_urls = create_django_urlpatterns(backend, oauth, handle_authorize)
    urlpatterns.append(path(f"api/auth/{backend.NAME}/", include(oauth_urls)))
