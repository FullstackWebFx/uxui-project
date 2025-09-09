/* Hide-on-scroll / show-on-scroll
   - додає клас .site-header--hidden при скролі вниз
   - додає .site-header--visible при скролі вгору або на початку сторінки
   - не ховає хедер, якщо в хедері активний фокус або мобільне меню відкрите
   - тротлінг через requestAnimationFrame для плавності
*/
(function () {
  const header = document.getElementById('site-header');
  if (!header) return;

  const mobileMenu = document.getElementById('mobile-menu'); // якщо є мобільне меню
  let lastY = window.scrollY || 0;
  let ticking = false;
  const DELTA = 12;           // мінімальний рух щоб спрацьовувало
  const TOP_THRESHOLD = 80;   // якщо ми близько до топу — показати хедер

  function isMenuOpen() {
    if (!mobileMenu) return false;
    return !mobileMenu.hasAttribute('hidden') && mobileMenu.getAttribute('aria-hidden') !== 'true';
  }

  function isHeaderFocused() {
    const active = document.activeElement;
    return active && header.contains(active);
  }

  function updateHeader() {
    const currentY = window.scrollY || 0;
    const dy = currentY - lastY;

    // якщо дуже мало руху — ігноруємо
    if (Math.abs(dy) < DELTA) {
      ticking = false;
      return;
    }

    // force visible: коли меню відкрите або фокус в хедері — не ховати
    if (isMenuOpen() || isHeaderFocused()) {
      header.classList.remove('site-header--hidden');
      header.classList.add('site-header--visible', 'site-header--force-visible');
      ticking = false;
      lastY = currentY;
      return;
    } else {
      header.classList.remove('site-header--force-visible');
    }

    if (currentY > lastY && currentY > TOP_THRESHOLD) {
      // скролимо вниз — ховаємо
      header.classList.add('site-header--hidden');
      header.classList.remove('site-header--visible');
    } else {
      // скролимо вгору — показуємо
      header.classList.remove('site-header--hidden');
      header.classList.add('site-header--visible');
    }

    // якщо на самому верху — точно показати
    if (currentY <= 8) {
      header.classList.remove('site-header--hidden');
      header.classList.add('site-header--visible');
    }

    lastY = currentY;
    ticking = false;
  }

  // прикріплюємо обробник скролу (passive for perf)
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  // також реагуємо на клавіатурні події (щоб показати хедер коли фокус перемістився туди)
  document.addEventListener('focusin', () => {
    if (isHeaderFocused() || isMenuOpen()) {
      header.classList.remove('site-header--hidden');
      header.classList.add('site-header--visible', 'site-header--force-visible');
    }
  });

  document.addEventListener('focusout', () => {
    // при втраті фокусу з хедера — прибрати force-visible (на наступному скролі лідером керує скрол)
    header.classList.remove('site-header--force-visible');
  });

  // на resize оновити lastY (щоб уникнути стрибків)
  window.addEventListener('resize', () => { lastY = window.scrollY || 0; }, { passive: true });

  // початковий стан: видимий
  header.classList.add('site-header--visible');
})();
