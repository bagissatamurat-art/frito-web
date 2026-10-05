// Отмечает загруженные картинки, чтобы убрать скелетон (см. img[data-skel] в frito.css)
document.addEventListener('load', e => { if (e.target.tagName === 'IMG') e.target.classList.add('is-loaded'); }, true);
document.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.classList.add('is-loaded'); }, true);

// Ленивые картинки меню: <img data-src>. Наблюдаем относительно ближайшего скролл-контейнера с запасом ~1 экран,
// чтобы не тянуть всё меню сразу (встроенный loading=lazy берёт 1250–2500px и грузит почти всё).
(() => {
  if (!('IntersectionObserver' in window)) return;
  const roots = new Map();
  const load = img => { const u = img.getAttribute('data-src'); if (u && u.indexOf('{{') < 0 && img.getAttribute('src') !== u) img.setAttribute('src', u); };
  const scrollRoot = el => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowY; if ((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight) return p; } return null; };
  const observer = root => { if (!roots.has(root)) roots.set(root, new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { load(e.target); roots.get(root).unobserve(e.target); } }), { root, rootMargin: '900px 0px' })); return roots.get(root); };
  const watch = img => { if (img.hasAttribute('data-lazy-w')) return; img.setAttribute('data-lazy-w', ''); observer(scrollRoot(img)).observe(img); };
  const scan = () => document.querySelectorAll('img[data-src]:not([data-lazy-w])').forEach(watch);
  new MutationObserver(ms => { for (const m of ms) if (m.type === 'attributes' && m.target.hasAttribute('src')) load(m.target); scan(); })
    .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-src'] });
  // страховка: рантайм иногда вставляет узлы пачкой до срабатывания наблюдателя — досканируем первые секунды и при показе вкладки
  document.addEventListener('DOMContentLoaded', scan);
  window.addEventListener('load', scan);
  let n = 0; const tick = () => { scan(); if (++n < 20) setTimeout(tick, 250); }; tick();
  document.addEventListener('visibilitychange', scan);
  document.addEventListener('click', () => setTimeout(scan, 50), true);
})();

// Появление карточек [data-reveal] при прокрутке, с небольшой задержкой между соседями
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('frito-reveal');
  const io = new IntersectionObserver(entries => {
    let i = 0;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.style.setProperty('--d', Math.min(i++ * 60, 300) + 'ms');
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -40px 0px' });
  const scan = () => document.querySelectorAll('[data-reveal]:not(.is-in):not([data-watch])').forEach(el => { el.setAttribute('data-watch', ''); io.observe(el); });
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
}

// Высота экранной клавиатуры (iOS/Android) → CSS-переменная --kb. Шторки (.f-sheet) поднимаются над клавиатурой.
if (window.visualViewport) {
  // iOS Safari: клавиатура перекрывает страницу, а window.innerHeight уменьшается вместе с ней,
  // поэтому считаем от нижнего края контейнера шторки (раскладочный вьюпорт) до низа видимой области.
  const vv = window.visualViewport, root = document.documentElement;
  let raf = 0;
  const update = () => {
    raf = 0;
    const open = root.clientHeight - vv.height > 120;
    const a = document.activeElement;
    const sheet = open && ((a && a.closest && a.closest('.f-sheet')) || document.querySelector('.f-sheet'));
    const box = sheet && sheet.offsetParent;
    const bottom = box ? box.getBoundingClientRect().bottom : root.clientHeight;
    const kb = open ? Math.max(0, Math.round(bottom - vv.offsetTop - vv.height)) : 0;
    root.style.setProperty('--kb', kb + 'px');
    root.style.setProperty('--vvh', open ? Math.round(vv.height) + 'px' : '');
  };
  const later = () => { if (!raf) raf = requestAnimationFrame(update); };
  vv.addEventListener('resize', later);
  vv.addEventListener('scroll', later);
  // программный фокус (шаг кода) — iOS двигает вьюпорт с задержкой, перепроверяем
  ['focusin', 'focusout'].forEach(e => document.addEventListener(e, () => [50, 300, 600].forEach(t => setTimeout(later, t))));
  update();
}

// Текущий заказ (до сервера — имитация по времени с момента оформления). Общая логика для главной, кабинета и страницы заказа.
// orders: localStorage.frito_orders = [{ no, at, mode, address, items: [[id, qty]], total, status }]
// Контакты Frito — единственный источник. Меняете номер, почту или соцсеть здесь — обновляется весь сайт
// (футер, боковое меню, страница заказа, документы, вход через Telegram, сторис).
window.FritoContacts = (() => {
  const C = {
    phone: '+7 700 938 00 00',     // номер WhatsApp — так, как показываем людям
    hours: '11:30 – 02:00',        // часы поддержки в WhatsApp
    email: 'info@frito.kz',
    instagram: 'frito.kz',         // логин без @
    tiktok: 'frito.kz',
    telegramBot: 'FritoKzBot',     // бот входа через Telegram
    company: 'ТОО «Frito Restaurants»',
    city: 'Астана',
  };
  const digits = C.phone.replace(/\D/g, '');
  return {
    ...C,
    waUrl: 'https://wa.me/' + digits,
    wa: text => 'https://wa.me/' + digits + (text ? '?text=' + encodeURIComponent(text) : ''),
    mailUrl: 'mailto:' + C.email,
    instagramUrl: 'https://www.instagram.com/' + C.instagram + '/', instagramLabel: '@' + C.instagram,
    tiktokUrl: 'https://www.tiktok.com/@' + C.tiktok, tiktokLabel: '@' + C.tiktok,
    telegramBotUrl: 'https://t.me/' + C.telegramBot, tgLogin: 'https://t.me/' + C.telegramBot + '?start=login',
    year: new Date().getFullYear(),
  };
})();

window.FritoOrder = (() => {
  const MIN = 6e4, ACTIVE_MIN = 50;
  const FLOW = {
    delivery: { steps: ['Принят', 'Готовим', 'В пути', 'Доставлен'], titles: ['Заказ принят', 'Готовим ваш заказ', 'Курьер уже в пути'], keys: ['accepted', 'cooking', 'onway'], total: 45 },
    pickup: { steps: ['Принят', 'Готовим', 'Готов', 'Выдан'], titles: ['Заказ принят', 'Готовим ваш заказ', 'Готов — заберите на кассе'], keys: ['accepted', 'cooking', 'onway'], total: 20 },
  };
  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const user = () => read('frito_user');
  const active = (list = read('frito_orders') || []) => list.find(o => o.status !== 'cancelled' && Date.now() - o.at < ACTIVE_MIN * MIN) || null;
  // данные для FritoOrderProgress: caption, title, eta, steps…
  const live = (o, img = () => '') => {
    const f = FLOW[o.mode === 'pickup' ? 'pickup' : 'delivery'], m = (Date.now() - o.at) / MIN, i = m < 5 ? 0 : m < 20 ? 1 : 2;
    const ready = o.mode === 'pickup' && i === 2;
    const hm = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
    return { caption: 'Заказ №' + o.no + ' · ' + (o.mode === 'pickup' ? 'самовывоз' : 'доставка'), title: f.titles[i], stageKey: f.keys[i],
      etaLabel: ready ? 'Готов! Назовите номер на кассе' : o.mode === 'pickup' ? 'Будет готов через' : 'Привезём через',
      etaNote: ready ? 'Держим горячим' : 'примерно к ' + hm(o.at + f.total * MIN),
      eta: ready ? '№' + o.no : String(Math.max(1, Math.round(f.total - m))), etaUnit: ready ? '' : 'мин',
      steps: f.steps.map((label, j) => ({ label, state: j < i ? 'done' : j === i ? 'cur' : 'todo' })),
      thumbs: (o.items || []).slice(0, 3).map(([id]) => img(id)).filter(Boolean), addr: o.address || '' };
  };
  // открыть страницу заказа: кладём состав в frito_view (byId: id → { name, price, img, mods })
  const open = (o, byId, stage) => {
    const items = (o.items || []).filter(([id]) => byId[id]);
    try { localStorage.setItem('frito_view', JSON.stringify({ no: o.no, at: o.status === 'placed' ? o.at : null, mode: o.mode, address: o.address, total: o.total,
      items: items.map(([id, q, x]) => ({ name: byId[id].name, mods: x && x.mods != null ? x.mods : byId[id].mods || '', qty: q, price: (x && x.price) || byId[id].price, img: byId[id].img })),
      repeat: Object.fromEntries(items.map(([id, q, x]) => [(x && x.key) || id, q])), repeatMeta: Object.fromEntries(items.filter(([, , x]) => x && x.key).map(([, , x]) => [x.key, { mods: x.mods, extra: x.extra || 0, sel: x.sel || null }])) })); } catch (e) {}
    const q = { order: o.no, mode: o.mode === 'pickup' ? 'pickup' : 'delivery', stage: stage || 'done' };
    if (o.status === 'cancelled') { q.issue = 'cancelled'; q.stage = 'accepted'; }
    location.href = 'status.dc.html?' + new URLSearchParams(q);
  };
  return { FLOW, user, active, live, open };
})();

// Наличие по ресторанам (стоп-лист). Демо: до подключения кассы — фиксированный список.
// Ключ — название ресторана (как в окне адреса), значение — id товаров, которых сейчас нет.
window.FritoStock = (() => {
  const STOP = {
    'Кошкарбаева 36': ['seul-box', 'seul-combo', 'seul'],
    'ТРЦ Аружан': ['deluxe-box', 'deluxe-combo', 'deluxe'],
    'Аль-фараби 13п': ['fritos', 'fritos-combo'],
    'Абая 52': ['seul-box', 'seul'],
  };
  const stop = store => (store && STOP[store]) || [];
  const has = (store, id) => !stop(store).includes(id);
  const missing = (store, ids) => (ids || []).filter(id => !has(store, id));
  return { STOP, stop, has, missing };
})();
