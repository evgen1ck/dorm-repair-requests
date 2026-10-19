FROM node:22-alpine AS builder
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /frontend/dist /usr/share/nginx/html
COPY etc/nginx/default.conf.template /etc/nginx/templates/default.conf.template
