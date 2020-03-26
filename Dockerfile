FROM node:12

WORKDIR /usr/src/app

EXPOSE 8080
EXPOSE 3000

COPY package.json ./
COPY lerna.json ./
COPY yarn.lock ./
COPY packages/ packages

RUN yarn

RUN yarn build-common
RUN yarn build-backend

CMD [ "yarn", "start" ]
