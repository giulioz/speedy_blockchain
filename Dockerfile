FROM node:12

WORKDIR /usr/src/app

COPY package.json ./
COPY lerna.json ./
COPY yarn.lock ./
COPY packages/ packages

RUN yarn

EXPOSE 8080
EXPOSE 3000

# For now
CMD [ "yarn", "dev" ]

