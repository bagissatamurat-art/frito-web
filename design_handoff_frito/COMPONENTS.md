# Компоненты Frito — спецификация для вёрстки

Все размеры в px. Шрифт везде Inter. Токены — в `tokens.css` (`--fr-*`). Живой каталог со состояниями — `Frito UI Kit.dc.html`. Референсные реализации 6 компонентов — `components/*.dc.html` (читать как спеку, не копировать код).

Соглашения: `font: inherit` на всех кнопках/инпутах; `cursor: pointer`; `border: 0` (кроме outlined-вариантов); `transition: all .15s` на интерактивных; фокус — `outline: 2px solid var(--fr-primary); outline-offset: 2px` (в макетах не отрисован — добавить в коде).

---

## 1. Button

Всегда pill (`border-radius: 999px`), `display:inline-flex; align-items:center; justify-content:center; gap: 8–10px; white-space: nowrap`.

| size | height | font | padding-x | где |
|---|---|---|---|---|
| xl | 60 | 19/600 | 28 | CTA корзины desktop |
| lg | 56 | 17/600 (Kaspi 700) | 28 | CTA mobile/checkout |
| md | 44 | 15/600 | 22 | «В корзину», «Выбрать» в модалке, «К меню» (52 → округлить до md/lg) |
| sm | 40–42 | 13–15/600 | 16 | «Изменить», ghost |
| xs | 36 | 12/600 | 14 | «Изменить» mobile |

| variant | bg | color | hover | disabled |
|---|---|---|---|---|
| primary | primary | #fff | primary-hover | bg surface-3, color ink-3, cursor not-allowed |
| secondary | primary-100 | primary | bg primary / color #fff (в карточке) или primary-200-ish `#E4E0FA` (в пустой корзине) | bg surface-2, color ink-3 |
| ghost | surface-2 | ink | surface-3 | color ink-3 |
| ghost-on-surface | #fff + shadow-btn | ink | surface-2 | — |
| danger/kaspi | kaspi | #fff | kaspi-hover | — |
| text | transparent | ink-2 (13/500) | ink или danger («Очистить») | — |
| link | transparent | primary (13/600) | primary-dark | — |

Split CTA (mobile): `justify-content: space-between; padding: 0 20px` — слева лейбл 16/600, справа сумма 16/700.

Иконка + текст (`secondary` с иконкой): `padding: 8px 18px 8px 10px`, иконка 20px, gap 8.

### IconButton
Круг, bg surface-2, color ink, символ `×` 18–22px. Размеры 48 (модалка desktop) / 44 (боковое меню) / 40 (шторка mobile, назад) / 36 (шапка корзины mobile). Hover: surface-3.
Бургер: 44×44 прозрачный, 3 полоски 20×2.5 (mobile 18×2.5), r2, gap 5 (mobile 4), hover opacity .7.
Удалить (в строке корзины): прозрачный, `×` 20px, color ink-3 → hover ink, hit-area ≥ 32.

### Social IconButton
44×44 круг. WhatsApp bg primary; Instagram/TikTok bg on-dark-icon → hover .18. Иконка 20 (TikTok 32).

---

## 2. Chip

Pill, `font: inherit`, `white-space: nowrap`, `border: 0`.

- **category** (tinted): 15/500, padding 12×22 (mobile 14/500, 10×18). default bg surface-2 / ink; active bg primary-100 / primary. Hover default → surface-3. Ряд: `display:flex; gap:10 (mobile 8); overflow-x:auto`. Mobile: `position: sticky; top:0; background: rgba(255,255,255,.94); backdrop-filter: blur(12px); border-bottom: 1px divider`.
- **slot** (solid): 13/600, padding 9×14. default surface-2 / ink; selected primary / #fff.
- **store on-dark** (футер): bg on-dark-fill → hover on-dark-fill-hover, padding 8px 14px 8px 10px, пин 14 (белый, opacity .7) + название 13/600 #fff + часы 12 on-dark-55. «ещё N»: bg rgba(168,153,255,.15), color primary-light.
- **social text on-surface** (в меню): bg #fff, 13/600, padding 8×14 (mobile 7×12).

---

## 3. Badge

- **count**: min-width 26, height 26, r13, bg danger, #fff 14/700, padding 0 6, `border: 2px solid surface-1` (вырез под фон). Позиция на FAB: top −6, right −4.
- **promo code**: 12/800 primary, bg #fff (внутри primary-100 плашки) или primary-100, r8, padding 4×8, letter-spacing .04em, uppercase.
- **success**: 13/600 success + круг 18 bg success с `✓` 11px #fff.
- **add** (на апселл-тайле): круг 24 (mobile 22) bg primary, `+` 16/700 #fff, `position:absolute; right:5; bottom:5`.
- **eta**: inline span 12/600 success внутри caption.

---

## 4. Segment (`FritoSegment`)

Контейнер: `display:flex; gap:4; padding:4; bg surface-2; r pill; width 100%`. Две кнопки `flex:1`, pill, height 36/40/44, font 13 (<40) / 14 (≥40) /600, gap 8, padding 0 14, иконка 20.

| variant | on | off |
|---|---|---|
| light | bg #fff, ink, shadow-xs, иконка -p | transparent, ink-2, иконка -p |
| filled | bg primary, #fff, иконка -w | transparent, ink-2, иконка -p |

`mode: 'delivery' | 'pickup' | null` (null — оба off). Props: `mode, variant, icons, height, onChange(mode)`.

---

## 5. Stepper (`FritoStepper`)

`display:flex; justify-content:space-between; align-items:center; width:100%; height: size`. Кнопки `−`/`+` — круг `size×size` (40/42/44), bg surface-2 → hover surface-3, символ 20px ink. Число по центру 16/700. Ширина контейнера: 132 (desktop), 112 (mobile корзина), 100% (mobile карточка). `qty ≤ 0` → компонент заменяется на кнопку «В корзину» / цену. Props: `qty, size, onInc, onDec`.

---

## 6. Toggle (`FritoToggle`)

48×28, r14, `role="switch"`. bg neutral-300 off / primary on, transition .2s. Ползунок 22, top 3, left 3 → 23, bg #fff, `shadow 0 1px 3px rgba(0,0,0,.2)`. Props: `on, onChange(on)`.

## 7. Checkbox

20×20, r6, `border: 2px` neutral-300 off / primary on, bg #fff / primary, `✓` 12/800 #fff. `role="checkbox" aria-checked`. Лейбл 12/400 ink-3, lh 1.45, gap 10, `align-items:flex-start`. Ссылки внутри — primary 12.

## 8. Radio (внутри OptionCard)

22×22 круг, `border: 2px` neutral-300 / primary, bg #fff / primary, точка 8 #fff.

---

## 9. Input (`FritoInput`)

`<label>` `position:relative; bg surface-1; r14; height 56 (textarea 84); cursor:text`.
- Лейбл: `position:absolute; left:14; transition .15s; pointer-events:none; ink-2 500`. Пусто и без фокуса: top 20 (textarea 16), 15px. Фокус или есть значение: top 10, 11px.
- Поле: `position:absolute; left/right 14; bottom 9; height 22; 15/600 ink; bg transparent; border 0; outline none`. Textarea: top 28, bottom 10, 14/400, lh 1.45, `resize:none`.
- Плейсхолдеров нет — роль плейсхолдера играет лейбл.
- Состояния для кода (в макетах не отрисованы, показаны в UI Kit): **error** — `border: 2px solid danger`, лейбл danger, подпись 12 danger под полем; **disabled** — bg surface-2, opacity .6.
Props: `label, value, multiline, onChange(value)`.

### Promo input (вариант)
- Checkout: `<input>` pill, bg surface-2, padding 11×16, 14/400, `placeholder` ink-3 + рядом secondary-кнопка «Применить» (14/600, padding 0 18).
- Корзина (main): блок bg surface-2 r14 padding 10×14, лейбл 11 ink-2 сверху, значение 15/600 uppercase; справа success-badge «−10%».
- Applied-плашка: bg primary-100 r14 padding 10px 12px 10px 14px; promo-badge + 13/600 primary-dark описание + `×` 18 ink-2.

> Замечание: два разных промо-инпута — унифицировать на pill-вариант (checkout).

---

## 10. OptionCard (выбор одного из N)

`<button>` `border: 2px; text-align:left; color ink; font:inherit`.
- default: border divider, bg #fff (rich: border `border`, bg `#F8F8FB`). Hover: border primary-200 (rich: primary + bg primary-50, translateY(−2px)).
- selected: border primary, bg primary-50.

Варианты:
- **simple** (время): r16, padding 12×18, column, gap 2; title 16/700, sub 12 ink-2; min-width 150. Mobile: r14, 10×12, 14/700 + 11.
- **radio** (оплата): r16, padding 12×14, row gap 12; иконка-плитка 40 r12 (bg kaspi / primary-100 / `#ECFDF3`) с svg 24; title 15/700 + sub 12 ink-2; Radio справа. Mobile: 38 r11, svg 22, 14/700.
- **rich** (модалка способа): r24 (mobile 22), padding 18 (14×12), column `align-items:stretch`, gap 8 (6); иконка 48 (40) по центру, title 19/700 (17), sub 13 ink-2 lh 1.35 `flex:1`, внизу вложенная primary-кнопка md 44 «Выбрать …» (визуальная, клик по всей карточке).

---

## 11. AddressPill

Pill height 48, `padding: 0 16px 0 6px`, gap 8–10. Слева круг 36 bg primary-50 с пином 16.
- **empty**: `border: 1px dashed primary-200`, текст 13 ink-2 «Выберите, как получить заказ», не кнопка.
- **filled** (`<button>`): `border: 1px solid border`, bg #fff, hover border `#B7ACF3`; колонка caption 11/500 ink-2 + value 14/700; справа «Изменить» 13/600 primary. Mobile: value с ellipsis, caption включает ETA.

## 12. AddressRow (внутри панели)

Row gap 14 (mobile 10): круг 40 (36) bg primary-50/primary-100 + иконка 18–20; колонка caption 12 ink-2 (ETA success 600) + value 15/700 (mobile 14, ellipsis); справа ghost-кнопка sm «Изменить». В checkout — обёрнут в bg surface-1 r16 padding 14×16, кнопка ghost-on-surface.

## 13. SettingRow

`justify-content:space-between`: слева title 14/600 (+ опц. sub 12 ink-2), справа Toggle. Если под другим блоком — `border-top: 1px divider; padding-top: 14 (12)`.

---

## 14. Panel (Card-контейнер)

bg #fff, r20 (mobile 18), padding 18×20 / 20×22 checkout (mobile 14×16 / 16). Column gap 16 (12–14). Заголовок `panel-title` 15–16/700 (mobile 14–15). Панели в колонке через gap 16 (mobile 12) на фоне surface-1.

Разделитель между строками внутри панели: `border-bottom: 1px divider`.

## 15. ProductCard

`<article>` bg #fff, `border: 1px border`, r24 (mobile 20), padding 14 (mobile 8 8 12), column gap 10 (8). Hover: shadow-card-hover.
- Фото: `aspect-ratio 1/1`, r18 (14), bg surface-2, `object-fit: cover`. Нет фото → моно-подпись 11 ink-3.
- Текст (padding 2 4 0): name 18/700 lh 1.25 (mobile 15), desc 14/400 lh 1.4 ink-2 `line-clamp: 2` (mobile 12).
- Низ (padding 4 4 0): цена 20/700 + secondary-кнопка 132×42 «В корзину» → hover primary. В корзине → Stepper 132×42 на том же месте.
- Mobile: одна кнопка на всю ширину 44 с ценой как лейблом (15/700), active → primary/#fff; в корзине → Stepper 100%×44.
Grid: desktop `repeat(3, minmax(0,1fr))` gap 16; mobile `1fr 1fr` gap 10.

## 16. CartLine

Grid `104px 1fr` gap 16, padding 20×0, `border-bottom: 1px divider` (mobile 88px, gap 12, 16×0).
Фото 104 r18 (88 r16). Правая колонка `justify-content:space-between`: name 16/700 (15) + delete `×`; mods 13/400 ink-2 lh 1.4 (12); ссылка «Изменить» 13/600 (только для бокс/комбо); низ — сумма строки 17/700 (15) + Stepper 132×42 (112×40).

## 17. OrderLine (checkout)

Grid `48px 1fr auto` gap 12, `align-items:center` (mobile 44, gap 10). Фото r12 (11). Колонка: name 14/600 ellipsis (13), **mods 12/400 ink-2** (11), qty × price 12 ink-3 (11). Сумма 14/700 (13).

## 18. UpsellTile

`<button>` прозрачный, column center gap 8, width 92 (mobile 80). Плитка 80 r18 (68 r16) bg surface-2 с фото + add-badge. Подпись 12/500 ink-2 (11) + цена 13/700 (12). Ряд `overflow-x:auto; gap 12 (10)`.

## 19. DeliveryBar (`FritoDeliveryBar`)

bg primary-50, r14, padding 12×14 (compact 10×12), column gap 8. Строка: текст 13/600 (12) цветом primary (или success при 0 остатке) + справа «от N тг.» 12–13/500 ink-2. Трек 6px r3 bg surface-3, заливка `width: %`, transition .3s. Тексты: «Ещё N тг. до бесплатной доставки» / «Доставка бесплатно». Props: `subtotal, freeFrom, compact`.

## 20. Totals (`FritoTotals`)

Column gap 10 (compact 8), 14/400 ink-2 (13). Строки `space-between`: «Товары», feeTitle («Доставка»/«Самовывоз»), «Скидка по промокоду» (только если > 0, значение success `−N`). Значения 600 ink. Итог: `border-top 1px divider; padding-top 12; margin-top 2; align-items: baseline` — title 16/700 (15) + сумма 24/800 −.02em (20). fee 0 → «Бесплатно». Props: `subtotal, fee, discount, feeTitle, totalTitle ('Сумма заказа' | 'К оплате'), compact`.

---

## 21. Modal (desktop)

Overlay `position:absolute/fixed; inset:0; bg overlay; display:flex; center; padding 40`. Диалог `max-width 560; bg #fff; r32; padding 36px 40px 40px; column gap 20; shadow-modal`. Шапка: h1 30/700 lh 1.15 −.01em + sub 17 ink-2 lh 1.4; IconButton 48 справа сверху. Клик по оверлею закрывает; внутри `stopPropagation`.

## 22. BottomSheet (mobile)

`position:absolute; left/right/bottom 0; bg #fff (корзина: surface-1); r 32 32 0 0; max-height 88–90%; shadow-sheet; overflow hidden`. Grabber 40×4 r2 surface-3, `padding-top 10`. Шапка padding 14px 16px 12px 20px: h 20/700 + IconButton 36. Контент `overflow-y:auto; flex:1`. Футер-CTA: `padding 12px 16px 26px; border-top 1px border; bg #fff`.

## 23. Drawer (боковое меню)

Right, width 400 (mobile 320, r 44 0 0 44), bg #fff, shadow-drawer, overlay. Шапка padding 22×28 (mobile 54 20 8 24): h 22/700 + IconButton 44 (40). Login-карточка: bg primary r22 padding 20 row gap 14, аватар-круг 48 rgba(255,255,255,.18), 17/700 + 13 opacity .85, шеврон 22. Пункты: `padding 16×4; border-bottom 1px divider; 17/600` + hint 13/500 ink-2. Секция «РЕСТОРАНЫ»: overline + строки пин 16 / 15/600 / 13 ink-2. Контакты: bg surface-2 r18 padding 16×18.

## 24. FloatingCartButton (mobile)

`position:absolute; right 16; bottom 28`, pill height 60, padding 0 20, bg primary, shadow-fab, gap 10: картинка пакета 34 + лейбл 17/600 (сумма или «Корзина»); count-badge. Active `scale(.96)`.

## 25. Header

Desktop: height 76, bg #fff, `border-bottom 1px border`, padding 0 32, gap 20: логотип 34 (fallback — текст FRITO 26/800 primary), Segment 280×40 (margin-left 24), AddressPill, справа бургер. Checkout: ghost-кнопка «‹ В меню», логотип по центру (absolute), бургер.
Mobile: padding 54 20 0 (safe-area), логотип 30 + бургер 44; ниже Segment 100%×44 и AddressPill.

## 26. Footer

bg dark, r28, padding 40 40 28 (mobile 28 22 22), color #fff, column gap 36 (24). Логотип белый 36 (30) + описание 13 on-dark-60 lh 1.5; телефон 24/700 (22) + часы 13 on-dark-55; соц-кнопки; секция ресторанов (overline on-dark-55 + store-chips); нижняя навигация `border-top 1px rgba(255,255,255,.1)`, ссылки 13/500 on-dark-75 → hover #fff (mobile 14, колонкой gap 12); копирайт 12 on-dark-40.

## 27. Stories

Картинки 188×236 r26 (mobile 150×190 r24), `object-fit: cover`, ряд gap 16 (12), mobile `overflow-x:auto`.

---

## Сводка: что ещё вынести в компоненты в коде

Уже есть (референс в `components/`): Segment, Stepper, Toggle, Input, Totals, DeliveryBar.
Сделать компонентами: **Button** (variant/size/icon), **IconButton**, **Chip**, **Badge**, **Checkbox**, **Radio**, **OptionCard** (simple/radio/rich), **AddressPill**, **AddressRow**, **SettingRow**, **Panel**, **ProductCard**, **CartLine**, **OrderLine**, **UpsellTile**, **Modal**, **BottomSheet**, **Drawer**, **Header**, **Footer**, **PromoField**.
