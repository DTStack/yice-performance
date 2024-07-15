## docker 部署

> 目前构建出来的镜像仅支持 `amd64(x86_64)` 的架构平台，`linux/arm64 v8` 架构平台暂不支持。
> `yice-mysql` 镜像 tag 从 `latest` 改为 `arm64v8` 可以支持在 arm64 上运行，测试的机器是 Mac 的 m1 芯片。


### docker run

&emsp;&emsp;为了保证 `yice-server` 可以访问到 `yice-mysql`，两个容器需要使用同一个网络。

``` shell
docker network create yice-network
```

``` shell
docker run -p 3306:3306 -d --name yice-mysql --network=yice-network -v /opt/dtstack/yice-performance/yice-mysql/conf:/etc/mysql/conf.d -v /opt/dtstack/yice-performance/yice-mysql/log:/var/log/mysql -v /opt/dtstack/yice-performance/yice-mysql/data:/var/lib/mysql registry.cn-hangzhou.aliyuncs.com/liuxy0551/yice-mysql:latest
docker run -p 4000:4000 -d --name yice-server --network=yice-network -v /opt/dtstack/yice-performance/pm2-logs:/yice-performance/pm2/logs -v /opt/dtstack/yice-performance/yice-report:/yice-performance/apps/server/yice-report registry.cn-hangzhou.aliyuncs.com/liuxy0551/yice-server:latest
```

> - `-p` 表示端口映射，`-p 宿主机 port:容器 port`，这里暴漏端口是为了外部可以通过 GUI 工具查看数据
> - `-d` 表示后台运行并返回容器 id
> - `--name` 表示给容器指定的名称
> - `-v /opt/dtstack/yice-performance/yice-mysql:/etc/mysql/conf.d` 等挂载路径表示将容器中的配置项、数据、日志都挂载到主机的 `/opt/dtstack/yice-performance/yice-mysql` 下
> - `-v /opt/dtstack/yice-performance/pm2-logs:/yice-performance/pm2/logs` 等挂载路径表示将容器中的 pm2 日志和检测报告挂载到宿主机
> - 挂载的目的是为了在删除容器时数据不丢失，且尽量保持容器存储层不发生写操作。

容器运行后，应当添加一个 `.env.local` 配置文件，内容在当前文档开头，pm2 会自动重启服务：

``` shell
cd /opt/dtstack/yice-performance
```

``` shell
docker cp .env.local yice-server:/yice-performance/
```

``` shell
tail 200 -f /opt/dtstack/yice-performance/pm2-logs/pm2-out.log
```

&emsp;&emsp;执行上述命令后可以在浏览器中访问 `http://localhost:4000` 查看效果。


### docker-compose

&emsp;&emsp;当你使用 `docker-compose` 时，[docker-compose.yml](../docker/docker-compose.yml) 如下：

``` yaml
version: '3'

services:
    mysql-service:
        container_name: yice-mysql
        image: registry.cn-hangzhou.aliyuncs.com/liuxy0551/yice-server:latest
        ports:
            - '3306:3306'
        restart: always
        networks:
            - yice-network

    server-service:
        container_name: yice-server
        image: registry.cn-hangzhou.aliyuncs.com/liuxy0551/yice-mysql:latest
        ports:
            - '4000:4000'
        restart: always
        depends_on:
            - mysql-service
        networks:
            - yice-network

networks:
  yice-network:
    driver: bridge
```

&emsp;&emsp;通过 docker-compose 启动程序：

``` shell
docker-compose -f docker/docker-compose.yml -p yice-performance up -d
```

&emsp;&emsp;执行上述命令后可以在浏览器中访问 `http://localhost:4000` 查看效果。


### 修改配置项

&emsp;&emsp;如果 `.env` 文件有需要修改的，可以通过新建一个 `.env.local` 文件来覆盖默认的配置项，将文件修改后复制到容器。

``` shell
docker cp yice-server:/yice-performance/.env /home/app/yice-performance/.env
```
``` shell
vim /home/app/yice-performance/.env
```
``` shell
docker cp /home/app/yice-performance/.env yice-server:/yice-performance/.env
```

``` shell
docker start yice-server
```


### 常见问题

#### 1、yice-server 容器无法启动

&emsp;&emsp;可能是 `docker` 版本较低，建议升级到 docker v24 及以上，升级前应当备份。

``` shell
yum install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

```
node[1]: ../src/node_platform.cc:61:std::unique_ptr<long unsigned int> node::WorkerThreadsTaskRunner::DelayedTaskScheduler::Start(): Assertion `(0) == (uv_thread_create(t.get(), start_thread, this))' failed.
 1: 0xb090e0 node::Abort() [node]
 2: 0xb0915e  [node]
 3: 0xb7512e  [node]
 4: 0xb751f6 node::NodePlatform::NodePlatform(int, v8::TracingController*) [node]
 5: 0xacbf74 node::InitializeOncePerProcess(int, char**, node::InitializationSettingsFlags, node::ProcessFlags::Flags) [node]
 6: 0xaccb59 node::Start(int, char**) [node]
 7: 0x7f2ffac64d90  [/lib/x86_64-linux-gnu/libc.so.6]
 8: 0x7f2ffac64e40 __libc_start_main [/lib/x86_64-linux-gnu/libc.so.6]
 9: 0xa408ec  [node]
```
