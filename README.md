<p align="center">
  <a href="https://github.com/DTStack/yice-performance" target="blank"><img src="./static/logo.png" width="140" alt="易测" /></a>
</p>

<p align="center">易测性能检测平台</p>


## 首页效果

<p align="center">
  <img src="./static/home.png" width="900" alt="易测" />
</p>

## 本地启动

### mysql 5.7

建表语句: `/src/mysql/base-table.sql`

### 基础依赖

- pnpm：v6.32.20
- node：v14.20.0
- pm2：v5.2.0

`.env` 文件中的属性按实际填写即可

- 运行页面：`pnpm dev:web`，7001 端口
- 运行 node 服务：`pnpm dev`，4000 端口


