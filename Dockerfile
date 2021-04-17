FROM python:slim
WORKDIR /root

COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt -i https://mirrors.sjtug.sjtu.edu.cn/pypi/web/simple
COPY ./ ./
ENV DJANGO_SETTINGS_MODULE=libook.settings_heroku
RUN SECRET_KEY=x GITHUB_CLIENT_SECRET= python manage.py collectstatic --noinput
CMD gunicorn libook.wsgi --log-file=- --bind=0.0.0.0:8000 --workers=2
