FROM node:22-alpine as build-stage
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY ./ /app/
RUN npm run build

FROM nginx:alpine3.20-slim
COPY --from=build-stage /app/dist /usr/share/nginx/html

