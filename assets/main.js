// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Reveal-on-scroll animation
const els = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add("show");
  });
}, { threshold: 0.12 });
els.forEach(el => io.observe(el));

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
