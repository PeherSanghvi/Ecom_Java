# ── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (cached layer unless package-lock.json changes)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build the Vue app
COPY . .
RUN npm run build

# ── Stage 2: serve with nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove the default nginx site config
RUN rm /etc/nginx/conf.d/default.conf

# SPA routing + /api proxy to ecom-java-backend container
COPY nginx.docker.conf /etc/nginx/conf.d/default.conf

# Copy the dist produced inside Docker (never the local dist/ folder)
COPY --from=builder /app/dist /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
