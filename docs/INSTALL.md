# Installing SCRATCH-MAP

## Table of Contents
  - [README](../README.md)
  - [UPDATE](./UPDATE.md)
  - [Environment Variables](#environment-variables)
  - [Docker](#docker)
    - [Docker Setup](#docker-setup)
    - [Docker Run](#docker-run)
    - [Docker Compose](#docker-compose)
  - [Using NPM](#using-npm-any-os)
  - [Running as a Service](#running-as-a-service-any-os)

### Environment Variables
  - `process.env.ADDRESS`
    - (optional) address for app to run on
    - DEFAULT: `0.0.0.0`
  - `process.env.PORT`
    - (optional) port for app to run on
    - DEFAULT: `3000`
  - `process.env.DATA_DIR`
    - (recommended) somewhere outside of app dir for update and container compatibility
    - DEFAULT: `APP_DIR/data/`
  - `process.env.LOG_LEVEL`
    - (optional) log level for console output
    - DEFAULT: `INFO`
    - OPTIONS: `INFO`, `DEBUG`
  - `process.env.ENABLE_SHARE`
    - (optional) enables/disables view-only /share routes for maps
    - DEFAULT: `false`
    - OPTIONS: `true`, `false`

### Docker

[![Docker Hub](https://img.shields.io/badge/DockerHub-image-blue?logo=docker&style=plastic)](https://hub.docker.com/r/ad3m3r5/scratch-map) ![Docker Image Size (tag)](https://img.shields.io/docker/image-size/ad3m3r5/scratch-map/latest?logo=docker&style=plastic)

The commands to create the data directory and set permissions are *nix specific and may need to be changed for your system.

The environment variables passed are examples.

#### Docker Setup

```
mkdir -p /opt/containers/scratch-map/data

chown -R 1000:1000 /opt/containers/scratch-map/data
```

#### Docker Run

```
docker run -d --restart=always \
  --name scratch-map -p 8080:8080 \
  -e PORT=8080 -e DATA_DIR=/data \
  -v /opt/containers/scratch-map/data:/data \
  ad3m3r5/scratch-map:latest
```

#### Docker Compose

```
cd /opt/containers/scratch-map

wget https://raw.githubusercontent.com/ad3m3r5/scratch-map/refs/heads/master/compose.yaml

docker compose up -d
```

### Using NPM (any OS)
1) Set ENV vars (see above) somewhere they will persist
2) `npm install`
3) `npm run`

### Running as a Service (any OS)

This varies depending on the OS, however I would recommend checking out [PM2](https://pm2.keymetrics.io/).

Example of pm2 command: `DATA_DIR=/data pm2 start server.js --name scratch-map`


