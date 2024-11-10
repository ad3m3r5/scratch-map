# Updating

As long as the [INSTALL](./INSTALL.md) instructions were followed, the below instructions should work.

Be sure to pay attention to any `Breaking Changes` in [CHANGELOG](./CHANGELOG.md) and make the appropriate modifications

## Table of Contents
  - [README](../README.md)
  - [INSTALL](./INSTALL.md)
  - [Docker](#docker)
    - [Docker Run](#docker-run)
    - [Docker Compose](#docker-compose)
  - [NPM or PM2](#npm-or-pm2)

### Docker

#### Docker Run

```
docker pull ad3m3r5/scratch-map:latest

docker stop scratch-map

docker rm scratch-map
```

Then run the `docker run` command from [INSTALL](./INSTALL.md)

#### Docker Compose

Update the `image` in compose.yaml, then run the below for a seamless update:

```
cd /opt/containers/scratch-map

docker compose pull

docker compose up -d
```

### NPM or PM2

Assuming you installed scratch-map by cloning with git and are using *nix commands:

- Ensure you are using the `master` branch of the repository:
  - `cd <your_install_dir>
  - `git branch`
- Pull the latest version
  - `git pull`
- Run your desired start command
