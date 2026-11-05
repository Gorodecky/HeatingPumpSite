# Підготовка деплою на Hetzner CPX02

Контейнерна конфігурація призначена для локальної перевірки та подальшої адаптації під конкретний домен. Вона не означає, що VPS уже налаштований або що сайт готовий приймати реальні заявки.

## Склад і обмеження ресурсів

- Caddy обслуговує статичний Vite build, проксуючи `/api/*` до API, та автоматично отримує TLS для `SITE_ADDRESS`.
- Node.js API і PostgreSQL доступні тільки у внутрішній Docker-мережі. Порт PostgreSQL не публікується на хост.
- PostgreSQL 16 має `shared_buffers=64MB`, до 20 підключень і `work_mem=2MB`. Ліміти контейнерів: БД 320 MiB, API 256 MiB, Caddy 96 MiB.
- Це тісна конфігурація для 1 GB RAM. До запуску на VPS потрібно окремо оцінити фактичний запас пам'яті та налаштувати swap/моніторинг. Ліміти контейнерів не включають пам'ять ядра й Docker.
- Сервіс `backup` створює щоденний gzip `pg_dump` у томі `postgres_backups` і щохвилини видаляє файли, старші за 30 днів. Архіви зберігаються на тому самому Docker host; це не захищає від втрати самого сервера.

## Секрети та запуск

1. Після підтвердження SSH fingerprint скопіювати проєкт на VPS і створити там `deploy.env` на основі `deploy.env.example`. Не копіювати локальний `server/.env`.
2. Згенерувати окремі значення `DB_PASSWORD` (`openssl rand -hex 32`) та `SESSION_SECRET` (`openssl rand -hex 48`). Hex-значення безпечні для URI в `DATABASE_URL`. Встановити права `600` на `deploy.env`.
3. Підставити фактичний домен у `APP_ORIGIN` і `SITE_ADDRESS`. DNS цього кроку не змінює: перед запуском власник має окремо налаштувати домен і перевірити, що він веде на VPS. `LEADS_ENABLED` лишати `false`.
4. Політика версії `1.1` і дата чинності наведені в `docs/PRIVACY_POLICY.md`. Налаштування Resend описано в `docs/RESEND_NOTIFICATIONS.md`. `LEADS_ENABLED=true` одночасно задає frontend build flag та вмикає приймання API; за замовчуванням обидва вимкнені. Увімкнення заявок потребує окремого рішення власника після production-перевірок.
5. Перший запуск із порожньою БД: `docker compose --env-file deploy.env up -d --build db`, потім `docker compose --env-file deploy.env run --rm migrate`, після успішної міграції — `docker compose --env-file deploy.env up -d --build api web backup`. Перед міграцією будь-якої наявної БД перевірити її стан і зробити backup.
6. Перевірити `https://<домен>/api/v1/health`, головну сторінку та `/admin`.

PostgreSQL не має `ports:`; SSH/firewall на VPS мають дозволяти лише SSH, HTTP і HTTPS. Створення адміністратора виконується окремо через `docker compose --env-file deploy.env exec api node dist/createAdmin.js` лише після production approval.

## Локальна перевірка

Для ізольованої локальної перевірки використовувати окремий локальний `deploy.env` з `SITE_ADDRESS=:80`, `APP_ORIGIN=http://localhost:18080`, `LEADS_ENABLED=false`, тестовими секретами та портами `WEB_HTTP_PORT=18080`, `WEB_HTTPS_PORT=18443`. Не використовувати його на VPS. Контейнерна БД та резервні копії у Compose — окремі томи; не підключати локальну чи production БД.

## Перевірка строків зберігання локально

1. Запустити ізольований Compose stack за кроками вище; перевірити `docker compose --env-file deploy.env ps` і `docker compose --env-file deploy.env logs backup`.
2. Переконатися, що резервна копія з’явилася: `docker compose --env-file deploy.env exec backup sh -c 'ls -lh /backups'`. Перевірити gzip та SQL-заголовок через `gzip -t` і `zcat ... | head` усередині контейнера. Для перевірки ротації у тестовому томі створити `heatingpump-expired.sql.gz`, надати йому mtime понад 30 днів (`touch -d '31 days ago' /backups/heatingpump-expired.sql.gz`) і дочекатися циклу до 60 секунд; файл має зникнути.
3. Для перевірки видалення заявок у тестовій БД створити тестову заявку, зсунути її `lastContactAt` більш ніж на 12 місяців назад, перезапустити API і перевірити відсутність запису через Prisma/SQL. У production це автоматично виконується на старті та кожні 24 години.
4. PostgreSQL не публікує порт: `docker compose --env-file deploy.env config` не повинен показувати `ports` для `db`. Не копіювати тестові секрети в production.
