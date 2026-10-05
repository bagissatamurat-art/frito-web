# Frito — что заменить на бэкенд и черновик API

Сейчас **ни одного запроса к серверу Frito нет**. Наружу сайт обращается только к Mapbox и DaData (адреса) и, если заданы ID, к счётчикам аналитики. Ниже перечислено всё, что сейчас подделано или зашито в код:

- §1 — ключи `localStorage` (это и есть «модель данных» прототипа);
- §2 — демо-данные и фальшивые сценарии, у каждого «сейчас → нужно»;
- §3 — черновик API, который их заменяет.

Места указаны по имени функции или переменной: номера строк меняются при правках, ищите поиском по файлу.

## 1. Ключи localStorage — текущая «модель данных»

| Ключ | Формат | Кто пишет / читает | Заменить на |
|---|---|---|---|
| `frito_user` | `{via:'whatsapp'\|'telegram', phone, at, name?, email?, bday?, notify?:{status,promo}}` | вход (menu, account) / все страницы | сессия или токен + `GET /me` |
| `frito_method` | `{mode:'delivery'\|'pickup', address, hours?, city?, from?}` (`from` — ресторан, который везёт) | окно адреса / меню, оформление, кабинет | можно оставить на клиенте; адрес с координатами → `POST /delivery/quote` |
| `frito_cart` | `{at, items:[{id, key, qty, mods, extra, sel}], promo, fee}` — **одна запись на строку корзины**: `key` = `id` или `id~группа:опции;…` (`lineKey` в `menu.dc.html`), `sel` — выбранные опции по группам, `mods` — их текст, `extra` — доплата. Один товар с разным составом — разные строки; тот же состав — количество складывается | меню (`saveCart` перед оформлением) / оформление | корзина на клиенте, при оформлении → `POST /orders` с id опций модификаторов |
| `frito_orders` | `[{no, at, mode, address, items:[[id, qty, {key, mods, extra, sel, price}]], total, status}]`, не больше 20 | оформление (`payGo`) / `frito.js FritoOrder`, кабинет | `GET /me/orders` |
| `frito_view` | `{no, at, mode, address, total, items:[{name,mods,qty,price,img}], repeat, repeatMeta}` | `FritoOrder.open` / страница заказа | `GET /orders/:no` |
| `frito_repeat` | `{items:{key:qty}, meta:{key:{mods,extra,sel}}, at}`, живёт 60 с | статус, кабинет («Повторить») / меню | на клиенте, ок |
| `frito_ratings` | `{[orderNo]: {stars, tags[], comment, at}}` | FritoRating / кабинет | `POST /orders/:no/rating`, рейтинг — в составе заказа |
| `frito_addresses` | `[{id, label, line, city, def}]` | кабинет | `GET/POST/PATCH/DELETE /me/addresses` |
| `frito_lang` | `'ru'\|'kk'` | frito-i18n.js | оставить (+ передавать язык в API, см. §2.9) |
| `frito_consent` | `'all'\|'necessary'` | analytics.js (баннер cookie) | оставить |
| `frito_purchase` (sessionStorage) | `{transaction_id, items, value, shipping, payment_type, mode}` | оформление / analytics.js (событие `purchase`) | оставить, но `transaction_id` — настоящий номер заказа |

## 2. Демо-данные и фальшивые сценарии

### 2.1 Каталог
- **Меню продублировано.** `CATS` в `menu.dc.html` (по нему рисуется меню) и в `frito-data.js` (из него берёт данные оформление). Товар — кортеж `[id, name, desc, price, imgFile, defaultModsText]`, базовый адрес картинок — `IMG` (бакет selstorage). **Нужно:** `GET /catalog?store=` — один источник.
- **Тип товара** (бокс, комбо, бургер, стрипсы) сейчас определяется регулярками по id: `BURGERS`, `kindOf()` в `menu.dc.html`. **Нужно:** тип и группы модификаторов приходят в товаре.
- **Модификаторы** — `G`, `KINDS`, `OPT_IMG` в `FritoProductModal.dc.html`. Группа: `{id, title, type:'single'|'multi', required, def, max, view?, options:[{id,label,price,img?}]}`. Компонент уже умеет принимать `product.groups` и `product.sel` — достаточно отдавать их из API. Результат «В корзину»: `{id, qty, unit, mods, sel}`, где `sel = {groupId: [optionId]}`.
- **Ограничение корзины:** сейчас одна позиция на один `id` товара, поэтому два «Сеул бокса» с разными напитками не уживаются. **Нужно:** ключ строки корзины = `id` + хеш выбранных опций.
- **Картинки** приходят оригиналами 1600×900 по ~380 КБ, а показываются шириной 220px. **Нужно:** уменьшенные копии (например, 480 и 960 px, WebP) и `srcset`. Подробности в AUDIT.

### 2.2 Рестораны, зоны, доставка
- **Рестораны** — `STORES` в `FritoAddressModal.dc.html`: `{city, name, hours, lat, lng}`. Координаты приблизительные. **Все города, кроме Астаны, выдуманы** для демо. Ещё одна копия ресторанов лежит в `STORES` в `frito-data.js` и `menu.dc.html`.
- **Зоны доставки:** для Астаны `ZONE` — демо-полигон, для остальных городов — круги `ZONE_R`.
- **Стоимость и время** считает `quote(d)` по прямой до ближайшего ресторана: 600 / 900 / 1 200 / 1 500 ₸, ETA = 15 + путь ± 5 мин. Бесплатно от 8 000 ₸ — это зашито в меню, окне адреса, оформлении и тексте `delivery.dc.html`.
- **«Открыто / закрыто»** считается по часам браузера (`openInfo`).
- **Нужно:** `GET /stores`, `POST /delivery/quote` → `{inZone, storeId, fee, etaMin, etaMax, freeFrom}`. Окно адреса при подтверждении уже возвращает `{mode, address, sub, city, from, lat, lng, fee, eta, alts, store}` — подставьте туда ответ сервера.
- **Ключи Mapbox и DaData** лежат в `FritoAddressModal.dc.html`: публичный `pk.` и публичный ключ DaData. Ограничьте их по домену frito.kz. **Секретный ключ DaData в клиент не класть.** Лучше проксировать DaData через свой бэк.

### 2.3 Наличие (стоп-лист)
- **Сейчас** это `window.FritoStock.STOP` в `frito.js`: `{ 'Название ресторана': [id товаров] }`.
- **Как используется:** меню прячет недоступные товары, окно адреса предупреждает, корзина помечает «нет в наличии», есть окно `FritoStockAlert` с альтернативами.
- **Нужно:** наличие по ресторану в каталоге (`GET /catalog?store=` → `available:false` или отдельный `stopList`). Интерфейс уже готов, достаточно подставить данные.

### 2.4 Авторизация (`FritoAuthModal.dc.html`)
- **Отправка кода** — таймер на 700 мс. **Проверка:** проходит любой код из 4 цифр, кроме `0000` (`WRONG`). 3 попытки, повторная отправка через 60 с.
- **Telegram:** ссылка на бота `tgLogin` из `FritoContacts` (`@FritoKzBot`). Ответ бота подделан таймером, вход выполняется с номером `TG_DEMO_PHONE`. QR-код — статичная картинка `assets/qr-tg-login.svg`.
- **После входа** в `frito_user` пишется только `{via, phone}`, без токена.
- **Нужно:**
  - `POST /auth/otp` `{phone, channel}` и `POST /auth/otp/verify` `{phone, code}` → сессия;
  - для Telegram: `POST /auth/telegram/start` → `{token, botUrl}`, бот получает контакт, клиент опрашивает `GET /auth/telegram/:token`;
  - QR генерировать по `botUrl`.
- Интерфейс (шаги, ошибки, таймер, «заблокировано») уже готов.

### 2.5 Оформление и оплата (`checkout.dc.html`)
- **Состав** берётся из `frito_cart`. Если корзины нет, показывается демо-набор `D.DEMO`.
- **Строки с модификаторами.** Один товар может прийти несколькими строками с разным `sel` (например, два «Сеул бокса»: острый и неострый). В `POST /orders` передавать каждую строку отдельно: `{productId, qty, options:[optionId…]}`; сервер сам считает цену строки и сохраняет снимок выбранных опций в позиции заказа. Строки с одинаковым набором опций сервер может склеить.
- **Поля предзаполнены демо-значениями:** подъезд, этаж, кв., телефон `+7 708 261 63 92`. **Нужно** брать их из профиля и последнего адреса.
- **Время к сроку:** `SLOTS` — 6 фиксированных интервалов. **Нужно:** `GET /slots?store=`.
- **Промокод:** `FritoPromoField` проверяет локально (NEW10 — ок, OLD20 — истёк, BIG15 — от 10 000 ₸), скидка всегда в процентах из `PROMO`. **Нужно:** `POST /promo/validate`. Итоговую сумму считает сервер.
- **Оплата:** `payGo` создаёт номер `4800 + random`, пишет `frito_orders` и `frito_purchase`, открывает страницу заказа. Kaspi — только номер телефона, без выставления счёта. Карта — без платёжной формы.
- **Нужно:** `POST /orders` → `{orderNo, total, payment:{kaspiInvoiceId | redirectUrl}}`. Для Kaspi — выставить счёт и ждать оплату, для карты — редирект на страницу банка и возврат. Цены, скидки и доставку пересчитывает сервер.

### 2.6 Статус заказа (`status.dc.html` + `FritoOrderStatus`, `frito.js FritoOrder`)
- **Этап** определяется параметрами URL `stage`, `mode`, `issue`, `order`, `demo` и временем с момента заказа (`FritoOrder`: < 5 мин — принят, < 20 — готовим, дальше — в пути).
- **Демо-данные:** `STEPS` с фиксированными временами и курьером «Айдос», `ITEMS`, скидка 947, ресторан выдачи «Сыганак 11», координаты для маршрутов. Главная и кабинет «опрашивают» заказ каждые 30 с — на деле просто перерисовываются.
- **Отмена** меняет только локальное состояние.
- **Оплата не прошла:** отсчёт 15 мин, по истечении — автоотмена на клиенте. «Оплатить снова» и выбор способа ничего не отправляют.
- **`order-status.html`** — демо-страница выбора сценариев; в продакшене не нужна.
- **Нужно:**
  - `GET /orders/:no` → `{stage, issue, timeline:[{key,label,at}], eta, mode, store, address, items, payment, total, refund?}`;
  - обновления опросом или WebSocket/SSE;
  - `POST /orders/:no/cancel`, `POST /orders/:no/pay {method}`;
  - автоотмена неоплаченного заказа — на сервере.
- Компонент `FritoOrderStatus` принимает `kind: active|ready|done|pay|cancel`, `steps`, `eta`, `deadline`, `refund` — маппинг ответа API в пропсы делается в одном месте `status.dc.html → renderVals → prog`.

### 2.7 Кабинет, история, оценки
- **История:** `DEMO_ORDERS` (заказы 4793, 4655, 4518) подмешиваются к реальным. Доставка в `total()` зашита как 600 ₸.
- **Оценка, адреса, профиль** хранятся только в `localStorage`. «Сменить телефон» заново открывает демо-вход.
- **Нужно:** `GET /me/orders`, `GET/PATCH /me`, CRUD `/me/addresses`, `POST /orders/:no/rating`. Оценка 1–3 должна создавать задачу менеджеру — так обещано в интерфейсе.

### 2.8 Заявки и анкеты
- **Франшиза, поставщики, помещения:** `FritoLeadForm` — отправка через таймер 700 мс. Поля описаны в `KINDS[kind].fields`.
- **Анкета кандидата:** `apply.dc.html` — то же. Список вакансий берётся из `frito-data.js VACANCIES` (помечен «черновик»), `?vacancy=` выбирает вакансию.
- **Нужно:** `POST /leads {kind, fields}`, `GET /vacancies`, `POST /applications`, уведомление в CRM, почту или Telegram.

### 2.9 Казахский язык
- **Как работает:** `frito-i18n.js` при `kk` загружает словарь `frito-i18n-kk.js` (~975 фраз «рус → каз» + правила-регулярки) и переписывает текст DOM через `MutationObserver`.
- **Ограничение:** любой текст, пришедший с сервера (названия и описания блюд, рестораны, статусы, ошибки, вакансии), останется русским, пока его нет в словаре. Правила рассчитаны на русские шаблоны: «Заказ №N», «от N ₸», «N из M».
- **Рекомендация:** API отдаёт тексты на нужном языке (`?lang=kk` или `Accept-Language`), а словарь остаётся только для интерфейса. Названия блюд — решение бренда: в гайдлайне на казахском они латиницей («Delüks», «Seul»).
- Элементы с `data-no-i18n` не переводятся.

### 2.10 Прочее
- **Контакты** — `window.FritoContacts` в `frito.js`, единственный источник для всего сайта. Можно отдавать из `GET /settings`.
- **Аналитика** — ID пустые (`analytics.js CFG`). События воронки уже расставлены, см. AUDIT. `purchase` должен получать настоящий номер заказа.
- **Юр. реквизиты** в оферте и политике — заглушки `[…]` (`docs/LAUNCH.md`).

## 3. Черновик API

Префикс условный: `/api/v1`. Деньги — целые тенге, время — ISO 8601 или Unix ms, язык — `?lang=ru|kk`.

```
GET  /catalog?store={id}&lang=        → { categories:[{id,name,items:[Product]}], stopList:[productId] }
     Product = { id, name, desc, price, kind, img:{thumb,full}, tags?, groups:[ModGroup], defaultSel? }
     ModGroup = { id, title, type:'single'|'multi', required, def?, max?, view?:'seg'|'tiles'|'chips', options:[{id,label,price,img?}] }
GET  /stores?city=                    → [{ id, city, name, address, lat, lng, hours:{open,close}, isOpen, pickupMinutes }]
GET  /zones?city=                     → [{ storeId, polygon:[[lat,lng]…] }]            (для отрисовки на карте)
POST /delivery/quote {lat,lng,subtotal}→ { inZone, storeId, fee, freeFrom, etaMin, etaMax, nearestPickup? }
GET  /slots?store={id}&mode=          → [{ from, to, available }]
POST /promo/validate {code,subtotal}  → { valid, kind:'percent'|'amount', value, reason?:'expired'|'min_total'|'not_found', minTotal? }

POST /auth/otp {phone,channel:'whatsapp'}      → { ttl, resendIn }
POST /auth/otp/verify {phone,code}             → { token, user } | 400 { error:'wrong_code', triesLeft } | 429 locked
POST /auth/telegram/start                      → { token, botUrl }        (QR = botUrl)
GET  /auth/telegram/{token}                    → { status:'pending'|'done', token?, user? }
GET  /me · PATCH /me {name,email,bday,notify}
GET/POST /me/addresses · PATCH/DELETE /me/addresses/{id}

POST /orders                                   → { orderNo, total, payment:{ method, kaspiInvoiceId?, redirectUrl? }, deadline }
     body = { mode, storeId, address?:{line,lat,lng,entrance,floor,flat,intercom}, recipient?:{name,phone},
              when:{asap:true}|{slot:{from,to}}, comment?, promo?,
              items:[{ productId, qty, sel:{groupId:[optionId]} }], payment:{ method:'kaspi'|'card', kaspiPhone? } }
GET  /orders/{no}                              → { no, mode, stage:'accepted'|'paid'|'cooking'|'onway'|'ready'|'done',
                                                   issue?:'payment_failed'|'cancelled'|'delayed', timeline:[{key,label,at}],
                                                   eta?, store, address?, items:[{name,mods,qty,price,img}], total, fee, discount,
                                                   payment:{method,status}, deadline?, refund?:{amount,to,eta} }
GET  /me/orders?cursor=                        → { items:[OrderShort], next }
POST /orders/{no}/pay {method} · POST /orders/{no}/cancel · POST /orders/{no}/rating {stars,tags,comment}
(real-time: WS /orders/{no}/stream или опрос GET /orders/{no} раз в 10–15 с)

GET  /vacancies?city=                          → [{ id,title,salaryFrom,shift,hours,city,branches,exp,short,duties,req,cond }]
POST /applications {vacancyId, fields}         · POST /leads {kind:'franchise'|'suppliers'|'place', fields}
GET  /settings                                 → { contacts:{phone,hours,email,instagram,tiktok,telegramBot}, freeDeliveryFrom, promoBanner? }
```

Принципы:
- Цена, скидка, доставка и итог всегда считаются на сервере. Клиент показывает предварительный расчёт.
- Номер заказа выдаёт сервер, клиент получает его в `POST /orders`.
- Наличие проверяется на сервере ещё раз при создании заказа. При расхождении приходит `409 {unavailable:[productId]}`, а интерфейс показывает `FritoStockAlert`.
