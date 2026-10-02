// Язык интерфейса: ru (по умолчанию) | kk. Тексты сайта написаны на русском; для казахского
// словарь RU→KK (frito-i18n-kk.js) подменяет их прямо в DOM — статичные и динамические (в т.ч. после перерисовки).
// Переключение — FritoI18n.set('kk'|'ru') (сохраняется в localStorage.frito_lang, страница перезагружается).
(() => {
  let lang = 'ru';
  try { lang = localStorage.getItem('frito_lang') === 'kk' ? 'kk' : 'ru'; } catch (e) {}
  document.documentElement.lang = lang;
  window.FritoI18n = {
    lang,
    set(l) { try { localStorage.setItem('frito_lang', l); } catch (e) {} location.reload(); },
  };
  if (lang !== 'kk') return;
  // словарь грузим только для казахского — русская версия ничего лишнего не скачивает.
  // Пока словарь не пришёл, страницу не показываем (без мелькания русского текста), но не дольше 1,5 с.
  const root = document.documentElement;
  root.classList.add('i18n-wait');
  const reveal = () => root.classList.remove('i18n-wait');
  setTimeout(reveal, 1500);
  const sc = document.createElement('script');
  sc.src = './frito-i18n-kk.js';
  let dictReady = false, domReady = document.readyState !== 'loading';
  const go = () => { if (dictReady && domReady) { start(); reveal(); } };
  sc.onload = () => { dictReady = true; go(); }; sc.onerror = reveal;
  document.head.appendChild(sc);
  if (!domReady) document.addEventListener('DOMContentLoaded', () => { domReady = true; go(); });
  function start() {
    const DICT = window.FRITO_KK || {}, RULES = window.FRITO_KK_RULES || [];
    const exact = new Map(Object.entries(DICT).map(([k, v]) => [k.trim(), v.trim()]));
    // фразы для замены внутри составных строк («Заказ №4821 · доставка»): длинные первыми, по границам слов
    const phrases = Object.keys(DICT).map(k => k.trim()).filter(k => k.length >= 3 && /[А-Яа-яЁё]/.test(k)).sort((a, b) => b.length - a.length);
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = phrases.length ? new RegExp('(?<![А-Яа-яЁёA-Za-z])(' + phrases.map(esc).join('|') + ')(?![А-Яа-яЁёA-Za-z])', 'g') : null;
    const done = new WeakMap(); // узел → последнее наше значение (чтобы не переводить уже переведённое)
    const tr = s => {
      if (!s || !/[А-Яа-яЁё]/.test(s)) return s;
      const t = s.trim(), hit = exact.get(t);
      if (hit != null) return s.replace(t, hit);
      for (const [rx, to] of RULES) s = s.replace(rx, to);
      return re ? s.replace(re, m => exact.get(m) ?? m) : s;
    };
    const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };
    const ATTRS = ['placeholder', 'aria-label', 'alt', 'title'];
    const text = n => { const p = n.parentNode; if (!p || SKIP[p.nodeName] || done.get(n) === n.nodeValue || (p.closest && p.closest('[data-no-i18n]'))) return; const v = tr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; done.set(n, n.nodeValue); };
    const attrs = el => { for (const a of ATTRS) { const v = el.getAttribute && el.getAttribute(a); if (v && /[А-Яа-яЁё]/.test(v)) { const t = tr(v); if (t !== v) el.setAttribute(a, t); } } };
    const walk = root => {
      if (root.nodeType === 3) return text(root);
      if (root.nodeType !== 1 || SKIP[root.nodeName]) return;
      attrs(root);
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      for (let n = w.nextNode(); n; n = w.nextNode()) n.nodeType === 3 ? text(n) : attrs(n);
    };
    new MutationObserver(ms => {
      for (const m of ms) {
        if (m.type === 'characterData') text(m.target);
        else if (m.type === 'attributes') attrs(m.target);
        else m.addedNodes.forEach(walk);
      }
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    walk(document.documentElement);
    document.title = tr(document.title);
  }
})();
