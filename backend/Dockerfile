# Use the Puppeteer image as the base
FROM ghcr.io/puppeteer/puppeteer:23.6.1

# Install Node.js
RUN apt-get update && apt-get install -y nodejs

# Set the working directory to /app
WORKDIR /app

# Copy the package*.json files to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Install Chrome browser for Puppeteer
RUN npx puppeteer browsers install chrome

# Copy the application code to the working directory
COPY . .

# Run the command to start the development server
CMD ["node", "server.js"]