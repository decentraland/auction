# latest official node image
FROM node:latest

RUN npm install -g nginx

RUN mkdir /webapp
WORKDIR /webapp
ADD package.json ./package.json
RUN npm install --unsafe-perm
ADD . ./

ENV PORT=80

CMD npm start
