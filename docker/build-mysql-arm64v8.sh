#!/bin/sh

cd docker

# arm64/v8
docker buildx build --platform linux/arm64v8 -f Dockerfile.mysql -t liuxy0551/yice-mysql --build-arg BASE_IMAGE=biarms/mysql:5.7.30-linux-arm64v8 .

# `Dockerfile.mysql` 支持构建 `linux/arm64v8` 架构的镜像，执行 `sh docker/build-mysql-arm64v8.sh` 可生成 arm64v8 架构的 mysql 镜像
