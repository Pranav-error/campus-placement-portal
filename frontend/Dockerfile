# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx ng build --configuration production

# --- Serve stage ---
FROM nginx:alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
# templated (not conf.d directly) so nginx's docker-entrypoint substitutes $PORT at
# container start — Render assigns a dynamic port, unlike Railway's fixed 80.
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV PORT=80

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
