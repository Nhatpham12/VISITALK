FROM node:20-bullseye

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN python3 -m venv /venv && \
    /venv/bin/pip install --no-cache-dir -r requirements.txt

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV PATH="/venv/bin:$PATH"

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (r) => {const {statusCode}=r; process.exit(statusCode===200?0:1)}).on('error',()=>process.exit(1))"

CMD ["node", "index.js"]
