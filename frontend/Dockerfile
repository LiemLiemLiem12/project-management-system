# ==========================================
# 1. DEPS: Cài đặt thư viện
# ==========================================
FROM node:24.0.0-alpine AS deps
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# ==========================================
# 2. BUILDER: Biên dịch mã nguồn
# ==========================================
FROM node:24.0.0-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# ==========================================
# 3. RUNNER: Image cuối cùng để chạy
# ==========================================
FROM node:24.0.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

# CHỈ COPY NHỮNG THỨ THỰC SỰ CẦN THIẾT TỪ BUILDER
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "server.js"]