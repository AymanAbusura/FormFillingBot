FROM ghcr.io/puppeteer/puppeteer:23.6.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    # PUPPETEER_EXECUTABLE_PATH=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN apt-get update && apt-get install -y wget && wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && dpkg -i google-chrome-stable_current_amd64.deb && rm google-chrome-stable_current_amd64.deb

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

CMD [ "node", "server.js" ]