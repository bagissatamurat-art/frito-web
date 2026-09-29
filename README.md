# Frito — веб-прототип

Статический сайт, сборка не нужна. Открывается `index.html` → главный экран.

## Публикация на GitHub Pages
```bash
git init && git add . && git commit -m "Frito web"
git branch -M main
git remote add origin https://github.com/<you>/frito-web.git
git push -u origin main
```
Settings → Pages → Source: `main` / root. Сайт: `https://<you>.github.io/frito-web/`.

## Ключи
- Mapbox token и DaData **API key** — публичные, лежат в `FritoAddressModal.dc.html`. Ограничьте их по домену (`<you>.github.io`) в кабинетах Mapbox и DaData.
- DaData **secret key** в код не добавлен и не должен попадать в репозиторий.

## Страницы
- `Frito Главный экран v2.dc.html` — меню
- `Frito Site Checkout.dc.html` — оформление
- `Frito Статус заказа.dc.html` — статус заказа
- `Frito Вакансии.dc.html`, `Frito Анкета кандидата.dc.html` — HR
- `Frito Модалки.dc.html` — витрина модалок
