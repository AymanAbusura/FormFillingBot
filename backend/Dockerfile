# Use Puppeteer's base image with pre-installed dependencies for Chrome
FROM ghcr.io/puppeteer/puppeteer:23.6.1

# Set Puppeteer-specific environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production

# Set working directory
WORKDIR /usr/src/app

# Copy the package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Install any OS dependencies required by Puppeteer/Chrome
RUN apt-get update && \
    apt-get install -y \
    fonts-liberation \
    libasound2 \
    lsb-release \
    wget \
    xdg-utils && \
    rm -rf /var/lib/apt/lists/*

# Copy all application files
COPY . .

# Expose the necessary port
EXPOSE 5001

# Start the server
CMD ["node", "server.js"]