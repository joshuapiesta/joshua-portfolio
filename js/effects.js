/**
 * Visual effects and page behaviour: boot screen, typewriter, scroll reveal,
 * active nav highlighting, mobile menu, counters, lightbox, Konami code.
 */
import { $, $$, prefersReducedMotion, toast } from './utils.js';

/* ---------- Boot sequence (once per browser session) ---------- */
export function runBoot(name) {
  const boot = $('#boot');
  const log = $('#boot-log');
  if (!boot) return Promise.resolve();
  const seen = sessionStorage.getItem('boot-seen');
  const recruiter = document.documentElement.dataset.mode === 'recruiter';
  if (seen || recruiter || prefersReducedMotion()) { boot.hidden = true; return Promise.resolve(); }

  const lines = [
    '[ OK ] Initialising portfolio kernel',
    '[ OK ] Mounting /content',
    '[ OK ] Loading modules: skills, projects, certs',
    '[ OK ] Starting matrix daemon',
    '[ OK ] Scanning for vulnerabilities... none found',
    `[ OK ] Welcome, visitor. Opening ${name}'s portfolio`,
    '',
    'ACCESS GRANTED',
  ];

  return new Promise((resolve) => {
    let i = 0;
    let done = false;
    const finish = (e) => {
      if (done) return;
      if (e?.type === 'keydown') e.preventDefault(); // don't let the skip key scroll the page
      done = true;
      sessionStorage.setItem('boot-seen', '1');
      boot.classList.add('is-done');
      setTimeout(() => { boot.hidden = true; resolve(); }, 400);
      window.removeEventListener('keydown', finish);
      boot.removeEventListener('click', finish);
    };
    window.addEventListener('keydown', finish);
    boot.addEventListener('click', finish);
    const tick = () => {
      if (done) return;
      if (i < lines.length) {
        log.textContent += (i ? '\n' : '') + lines[i++];
        setTimeout(tick, i === lines.length ? 500 : 140 + Math.random() * 120);
      } else finish();
    };
    tick();
  });
}

/* ---------- Typewriter ---------- */
export function typewriter(el, text, speed = 55) {
  if (!el) return;
  if (prefersReducedMotion()) { el.textContent = text; return; }
  el.textContent = '';
  let i = 0;
  const step = () => {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(step, speed + Math.random() * 40);
  };
  step();
}

/* ---------- Scroll reveal + animated counters ---------- */
export function initReveal() {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-visible');
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(e.target);
    }
  }, { threshold: 0.15 });
  $$('.reveal, .stats').forEach((el) => io.observe(el));
}

function countUp(el) {
  const target = el.dataset.count;
  const n = parseInt(target, 10);
  if (Number.isNaN(n) || prefersReducedMotion()) return;
  const suffix = target.replace(/^\d+/, '');
  const start = performance.now();
  const dur = 900;
  const frame = (t) => {
    const p = Math.min(1, (t - start) / dur);
    el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* ---------- Navigation ---------- */
export function initNav() {
  const toggle = $('#nav-toggle');
  const links = $('#nav-links');
  toggle?.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links?.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') { links.classList.remove('is-open'); toggle?.setAttribute('aria-expanded', 'false'); }
  });

  // Highlight the section currently in view.
  const navAnchors = $$('#nav-links a[href^="#"]');
  const sections = navAnchors.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navAnchors.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach((s) => io.observe(s));
}

/* ---------- Lightbox ---------- */
export function initLightbox() {
  const box = $('#lightbox');
  const img = $('#lightbox-img');
  const cap = $('#lightbox-caption');
  const close = () => { box.hidden = true; img.src = ''; };
  $('#lightbox-close').addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) close(); });
  return {
    open(src, caption) { img.src = src; img.alt = caption; cap.textContent = caption; box.hidden = false; $('#lightbox-close').focus(); },
    close,
  };
}

/* ---------- Uptime counter in the hero status card ---------- */
export function initUptime(sinceIso) {
  const el = $('#uptime');
  if (!el) return;
  const since = new Date(sinceIso).getTime();
  const tick = () => {
    const s = Math.max(0, Math.floor((Date.now() - since) / 1000));
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    el.textContent = `${d}d ${h}h ${m}m`;
  };
  tick();
  setInterval(tick, 30_000);
}

/* ---------- Konami code easter egg ---------- */
export function initKonami(onUnlock) {
  const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let pos = 0;
  window.addEventListener('keydown', (e) => {
    pos = e.key === seq[pos] ? pos + 1 : (e.key === seq[0] ? 1 : 0);
    if (pos === seq.length) { pos = 0; onUnlock(); }
  });
}

export function partyMode() {
  const html = document.documentElement;
  const on = html.classList.toggle('party');
  toast(on ? '🎉 party mode unlocked. You found the Konami code.' : 'party mode off');
  if (on) setTimeout(() => html.classList.remove('party'), 8000);
}
