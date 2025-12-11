#!/bin/bash

# ===========================================
# Скрипт настройки VPS для Quiz TMA Backend
# Протестировано на Ubuntu 22.04
# ===========================================

set -e

echo "🚀 Начинаю настройку VPS..."

# Обновление системы
echo "📦 Обновление системы..."
sudo apt update && sudo apt upgrade -y

# Установка Docker
echo "🐳 Установка Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "Docker установлен. Перезайдите в систему для применения групп."
fi

# Установка Docker Compose
echo "🐳 Установка Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Создание директории приложения
echo "📁 Создание директорий..."
sudo mkdir -p /opt/quiz-tma
sudo chown $USER:$USER /opt/quiz-tma

# Настройка firewall
echo "🔥 Настройка firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "✅ Базовая настройка завершена!"
echo ""
echo "Следующие шаги:"
echo "1. Скопируйте файлы проекта в /opt/quiz-tma"
echo "2. Создайте .env файл с переменными окружения"
echo "3. Запустите: cd /opt/quiz-tma/deploy && docker-compose -f docker-compose.prod.yml up -d"
