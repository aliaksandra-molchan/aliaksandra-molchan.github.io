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
