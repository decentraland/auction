# latest official node image
FROM node:latest

RUN npm install -g babel-cli

# use cached layer for node modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install --unsafe-perm
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

# add project files
ADD . /usr/src/app
ADD package.json /usr/src/app/package.json
WORKDIR /usr/src/app

CMD npm run start
