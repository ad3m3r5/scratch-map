FROM node:18.20.4-alpine3.20

ENV NODE_ENV=production
ARG APP_DIR=/opt/scratch-map

RUN apk update \
  && apk upgrade --no-cache

RUN mkdir $APP_DIR && chown -R node:node $APP_DIR

WORKDIR $APP_DIR
USER node

COPY --chown=node:node . .

RUN npm ci --omit=dev

CMD [ "node", "server.js" ]
