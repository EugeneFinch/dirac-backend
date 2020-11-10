FROM node:14-alpine
WORKDIR app
COPY package.json yarn.lock ./
RUN yarn install --prod

COPY . .

EXPOSE 3030
ENTRYPOINT yarn start
