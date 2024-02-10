# Use Node.js LTS (Long Term Support) as the base image
FROM node:lts

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and other files to the working directory
COPY . .

# Expose the port the app will run on
EXPOSE 8080 

# Start the development server
CMD ["npm", "start"]
