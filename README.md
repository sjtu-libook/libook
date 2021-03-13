# library-book

* 后端: libook (django)
* 前端: booklib (React)

## 安装依赖

后端使用 Python django 框架编写，使用 pipenv 管理依赖。您需要先安装 pipenv，而后才能启动。

```bash
pip3 install pipenv
pipenv install
make migrate # 创建数据库
make run.backend
```

启动后，在 http://127.0.0.1:8000/api/schema/swagger-ui/ 可以看到后端暴露的所有 API。

前端使用 React 框架编写，使用 yarn 管理依赖。您需要先安装 Node.js 和 yarn，而后才能启动。

```bash
npm i -g yarn
cd booklib
yarn
yarn start
```

启动后，在 http://127.0.0.1:3000/ 即可使用前端。

## Maintenance

```
pipenv run python manage.py fill_timeslice
```

## License

Apache 2.0
