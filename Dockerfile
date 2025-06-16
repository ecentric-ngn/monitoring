# syntax=docker/dockerfile:1
FROM node:20-alpine as angular
WORKDIR /ng-app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
ARG app_name
COPY dist/sakai-ng /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
