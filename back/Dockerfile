# Set the base image to Node.js 14
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# Install build-essential, Python 2.7, and libffi-dev
RUN apt-get update && apt-get install -y build-essential python2.7 libffi-dev

# Rebuild bcrypt module
RUN npm uninstall bcrypt && npm install bcrypt --build-from-source

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL=postgres://postgres:password@db:5432/mydb

# Expose port 3000
EXPOSE 3000

# Set the command to start the app
CMD ["npm", "start"]
