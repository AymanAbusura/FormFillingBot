FROM ghcr.io/puppeteer/puppeteer:23.6.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /Users/ayman/Desktop/Courses&Projects/Projects/formfillingbot/backend

COPY package.json ./
RUN npm ci
RUN npm audit fix
COPY . .

CMD [ "node", "server.js" ]