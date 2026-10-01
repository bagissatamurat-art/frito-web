// Отмечает загруженные картинки, чтобы убрать скелетон (см. img[data-skel] в frito.css)
document.addEventListener('load', e => { if (e.target.tagName === 'IMG') e.target.classList.add('is-loaded'); }, true);
document.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.classList.add('is-loaded'); }, true);

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
