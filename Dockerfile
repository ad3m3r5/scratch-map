FROM node:18.20.4-alpine3.20

ENV NODE_ENV=production

RUN apk update \
  && apk upgrade --no-cache

WORKDIR /opt/scratch-map

COPY --chown=node:node package*.json ./

RUN npm ci --omit=dev

COPY --chown=node:node . .

USER node

CMD [ "node", "server.js" ]
