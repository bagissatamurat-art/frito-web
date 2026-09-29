# Handoff: Frito — главный экран с корзиной и оформление заказа

## Overview
Сайт доставки Frito (Астана): меню с плавающей/боковой корзиной и страница оформления заказа. Два брейкпоинта: desktop 1440 (меню 2/3 + корзина 1/3) и mobile 390 (плавающая кнопка корзины → bottom sheet). Цель пакета — сверстать экраны на переиспользуемых компонентах и токенах, чтобы дальнейшая разработка шла быстрее.

## About the Design Files
Файлы `screens/*.dc.html` и `components/*.dc.html` — **дизайн-референсы, собранные в HTML** (прототипы с интерактивом), а не production-код. Задача — **воссоздать их в целевом стеке** (React/Next/Vue/…) по его паттернам. Если стека ещё нет — рекомендуем React + TypeScript + CSS-переменные из `tokens.css` (или Tailwind с этими же значениями в theme). Логику прототипов (класс `Component`, `renderVals`) не переносить — переносить внешний вид, состояния и поведение.

## Fidelity
**High-fidelity.** Цвета, типографика, отступы, радиусы, состояния — финальные. Воссоздавать pixel-perfect. Исключения отмечены как «предложение» (focus-ring, error/disabled инпутов — в макетах не отрисованы, добавить по спеке).

## Как открыть и потестить адаптив
- **Быстро, без установки:** `preview/Frito Site.html` и `preview/Frito Checkout.html` — самодостаточные файлы, открываются двойным кликом. Меняйте ширину окна или включите DevTools → Device toolbar: ≥1024px — desktop-раскладка (меню + боковая корзина), <1024px — mobile (FAB + bottom sheet, контент ограничен 600px по центру). Нужен интернет для шрифта Inter, React (unpkg) и фото товаров с CDN.
- **Из исходников:** папка `site/` — `npx serve site` (или любой статический сервер) → открыть `Frito Site.dc.html`. Открывать через `file://` нельзя — компоненты подгружаются fetch'ем.
- Переходы: «Перейти к оформлению» → Checkout, «В меню»/«‹» → обратно.

## Для Claude Code / агента
Промпт для старта:
> Прочитай `design_handoff_frito/README.md`, `COMPONENTS.md` и `tokens.css`. Воссоздай экраны из `site/Frito Site.dc.html` и `site/Frito Site Checkout.dc.html` в нашем стеке pixel-perfect (разметка и inline-стили в `<x-dc>` — источник правды по вёрстке; класс `Component` — источник правды по состояниям и расчётам). Данные меню/ресторанов сейчас в `frito-data.js` — замени на API, сохранив форму объектов (см. раздел «API-контракт»). Не переносить runtime `support.js`, `sc-if`/`sc-for`/`dc-import` — это шаблонизатор прототипа.

### API-контракт (что нужно от бэкенда)
- `GET /menu` → `{ categories: [{id, name}], items: [{id, catId, name, desc, price, img, mods?: string[], soldOut?: boolean}] }` — форма как в `frito-data.js`.
- `GET /stores` → `[{id, name, address, hours, lat, lng}]`.
- `POST /promo/validate {code, subtotal}` → `{ ok, percent }` или `{ ok:false, reason: 'not_found'|'expired'|'min_sum', minSum? }` — три текста ошибок в макете.
- `GET /delivery/config` → `{ fee: 1000, freeFrom: 8000|12000 }` — один параметр вместо двух захардкоженных.
- `POST /orders` → тело: `{ mode, address?: {street, entrance, floor, flat, intercom, leaveAtDoor}, storeId?, when: 'asap'|{slot}, contact: {phone, name?, comment?}, payment: {type: 'kaspi'|'card'|'cash', kaspiPhone?, changeFrom?}, promo?, items: [{id, qty}] }` → `{ orderId, paymentUrl? }`.
- Корзина и способ получения живут на клиенте (localStorage) и переживают переход меню ↔ checkout.

## Files
```
README.md            — этот файл
preview/             — Frito Site.html, Frito Checkout.html: самодостаточные адаптивные версии, открыть в браузере
site/                — те же адаптивные экраны в исходниках (+ support.js, компоненты, assets) — запускать через статический сервер
tokens.css           — все дизайн-токены (--fr-*), источник правды
COMPONENTS.md        — спека каждого элемента: размеры, состояния, варианты, props
screens/
  Frito Главный экран v2.dc.html   — меню + корзина (desktop, mobile), модалка способа, боковое меню
  Frito Оформление заказа.dc.html  — checkout (desktop, mobile)
  Frito UI Kit.dc.html             — визуальный каталог токенов и компонентов со состояниями
components/          — референс уже выделенных компонентов
  FritoSegment, FritoStepper, FritoToggle, FritoInput, FritoTotals, FritoDeliveryBar (.dc.html)
frito-data.js        — данные: категории, товары (id, name, desc, price, img, mods), рестораны, промокод, fmt/plural
assets/              — иконки svg, story-картинки, пакет
```
`screens/*.dc.html` — фиксированные артборды 1440/390 для чтения разметки; рабочие адаптивные версии — в `site/` и `preview/`. Брейкпоинт 1024px реализован в `site/*.dc.html` через `isDesktop/isMobile` (resize-листенер в классе `Component`).

## Design Tokens
Полный список в `tokens.css`. Ключевое:
- **Primary** `#614BE2` (hover `#503BCB`, dark `#4A36C4`), тинты `#EFEDFC` (100), `#F5F3FF` (50), `#D9D4F7` (200), `#A899FF` на тёмном. Dark `#1B1740` (футер).
- **Ink** `#111827` / `#6B7280` / `#9CA3AF`. **Surfaces** `#FFFFFF` / `#F7F7F9` / `#F3F4F6` / `#E5E7EB`. **Lines** `#ECECF1` (border) / `#F1F1F4` (divider). Off-state `#D1D5DB`.
- **Semantic** success `#16A34A`, danger `#EF4444`, kaspi `#F14635`.
- **Шрифт** Inter 400/500/600/700/800. Шкала: 36 display · 30/28 h1 · 24 h2 · 22 h3 · 18 title · 16 panel-title · 15 body-lg · 14 body · 13 label · 12 caption · 11 micro; цены 24/800, 20/700, 17/700. Заголовки letter-spacing −.01…−.02em; overline +.04em uppercase.
- **Отступы** шаг 4: 4 8 12 16 20 24 28 32 40 56.
- **Радиусы**: pill 999 (все кнопки/чипы/инпуты-пилюли), 6 checkbox, 8 promo-badge, 12–14 малые плитки/инпуты, 16 option-card, 18/20 панели, 22/24 карточки, 28 футер, 32 модалки/шторки, 44 mobile-рамка.
- **Высоты контролов**: 60 xl · 56 lg · 44 md · 40 sm · 36 xs; инпут 56, textarea 84.
- **Тени**: см. `tokens.css` (xs, card-hover, fab, modal, drawer, sheet). Overlay `rgba(17,24,39,.45)`.
- **Motion**: .15s интерактив, .2s toggle, .3s прогресс; `scroll-behavior: smooth` для якорей категорий.

## Screens / Views

### 1. Главный экран — Desktop 1440×960
- **Layout**: `grid-template-rows: 76px 1fr`. Header (bg #fff, border-bottom). Ниже `grid-template-columns: minmax(0,1fr) 480px`: слева скролл-область меню, справа `<aside>` корзина (border-left, bg #fff).
- **Header**: логотип 34 → Segment 280×40 (light, с иконками) → AddressPill (empty dashed / filled) → бургер справа.
- **Меню**: белая шапка `padding 24 32 0`: 3 stories 188×236 r26; ряд category-chips (`padding 28 0 20`). Контент `padding 8 32 48; border-top`: секции категорий `padding-top 28`, h2 24/700 `margin-bottom 18`, grid 3 колонки gap 16 ProductCard. Активный чип следит за скроллом (см. Interactions). Footer в конце скролла (`margin 32`).
- **Корзина пустая**: h2 22 «Корзина пуста» (padding 28 28 0); центр — картинка пакета 220, текст 15 ink-2 max-width 280, две secondary-кнопки с иконками «Доставка/Самовывоз» (если способ не выбран).
- **Корзина заполненная** (bg surface-1): шапка `padding 24 24 16`: h2 22/700 «N товаров на X тг.» + text-кнопка «Очистить». Скролл-колонка `padding 4 24 20; gap 16` из панелей: items (CartLine ×N, panel padding 4×20) → upsell «Добавить к заказу?» → «Способ получения» (Segment filled + AddressRow + SettingRow «Оставить у двери» только для доставки; если способ не выбран — подсказка 13 ink-2 высотой 40) → промо (promo-block + DeliveryBar при доставке) → Totals → дисклеймер 12 ink-3 → Checkbox оферты. Футер `padding 16 24 20; border-top; bg #fff`: primary xl «Перейти к оформлению ›» (disabled если чекбокс снят).
- **Модалка способа получения**: overlay + диалог 560; заголовок «Выберите способ получения заказа», подзаголовок зависит от контекста; две OptionCard rich (Доставка / Самовывоз) в grid 1fr 1fr gap 12.
- **Боковое меню**: Drawer 400 (см. COMPONENTS §23).

### 2. Главный экран — Mobile 390×844
- Скролл-контейнер на весь экран. Белая шапка: логотип 30 + бургер (`padding 54 20 0`); Segment 100%×44 + AddressPill (`padding 14 20 0; gap 10`); stories 150×190 horizontal scroll (`padding 18 20 0`); sticky category-chips с blur. Контент `padding 0 16 24`: h2 22/700, grid 2 колонки gap 10. Footer `margin 8 12 110` (место под FAB).
- **FAB корзины**: pill 60 справа снизу (right 16, bottom 28) с суммой и count-badge; пустая → «Корзина».
- **Bottom sheet корзины**: max-height 88%; шапка «N товаров на X тг.» + IconButton 36; пустая — картинка 160 + текст + primary «К меню» 52; заполненная — та же последовательность панелей, что на desktop, но compact-варианты (CartLine 88, Stepper 112×40, Totals compact, DeliveryBar compact); футер — split CTA 56 «Перейти к оформлению · сумма».
- **Модалка способа**: bottom sheet `padding 24 20 34`, h 24/700, две OptionCard rich compact, кнопки «Выбрать».
- **Боковое меню**: Drawer 320 с r 44 0 0 44.

### 3. Оформление заказа — Desktop 1440×960
- Header 76: ghost «‹ В меню» слева, логотип по центру, бургер справа.
- Контент `padding 32 32 48`, `max-width 1120` по центру, `grid-template-columns: minmax(0,1fr) 400px; gap 24; align-items:start`.
- **Левая колонка** (gap 16): h1 28/800 «Оформление заказа»; панели (r20, padding 20×22):
  1. **Способ получения**: title + Segment 220×40 в одной строке; AddressRow в bg surface-1 r16; при доставке — grid 4×FritoInput (Подъезд, Этаж, Кв./офис, Домофон) gap 10 + SettingRow «Оставить у двери» с sub.
  2. **Время доставки / готовности**: две OptionCard simple («Как можно скорее» с ETA / «Ко времени»); при «Ко времени» — ряд slot-chips.
  3. **Контакты**: grid 2 (Имя, Телефон) + textarea «Комментарий к заказу».
  4. **Оплата**: grid 2 OptionCard radio (Kaspi, Картой онлайн; +«На кассе» при самовывозе); ниже условный FritoInput («Номер Kaspi…» / «С какой суммы подготовить сдачу»).
- **Правая колонка** `position: sticky; top:0; gap 12`:
  - «Ваш заказ» (title + «N товаров»): OrderLine ×N gap 12 (**с модификаторами** второй строкой 12 ink-2), ссылка «Изменить состав заказа».
  - Панель итога: promo (applied-плашка или pill-инпут + «Применить») → DeliveryBar при доставке → Totals (totalTitle «К оплате») → CTA lg (bg kaspi «Оплатить через Kaspi» / primary «Оплатить картой» / «Оформить заказ») → дисклеймер 12 ink-3 по центру.

### 4. Оформление заказа — Mobile 390×844
- Шапка bg surface-1 `padding 54 16 12`: круглая кнопка «‹» 40 bg #fff, title 17/700 «Оформление», спейсер 40.
- Скролл `padding 4 16 24; gap 12`, панели r18 padding 16: способ (Segment 100%×42, AddressRow compact, grid 2 инпутов, SettingRow) → время (grid 2 OptionCard compact, слоты horizontal scroll с `margin 0 -16; padding 0 16`) → контакты (инпуты колонкой gap 10) → оплата (OptionCard radio compact колонкой) → «Ваш заказ» (OrderLine compact + promo + DeliveryBar compact + Totals compact над `border-top`) → дисклеймер 11.
- Футер `padding 12 16 26; border-top; bg #fff`: split CTA 56 «Оплатить через Kaspi · сумма».

## Interactions & Behavior
- **Выбор способа получения**: до выбора способ = null; клик «В корзину» открывает модалку; после выбора товар добавляется автоматически (подзаголовок «Товар добавится в корзину сразу после выбора»). Выбор доставки → адрес по умолчанию; самовывоз → первый ресторан. Segment в шапке/панели меняет способ напрямую. «Изменить» открывает модалку.
- **Корзина**: `cart: Record<id, qty>`; «В корзину» → qty 1 и кнопка сменяется Stepper на том же месте; `−` до 0 удаляет позицию. «×» в строке удаляет позицию, «Очистить» — всё. Заголовок «N товар/товара/товаров на X тг.» (склонение — `plural` в frito-data.js). Апселл показывает только товары, которых нет в корзине.
- **Категории**: клик по чипу — плавный скролл к секции (`scrollTo`, mobile с offset 64 под sticky nav); при скролле активный чип обновляется по позиции секций (offset 60 desktop / 90 mobile).
- **Расчёт**: subtotal = Σ qty×price; скидка = round(subtotal × promo%); доставка = 0 при самовывозе или subtotal ≥ freeDeliveryFrom (8 000 на главном / 12 000 на checkout — **согласовать одно значение**), иначе 1 000; total = subtotal − скидка + доставка. DeliveryBar: остаток и %.
- **Чекбокс оферты** (главный экран): снят → CTA disabled (bg surface-3, text ink-3, cursor not-allowed). Checkout: согласие — по нажатию кнопки (текст под CTA).
- **Checkout**: способ меняет набор полей, заголовок времени («Время доставки»/«Время готовности»), ETA («~45 мин · готовка 25 + дорога 20» / «~25 мин»), список оплат (наличные только при самовывозе; при переключении на доставку с cash → kaspi). Оплата меняет CTA (лейбл и цвет) и доп. поле. Промокод: ввод → «Применить» → applied-плашка с `×`.
- **Hover/active**: см. COMPONENTS.md. Все transitions .15s. FAB active `scale(.96)`. OptionCard rich hover `translateY(-2px)`.
- **Логотип**: `https://frito.kz/brand.svg`; onError → текстовый fallback «FRITO» 26/800 primary с иконкой-молнией (clip-path). На тёмном — `filter: brightness(0) invert(1)`.
- **Форматирование**: `fmt(n)` → «4 090 тг.» (пробел-разделитель тысяч, «тг.» с точкой). В свободном тексте — «тг» без точки (например «от 1 000 тг»).
- **Loading/Error**: не спроектированы. Предложение: skeleton на месте фото (bg surface-2), error-состояние инпута по спеке.
- **Responsive**: два фиксированных макета; между 390 и 1440 — рекомендуем брейкпоинт 1024: ниже — mobile-паттерн (FAB + sheet), выше — desktop с корзиной 480 (min 400).

## State Management
Главный экран: `cart`, `mode: 'delivery'|'pickup'|null`, `address`, `door`, `agree`, `modal` (+ `pendingId` — товар, ждущий выбора способа), `menuOpen`, `mobileCartOpen`, `activeCategory`.
Checkout: `mode`, `door`, `when: 'asap'|'later'`, `slot`, `pay: 'kaspi'|'card'|'cash'`, `promo`, поля формы (entrance, floor, flat, intercom, name, phone, comment, kaspiPhone, change).
Данные: категории/товары/рестораны/промокод — `frito-data.js` (в проде — API). Корзина и способ получения должны переживать переход меню ↔ checkout (localStorage или глобальный стор).

## Известные несоответствия в макетах (исправить в коде)
1. Три оттенка линий (#ECECF1 / #EEEEF2 / #F1F1F4) → оставить два: `border` #ECECF1, `divider` #F1F1F4 (#EEEEF2 → #ECECF1).
2. Два тинта primary (#EFEDFC и #F5F3FF) используются местами взаимозаменяемо → правило: **primary-100** для кнопок/чипов/иконочных плиток, **primary-50** для выбранных карточек/фонов-плашек/круга пина.
3. Порог бесплатной доставки: 8 000 (главный) vs 12 000 (checkout) → один параметр.
4. Промо-инпут в двух разных стилях → унифицировать на pill-вариант из checkout.
5. Высоты кнопок 42 (карточки) и 52 («К меню») — округлить до 44 / 56.
6. Размер IconButton «×» плавает 36–48 — привязать к контейнеру: модалка 48, drawer 44, sheet 40 (36 только в шапке корзины mobile).
7. `CATS` продублирован в главном экране и `frito-data.js` — единый источник данных.
8. Все `href="#"` — заглушки (франшиза, оферта, карта и т.д.).

## Assets
`assets/`: `ic-delivery-p/w.svg`, `ic-pickup-p/w.svg`, `ic-pin-p.svg`, `ic-card-p.svg`, `ic-kaspi-w.svg`, `ic-whatsapp-w.svg`, `ic-instagram-w.svg`, `ic-tiktok-w.svg` (суффикс -p primary / -w white), `bag-frito.png` (пакет для пустой корзины и FAB), `story-stores.png`, `story-new10.png`, `story-whatsapp.png`. Фото товаров — CDN `…selstorage.ru/frito-co/96814/images/items/<hash>` (см. `frito-data.js`). Логотип — `https://frito.kz/brand.svg`. Шрифт — Inter (Google Fonts, 400–800).
