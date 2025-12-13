# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Устанавливаем OpenSSL для Prisma
RUN apk add --no-cache openssl

# Копируем файлы зависимостей
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости (включая devDependencies)
RUN npm ci

# Генерируем Prisma Client
RUN npx prisma@5 generate

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Устанавливаем OpenSSL для Prisma runtime
RUN apk add --no-cache openssl

# Устанавливаем только production зависимости
COPY package*.json ./
RUN npm ci --omit=dev

# Копируем Prisma schema (нужен для runtime)
COPY prisma ./prisma/

RUN npx prisma@5 generate

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist

# Создаём непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Открываем порт
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Запускаем приложение
CMD ["node", "dist/index.js"]
