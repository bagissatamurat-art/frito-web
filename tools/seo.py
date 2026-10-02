#!/usr/bin/env python3
"""Базовое SEO сайта Frito: мета-теги, иконки, Open Graph, noindex для служебных файлов,
разметка Schema.org и запасной HTML меню на главной, sitemap.xml, robots.txt, manifest.

Запуск из корня сайта:  python3 tools/seo.py
Переезд на свой домен: поменять BASE ниже и перезапустить (а в 404.html — <base href>).
Скрипт идемпотентен: блоки между <!-- seo:start --> и <!-- seo:end --> заменяются целиком.
"""
import html, json, os, re, datetime

BASE = 'https://bagissatamurat-art.github.io/frito-web/'   # ← адрес сайта (со слешем в конце)
# коды подтверждения прав: Google Search Console и Яндекс.Вебмастер (только значение content="…")
VERIFY = {'google': '', 'yandex': ''}
# дата публикации вакансий для разметки JobPosting (обновляйте, когда меняете вакансии)
JOBS_POSTED = '2026-10-02'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# ---- контакты: единственный источник — frito.js (window.FritoContacts) ----
js = open('frito.js', encoding='utf-8').read()
def contact(key):
    m = re.search(key + r":\s*'([^']*)'", js)
    return m.group(1) if m else ''
C = {k: contact(k) for k in ('phone', 'hours', 'email', 'instagram', 'tiktok', 'company')}
PHONE_E164 = '+' + re.sub(r'\D', '', C['phone'])

# ---- страницы: title, description, индексировать ли ----
PAGES = {
    'menu.dc.html': ('Frito — доставка хрустящей курочки, бургеров и боксов в Астане',
                     'Хрустящая курочка, бургеры, твистеры, стрипсы и боксы. Доставка за 35–45 минут и самовывоз за 15 минут. Оплата Kaspi и картой онлайн. Заказ на сайте и в WhatsApp.', True),
    'vacancies.dc.html': ('Вакансии Frito — работа в ресторанах в Астане',
                          'Кассир-официант, повар, курьер, управляющий: открытые вакансии Frito, график и зарплата. Без опыта — обучим. Заполните анкету онлайн.', True),
    'apply.dc.html': ('Анкета кандидата · Вакансии Frito', 'Заполните анкету — HR-менеджер Frito перезвонит в течение двух рабочих дней.', True),
    'delivery.dc.html': ('Доставка и оплата · Frito', 'Зона и стоимость доставки Frito, время работы ресторанов, оплата Kaspi, картой онлайн или на кассе, промокоды, отмена и возврат.', True),
    'franchise.dc.html': ('Франшиза Frito — откройте ресторан в своём городе', 'Готовая модель, обучение команды, поставки и маркетинг. Оставьте заявку на франшизу Frito — менеджер по развитию пришлёт презентацию.', True),
    'suppliers.dc.html': ('Поставщикам · Frito', 'Предложите продукты, напитки, упаковку или оборудование для ресторанов Frito. Отдел закупок изучит заявку и ответит.', True),
    'place.dc.html': ('Предложить помещение · Frito', 'Ищем помещения для новых ресторанов Frito: фуд-корты ТРЦ, первая линия, отдельные помещения. Аренда и продажа.', True),
    'offer.dc.html': ('Публичная оферта · Frito', 'Условия продажи блюд и напитков Frito с доставкой и самовывозом через сайт и приложение.', True),
    'privacy.dc.html': ('Политика конфиденциальности · Frito', 'Какие персональные данные собирает Frito, зачем, кому передаёт и как защищает.', True),
    # личные и служебные — не индексируем, но ссылки разрешаем
    'account.dc.html': ('Личный кабинет · Frito', 'История заказов, адреса и настройки.', False),
    'checkout.dc.html': ('Оформление заказа · Frito', 'Оформление заказа Frito.', False),
    'status.dc.html': ('Статус заказа · Frito', 'Статус вашего заказа Frito.', False),
    'order-status.html': ('Заказ оформлен · Frito', 'Заказ Frito оформлен.', False),
}
TITLE_RE = re.compile(r'[ \t]*<title>.*?</title>\n?', re.S)
BLOCK_RE = re.compile(r'[ \t]*<!-- seo:start -->.*?<!-- seo:end -->\n?', re.S)
e = lambda s: html.escape(s, quote=True)

def icons():
    return ('<link rel="icon" href="favicon.ico" sizes="32x32">\n'
            '<link rel="icon" href="favicon.svg" type="image/svg+xml">\n'
            '<link rel="apple-touch-icon" href="apple-touch-icon.png">\n'
            '<link rel="manifest" href="site.webmanifest">\n'
            '<meta name="theme-color" content="#614BE2">\n')

def verify():
    return ''.join(f'<meta name="{n}" content="{e(v)}">\n' for n, v in (('google-site-verification', VERIFY['google']), ('yandex-verification', VERIFY['yandex'])) if v)

def block(fn, title, desc, index, extra=''):
    url = BASE + fn
    robots = 'index, follow, max-image-preview:large' if index else 'noindex, follow'
    out = (f'<!-- seo:start --> <!-- генерирует tools/seo.py — правьте там -->\n'
           f'<title>{e(title)}</title>\n'
           f'<meta name="description" content="{e(desc)}">\n'
           f'<meta name="robots" content="{robots}">\n')
    if index:
        out += f'<link rel="canonical" href="{e(url)}">\n'
    out += icons()
    out += (f'<meta property="og:type" content="website">\n'
            f'<meta property="og:site_name" content="Frito">\n'
            f'<meta property="og:locale" content="ru_RU">\n'
            f'<meta property="og:title" content="{e(title)}">\n'
            f'<meta property="og:description" content="{e(desc)}">\n'
            f'<meta property="og:url" content="{e(url)}">\n'
            f'<meta property="og:image" content="{BASE}assets/og-image.png">\n'
            f'<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
            f'<meta name="twitter:card" content="summary_large_image">\n')
    out += '<script src="analytics.js"></script>\n'
    return out + extra + '<!-- seo:end -->\n'

def put(fn, blk):
    s = open(fn, encoding='utf-8').read()
    s = BLOCK_RE.sub('', s)
    s = TITLE_RE.sub('', s, count=1) if '<head>' in s else s
    s = re.sub(r'<html(?![^>]*\blang=)([^>]*)>', r'<html lang="ru"\1>', s, count=1)
    s = re.sub(r'(<meta name="viewport"[^>]*>\n)', lambda m: m.group(1) + blk, s, count=1)
    open(fn, 'w', encoding='utf-8').write(s)

# ---- главная: меню из данных страницы → Schema.org + запасной HTML ----
menu_src = open('menu.dc.html', encoding='utf-8').read()
IMG = re.search(r"const IMG = '([^']+)'", menu_src).group(1)
cats = []
for cm in re.finditer(r"\{ name: '([^']+)', items: \[(.*?)\]\s*\}", menu_src, re.S):
    items = re.findall(r"\['([^']*)','([^']*)','([^']*)',(\d+),(?:'([^']*)'|null)", cm.group(2))
    cats.append((cm.group(1), items))
stores_src = open('FritoAddressModal.dc.html', encoding='utf-8').read()
stores = re.findall(r"\{ city: 'astana', name: '([^']+)', hours: '([^']+)', lat: ([\d.]+), lng: ([\d.]+) \}", stores_src)

def hours(h):
    a, b = [x.strip() for x in h.replace('–', '-').split('-')]
    return f'Mo-Su {a}-{b}'

org = {'@type': 'Organization', '@id': BASE + '#org', 'name': 'Frito', 'url': BASE + 'menu.dc.html',
       'logo': BASE + 'assets/icons/icon-512.png', 'email': C['email'],
       'sameAs': [f"https://www.instagram.com/{C['instagram']}/", f"https://www.tiktok.com/@{C['tiktok']}"],
       'contactPoint': {'@type': 'ContactPoint', 'telephone': PHONE_E164, 'contactType': 'customer service',
                        'availableLanguage': ['ru', 'kk'], 'contactOption': 'WhatsApp'}}
menu = {'@type': 'Menu', '@id': BASE + '#menu', 'name': 'Меню Frito', 'inLanguage': 'ru',
        'hasMenuSection': [{'@type': 'MenuSection', 'name': cn, 'hasMenuItem': [
            {'@type': 'MenuItem', 'name': n, 'description': d,
             **({'image': IMG + img} if img else {}),
             'offers': {'@type': 'Offer', 'price': p, 'priceCurrency': 'KZT'}} for (_id, n, d, p, img) in items]}
            for cn, items in cats]}
rest = [{'@type': 'Restaurant', 'name': f'Frito, {n}', 'servesCuisine': ['Фастфуд', 'Курица'],
         'priceRange': '₸₸', 'telephone': PHONE_E164, 'parentOrganization': {'@id': BASE + '#org'},
         'hasMenu': {'@id': BASE + '#menu'}, 'acceptsReservations': False,
         'address': {'@type': 'PostalAddress', 'streetAddress': n, 'addressLocality': 'Астана', 'addressCountry': 'KZ'},
         'geo': {'@type': 'GeoCoordinates', 'latitude': float(la), 'longitude': float(lo)},
         'openingHours': hours(h)} for n, h, la, lo in stores]
site = {'@type': 'WebSite', '@id': BASE + '#site', 'name': 'Frito', 'url': BASE, 'inLanguage': ['ru', 'kk'],
        'publisher': {'@id': BASE + '#org'}}
ld = json.dumps({'@context': 'https://schema.org', '@graph': [org, site, menu, *rest]}, ensure_ascii=False)
menu_extra = verify() + f'<script type="application/ld+json">{ld}</script>\n'

# запасной HTML меню — для поисковиков и браузеров без JavaScript
NS_RE = re.compile(r'<noscript class="seo-menu">.*?</noscript>\n?', re.S)
fallback = ['<noscript class="seo-menu">',
            '<h1>Frito — доставка хрустящей курочки, бургеров и боксов</h1>',
            '<p>Доставка за 35–45 минут и самовывоз за 15 минут. Оплата Kaspi и картой онлайн. '
            f'Заказ в WhatsApp: <a href="https://wa.me/{PHONE_E164[1:]}">{e(C["phone"])}</a>.</p>']
for cn, items in cats:
    fallback.append(f'<h2>{e(cn)}</h2><ul>' + ''.join(
        f'<li><strong>{e(n)}</strong> — {e(d)} — {p} ₸</li>' for (_id, n, d, p, _img) in items) + '</ul>')
fallback.append('<p><a href="delivery.dc.html">Доставка и оплата</a> · <a href="vacancies.dc.html">Вакансии</a> · '
                '<a href="franchise.dc.html">Франшиза</a> · <a href="offer.dc.html">Оферта</a> · '
                '<a href="privacy.dc.html">Конфиденциальность</a></p>')
fallback.append('</noscript>')
s = open('menu.dc.html', encoding='utf-8').read()
s = NS_RE.sub('', s)
s = s.replace('</x-dc>\n', '</x-dc>\n' + '\n'.join(fallback) + '\n', 1)
open('menu.dc.html', 'w', encoding='utf-8').write(s)

# ---- вакансии → JobPosting (данные из frito-data.js) ----
import subprocess
try:
    vac = json.loads(subprocess.run(['node', '--input-type=module', '-e',
        "import('./frito-data.js').then(m => console.log(JSON.stringify(m.VACANCIES)))"], capture_output=True, text=True, check=True).stdout)
except Exception as ex:
    print('вакансии: node недоступен, JobPosting пропущен —', ex); vac = []
def salary(v):
    m = re.search(r'(\d[\d\s ]*)', v.get('salary', ''))
    n = int(re.sub(r'\D', '', m.group(1))) if m else None
    return {'@type': 'MonetaryAmount', 'currency': 'KZT', 'value': {'@type': 'QuantitativeValue', 'minValue': n, 'unitText': 'MONTH'}} if n else None
def job_html(v):
    sec = lambda t, xs: f'<p><strong>{e(t)}</strong></p><ul>' + ''.join(f'<li>{e(x)}</li>' for x in xs) + '</ul>' if xs else ''
    return f'<p>{e(v.get("short", ""))}</p>' + sec('Обязанности', v.get('duties')) + sec('Требования', v.get('req')) + sec('Условия', v.get('cond'))
jobs = [{'@context': 'https://schema.org', '@type': 'JobPosting', 'title': v['title'], 'description': job_html(v),
         'datePosted': JOBS_POSTED, 'employmentType': 'FULL_TIME', 'directApply': True,
         'hiringOrganization': {'@type': 'Organization', 'name': 'Frito', 'sameAs': BASE + 'menu.dc.html', 'logo': BASE + 'assets/icons/icon-512.png'},
         'jobLocation': [{'@type': 'Place', 'address': {'@type': 'PostalAddress', 'streetAddress': b, 'addressLocality': v.get('city', 'Астана'), 'addressCountry': 'KZ'}}
                         for b in (v.get('branches') or ['Астана'])],
         **({'baseSalary': salary(v)} if salary(v) else {}),
         **({'experienceRequirements': v['exp']} if v.get('exp') else {})} for v in vac]
jobs_extra = f'<script type="application/ld+json">{json.dumps(jobs, ensure_ascii=False)}</script>\n' if jobs else ''

# ---- применяем к страницам ----
for fn, (t, d, idx) in PAGES.items():
    put(fn, block(fn, t, d, idx, menu_extra if fn == 'menu.dc.html' else jobs_extra if fn == 'vacancies.dc.html' else ''))

# служебное (компоненты, UI Kit, макеты): не индексировать и не ходить по ссылкам
for fn in sorted(os.listdir('.')):
    if fn.endswith('.dc.html') and fn.startswith('Frito'):
        s = open(fn, encoding='utf-8').read()
        s = BLOCK_RE.sub('', s)
        s = re.sub(r'(<meta charset="utf-8">\n)', r'\1<!-- seo:start --><meta name="robots" content="noindex, nofollow"><!-- seo:end -->\n', s, count=1)
        open(fn, 'w', encoding='utf-8').write(s)

# корень: редирект на главную + canonical
open('index.html', 'w', encoding='utf-8').write(
    '<!DOCTYPE html>\n<html lang="ru"><head><meta charset="utf-8">\n'
    f'<title>{e(PAGES["menu.dc.html"][0])}</title>\n'
    f'<meta name="description" content="{e(PAGES["menu.dc.html"][1])}">\n'
    f'<link rel="canonical" href="{BASE}menu.dc.html">\n' + verify() + icons() +
    '<meta http-equiv="refresh" content="0; url=menu.dc.html">\n'
    '</head><body><a href="menu.dc.html">Frito — меню и доставка</a></body></html>\n')

# sitemap.xml, robots.txt, manifest
today = datetime.date.today().isoformat()
urls = [fn for fn, (_t, _d, idx) in PAGES.items() if idx]
prio = {'menu.dc.html': '1.0', 'vacancies.dc.html': '0.7', 'delivery.dc.html': '0.6'}
open('sitemap.xml', 'w', encoding='utf-8').write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ''.join(f'  <url><loc>{BASE}{u}</loc><lastmod>{today}</lastmod><priority>{prio.get(u, "0.4")}</priority></url>\n' for u in urls) +
    '</urlset>\n')
open('robots.txt', 'w', encoding='utf-8').write(
    '# Работает только в корне домена (на github.io/frito-web/ — нет; после переезда на свой домен — да)\n'
    'User-agent: *\nDisallow: /tools/\nDisallow: /account.dc.html\nDisallow: /checkout.dc.html\n\n'
    f'Sitemap: {BASE}sitemap.xml\n')
open('site.webmanifest', 'w', encoding='utf-8').write(json.dumps({
    'name': 'Frito — доставка курочки и бургеров', 'short_name': 'Frito', 'lang': 'ru',
    'start_url': 'menu.dc.html', 'display': 'standalone', 'background_color': '#FFFFFF', 'theme_color': '#614BE2',
    'icons': [{'src': 'assets/icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
              {'src': 'assets/icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png'},
              {'src': 'assets/icons/icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}]},
    ensure_ascii=False, indent=2))
print(f'ok: {len(PAGES)} страниц, вакансий: {len(jobs)}, меню: {sum(len(i) for _, i in cats)} позиций в {len(cats)} категориях, ресторанов: {len(rest)}')
