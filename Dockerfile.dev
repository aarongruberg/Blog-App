# Use an official Node.js runtime as a parent image, version 18.14.0
FROM node:18.14.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Install any dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define the command to run the app
CMD ["node", "index.js"]