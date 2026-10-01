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
  const vv = window.visualViewport;
  const update = () => {
    const kb = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
    const was = document.documentElement.style.getPropertyValue('--kb');
    document.documentElement.style.setProperty('--kb', (kb > 80 ? kb : 0) + 'px');
    // клавиатура только что открылась — после подъёма шторки держим поле ввода в видимой зоне
    if (kb > 80 && (!was || was === '0px')) setTimeout(() => {
      const el = document.activeElement;
      if (el && el.closest && el.closest('.f-sheet')) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 280);
  };
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
  update();
}
