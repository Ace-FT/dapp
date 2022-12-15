# Starting from a base image supported by SCONE  
FROM node:14-alpine3.11

# install your dependencies
RUN mkdir /app && cd /app && npm install figlet@1.x

COPY ./src /app
COPY ./package.json /app
COPY ./chain.json /app
RUN cd /app && npm install && ls -la

ENTRYPOINT [ "node", "/app/app.js"]