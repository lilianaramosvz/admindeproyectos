# =========================================================
# Multi-stage build — frontend (Vite + React SPA)
# Stage 1: Node builder, produce dist/
# Stage 2: nginx Alpine, sirve dist/ con SPA routing
# Final image: ~50 MB
# =========================================================

# ===== Stage 1: builder =====
FROM node:20-alpine AS builder
WORKDIR /app

# Layer cache: instala dependencias antes de copiar src/
# Si solo cambia src/, Docker reusa esta capa.
COPY package*.json ./
RUN npm ci

# Después copia el resto y compila
COPY . .
RUN npm run build
# Esto genera /app/dist con los archivos estáticos

# ===== Stage 2: runtime =====
FROM nginx:1.27-alpine

# Copia los archivos estáticos del build
COPY --from=builder /app/dist /usr/share/nginx/html

# Config de nginx para SPA: fallback a index.html para client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
