// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Reveal-on-scroll animation
(function initReveal() {
  // Auto-assign staggered delays to .reveal children of [data-stagger] containers
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    parent.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.transitionDelay = `${i * 90}ms`;
    });
  });

  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('show');
        io.unobserve(e.target);
        // Remove reveal class from .app cards after animation so hover uses their own transition
        if (e.target.classList.contains('app')) {
          setTimeout(() => e.target.classList.remove('reveal'), 800);
        }
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();

// Lightweight parallax for hero image (nice but subtle)
const hero = document.getElementById("heroMedia");
let raf = null;
window.addEventListener("mousemove", (ev) => {
  if (!hero) return;
  if (raf) cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const rect = hero.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (ev.clientX - cx) / rect.width;
    const dy = (ev.clientY - cy) / rect.height;
    hero.style.transform = `translate(${dx * 6}px, ${dy * 6}px)`;
  });
}, { passive: true });

window.addEventListener("mouseleave", () => {
  if (!hero) return;
  hero.style.transform = "translate(0px, 0px)";
});


// ===== Simple reviews rotation (no markup change) =====
/* const reviews = document.querySelectorAll('.micro-reviews .review');
const dots = document.querySelectorAll('.reviews-dots .dot');

let current = 0;
const delay = 6000;

function showReview(index){
  reviews.forEach((r,i) => {
    r.classList.toggle('is-active', i === index);
  });

  dots.forEach((d,i) => {
    d.classList.toggle('is-active', i === index);
  });

  current = index;
}

// init
showReview(0);

setInterval(() => {
  const next = (current + 1) % reviews.length;
  showReview(next);
}, delay);

// клики по точкам
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => showReview(i));
});
 */

// ===== Reviews rotation (supports multiple blocks) =====
const REVIEW_DELAY = 6000;

function initReviewSlider(root) {
  const reviews = root.querySelectorAll('.review');
  const dotsWrap = root.parentElement.querySelector('.reviews-dots') || root.querySelector('.reviews-dots');
  const dots = dotsWrap ? dotsWrap.querySelectorAll('.dot') : [];

  if (!reviews.length) return;

  let current = 0;
  let timer = null;

  function showReview(index) {
    reviews.forEach((r, i) => r.classList.toggle('is-active', i === index));
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === index);
      // сброс анимации прогресса (чтобы стартовала заново)
      d.classList.remove('is-animating');
      void d.offsetWidth; // reflow
      d.classList.add('is-animating');
    });
    current = index;
  }

  function start() {
    stop();
    timer = setInterval(() => {
      showReview((current + 1) % reviews.length);
    }, REVIEW_DELAY);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // init
  showReview(0);
  start();

  // click dots
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showReview(i);
      start(); // перезапускаем таймер после ручного клика
    });
  });

  // pause on hover (приятно, когда читаешь длинный отзыв)
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
}

// инициализируем все блоки с отзывами на странице
document.querySelectorAll('.micro-reviews').forEach(initReviewSlider);

// ===== Reviews Carousel (3D-style, 5 cards) =====
function initReviewsCarousel() {
  const track = document.getElementById('reviewsCarousel');
  if (!track) return;

  const cards = [...track.querySelectorAll('.r-card')];
  const dots  = [...document.querySelectorAll('.carousel-dots-row .cdot')];
  const total = cards.length;
  let active = 0;
  let timer  = null;
  const DELAY = 3000;

  function goTo(index) {
    active = ((index % total) + total) % total;

    cards.forEach((card, i) => {
      let newOffset = i - active;
      // нормализуем offset в диапазон [-floor(n/2), floor(n/2)]
      if (newOffset >  Math.floor(total / 2)) newOffset -= total;
      if (newOffset < -Math.floor(total / 2)) newOffset += total;

      const oldOffset = parseInt(card.dataset.offset ?? '99');
      const jump = Math.abs(newOffset - oldOffset);

      if (jump > 2) {
        // Карточка "телепортируется" — убираем анимацию, чтобы не скакала через экран
        card.style.transition = 'none';
        card.dataset.offset = newOffset;
        void card.offsetWidth; // reflow
        requestAnimationFrame(() => { card.style.transition = ''; });
      } else {
        card.dataset.offset = newOffset;
      }
    });

    dots.forEach((dot, i) => {
      const isActive = i === active;
      // сброс и перезапуск анимации прогресса
      dot.classList.remove('cdot-active');
      void dot.offsetWidth; // reflow
      if (isActive) dot.classList.add('cdot-active');
    });
  }

  function next() { goTo(active + 1); }
  function prev() { goTo(active - 1); }

  function startTimer() {
    stopTimer();
    timer = setInterval(next, DELAY);
  }

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  // Кнопки со стрелками
  document.querySelector('.carousel-prev')
    ?.addEventListener('click', () => { prev(); startTimer(); });
  document.querySelector('.carousel-next')
    ?.addEventListener('click', () => { next(); startTimer(); });

  // Точки-индикаторы
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startTimer(); });
  });

  // Пауза при наведении (удобно читать)
  track.addEventListener('mouseenter', stopTimer);
  track.addEventListener('mouseleave', startTimer);

  // Свайп на тачскринах
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? next() : prev();
      startTimer();
    }
  }, { passive: true });

  // Клик по боковым карточкам — переход к ней
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (i !== active) { goTo(i); startTimer(); }
    });
  });

  goTo(0);
  startTimer();
}

initReviewsCarousel();
