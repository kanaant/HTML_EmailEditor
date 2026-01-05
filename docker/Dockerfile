# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Documentation
FROM node:18-alpine AS docs-build
WORKDIR /app/docs
COPY docs/package*.json ./
RUN npm install
COPY docs/ ./
RUN npm run docs:build

# Stage 3: Final Image (Node + Nginx)
FROM node:18-alpine
WORKDIR /app

# Install Nginx
RUN apk add --no-cache nginx

# Copy Backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# Copy Frontend Build
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy Docs Build
COPY --from=docs-build /app/docs/docs/.vitepress/dist /usr/share/nginx/html/docs

# Copy Configs
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/start.sh /start.sh

# Permissions
RUN chmod +x /start.sh

# Expose Port 80
EXPOSE 80

# Start
ENTRYPOINT ["/start.sh"]
