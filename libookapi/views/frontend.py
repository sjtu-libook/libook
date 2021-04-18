import os
import logging
from django.http import HttpResponse
from django.shortcuts import redirect
from django.views.generic import View
from django.conf import settings


class FrontendAppView(View):
    """
    Serves the compiled frontend entry point (only works if you have run `yarn
    build`).
    """
    if settings.REDIRECT_TARGET:
        return redirect(settings.REDIRECT_TARGET)

    index_file_path = os.path.join(
        settings.REACT_APP_DIR, 'build', 'index.html')

    def get(self, request):
        try:
            with open(self.index_file_path) as f:
                return HttpResponse(f.read())
        except FileNotFoundError:
            return HttpResponse('Production build of app not found', 200)
