# Журнал работ на строительном объекте

Приложение для ведения ежедневного журнала выполненных строительных работ.

## Реализованный функционал

- Список записей журнала работ.
- Пагинация списка записей.
- Фильтрация записей по дате выполнения.
- Сортировка записей по дате в прямом и обратном порядке.
- Добавление записи через форму.
- Редактирование записи.
- Удаление записи.
- Справочник видов работ с выбором из предзаполненного списка.
- Хранение данных в PostgreSQL.
- Взаимодействие frontend и backend через REST API.
- Frontend- и backend-валидация обязательных полей.
- Базовые backend-тесты API.
- Автоматическое применение Prisma-миграций и seed справочника при Docker-запуске.

## Стек

- React + TypeScript + Vite: быстрый и простой стек для SPA с типизацией и удобной dev-сборкой.
- Node.js + Express + TypeScript: минимальный и понятный backend для REST API без лишней инфраструктуры.
- Prisma: типобезопасный ORM, миграции и удобный Prisma Client для PostgreSQL.
- PostgreSQL: надёжная реляционная база для хранения журнала и справочников.
- Docker Compose: единая команда запуска для базы данных, backend и frontend.

## Запуск через Docker Compose

Требуется Docker и Docker Compose.

1. При необходимости создайте локальный `.env`:

```bash
cp .env.example .env
```

2. Запустите приложение:

```bash
docker-compose up --build
```

3. Откройте сервисы:

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- Backend healthcheck: http://localhost:4000/health
- PostgreSQL на хосте: `localhost:5433`

При старте backend выполняет `prisma generate`, `prisma migrate deploy` и `prisma db seed`: генерирует Prisma Client, применяет миграции и заполняет справочник видов работ.

Для production-хостинга без доступа к shell/pre-deploy hooks backend `npm start` также выполняет `prisma migrate deploy` и `prisma db seed` перед запуском Express. Это позволяет применить миграции на Render Free plan обычным redeploy.

Фактически production `npm start` выполняет `prisma generate`, `prisma migrate deploy`, `prisma db seed` и только затем запускает Express, поэтому база и Prisma Client инициализируются автоматически при старте backend.

Если локальный volume PostgreSQL был создан старой версией проекта до появления миграций, сбросьте dev-базу:

```bash
docker-compose down -v
docker-compose up --build
```

## Переменные окружения

Корневой `.env.example` содержит dev-значения без реальных секретов:

- `POSTGRES_DB`: имя базы данных.
- `POSTGRES_USER`: пользователь PostgreSQL.
- `POSTGRES_PASSWORD`: пароль PostgreSQL для локального Docker-окружения.
- `POSTGRES_PORT`: порт PostgreSQL на хосте, по умолчанию `5433`.
- `DATABASE_URL`: строка подключения backend к PostgreSQL внутри docker-compose.
- `BACKEND_PORT`: порт Express API, по умолчанию `4000`.
- `FRONTEND_ORIGIN`: origin frontend для CORS.
- `VITE_API_URL`: URL backend API для frontend.

Назначение файлов:

- `.env.example`: переменные для `docker-compose` из корня проекта.
- `backend/.env.example`: переменные для локального запуска backend без Docker.
- `frontend/.env.example`: переменные для локального запуска frontend без Docker.

## Локальная разработка без Docker

Требуется Node.js 22 LTS и доступный PostgreSQL.

Для локального backend используйте `backend/.env.example`:

- если PostgreSQL установлен локально на машине, оставьте `localhost:5432`;
- если backend должен подключаться к PostgreSQL из `docker-compose`, замените порт в `DATABASE_URL` на `5433`.

Установка зависимостей:

```bash
npm install
```

Подготовка базы и Prisma:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:migrate
npm --prefix backend run prisma:seed
```

Запуск backend и frontend в отдельных терминалах:

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

После запуска откройте:

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api

## Локальное тестирование с Supabase

Если для локальной проверки используется Supabase вместо локального PostgreSQL, не вставляйте реальный connection string в `.env.example` и не коммитьте его в репозиторий.

Создайте локальные файлы окружения:

`backend/.env`

```env
DATABASE_URL=YOUR_SUPABASE_CONNECTION_STRING
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
```

`frontend/.env`

```env
VITE_API_URL=http://localhost:4000
```

Далее выполните:

```bash
npm install
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:migrate
npm --prefix backend run prisma:seed
npm --prefix backend run dev
npm --prefix frontend run dev
```

Рекомендуется использовать Supabase Session Pooler connection string и добавлять к нему параметры `?schema=public&sslmode=require`, если они не включены изначально.

Полная проверка сборки:

```bash
npm run build
npm run test:backend
```

## API

Базовый URL при Docker-запуске: `http://localhost:4000`.

## Публичные URL

Ссылки для проверки приложения:

- Frontend: https://journal-construction-frontend.vercel.app/
- API: https://journal-api-v1.onrender.com/

### Healthcheck

`GET /health`

Проверяет доступность backend и подключение к базе данных.

### Work types

`GET /api/work-types`

Возвращает список видов работ, отсортированный по `name`.

### Work log entries

`GET /api/work-log-entries`

Возвращает список записей журнала вместе с `workType`.

Query params:

- `dateFrom`: необязательная дата начала периода.
- `dateTo`: необязательная дата конца периода.
- `sortOrder`: `asc` или `desc`, по умолчанию `desc`.
- `page`: номер страницы, по умолчанию `1`.
- `pageSize`: размер страницы, по умолчанию `10`, максимум `100`.

Формат ответа:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 10,
  "total": 0
}
```

`POST /api/work-log-entries`

Создаёт запись журнала.

Тело запроса:

```json
{
  "date": "2026-05-25",
  "workTypeId": 1,
  "volumeValue": 12.5,
  "volumeUnit": "м²",
  "performerName": "Иванов Иван Иванович",
  "comment": "Необязательный комментарий"
}
```

`PUT /api/work-log-entries/:id`

Обновляет запись журнала. Тело запроса совпадает с `POST`.

`DELETE /api/work-log-entries/:id`

Удаляет запись журнала.

Коды ошибок:

- `400`: ошибка валидации входных данных или некорректная связь.
- `404`: запись не найдена.
- `500`: неожиданная ошибка сервера.

## Структура проекта

```text
.
├── backend/
│   ├── prisma/
│   │   ├── migrations/        # Prisma migrations
│   │   ├── schema.prisma      # модели WorkType и WorkLogEntry
│   │   └── seed.ts            # предзаполнение справочника видов работ
│   └── src/
│       ├── lib/               # Prisma Client
│       ├── middleware/        # обработка ошибок
│       ├── routes/            # REST routes
│       ├── validation/        # Zod schemas
│       ├── app.ts             # Express app
│       ├── app.test.ts        # базовые API-тесты
│       └── server.ts          # HTTP entrypoint
├── frontend/
│   └── src/
│       ├── api/               # fetch API client
│       ├── components/        # форма, фильтр, таблица
│       ├── types/             # TypeScript-типы
│       ├── App.tsx
│       └── main.tsx
├── docker-compose.yml
├── package.json
└── README.md
```

## Полезные команды

```bash
npm run build
npm run test:backend
npm --prefix backend run prisma:migrate
npm --prefix backend run prisma:seed
npm --prefix backend run prisma:studio
npm --prefix frontend run dev
docker-compose up --build
docker-compose down
```

## Возможные улучшения

- Авторизация пользователей.
- Роли и разграничение доступа.
- Экспорт журнала в Excel/PDF.
- Расширенный справочник единиц измерения.
- Расширение покрытия тестами frontend и edge cases backend.
