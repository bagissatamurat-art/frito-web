# Frito — веб-прототип

Статический сайт, сборка не нужна. `index.html` → `menu.dc.html`.
Экран сам подстраивается: ≥1024px — ПК-версия, меньше — мобильная.

## Флоу
menu → (способ получения, корзина) → checkout → оплатить → status
vacancies → apply

## Публикация
```bash
git init && git add . && git commit -m "Frito web"
git branch -M main
git remote add origin https://github.com/<you>/frito-web.git
git push -u origin main
```
Settings → Pages → Source: `main` / root.

Файлы `Frito *.dc.html` — дизайн-холсты (ПК + мобайл рядом), на сайт не влияют.
Ключи Mapbox и DaData API ограничьте по домену `*.github.io`.
