# Журнал работ на строительном объекте

Тестовое задание в формате монорепозитория.

## Стек

- Frontend: React, TypeScript, Vite, обычный CSS
- Backend: Node.js, Express, TypeScript
- ORM: Prisma
- База данных: PostgreSQL
- Запуск окружения: Docker Compose
- Рекомендуемая версия Node.js для локального запуска: 22 LTS

## Структура

```text
backend/   Express API, Prisma schema
frontend/  React + Vite приложение
```

## Запуск через Docker Compose

1. При необходимости скопируйте переменные окружения:

```bash
cp .env.example .env
```

2. Запустите проект:

```bash
docker-compose up --build
```

3. Откройте:

- Frontend: http://localhost:5173
- Backend healthcheck: http://localhost:4000/health

При старте backend выполняет `prisma generate`, `prisma migrate deploy` и `prisma db seed`, чтобы сгенерировать Prisma Client, применить миграции PostgreSQL и заполнить справочник видов работ.
PostgreSQL публикуется на host-порту `5433` по умолчанию, чтобы не конфликтовать с локальной базой на `5432`.

Если локальный volume PostgreSQL был создан старой версией проекта до появления миграций, сбросьте dev-базу:

```bash
docker-compose down -v
docker-compose up --build
```

## Локальный запуск без Docker

Требуется установленный PostgreSQL и корректный `DATABASE_URL`.

```bash
npm install
cp backend/.env.example backend/.env
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:migrate
npm --prefix backend run prisma:seed
npm --prefix backend run dev
npm --prefix frontend run dev
```

## Текущий статус

Создан базовый каркас проекта: конфигурация TypeScript, Vite, Express, Prisma, PostgreSQL, seed справочника видов работ и Docker Compose. Бизнес-логика журнала будет добавляться следующим шагом.
