FROM ghcr.io/puppeteer/puppeteer:23.6.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    # PUPPETEER_EXECUTABLE_PATH=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN apt-get update && apt-get install -y chromium-browser

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

CMD [ "node", "server.js" ]