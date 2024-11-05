FROM ghcr.io/puppeteer/puppeteer:23.6.1

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/app/.cache/puppeteer

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

CMD [ "node", "server.js" ]