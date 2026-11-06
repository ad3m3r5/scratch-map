# node:22 is latest LTS with armv7
FROM node:22.23.4-alpine3.23

ENV \
  NODE_ENV=production \
  APP_DIR=/app

RUN apk update \
  && apk upgrade --no-cache \
  && mkdir -p $APP_DIR/data \
  && chown -R node:node $APP_DIR

USER node
WORKDIR $APP_DIR

COPY --chown=node:node . .

RUN yarn install --frozen-lockfile --production \
  && yarn cache clean

CMD [ "node", "server.js" ]
