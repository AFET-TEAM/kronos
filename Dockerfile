# --- AŞAMA 1: Builder ---
    FROM node:18-alpine AS builder
    WORKDIR /app
    COPY package*.json ./
    # Tüm paketleri yükle
    RUN npm install
    COPY . .
    RUN npm run build
    
    # --- AŞAMA 2: Production ---
    FROM node:18-alpine
    WORKDIR /app
    
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/.svelte-kit ./.svelte-kit
    COPY --from=builder /app/package.json ./package.json
    
    EXPOSE 3000
    CMD ["node", ".svelte-kit/output/server/index.js"]