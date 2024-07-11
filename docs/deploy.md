## 主机部署文档

**建议使用 Ubuntu 进行部署**

### 数据库

- 数据库：MYSQL 5.7

&emsp;&emsp;通过 docker 容器使用 mysql-5.7，数据库连接信息维护在 `.env` 文件，相关配置项以 `DB_` 开头。执行建表语句及示例数据: `docker/mysql/demo-data.sql`。如果不需要示例数据时，单独的建表语句在 `/src/mysql/base-table.sql`。

### 部署步骤

> 在服务器上仅需启动 node 服务即可，静态页面由 node 服务托管


1、部署命令

按实际情况修改 `scripts/deploy.mjs` 文件

``` bash
pnpm deploy
```

2、nginx 配置

``` nginx
# yice-performance 的 nginx 配置
# /opt/dtstack/yice-performance

# http
server {
    listen          80;
    server_name     yice.dtstack.cn;

    location / {
        proxy_pass http://localhost:4000/;
    }
}
```

3、部署完成后，执行以下命令检查服务是否正常

- `pm2 list` 查看服务是否正常运行
- `pm2 logs` 或 `tailf -100 pm2/logs/pm2-err.log` 查看是否有异常日志
- 查看数据库是否正常运行
- 查看页面是否能正常访问

4、【谨慎】执行以下命令可以停止服务

``` bash
pm2 stop yice
```

5、查看服务器端报告文件夹的大小

``` bash
pnpm fileSize
```


### 可能遇到的问题

#### 1、gcc 版本过低

&emsp;&emsp;建议使用 Ubuntu 部署。
&emsp;&emsp;主机模式部署时 `CentOS7` 上启动服务时报错：`Error: /lib64/libstdc++.so.6: version 'CXXABI_1.3.9' not found`，这是因为 `CentOS7` 的 `gcc` 版本过低，需要升级到 `gcc-4.8.5` 以上，执行下方命令可以看到没有 `CXXABI_1.3.9`。

``` shell
strings /lib64/libstdc++.so.6 | grep CXXABI
```

&emsp;&emsp;升级 gcc 版本需要自行研究。

``` shell
cd /etc/gcc
wget https://ftp.gnu.org/gnu/gcc/gcc-9.5.0/gcc-9.5.0.tar.gz
tar xzvf gcc-9.5.0.tar.gz
mkdir obj.gcc-9.5.0
cd gcc-9.5.0
./contrib/download_prerequisites
cd ../obj.gcc-9.5.0
../gcc-9.5.0/configure --disable-multilib --enable-languages=c,c++
make -j $(nproc)
make install
```

相关链接：
- https://github.com/Automattic/node-canvas/issues/1796
- https://gist.github.com/nchaigne/ad06bc867f911a3c0d32939f1e930a11
- https://ftp.gnu.org/gnu/gcc/


