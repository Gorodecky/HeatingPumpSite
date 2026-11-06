# Ручне браузерне тестування SEO-версії

## Запуск

У корені проєкту виконайте:

```sh
npm run preview:seo
```

Скрипт спочатку запускає production build (`tsc`, Vite та `scripts/prerender.mjs`), примусово збирає frontend із `VITE_LEADS_ENABLED=false`, а потім запускає Vite preview на `127.0.0.1:4173`. Дочекайтеся повідомлення `Local: http://127.0.0.1:4173/`. Якщо порт зайнятий, зупиніть попередній preview і повторіть команду. Для завершення натисніть `Ctrl+C`.

Preview обслуговує статичний `dist`; він не запускає API, не підключається до PostgreSQL і не може зберегти заявку.

## URL sitemap

Відкрийте кожну адресу напряму в Chrome:

1. [Головна](http://127.0.0.1:4173/)
2. [Viessmann](http://127.0.0.1:4173/brands/viessmann/)
3. [LG](http://127.0.0.1:4173/brands/lg/)
4. [AUX](http://127.0.0.1:4173/brands/aux/)
5. [FADO](http://127.0.0.1:4173/brands/fado/)
6. [Чи підійде тепловий насос](http://127.0.0.1:4173/knowledge/chi-pidiide-vam-teplovyi-nasos/)
7. [COP і SCOP](http://127.0.0.1:4173/knowledge/cop-i-scop/)
8. [Радіатори чи тепла підлога](http://127.0.0.1:4173/knowledge/radiatory-chy-tepla-pidloha/)
9. [Витрати та етапи монтажу](http://127.0.0.1:4173/knowledge/vytraty-ta-etapy-montazhu/)
10. [Теплові насоси FADO](http://127.0.0.1:4173/knowledge/teplovi-nasosy-fado/)
11. [Політика конфіденційності](http://127.0.0.1:4173/privacy/)

Очікування для кожної сторінки: немає порожнього екрана, видно відповідний заголовок і основний вміст, URL та сторінка залишаються правильними після `Cmd+R`.

## Перевірки навігації та hydration

1. Відкрийте головну, перейдіть карткою бази знань на статтю COP і SCOP. Натисніть `Cmd+Left`, потім `Cmd+Right`: мають послідовно відновитися головна та стаття.
2. На кожній із 11 URL відкрийте DevTools (`Cmd+Option+I`) → **Console**, очистьте її, оновіть сторінку й перевірте, що немає `Hydration failed`, hydration mismatch чи повідомлення `React hydration recovered from an error`.
3. Після hydration виконайте в Console:

   ```js
   (() => {
     const expectedCanonical = `https://teplo-tvd.live${location.pathname}`;
     const titles = document.querySelectorAll("head > title");
     const descriptions = document.querySelectorAll('head > meta[name="description"]');
     const canonicals = document.querySelectorAll('head > link[rel="canonical"]');
     return {
       titleCount: titles.length,
       descriptionCount: descriptions.length,
       canonicalCount: canonicals.length,
       canonical: canonicals[0]?.href,
       expectedCanonical,
       canonicalMatches: canonicals[0]?.href === expectedCanonical,
     };
   })()
   ```

   Очікується `titleCount`, `descriptionCount` і `canonicalCount` рівні `1`, а `canonicalMatches` — `true`.

## Мобільне меню

1. Відкрийте DevTools → Device Toolbar (`Cmd+Shift+M`) і виберіть вузький мобільний viewport.
2. На головній натисніть кнопку меню. Переконайтеся, що меню відкрилося, кнопка має `aria-expanded="true"`, переходи працюють, а після переходу меню закривається.
3. Повторіть на вкладеній сторінці та перевірте повернення на головну.

## Безпечний тест форми підбору

Збірка примусово має `VITE_LEADS_ENABLED=false`. Не змінюйте це значення для цього сценарію, не запускайте API та не вводьте реальні персональні дані.

1. На головній натисніть «Далі» без заповнення кроку 1. Має з’явитися повідомлення про обов’язкові поля.
2. Введіть вигадане місто `Тестове місто`, оберіть `До 100 м²` і `Новий будинок`, потім натисніть «Далі».
3. На кроці 2 без вибору натисніть «Далі» й перевірте повідомлення. Потім виберіть `Радіатори` та `Поки вивчаю` й перейдіть до кроку 3.
4. Перевірте, що кнопка надсилання вимкнена. Не намагайтеся обходити її або надсилати запит.
5. У DevTools → Network → Fetch/XHR переконайтеся, що під час цих дій немає `POST /api/v1/leads`.

## Невідомий маршрут через Caddy

У `deploy/Caddyfile` статична гілка використовує `try_files {path} {path}/` і `file_server`, без SPA fallback. Перевірити фактичну відповідь Caddy локально можна командою:

```sh
npm run test:caddy-404
```

Вона повторно збирає prerendered `dist`, запускає тимчасовий офіційний Docker-образ Caddy на `127.0.0.1:18181`, монтує збірку read-only та перевіряє, що стаття повертає `200`, а `/not-a-real-page/` — `404`. Контейнер і тимчасовий конфіг видаляються після тесту. Цей тест не використовує production-конфігурацію, API чи базу даних.
