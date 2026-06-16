# ============================================================
# Stage 1: Build frontend (React + Vite)
# ============================================================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ============================================================
# Stage 2: Backend (Node.js + Python on Debian)
# ============================================================
FROM python:3.11-slim AS backend

# Install Node.js 20.x
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install only Python packages needed by predict_server.py
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host files.pythonhosted.org joblib numpy scikit-learn xgboost

WORKDIR /app

# Install Node.js dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY backend/ ./

# Copy ML model from frontend/public/model
COPY frontend/public/model/ ./model/

# Copy frontend build for static serving (optional fallback)
COPY --from=frontend-build /app/frontend/dist ./public/dist

ENV NODE_ENV=production
ENV PYTHON_PATH=/usr/local/bin/python3

EXPOSE 5001

CMD ["node", "index.js"]

# ============================================================
# Stage 3: Frontend (Nginx)
# ============================================================
FROM nginx:alpine AS frontend

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy frontend build from stage 1
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
