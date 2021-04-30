# library-book

[![Frontend](https://github.com/sjtu-libook/libook/actions/workflows/frontend_test.yml/badge.svg)](https://github.com/sjtu-libook/libook/actions/workflows/frontend_test.yml)
[![Backend](https://github.com/sjtu-libook/libook/actions/workflows/backend_test.yml/badge.svg)](https://github.com/sjtu-libook/libook/actions/workflows/backend_test.yml)
[![Coverage Status](https://coveralls.io/repos/github/sjtu-libook/libook/badge.svg?t=FH8Kas)](https://coveralls.io/github/sjtu-libook/libook)

* 后端: libook (django)
* 前端: booklib (React)

## 安装依赖

后端使用 Python django 框架编写，使用 pipenv 管理依赖。您需要先安装 pipenv，而后才能启动。

```bash
pip3 install pipenv
pipenv install --dev
make migrate # 创建数据库
make run.backend
```

* 启动后，在 http://127.0.0.1:8000/api/schema/swagger-ui/ 可以看到后端暴露的所有 API。
* 访问 http://127.0.0.1:8000/api/ 可以向后端发送请求。
* 运行 `make createsuperuser` 后，即可使用 Django 管理后台。 http://127.0.0.1:8000/admin/

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
pipenv run python manage.py fill_region
```

## 开发流程

### 后端

1. `git checkout master && git pull && make migrate` 保证目前代码为最新版本，并更新本地数据库 schema。
2. `git checkout -b your-name/your-feature-name` 创建一个新分支。
3. 对代码做修改。
4. 如果更改了数据库 model，运行 `make makemigrations && make migrate` 更新相关文件。
5. 编写测试。可以配置 VSCode 的 Python 使用 pipenv 的 Python，并配置 Python Test 插件使用 pytest。在侧边栏即可查看所有测试的情况。`make test.backend` 可以手动跑测试。
6. 更新文档。大部分 API 可以自动生成文档，有一些可能要自己声明。在 Swagger 中可以查看自动生成的 API 文档。
7. `make format.backend` 格式化代码。
8. 发 PR。CI 测试通过即可自己 Squash and Merge。Merge 时需要填写格式正确的 commit 标题。如果有不确定的地方，可以请求其他人 review。

### 前端

1. `git checkout master && git pull && make migrate` 保证目前代码为最新版本，并更新本地数据库 schema。
2. `git checkout -b your-name/your-feature-name` 创建一个新分支。
3. `make run.backend` 运行后端。
4. `make run.frontend` 运行前端，在浏览器页面中应当可以正常使用。
5. 对代码做修改。
6. `make format.frontend` 格式化代码。
7. 发 PR。CI 测试通过即可自己 Squash and Merge。Merge 时需要填写格式正确的 commit 标题。如果有不确定的地方，可以请求其他人 review。


## License

Apache 2.0
