install.backend:
	pipenv sync

install.frontend:
	cd booklib && yarn

install: install.backend install.frontend

makemigrations:
	pipenv run python manage.py makemigrations

migrate:
	pipenv run python manage.py migrate

createsuperuser:
	pipenv run python manage.py createsuperuser

run.backend:
	pipenv run python manage.py runserver

format.backend:
	pipenv run autopep8 --in-place --recursive . --exclude booklib

test.backend:
	pipenv run pytest -v

run.frontend:
	cd booklib && yarn start

lint.frontend:
	cd booklib && yarn lint

format.frontend:
	cd booklib && yarn lint --fix

build.frontend:
	cd booklib && yarn build
