# node.js Dockerfile
# Taken from https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./nodejs/package*.json ./

RUN npm install

# Bundle app source
COPY ./nodejs /usr/src/app/
COPY ./resources /usr/src/resources/

EXPOSE 8080
CMD ["node", "app.js"]