# SCRATCH-MAP

![logo](https://user-images.githubusercontent.com/11009228/201435148-647ed019-7cec-4e75-bce9-a4d1972fb4e9.jpg)

<p style="text-align: center;">An open-source scratch-off style map to track your travels.</p>
<br/>

## Table of Contents
  * [Features](#features)
  * [MAPS](MAPS.md)
  * [CONTRIBUTING](CONTRIBUTING.md)
  * [Running](#running)
    * [Docker](#docker)
    * [Using NPM](#using-npm-any-os)
    * [Running as a Service](#running-as-a-service-any-os)
    * [Environment Variables](#environment-variables)
  * [Tech Stack](#tech-stack)
  * [Screenshots](#screenshots)
  * [Credits](#credits)
    * [Libraries](#libraries)

<br/>

## Features
  * World Map
  * US States Map
  * Canadian Map
  * Australian Map
  * French Map
  * Date Traveled To Location
  * Link a Photo Album URL to a Scratch

<br/>

## Running

### Docker

[![Docker Hub](https://img.shields.io/badge/DockerHub-image-blue?logo=docker&style=plastic)](https://hub.docker.com/r/ad3m3r5/scratch-map) ![Docker Image Size (tag)](https://img.shields.io/docker/image-size/ad3m3r5/scratch-map/latest?logo=docker&style=plastic)

The commands to create the data directory and set permissions are Linux specific.

```
mkdir -p /opt/docker/scratch-map/data

chown -R 1000:1000 /opt/docker/scratch-map/data

docker run -d --restart=always --name scratch-map -p 8080:8080 \
  -e PORT=8080 -e DBLOCATION=/data \
  -v /opt/docker/scratch-map/data:/data \
  ad3m3r5/scratch-map:latest
```

### Using NPM (any OS)
* Set ENV vars (see below) somewhere they will persist
* `npm install`
* `npm run`

### Running as a Service (any OS)
This varies depending on the OS, however I would recommend checking out [PM2](https://pm2.keymetrics.io/).

### Environment Variables
  * `process.env.DBLOCATION`
    * (recommended) somewhere outside of app dir for update compatibility
    * DEFAULT: APPDIR/data/
  * `process.env.PORT`
    * (optional) port for app to run on
    * DEFAULT: 3000

<br/>

## Tech Stack
* nodeJS (18.12.0)
* express
* pug
* lowdb
* nodemon

<br/>

## Screenshots

![Home Page](https://user-images.githubusercontent.com/11009228/201794201-dcff2e3c-027e-45da-9379-6ee855838a14.png)

![World Map](https://user-images.githubusercontent.com/11009228/201389466-269d0fe5-88e0-42d6-bd9e-fe1fe79befb8.png)

![States Map](https://user-images.githubusercontent.com/11009228/201389708-1e3643a1-1cf6-4f23-98ec-e34a72acafd0.png)

![Canadian Map](https://user-images.githubusercontent.com/11009228/201794259-20e3f9b5-b126-4c8d-8cb0-820b6f16da0a.png)

![Example Pop-up](https://user-images.githubusercontent.com/11009228/201492766-4c1a7614-6d48-411f-90e4-97ac9a6f4ca1.png)

<br/>

## Credits

### Libraries
* pan/zoom for SVGs
  * https://github.com/luncheon/svg-pan-zoom-container
* scratch prompts/pop-ups
  * https://github.com/sweetalert2/sweetalert2

### Fonts
* Roboto - used on SVG labels
  * https://fonts.google.com/specimen/Roboto