## docker 部署

> 目前构建出来的镜像仅支持 `amd64(x86_64)` 的架构平台，`linux/arm64 v8` 架构平台暂不支持。
> `linux/arm64 v8` 测试的不多可以自行构建镜像，`yice-server` 能够在 arm64 上运行，`yice-mysql` 镜像 tag 从 `latest` 改为 `arm64v8` 可以支持在 arm64 上运行，测试的机器是 Mac 的 m1 芯片。
> 将出现的 `registry.cn-hangzhou.aliyuncs.com/` 删除，使用的就会是 Docker Hub 的镜像了。
> docker 容器会限制性能，这对于测试分数是有影响的。


### docker run

&emsp;&emsp;为了保证 `yice-server` 可以访问到 `yice-mysql`，需要两个容器使用同一个网络。

``` shell
docker network create yice-network
```

&emsp;&emsp;阿里云提供了容器镜像服务的个人版，对于加速镜像拉取效果明显，所以易测支持了从阿里云拉取镜像。

``` shell
docker run -p 3306:3306 -d --name yice-mysql --network=yice-network -v /home/app/yice-performance/yice-mysql/conf:/etc/mysql/conf.d -v /home/app/yice-performance/yice-mysql/log:/var/log/mysql -v /home/app/yice-performance/yice-mysql/data:/var/lib/mysql registry.cn-hangzhou.aliyuncs.com/liuxy0551/yice-mysql:latest
docker run -p 4000:4000 -d --name yice-server --network=yice-network -v /home/app/yice-performance/yice-report:/yice-performance/apps/server/yice-report registry.cn-hangzhou.aliyuncs.com/liuxy0551/yice-server:latest
```

> ● -p 表示端口映射，-p 宿主机 port:容器 port，这里暴漏端口是为了外部可以通过 GUI 工具查看数据
> ● -d 表示后台运行并返回容器 id
> ● --name 表示给容器指定的名称
> ● -v /home/app/yice-performance/yice-mysql:/etc/mysql/conf.d 等挂载路径表示将容器中的配置项、数据、日志都挂载到主机的 /home/app/yice-performance/yice-mysql 下
> ● -v /home/app/yice-performance/yice-report:/yice-performance/apps/server/yice-report 表示将容器中的检测报告挂载到宿主机
> ● 挂载的目的是为了在删除容器时数据不丢失，且尽量保持容器存储层不发生写操作。

&emsp;&emsp;执行上述命令后可以在浏览器中访问 `http://localhost:4000` 查看效果。


### docker-compose

&emsp;&emsp;当你使用 `docker-compose` 时，不需要单独创建网络，[docker-compose.yml](../docker/docker-compose.yml) 如下：

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

&emsp;&emsp;通过 docker-compose 启动程序

``` shell
docker-compose -f docker/docker-compose.yml -p yice-performance up -d
```

&emsp;&emsp;执行上述命令后可以在浏览器中访问 `http://localhost:4000` 查看效果。


### 修改配置项

&emsp;&emsp;如果 `.env` 文件有需要修改的，可以通过新建一个 `.env.local` 文件来覆盖默认的配置项。也可以将 `.env` 文件从容器中复制到宿主机修改后复制回容器。

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
