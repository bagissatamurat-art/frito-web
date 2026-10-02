// Аналитика Frito: Google Tag Manager, Google Analytics 4, Яндекс.Метрика, Meta (Facebook) Pixel.
// ▸ Впишите ID в CFG — пустой ID = система не подключается. Пока все пустые, сайт ничего не грузит и баннер не показывает.
// ▸ Если GA4 и Pixel настроены ВНУТРИ контейнера GTM — оставьте ga4 и fbPixel пустыми, иначе события задвоятся.
// ▸ События сайта: FritoAnalytics.track(имя, параметры) — уходят в dataLayer (для GTM), GA4, Метрику (цели + e-commerce) и Pixel.
//   Список: view_item, add_to_cart, remove_from_cart, select_method, begin_checkout, add_payment_info, purchase,
//   login, generate_lead, contact (клик по WhatsApp / почте / Telegram — ловится автоматически).
// ▸ requireConsent: true — счётчики запускаются только после «Принять» в баннере cookie (выбор хранится в localStorage.frito_consent).
window.FritoAnalytics = (() => {
  const CFG = {
    gtm: '',        // 'GTM-XXXXXXX'
    ga4: '',        // 'G-XXXXXXXXXX'
    ym: '',         // номер счётчика Метрики, например '98765432'
    fbPixel: '',    // ID пикселя Meta, например '1234567890123456'
    requireConsent: true,
    currency: 'KZT',
  };
  const any = CFG.gtm || CFG.ga4 || CFG.ym || CFG.fbPixel;
  window.dataLayer = window.dataLayer || [];
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const consent = () => !CFG.requireConsent || get('frito_consent') === 'all';
  let started = false;
  const script = (src, attrs = {}) => { const s = document.createElement('script'); s.async = true; s.src = src; Object.assign(s, attrs); document.head.appendChild(s); };

  function start() {
    if (started || !any || !consent()) return; started = true;
    if (CFG.gtm) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      script('https://www.googletagmanager.com/gtm.js?id=' + CFG.gtm);
    }
    if (CFG.ga4) {
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      gtag('js', new Date()); gtag('config', CFG.ga4, { currency: CFG.currency });
      script('https://www.googletagmanager.com/gtag/js?id=' + CFG.ga4);
    }
    if (CFG.ym) {
      window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); }; window.ym.l = Date.now();
      script('https://mc.yandex.ru/metrika/tag.js');
      ym(+CFG.ym, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true, ecommerce: 'dataLayer' });
    }
    if (CFG.fbPixel) {
      const f = window.fbq = window.fbq || function () { f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments); };
      if (!window._fbq) window._fbq = f; f.push = f; f.loaded = true; f.version = '2.0'; f.queue = f.queue || [];
      script('https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', CFG.fbPixel); fbq('track', 'PageView');
    }
  }

  // ---- события ----
  // товар: { id, name, price, qty, category } → формат GA4 / Метрики / Pixel
  const ga = it => ({ item_id: it.id, item_name: it.name, item_category: it.category || '', price: it.price, quantity: it.qty || 1 });
  const ymp = it => ({ id: it.id, name: it.name, category: it.category || '', price: it.price, quantity: it.qty || 1 });
  const value = items => items.reduce((a, it) => a + (it.price || 0) * (it.qty || 1), 0);
  const FB = { view_item: 'ViewContent', add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', add_payment_info: 'AddPaymentInfo',
    purchase: 'Purchase', generate_lead: 'Lead', login: 'CompleteRegistration', contact: 'Contact' };
  const YM_EC = { view_item: 'detail', add_to_cart: 'add', remove_from_cart: 'remove', purchase: 'purchase' };

  function track(name, p = {}) {
    const items = (p.items || []).map(ga), val = p.value ?? value(p.items || []);
    const params = { ...p, ...(p.items ? { items, value: val, currency: CFG.currency } : {}) };
    // dataLayer — для GTM и e-commerce Метрики (пишется всегда, наружу уходит только после запуска счётчиков)
    if (p.items) window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({ event: name, ...(p.items ? { ecommerce: { items, value: val, currency: CFG.currency, ...(p.transaction_id ? { transaction_id: p.transaction_id } : {}) } } : {}), ...Object.fromEntries(Object.entries(p).filter(([k]) => k !== 'items')) });
    if (YM_EC[name] && p.items) {
      const ec = { products: p.items.map(ymp) }; if (name === 'purchase') ec.actionField = { id: p.transaction_id, revenue: val };
      window.dataLayer.push({ ecommerce: { currencyCode: CFG.currency, [YM_EC[name]]: ec } });
    }
    if (!started) return;
    if (CFG.ga4 && window.gtag) gtag('event', name, params);
    if (CFG.ym && window.ym) ym(+CFG.ym, 'reachGoal', name, params);
    if (CFG.fbPixel && window.fbq) {
      const ev = FB[name], data = p.items ? { value: val, currency: CFG.currency, content_type: 'product', content_ids: p.items.map(i => i.id), contents: p.items.map(i => ({ id: i.id, quantity: i.qty || 1 })) } : {};
      ev ? fbq('track', ev, data) : fbq('trackCustom', name, { ...data, ...p, items: undefined });
    }
  }

  // покупка: оформление кладёт заказ в sessionStorage.frito_purchase, событие отправляется на странице «Заказ оформлен» один раз
  function purchaseFromSession() {
    let o = null; try { o = JSON.parse(sessionStorage.getItem('frito_purchase')); sessionStorage.removeItem('frito_purchase'); } catch (e) {}
    if (o && o.items) track('purchase', o);
  }

  // клики по контактам — автоматически
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    const h = a.getAttribute('href') || '';
    const ch = /wa\.me|whatsapp/.test(h) ? 'whatsapp' : /^mailto:/.test(h) ? 'email' : /t\.me\//.test(h) ? 'telegram' : /instagram\.com/.test(h) ? 'instagram' : /tiktok\.com/.test(h) ? 'tiktok' : '';
    if (ch) track('contact', { channel: ch, page: location.pathname.split('/').pop() });
  }, true);

  // ---- баннер cookie ----
  function banner() {
    if (!any || !CFG.requireConsent || get('frito_consent')) return;
    const b = document.createElement('div');
    b.className = 'f-consent'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Cookie');
    b.innerHTML = '<p class="f-consent__text">Мы используем cookie и сервисы аналитики, чтобы сайт работал удобнее. Подробнее — в <a href="privacy.dc.html#cookies">политике конфиденциальности</a>.</p>'
      + '<div class="f-consent__actions"><button type="button" class="f-btn f-btn--md f-btn--secondary" data-c="necessary">Только необходимые</button><button type="button" class="f-btn f-btn--md f-btn--primary" data-c="all">Принять</button></div>';
    b.addEventListener('click', e => { const v = e.target.getAttribute && e.target.getAttribute('data-c'); if (!v) return; set('frito_consent', v); b.remove(); if (v === 'all') { start(); } });
    document.body.appendChild(b);
  }

  start();
  const ready = () => { banner(); purchaseFromSession(); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', ready) : ready();
  return { track, config: CFG, consent: v => { set('frito_consent', v); if (v === 'all') start(); } };
})();
