#!/bin/sh
cd docker
docker buildx build --platform linux/arm64/v8 -f Dockerfile.mysql -t liuxy0551/yice-mysql .
docker buildx build --platform linux/arm64/v8 -f Dockerfile.server -t liuxy0551/yice-server ../

# docker-compose up -d

