# Деплой в Yandex Cloud

## Рекомендуемая архитектура (экономная)

Для небольшой нагрузки (до 1000 прохождений/день):

- **VPS (Compute Cloud)** — приложение + Redis в Docker
- **Managed PostgreSQL** — база данных (минимальный тариф)
- **Object Storage** — хранение изображений

**Redis в Docker на VPS** — экономит ~2000₽/мес по сравнению с Managed Redis.

---

## Предварительные требования

1. Аккаунт Yandex Cloud
2. Установленный Yandex Cloud CLI (`yc`)
3. SSH ключ (`~/.ssh/id_rsa.pub`)

## Шаг 1: Настройка Yandex Cloud CLI

```bash
# Установка (macOS)
curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash

# Перезапустите терминал или выполните:
source ~/.bashrc  # или source ~/.zshrc

# Инициализация (следуйте инструкциям)
yc init

# Проверка
yc config list
```

## Шаг 2: Создание Managed PostgreSQL

```bash
# Создайте кластер PostgreSQL
yc managed-postgresql cluster create \
  --name quiz-tma-db \
  --environment production \
  --network-name default \
  --host zone-id=ru-central1-a,subnet-name=default-ru-central1-a \
  --resource-preset s2.micro \
  --disk-size 10 \
  --disk-type network-ssd \
  --database name=quiz_tma,owner=quiz_user \
  --user name=quiz_user,password=<YOUR_SECURE_PASSWORD>

# Дождитесь создания (5-10 минут)
yc managed-postgresql cluster get quiz-tma-db

# Получите хост для подключения
yc managed-postgresql cluster get quiz-tma-db --format json | jq -r '.hosts[0].name'
# Пример: rc1a-xxx.mdb.yandexcloud.net
```

> ⚠️ **Важно**: Сохраните пароль! Он понадобится для DATABASE_URL.

## Шаг 3: Создание Object Storage

```bash
# Создайте bucket
yc storage bucket create --name quiz-tma-images

# Создайте service account для S3
yc iam service-account create --name quiz-tma-s3

# Получите ID service account
SA_ID=$(yc iam service-account get --name quiz-tma-s3 --format json | jq -r '.id')
echo "Service Account ID: $SA_ID"

# Получите ID папки (folder)
FOLDER_ID=$(yc config get folder-id)
echo "Folder ID: $FOLDER_ID"

# Назначьте роль storage.editor
yc resource-manager folder add-access-binding $FOLDER_ID \
  --role storage.editor \
  --subject serviceAccount:$SA_ID

# Создайте ключ доступа для S3
yc iam access-key create --service-account-name quiz-tma-s3
# Сохраните key_id и secret — это S3_ACCESS_KEY и S3_SECRET_KEY!
```

## Шаг 4: Создание VPS

```bash
# Создайте VM (2 ядра, 2GB RAM)
yc compute instance create \
  --name quiz-tma-server \
  --zone ru-central1-a \
  --network-interface subnet-name=default-ru-central1-a,nat-ip-version=ipv4 \
  --create-boot-disk image-folder-id=standard-images,image-family=ubuntu-22-04-lts,size=20 \
  --memory 2GB \
  --cores 2 \
  --core-fraction 50 \
  --preemptible \
  --ssh-key ~/.ssh/id_rsa.pub

# Получите IP адрес
VPS_IP=$(yc compute instance get quiz-tma-server --format json | jq -r '.network_interfaces[0].primary_v4_address.one_to_one_nat.address')
echo "VPS IP: $VPS_IP"
```

> 💡 `--preemptible` — прерываемая VM, дешевле на ~50%, но может перезапуститься раз в 24ч.
> Уберите этот флаг для production с высокими требованиями к uptime.

## Шаг 5: Настройка VPS

```bash
# Подключитесь к серверу
ssh ubuntu@$VPS_IP

# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Установите Docker Compose
sudo apt install -y docker-compose-plugin

# Настройте firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# ВАЖНО: Перезайдите для применения группы docker
exit
```

## Шаг 6: Деплой приложения

```bash
# Подключитесь снова
ssh ubuntu@$VPS_IP

# Создайте директорию
sudo mkdir -p /opt/quiz-tma
sudo chown $USER:$USER /opt/quiz-tma
cd /opt/quiz-tma

# Склонируйте репозиторий
git clone https://github.com/YOUR_USERNAME/telegram-mini-app-q.git .

# Перейдите в папку деплоя
cd backend/deploy

# Создайте .env файл
cp env.production.example .env
nano .env
```

### Заполните .env файл:

```env
# Yandex Managed PostgreSQL
# Формат: postgresql://USER:PASSWORD@HOST:6432/DATABASE?sslmode=require
DATABASE_URL=postgresql://quiz_user:YOUR_PASSWORD@rc1a-xxx.mdb.yandexcloud.net:6432/quiz_tma?sslmode=require

# Yandex Object Storage
S3_ENDPOINT=https://storage.yandexcloud.net
S3_REGION=ru-central1
S3_BUCKET=quiz-tma-images
S3_ACCESS_KEY=ваш_key_id
S3_SECRET_KEY=ваш_secret

# Telegram Bot
TELEGRAM_BOT_TOKEN=ваш_токен_бота
```

### Запустите контейнеры:

```bash
# Соберите и запустите
docker compose -f docker-compose.prod.yml up -d --build

# Проверьте статус
docker compose -f docker-compose.prod.yml ps

# Проверьте логи
docker compose -f docker-compose.prod.yml logs -f app
```

## Шаг 7: Применение миграций

```bash
# Примените схему к базе данных
docker compose -f docker-compose.prod.yml exec app npx prisma db push

# Проверьте что всё работает
curl http://localhost:3000/health
# Должно вернуть: {"status":"ok","database":"connected","redis":"connected"}
```

## Шаг 8: Настройка домена (опционально)

Если у вас есть домен:

1. Направьте A-запись домена на IP вашего VPS
2. Установите Certbot для SSL:

```bash
# Установите Certbot
sudo apt install -y certbot

# Остановите nginx временно
docker compose -f docker-compose.prod.yml stop nginx

# Получите сертификат
sudo certbot certonly --standalone -d your-domain.com

# Скопируйте сертификаты
sudo mkdir -p /opt/quiz-tma/backend/deploy/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/quiz-tma/backend/deploy/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/quiz-tma/backend/deploy/ssl/
sudo chown -R $USER:$USER /opt/quiz-tma/backend/deploy/ssl

# Раскомментируйте HTTPS секцию в nginx.conf
nano nginx.conf

# Перезапустите
docker compose -f docker-compose.prod.yml up -d
```

---

## Обновление приложения

```bash
ssh ubuntu@<VPS_IP>
cd /opt/quiz-tma

# Получите последние изменения
git pull origin main

# Пересоберите и перезапустите
cd backend/deploy
docker compose -f docker-compose.prod.yml up -d --build

# При изменении схемы БД
docker compose -f docker-compose.prod.yml exec app npx prisma db push
```

---

## Полезные команды

```bash
# Статус контейнеров
docker compose -f docker-compose.prod.yml ps

# Логи приложения
docker compose -f docker-compose.prod.yml logs -f app

# Логи всех сервисов
docker compose -f docker-compose.prod.yml logs -f

# Перезапуск
docker compose -f docker-compose.prod.yml restart

# Остановка
docker compose -f docker-compose.prod.yml down

# Очистка (удаляет volumes!)
docker compose -f docker-compose.prod.yml down -v
```

---

## Стоимость (примерная)

| Ресурс                         | Описание         | Цена/мес   |
| ------------------------------ | ---------------- | ---------- |
| VPS (2 ядра, 2GB, прерываемая) | Compute Cloud    | ~500₽      |
| Managed PostgreSQL (s2.micro)  | 10GB SSD         | ~2000₽     |
| Object Storage                 | 10GB             | ~50₽       |
| **Redis в Docker**             | На VPS бесплатно | **0₽**     |
| **Итого**                      |                  | **~2550₽** |

_Managed Redis добавил бы ещё ~2000₽/мес_

---

## Troubleshooting

### Ошибка подключения к PostgreSQL

```bash
# Проверьте что IP VPS добавлен в whitelist PostgreSQL
# В консоли Yandex Cloud → Managed PostgreSQL → Ваш кластер → Хосты → Публичный доступ
```

### Контейнер не запускается

```bash
# Посмотрите логи
docker compose -f docker-compose.prod.yml logs app

# Проверьте .env файл
cat .env
```

### Redis не подключается

```bash
# Redis должен быть в той же docker-сети
docker compose -f docker-compose.prod.yml exec app ping redis
```
