FROM node:latest

RUN npm install -g npm@8.18.0

WORKDIR /usr/src/nodejsapp
ADD ./my-app .
RUN npm install


EXPOSE 3000

CMD npm start