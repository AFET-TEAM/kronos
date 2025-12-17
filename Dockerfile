# --- AŞAMA 1: Builder (Derleme) ---
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    
    RUN npm install
    
    COPY . .
    
    RUN npm run build
    
    # --- AŞAMA 2: Production (Node.js ile SSR) ---
    FROM node:18-alpine
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    COPY package*.json ./
    
    RUN npm ci --only=production
    
    # SvelteKit build çıktısını kopyala (hem client hem server)
    COPY --from=builder /app/.svelte-kit/output /app/.svelte-kit/output
    
    # Static assets varsa
    COPY --from=builder /app/static /app/static
    
    RUN chown -R node:node /app
    
    USER node
    
    EXPOSE 3000
    
    CMD ["node", ".svelte-kit/output/server/index.js"]