#!/bin/sh

cd docker

# arm64/v8
docker buildx build --platform linux/amd64 -f Dockerfile.mysql -t liuxy0551/yice-mysql --build-arg BASE_IMAGE=biarms/mysql:5.7.30-linux-arm64v8 .
