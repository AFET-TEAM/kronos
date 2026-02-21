# --- AŞAMA 1: Builder ---
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    # Build arguments
    ARG PUBLIC_API_URL
    ENV PUBLIC_API_URL=${PUBLIC_API_URL}
    
    COPY package*.json ./
    
    RUN npm install
    
    COPY . .
    
    RUN npm run build
    
    # --- AŞAMA 2: Production ---
    FROM node:18-alpine
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    COPY package*.json ./
    
    COPY --from=builder --chown=node:node /app/node_modules ./node_modules
    
    COPY --from=builder --chown=node:node /app/build ./build
    
    USER node
    
    EXPOSE 3000
    
    CMD ["node", "build/index.js"]