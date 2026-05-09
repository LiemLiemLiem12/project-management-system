# ==========================================
# STAGE 1: BUILDER - Nơi chứa toàn bộ source để biên dịch
# ==========================================
FROM node:24.0.0-alpine AS builder
WORKDIR /app

ARG APP_NAME

COPY . .

RUN npm ci --include=dev


RUN npx nx run ${APP_NAME}:prune

# ==========================================
# STAGE 2: RUNNER - Image cuối cùng (Siêu nhẹ, không chứa source thừa)
# ==========================================
FROM node:24.0.0-alpine AS runner
WORKDIR /app

ARG APP_NAME
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/apps/${APP_NAME}/dist/package*.json .

RUN npm install --omit=dev

COPY --from=builder /app/apps/${APP_NAME}/dist ./dist

EXPOSE ${PORT}

# Chạy ứng dụng từ thư mục dist
CMD ["node", "dist/main.js"]