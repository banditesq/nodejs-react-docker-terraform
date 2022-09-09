FROM node:latest

RUN npm install -g npm@8.18.0
RUN npm install nodemon -g

WORKDIR /usr/src/nodejsapp
ADD . .
RUN npm install --force
RUN npm install -g ts-node
RUN npm install -g typescript


EXPOSE 8080

CMD npm start