#!/bin/bash

# ===========================================
# Скрипт деплоя Quiz TMA Backend
# ===========================================

set -e

DEPLOY_DIR="/opt/quiz-tma"
REPO_URL="https://github.com/YOUR_USERNAME/telegram-mini-app-q.git"

echo "🚀 Деплой Quiz TMA Backend..."

cd $DEPLOY_DIR

# Если репозиторий уже склонирован - обновляем
if [ -d ".git" ]; then
    echo "📥 Обновление кода..."
    git pull origin main
else
    echo "📥 Клонирование репозитория..."
    git clone $REPO_URL .
fi

cd backend

# Проверяем наличие .env
if [ ! -f "deploy/.env" ]; then
    echo "❌ Файл deploy/.env не найден!"
    echo "Создайте его на основе deploy/.env.production.example"
    exit 1
fi

# Сборка и запуск
echo "🐳 Сборка Docker образов..."
cd deploy
docker-compose -f docker-compose.prod.yml build

echo "🚀 Запуск контейнеров..."
docker-compose -f docker-compose.prod.yml up -d

# Применение миграций
echo "📊 Применение миграций..."
docker-compose -f docker-compose.prod.yml exec -T app npx prisma db push --accept-data-loss

echo "✅ Деплой завершён!"
echo ""
echo "Проверьте статус: docker-compose -f docker-compose.prod.yml ps"
echo "Логи: docker-compose -f docker-compose.prod.yml logs -f"
