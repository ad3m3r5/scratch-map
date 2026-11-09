# node:22 is latest LTS with armv7
FROM node:22.23.4-alpine3.23

ENV \
  NODE_ENV=production \
  APP_DIR=/app

RUN apk upgrade --no-cache \
  && mkdir -p $APP_DIR/data \
  && chown -R node:node $APP_DIR

USER node
WORKDIR $APP_DIR

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production \
  && yarn cache clean

COPY --chown=node:node . .

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:${PORT:-3000}/ || exit 1

CMD [ "node", "server.js" ]
