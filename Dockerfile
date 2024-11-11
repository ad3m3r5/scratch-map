# node:18 required due to NPM bug on linux/arm/v7
#   https://github.com/docker/build-push-action/issues/1071
FROM node:18.20.4-alpine3.20

# Set the platform to build image for
ENV \
  NODE_ENV=production \
  APP_DIR=/app

RUN apk update \
  && apk upgrade --no-cache

USER node
WORKDIR $APP_DIR

COPY --chown=node:node . .

RUN npm ci --omit=dev

CMD [ "node", "server.js" ]
