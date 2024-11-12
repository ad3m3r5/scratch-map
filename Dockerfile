# node:18 required due to npm bug on linux/arm/v7
#   https://github.com/docker/build-push-action/issues/1071
FROM node:18.20.4-alpine3.20

ENV \
  NODE_ENV=production \
  APP_DIR=/app

RUN apk update \
  && apk upgrade --no-cache

USER node
WORKDIR $APP_DIR

COPY --chown=node:node . .

RUN yarn install

CMD [ "node", "server.js" ]
