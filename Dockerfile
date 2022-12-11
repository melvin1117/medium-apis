FROM node:14.17-alpine

COPY . /app

WORKDIR /app

RUN npm install

EXPOSE 3000

CMD ["/usr/local/bin/npm start"]
