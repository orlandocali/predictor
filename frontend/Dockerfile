FROM node:20-alpine
WORKDIR /app

# Copy package files and install dependencies
# node_modules stays inside the image; source is mounted via docker-compose volume
COPY package*.json ./
RUN npm ci

EXPOSE 5173

CMD ["npm", "run", "dev"]
