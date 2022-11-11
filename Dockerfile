FROM node:18.12.0-alpine3.16

ENV NODE_ENV=production

WORKDIR /opt/scratch-map

COPY --chown=node:node package*.json ./

RUN npm ci --omit=dev

COPY --chown=node:node . .

USER node

CMD [ "node", "server.js" ]