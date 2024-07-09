#!/bin/sh

cd docker

# amd64
docker buildx build --platform linux/amd64 -f Dockerfile.mysql -t liuxy0551/yice-mysql .
docker buildx build --platform linux/amd64 -f Dockerfile.server -t liuxy0551/yice-server ../
