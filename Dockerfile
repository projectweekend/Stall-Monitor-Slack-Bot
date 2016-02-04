FROM node:4.2
ADD ./package.json /src/
RUN cd /src && npm install
ADD . /src/
WORKDIR /src
CMD ["node", "main.js"]
