<p align="center">
  <a href="https://github.com/DTStack/yice-performance" target="blank"><img src="./apps/web/public/logo.png" width="140" alt="易测" /></a>
</p>

<p align="center">易测性能检测平台 v2</p>


## 首页效果

<p align="center">
  <img src="./docs/screenshot/home.png" width="900" alt="易测" />
</p>

更多截图可查看：[截图展示](./docs/screenshot.md)

## 本地启动

### mysql 5.7

执行 建表语句及示例数据: `docker/mysql/demo-data.sql`

### 基础依赖

- 安装服务依赖：`pnpm i`
- 运行 node 服务和前端页面：`pnpm dev`

> `.env` 文件中的属性按实际填写即可，建议本地新建一个 `.env.local` 文件，配置一些较隐私的内容，这个文件不会被 git 感知且配置项的优先级大于 `.env` 文件。
> node 服务在 4000 端口，页面服务在 7001 端口
> pnpm：v6.35.1
> node：v14.20.0


## 部署文档

[主机部署文档](./docs/deploy.md)
[Docker 部署文档](./docs/docker.md)
[从 v1 到 v2](./docs/v1_to_v2.md)


## 功能点

- [x] 页面检测
- [x] 定时运行任务
- [x] 补数据
- [x] 查看报告
- [x] 任务失败钉钉告警
- [x] 多种结果分析图
- [x] 权限控制
- [x] 数据周报邮件
- [x] docker 部署

**数据周报**功能依赖 canvas 模块，该模块需要一些先行安装的依赖，详情见：[node-canvas wiki](https://github.com/Automattic/node-canvas/wiki)。比如 CentOS 需要先执行 `yum install gcc-c++ cairo-devel pango-devel -y`，MacOS 需要先执行 `brew install pkg-config cairo pango libpng`。


**注意**
> 易测检测系统和我司内部的 devops 系统深度绑定，用于检测我司需要登录的一些页面，但不影响评分功能的实现参考。


## 趋势

[![Stargazers over time](https://starchart.cc/dtstack/yice-performance.svg)](https://starchart.cc/dtstack/yice-performance)
