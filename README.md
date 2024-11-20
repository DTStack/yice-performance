<p align="center">
  <a href="https://github.com/DTStack/yice-performance" target="blank"><img src="./apps/web/public/logo.png" width="140" alt="易测" /></a>
</p>

<p align="center">易测性能检测平台 v2</p>


## 首页效果

<p align="center">
  <img src="./docs/screenshot/home.png" width="900" alt="易测" />
  <img src="./docs/screenshot/project-chart.png" width="900" alt="性能评分趋势图" />
</p>

更多截图可查看：[截图展示](./docs/screenshot.md)

## 本地启动

``` shell
git clone https://github.com/DTStack/yice-performance
cd yice-performance
```

### mysql 5.7

执行 建表语句及示例数据: `docker/mysql/demo-data.sql`，将 `.env` 中 `DB_` 开头的配置项按实际情况修改。

### 服务启动

- 安装服务依赖：`pnpm install`
- 运行 node 服务和前端页面：`pnpm dev`

> 服务配置项 `.env` 文件中的属性按实际填写即可，建议本地新建一个 `.env.local` 文件，配置一些较隐私的内容，这个文件不会被 git 感知且配置项的优先级大于 `.env` 文件。
> node 服务在 4000 端口，页面服务在 7001 端口
> pnpm：v6.35.1
> node：v14.20.0


## 部署文档

[Docker 部署文档](./docs/docker.md)

[主机模式部署文档](./docs/deploy.md)

[从 v1 到 v2](./docs/v1_to_v2.md)


## 功能点

- [x] 页面检测
- [x] 定时检测
- [x] 补数据
- [x] 查看报告
- [x] 任务失败钉钉告警
- [x] 多种分析图
- [x] 权限控制
- [x] 数据周报邮件
- [x] docker 部署


**注意**
> 易测检测系统和我司内部的 devops 系统深度绑定，用于检测我司需要登录的一些页面，但不影响评分功能的实现参考。


## 常见问题

### 1. yice-server 容器无法启动

&emsp;&emsp;可能是 `docker` 版本较低，建议升级到 docker v24 及以上，升级前应当备份。

### 2. gcc 版本过低

&emsp;&emsp;主机部署时建议使用 Ubuntu。
&emsp;&emsp;主机模式部署时 CentOS7 上启动服务时报错：Error: /lib64/libstdc++.so.6: version 'CXXABI_1.3.9' not found，这是因为 CentOS7 的 gcc 版本过低，需要升级到 gcc-4.8.5 以上，执行下方命令可以看到没有 CXXABI_1.3.9。

``` shell
strings /lib64/libstdc++.so.6 | grep CXXABI
```

### 3. MacOS M 系列 arm 芯片本地安装 canvas 时失败

&emsp;&emsp; node@14.21.3 pnpm@6.35.1 代理开增强模式，可以正常安装依赖并启动。出现报错时，可以考虑使用这个依赖版本组合。


## 趋势

[![Stargazers over time](https://starchart.cc/dtstack/yice-performance.svg)](https://starchart.cc/dtstack/yice-performance)
