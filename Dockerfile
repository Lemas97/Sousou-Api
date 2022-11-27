FROM node:16-alpine as development

WORKDIR /usr/src/app

COPY package*.json .
COPY tsconfig*.json .
COPY mikro-orm.config.ts .

RUN yarn install

COPY . .

RUN yarn build

FROM node:16-alpine as production

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json .

RUN yarn install --production

COPY --from=development /usr/src/app/dist .

CMD [ "node", "dist/main.js"]
