FROM node:14

# Die WORKDIR-Anweisung legt das Verzeichnis fest, in dem während des Build-Vorgangs die RUN-, CMD- und
# ENTRYPOINT-Anweisungen im Image ausgeführt werden.
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY . .
RUN ls -la /usr/src/app/*
RUN npm install

EXPOSE 8100
CMD [ "node", "app.js" ]


