"""
WSGI config for libook project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'libook.settings')

django_app = get_wsgi_application()

def netlify_fix_application(environ, start_response):
    if "HTTP_COOKIE" in environ:
        environ["HTTP_COOKIE"] = environ["HTTP_COOKIE"].replace(",", ";")
    return django_app(environ, start_response)

application = netlify_fix_application

