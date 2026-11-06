# SEO Release Checklist

- **Дата перевірки:** 6 листопада 2026 року
- **Гілка:** `feature/seo-optimization`
- **Production:** `https://teplo-tvd.live`
- **Статус:** локальні перевірки пройшли; merge, push і deployment не виконувалися.

## Git і межі змін

- Звірено повний diff `feature/seo-optimization` відносно `origin/main`; SEO-файли та результати цієї перевірки зафіксовані окремими commits.
- Окремі навмисні security changes: `server/Dockerfile`, `server/package.json`, `server/package-lock.json`, `server/src/index.ts` і `server/src/leadQueue.integration.test.ts`. `compose.yaml`, Prisma schema/migrations, `server/.env`, `deploy.env` і секрети не змінювалися.
- API runtime image виконує `npm ci --omit=dev --omit=optional`, копіює лише generated `.prisma` client та `dist`; Docker build завершується помилкою, якщо `prisma`, `@prisma/config` чи `deepmerge-ts` залишилися у runtime dependencies. Migration image як і раніше збирається з `build` target.
- Навмисні deployment/build зміни: `.github/workflows/deploy.yml` задає Pages base `/HeatingPumpSite/`; `Dockerfile` та `compose.yaml` передають base `/` для Hetzner; `deploy/Caddyfile` перенаправляє www і старі `/HeatingPumpSite/` URL та обслуговує кореневу збірку. API reverse proxy залишається `/api/*` → `api:3001`.
- `Dockerfile` додатково копіює `scripts/prerender.mjs` у build stage. Без цього Hetzner web image не збирався після додавання prerender до `npm run build`.
- `LEADS_ENABLED` у deploy прикладі лишається вимкненим. Production-конфігурацію на сервері не читали й не змінювали.
- Робоче дерево має бути чистим перед PR/merge; перед публікацією перевірити `git status --short --branch` та `git diff --check origin/main...HEAD`.

## Security dependency changes — 6 листопада 2026 року

- Після доступу до npm registry виконано `npm audit --omit=dev --json` для frontend і `npm --prefix server audit --omit=dev --json` для server. Обидва звіти: **0 vulnerabilities**. Server Docker build із усіма залежностями також повідомив 0 vulnerabilities після оновлень.
- `zod` оновлено з 3.25.76 до точної версії 4.6.7. Це вище виправленої межі 4.6.6 для GHSA-mrhx-c7xc-m3w5 / CVE-2023-54404. Перевірено lock integrity з npm registry.
- Для збереження Prisma 6.19.3 погоджено та зафіксовано точковий override `deepmerge-ts` з 7.1.5 на 8.0.1. Він усуває GHSA-ggr8-5vv4-36mx / CVE-2026-40345; Prisma major не змінювався. Після override `npm audit` для server не повернув вразливостей.
- Раніше audit пов’язував High findings із `prisma`, `@prisma/config` та `deepmerge-ts` і пропонував Prisma 7.10.1 як автоматичне виправлення (major). Замість цього CLI/tooling залишено в migration image, а runtime image зібрано без нього.
- Фізична перевірка запущеного API image: `prisma`, `@prisma/config`, `deepmerge-ts` — відсутні; `@prisma/client` 6.19.3, generated client, runtime і query engine — присутні. `GET /api/v1/health` повернув 200.
- Migration image залишив Prisma CLI 6.19.3 і `@prisma/config` 6.19.3; `deepmerge-ts` у ньому 8.0.1. `prisma migrate deploy` успішно застосував усі 5 migrations до тимчасової тестової БД.
- Інтеграційні перевірки API image з PostgreSQL повернули HTTP 201 для однієї синтетичної заявки; окремий SQL-запит підтвердив рівно один відповідний запис. Test container був без volume і зупинений після перевірок. Production-БД не використовувалася.

## Результати тестування

| Перевірка | Результат |
|---|---|
| `npm run test:seo` | Успішно: збірка і 6/6 тестів. |
| SEO HTML, canonical, robots і JSON-LD | Успішно для всіх 11 URL sitemap: унікальні Title/Description, відповідний canonical, один JSON-LD блок із правильними типами та URL; `/admin/` має `noindex`. Перевірка виконана для кореневої та Pages base збірок. |
| SSR parity та JSON-LD повторне використання | Успішно: prerendered markup збігається з React SSR; повторна синхронізація перевикористовує script, SPA-навігація його оновлює, неіндексований маршрут видаляє. |
| `npm --prefix server test` | Успішно: 3/3 unit-тести. |
| Серверна збірка `npm run build:server` | Успішно. |
| Інтеграція API/DB і міграції | Успішно: 9/9 integration tests у PostgreSQL 16, БД `heatingpump_security_test`, loopback port і тимчасова schema `lead_it_*`. Перевірено 400 validation/malformed JSON, 201 lead write, 413 за `Content-Length` і chunked body, 500 без stack/internal error text, 503 без запису, login/admin Zod contracts, atomic persistence і queue behavior. Resend credentials були порожні. Усі 5 migrations пройшли як через harness, так і з migration Docker image. |
| Docker Compose | Успішно: `docker compose --env-file deploy.env.example config --quiet`. Сервіси не запускалися цією командою. |
| Caddy | Успішно: Docker `caddy:2-alpine caddy validate` перевірив `deploy/Caddyfile`; тимчасовий локальний Caddy перевірив prerendered статтю `200` і невідомий URL `404`. |
| Hetzner frontend build | Успішно: `VITE_LEADS_ENABLED=false VITE_BASE_PATH=/ npm run build`, потім 6/6 SEO-тестів. |
| GitHub Pages build | Успішно: `VITE_BASE_PATH=/HeatingPumpSite/ npm run build`, потім 6/6 SEO-тестів; asset paths мають Pages prefix. |
| Docker images | Успішно: `docker compose --env-file deploy.env.example build web api migrate`. API image запущено локально на тестовій БД; `/api/v1/health` — 200, lead POST — 201 і запис підтверджено SQL-запитом. |
| npm audit | Успішно: frontend production — 0; server production — 0. Server Docker build tree також audited 0 vulnerabilities після Zod та deepmerge updates. |
| `git diff --check` | Перевірити після документаційного commit. |

### Невиконані зовнішні перевірки

- Не перевіряли production DNS, TLS, HTTP→HTTPS, www redirect, фактичні Googlebot-відповіді, production health або файли `robots.txt`/`sitemap.xml` через мережу. Усі ці пункти потребують post-deployment перевірки.
- Не виконували deployment, міграції, зміни DNS чи реальні заявки.
- Не перевіряли production DNS, TLS, HTTP→HTTPS, www redirect, фактичні Googlebot-відповіді, production health або `robots.txt`/`sitemap.xml` через мережу. Це потребує post-deployment перевірки.
- Не виконували merge, push, deployment, змін DNS чи production заявок. Усі тести працювали локально; API smoke/integration використовували лише disposable PostgreSQL без volume.

## Безпечний порядок deployment на Hetzner

Виконувати лише після окремого погодження merge і deployment. GitHub Actions автоматично публікує GitHub Pages після push у `main`, тому merge до `main` є дією, що запускає публікацію Pages.

1. На review підтвердити commits і diff. Переконатися, що production `deploy.env` не змінений, `SITE_ADDRESS=teplo-tvd.live`, `APP_ORIGIN=https://teplo-tvd.live`, а `LEADS_ENABLED` лишається у погодженому стані (за поточним планом — `false`). Не копіювати локальні `.env` на VPS.
2. На VPS перевірити поточні сервіси й вільне місце, зберегти попередні web та api images під окремими tags, а також створити й перевірити свіжу резервну копію PostgreSQL. Перед зміною перевірити, що архів не порожній і проходить `gzip -t`.
3. Оновити checkout до погодженого commit із `main`, перевірити `git status`, не змінювати `deploy.env`.
4. Гілка змінює API image та валідацію HTTP, але не Prisma schema чи migrations. Для цього релізу DB migration не потрібна. Після перевірки backup зібрати й оновити web та api:

   ```sh
   docker compose --env-file deploy.env build web api
   docker compose --env-file deploy.env up -d --no-deps api web
   ```

5. Перевірити сервіси, логи й основні HTTP маршрути:

   ```sh
   docker compose --env-file deploy.env ps
   docker compose --env-file deploy.env logs --tail=100 web
   curl -fsS https://teplo-tvd.live/ -o /dev/null
   curl -fsS https://teplo-tvd.live/robots.txt
   curl -fsS https://teplo-tvd.live/sitemap.xml
   curl -fsS https://teplo-tvd.live/api/v1/health
   curl -fsS https://teplo-tvd.live/knowledge/cop-i-scop/ -o /tmp/seo-article.html
   grep -F '<link rel="canonical" href="https://teplo-tvd.live/knowledge/cop-i-scop/"' /tmp/seo-article.html
   grep -F 'application/ld+json' /tmp/seo-article.html
   ```

   Додатково перевірити status і `Location` для `https://www.teplo-tvd.live/`, `http://teplo-tvd.live/` та `https://teplo-tvd.live/HeatingPumpSite/`; очікувати canonical HTTPS/host або 308 redirect відповідно до правила.
6. Відкрити основні сторінки в браузері, перевірити Console, форму з вимкненим прийманням і спостерігати логи/ресурси. Не надсилати реальних заявок. Зберегти результати та старий image tag до завершення періоду спостереження.

## Rollback

До оновлення зберегти старі tags для `heatingpumpsait-web` і `heatingpumpsait-api`, наприклад `:pre-seo-<timestamp>`. Якщо після оновлення є помилка:

```sh
docker image tag heatingpumpsait-web:pre-seo-<timestamp> heatingpumpsait-web:latest
docker image tag heatingpumpsait-api:pre-seo-<timestamp> heatingpumpsait-api:latest
docker compose --env-file deploy.env up -d --no-deps api web
docker compose --env-file deploy.env ps
curl -fsS https://teplo-tvd.live/ -o /dev/null
```

Не додавайте `--build` до команди rollback: потрібні збережені попередні images. Ця зміна не містить DB migrations, тому rollback не потребує відновлення PostgreSQL. Для GitHub Pages після окремого погодження зробити revert релізного commit у `main`; наступний затверджений push запустить Pages workflow.

## Ризики перед публікацією

- Для `deepmerge-ts` використовується major override 8.0.1, перевірений із Prisma CLI 6.19.3 та реальною `migrate deploy` на тестовій БД; при зміні Prisma CLI треба повторити цей test.
- Реальна поведінка DNS, TLS, redirects, Caddy routes та production API не підтверджена; локальні перевірки не доводять runtime production.
- Merge у `main` запускає GitHub Pages deployment автоматично.
- На Hetzner Caddy отримує config із кореневим доменом та www redirect; до deployment підтвердити DNS для обох hostnames і зберегти Caddy volumes. Не змінювати DB/lead flags у межах SEO-релізу.
- Ресурси 1 GB VPS мають невеликий запас відповідно до `docs/DEPLOY_CP02.md`; після build/restart контролювати пам’ять, диск та health.

## Рішення перед публікацією

- [ ] Переглянути відкриті npm advisories і зафіксувати рішення щодо ризику.
- [ ] Переглянути цю гілку та погодити merge в `main` окремо.
- [ ] Підтвердити Hetzner backup, DNS/TLS і погоджений стан приймання заявок.
- [ ] Окремо погодити deployment; після нього виконати post-deployment HTTP/браузерні перевірки й залишити попередній web image доступним для rollback.
