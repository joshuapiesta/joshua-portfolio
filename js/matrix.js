/**
 * Matrix-style falling characters on a fixed canvas.
 * Pauses when the tab is hidden, when reduced motion is requested, or in recruiter mode.
 */
import { prefersReducedMotion } from './utils.js';

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/\\{}[]$#@';

export function createMatrix(canvas) {
  const ctx = canvas.getContext('2d');
  let columns = [];
  let fontSize = 16;
  let raf = null;
  let lastTick = 0;
  let enabled = !prefersReducedMotion();

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fontSize = window.innerWidth < 600 ? 13 : 16;
    const count = Math.ceil(window.innerWidth / fontSize);
    columns = Array.from({ length: count }, () => Math.random() * -50);
    ctx.fillStyle = '#050a0e';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  function frame(ts) {
    raf = requestAnimationFrame(frame);
    if (ts - lastTick < 50) return; // ~20 fps is plenty and saves battery
    lastTick = ts;

    ctx.fillStyle = 'rgba(5, 10, 14, 0.12)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

    for (let i = 0; i < columns.length; i++) {
      const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      const x = i * fontSize;
      const y = columns[i] * fontSize;
      ctx.fillStyle = Math.random() > 0.97 ? '#d6fff0' : '#00ff9c';
      ctx.fillText(ch, x, y);
      if (y > window.innerHeight && Math.random() > 0.975) columns[i] = 0;
      columns[i] += 1;
    }
  }

  function start() {
    if (!enabled || raf) return;
    canvas.hidden = false;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  resize();

  return {
    start,
    stop,
    toggle() { enabled = !enabled; enabled ? start() : (stop(), ctx.clearRect(0, 0, canvas.width, canvas.height)); return enabled; },
    get running() { return !!raf; },
  };
}
