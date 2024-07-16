#!/bin/sh

# 构建
pnpm install
pnpm build

cd docker

# amd64
docker buildx build --platform linux/amd64 -f Dockerfile.mysql -t liuxy0551/yice-mysql .
docker buildx build --platform linux/amd64 -f Dockerfile.server -t liuxy0551/yice-server ../

# docker tag liuxy0551/yice-mysql registry.cn-hangzhou.aliyuncs.com/liuxy0551/yice-mysql:latest
# docker push registry.cn-hangzhou.aliyuncs.com/liuxy0551/yice-mysql:latest

# docker tag liuxy0551/yice-server registry.cn-hangzhou.aliyuncs.com/liuxy0551/yice-server:latest
# docker push registry.cn-hangzhou.aliyuncs.com/liuxy0551/yice-server:latest
