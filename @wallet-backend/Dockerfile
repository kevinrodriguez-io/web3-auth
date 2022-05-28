FROM node:apline

WORKDIR /usr/app

ENV PORT ${PORT}
ENV HOST 0.0.0.0

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

CMD yarn start