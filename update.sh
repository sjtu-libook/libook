#!/bin/bash

set -e

git fetch
git reset --hard origin/master
docker-compose up -d --build
docker-compose exec libook python manage.py migrate
sleep 60
