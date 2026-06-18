FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

FROM node:18-alpine

RUN apk add --no-cache wget

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN mkdir -p uploads/images uploads/documents uploads/videos uploads/misc logs \
    && chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
