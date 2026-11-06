# SEO Release Checklist

- **Дата перевірки:** 6 листопада 2026 року
- **Гілка:** `feature/seo-optimization`
- **Production:** `https://teplo-tvd.live`
- **Статус:** локальні перевірки пройшли; merge, push і deployment не виконувалися.

## Git і межі змін

- Звірено повний diff `feature/seo-optimization` відносно `origin/main`; SEO-файли та результати цієї перевірки зафіксовані окремими commits.
- У diff немає змін `server/src/index.ts`, Prisma schema/migrations, `server/.env`, `deploy.env` або файлів секретів. Є одна навмисна зміна лише в `server/src/leadQueue.integration.test.ts`: тест із застарілою зафіксованою датою переведено на час відносно БД і додано перевірку HTTP 400 для некоректного телефону.
- Навмисні deployment/build зміни: `.github/workflows/deploy.yml` задає Pages base `/HeatingPumpSite/`; `Dockerfile` та `compose.yaml` передають base `/` для Hetzner; `deploy/Caddyfile` перенаправляє www і старі `/HeatingPumpSite/` URL та обслуговує кореневу збірку. API reverse proxy залишається `/api/*` → `api:3001`.
- `Dockerfile` додатково копіює `scripts/prerender.mjs` у build stage. Без цього Hetzner web image не збирався після додавання prerender до `npm run build`.
- `LEADS_ENABLED` у deploy прикладі лишається вимкненим. Production-конфігурацію на сервері не читали й не змінювали.
- Робоче дерево має бути чистим перед PR/merge; перед публікацією перевірити `git status --short --branch` та `git diff --check origin/main...HEAD`.

## Результати тестування

| Перевірка | Результат |
|---|---|
| `npm run test:seo` | Успішно: збірка і 6/6 тестів. |
| SEO HTML, canonical, robots і JSON-LD | Успішно для всіх 11 URL sitemap: унікальні Title/Description, відповідний canonical, один JSON-LD блок із правильними типами та URL; `/admin/` має `noindex`. Перевірка виконана для кореневої та Pages base збірок. |
| SSR parity та JSON-LD повторне використання | Успішно: prerendered markup збігається з React SSR; повторна синхронізація перевикористовує script, SPA-навігація його оновлює, неіндексований маршрут видаляє. |
| `npm --prefix server test` | Успішно: 3/3 unit-тести. |
| Серверна збірка `npm run build:server` | Успішно. |
| Інтеграція форми/API з PostgreSQL | Успішно: 8/8 у тимчасовому контейнері PostgreSQL 16, БД `heatingpump_seo_test`, випадковий loopback-порт і тимчасова схема `lead_it_*`. Тести підтвердили HTTP 400 для некоректного телефону без запису, HTTP 201 для синтетичної заявки, вимкнений endpoint із HTTP 503 та збереження черги після перезапуску. Контейнер працював без volume і видалився після тесту; Resend credentials були порожні. Production-БД не використовувалася. |
| Docker Compose | Успішно: `docker compose --env-file deploy.env.example config --quiet`. Сервіси не запускалися цією командою. |
| Caddy | Успішно: Docker `caddy:2-alpine caddy validate` перевірив `deploy/Caddyfile`; тимчасовий локальний Caddy перевірив prerendered статтю `200` і невідомий URL `404`. |
| Hetzner frontend build | Успішно: `VITE_LEADS_ENABLED=false VITE_BASE_PATH=/ npm run build`, потім 6/6 SEO-тестів. |
| GitHub Pages build | Успішно: `VITE_BASE_PATH=/HeatingPumpSite/ npm run build`, потім 6/6 SEO-тестів; asset paths мають Pages prefix. |
| Hetzner Docker images | Успішно: `docker compose --env-file deploy.env.example build api web`. Це лише збірка образів; сервіси не запускалися. |
| `git diff --check` | Перевірити повторно після останнього commit; metadata в `docs/seo-audit.md` приведені до чистого Markdown без trailing whitespace. |

### Невиконані зовнішні перевірки

- Не перевіряли production DNS, TLS, HTTP→HTTPS, www redirect, фактичні Googlebot-відповіді, production health або файли `robots.txt`/`sitemap.xml` через мережу. Усі ці пункти потребують post-deployment перевірки.
- Не виконували deployment, міграції, зміни DNS чи реальні заявки.
- `npm ci` під час Docker builds повідомив про 2 frontend advisories (1 moderate, 1 high) та 4 server advisories рівня high. Локальний `npm audit` не зміг отримати advisory detail через `ENOTFOUND registry.npmjs.org`; пакети й fix versions не підтверджені. Перевірити advisories у доступному до npm registry середовищі перед публікацією та оцінити окремо від цього SEO diff.

## Безпечний порядок deployment на Hetzner

Виконувати лише після окремого погодження merge і deployment. GitHub Actions автоматично публікує GitHub Pages після push у `main`, тому merge до `main` є дією, що запускає публікацію Pages.

1. На review підтвердити commits і diff. Переконатися, що production `deploy.env` не змінений, `SITE_ADDRESS=teplo-tvd.live`, `APP_ORIGIN=https://teplo-tvd.live`, а `LEADS_ENABLED` лишається у погодженому стані (за поточним планом — `false`). Не копіювати локальні `.env` на VPS.
2. На VPS перевірити поточні сервіси й вільне місце, зберегти попередній web image під окремим tag та створити й перевірити свіжу резервну копію PostgreSQL. Перед зміною перевірити, що архів не порожній і проходить `gzip -t`.
3. Оновити checkout до погодженого commit із `main`, перевірити `git status`, не змінювати `deploy.env`.
4. Оскільки ця гілка не містить API чи схеми БД змін, не запускати Prisma migrations і не перебудовувати БД. Зібрати та оновити лише web:

   ```sh
   docker compose --env-file deploy.env build web
   docker compose --env-file deploy.env up -d --no-deps web
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

До оновлення зберегти старий image tag, наприклад `heatingpumpsait-web:pre-seo-<timestamp>`. Якщо після оновлення є помилка:

```sh
docker image tag heatingpumpsait-web:pre-seo-<timestamp> heatingpumpsait-web:latest
docker compose --env-file deploy.env up -d --no-deps web
docker compose --env-file deploy.env ps
curl -fsS https://teplo-tvd.live/ -o /dev/null
```

Не додавайте `--build` до команди rollback: потрібен збережений попередній image. У цій зміні немає DB migrations, тому rollback не потребує відновлення PostgreSQL. Для GitHub Pages після окремого погодження зробити revert релізного commit у `main`; наступний затверджений push запустить Pages workflow.

## Ризики перед публікацією

- npm advisories із Docker build ще не класифіковані за пакетами через недоступність audit registry; це найважливіший відкритий технічний пункт.
- Реальна поведінка DNS, TLS, redirects, Caddy routes та production API не підтверджена; локальні перевірки не доводять runtime production.
- Merge у `main` запускає GitHub Pages deployment автоматично.
- На Hetzner Caddy отримує config із кореневим доменом та www redirect; до deployment підтвердити DNS для обох hostnames і зберегти Caddy volumes. Не змінювати DB/lead flags у межах SEO-релізу.
- Ресурси 1 GB VPS мають невеликий запас відповідно до `docs/DEPLOY_CP02.md`; після build/restart контролювати пам’ять, диск та health.

## Рішення перед публікацією

- [ ] Переглянути відкриті npm advisories і зафіксувати рішення щодо ризику.
- [ ] Переглянути цю гілку та погодити merge в `main` окремо.
- [ ] Підтвердити Hetzner backup, DNS/TLS і погоджений стан приймання заявок.
- [ ] Окремо погодити deployment; після нього виконати post-deployment HTTP/браузерні перевірки й залишити попередній web image доступним для rollback.
