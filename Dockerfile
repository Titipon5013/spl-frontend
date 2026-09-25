# # Stage 1: Build the React application
FROM node:20-bullseye AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# # Stage 2: Serve the application using Nginx
FROM nginx:alpine

COPY /dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
