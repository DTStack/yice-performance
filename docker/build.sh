#!/bin/sh

cd docker

# amd64
docker buildx build --platform linux/amd64 -f Dockerfile.mysql -t liuxy0551/yice-mysql --build-arg BASE_IMAGE=mysql:5.7 .
docker buildx build --platform linux/amd64 -f Dockerfile.server -t liuxy0551/yice-server --build-arg BASE_IMAGE=ubuntu:22.04 ../
