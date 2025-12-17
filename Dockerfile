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
    
    # Package files'ları kopyala
    COPY package*.json ./
    
    # Production dependencies + SvelteKit runtime dependencies
    RUN npm install
    
    # SvelteKit build çıktısını kopyala
    COPY --from=builder /app/.svelte-kit/output /app/.svelte-kit/output
    
    # Static assets
    COPY --from=builder /app/static /app/static
    
    # node_modules'ü builder'dan kopyala (daha güvenli)
    COPY --from=builder /app/node_modules /app/node_modules
    
    RUN chown -R node:node /app
    
    USER node
    
    EXPOSE 3000
    
    CMD ["node", ".svelte-kit/output/server/index.js"]