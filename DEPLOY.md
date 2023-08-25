## 部署文档

### 数据库

- 数据库：MYSQL 5.7

通过 docker 容器使用 mysql-5.7，数据库连接信息维护在 `.env` 文件，相关配置项以 `DB_` 开头。


### 基础依赖
- pnpm：v6.32.20
- node：v14.20.0
- pm2：v5.2.0


### 部署步骤

github：https://github.com/DTStack/yice-performance

> 在服务器上仅需启动 node 服务即可，静态页面由 node 服务托管

【可选】维护者可以在本机执行以下命令，输入密码后会将本机的 ssh 公钥添加到服务器，后续连接服务器就不再需要输入密码：

``` bash
ssh-copy-id root@46.172.32.43
```

1、【建议】可以在本机的环境变量里添加环境变量（仅第一次，vim ~/.zshrc）

``` bash
# 易测服务器
export yiceServerIP="46.172.32.43"
```

2、部署命令

``` bash
pnpm deploy
```

3、登录服务器

``` bash
ssh root@46.172.32.43
```

``` bash
cd /opt/dtstack/yice-performance/
vim .env
```

确保服务器的配置文件内容如下，个人内容禁止公开到外部

```
# node 服务信息
APP_PORT=4000
API_PREFIX='api/v1'

# 部分动作由于网络原因，延时再进行下一步操作比较稳妥，毫秒
RESPONSE_SLEEP=5000

# 仅在本地调试时允许放开下方一行的注释，放开会出现检测浏览器窗口
# USE_HEADLESS=yes

# 数据库信息 - 暂未使用
DB_HOST='localhost'
DB_PORT=3306
DB_USERNAME='root'
DB_PASSWORD='123456'
DB_DATABASE='yice-performance'

# devops 的默认用户名和密码
DEVOPS_USERNAME="admin@dtstack.com"
DEVOPS_PASSWORD="123456"

# 钉钉告警机器人
ALARM_WEBHOOK=""
ALARM_USER_PHONE=""

# 任务超时则取消该任务，分钟
TASK_TIMEOUT=5

# 项目新增版本后，默认 cron：凌晨两点和三点触发
TASK_DEFAULT_CRON='0 0 2-3 * * *'
```

4、【可选】如果配置文件内容和上述不一致，请修改后重启服务

``` bash
pnpm pm2
```

5、部署完成后，执行以下命令检查服务是否正常

- `pm2 list` 查看服务是否正常运行
- `pm2 logs` 或 `tailf -500 pm2/logs/pm2-err.log` 查看是否有异常日志
- 查看数据库是否正常运行
- 查看页面是否能正常访问

6、【谨慎】执行以下命令可以停止服务

``` bash
pm2 stop yice
```

7、查看服务器端报告文件夹的大小

``` bash
pnpm static
```
