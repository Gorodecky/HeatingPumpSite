FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY index.html vite.config.ts tsconfig*.json ./
COPY src ./src
COPY public ./public
ARG VITE_LEADS_ENABLED=false
ARG VITE_BASE_PATH=/
ENV VITE_LEADS_ENABLED=$VITE_LEADS_ENABLED
ENV VITE_BASE_PATH=$VITE_BASE_PATH
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/dist /srv/site
COPY deploy/Caddyfile /etc/caddy/Caddyfile
