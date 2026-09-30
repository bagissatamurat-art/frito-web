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
