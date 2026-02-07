# Use Node.js LTS as the base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and other files to the working directory
COPY . .

# Expose the port the app will run on
EXPOSE 8000

# Start the development server
CMD ["npm", "run", "dev"]
