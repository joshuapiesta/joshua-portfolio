/**
 * Small shared helpers. No framework, no dependencies.
 */

/** Escape a string for safe insertion into HTML. Always use this for content from JSON. */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Shorthand for document.querySelector. */
export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/** Format "YYYY-MM" or "YYYY" into "Mon YYYY" / "YYYY". Null means "Present". */
export function fmtDate(value, nullLabel = 'Present') {
  if (!value) return nullLabel;
  const [y, m] = String(value).split('-');
  if (!m) return y;
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString('en', { month: 'short', year: 'numeric' });
}

/** Months between a "YYYY-MM" date and now (or another date). */
export function monthsBetween(from, to = new Date()) {
  const [fy, fm = 1] = String(from).split('-').map(Number);
  const months = (to.getFullYear() - fy) * 12 + (to.getMonth() + 1 - fm);
  return Math.max(0, months);
}

/** "1 yr 3 mos" style duration. */
export function fmtDuration(start, end) {
  const endDate = end ? new Date(Number(end.split('-')[0]), Number(end.split('-')[1] || 1) - 1, 1) : new Date();
  const total = monthsBetween(start, endDate) + 1;
  const y = Math.floor(total / 12);
  const m = total % 12;
  const parts = [];
  if (y) parts.push(`${y} yr${y > 1 ? 's' : ''}`);
  if (m) parts.push(`${m} mo${m > 1 ? 's' : ''}`);
  return parts.join(' ') || '1 mo';
}

/** Returns "active" | "expiring" | "expired" for a certification expiry date. */
export function certStatus(expires) {
  if (!expires) return 'active';
  const [y, m = 12] = String(expires).split('-').map(Number);
  const exp = new Date(y, m, 0); // last day of month
  const now = new Date();
  if (exp < now) return 'expired';
  const soon = new Date(); soon.setMonth(soon.getMonth() + 3);
  return exp < soon ? 'expiring' : 'active';
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Show a short toast message. */
let toastTimer;
export function toast(message, ms = 2400) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), ms);
}

/** Inline SVG icons used in links and skill group headers. */
export const ICONS = {
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 20.4h-3.5v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.1 2.1 2.1 0 0 1 0 4.1zM7.1 20.4H3.6V9h3.5v11.4zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4h20v16H2zM4 6v.5l8 5 8-5V6zm0 2.8V18h16V8.8l-8 5z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.2 2h3.4l-7.4 8.5L23 22h-6.8l-5.3-7-6.1 7H1.4l7.9-9.1L1 2h7l4.8 6.4L18.2 2zm-1.2 18h1.9L7.1 3.9H5.1L17 20z"/></svg>',
  website: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 9h-3a15 15 0 0 0-1.3-5.4A8 8 0 0 1 18.9 11zM12 4c.9 1.3 1.6 3.9 1.9 7h-3.8c.3-3.1 1-5.7 1.9-7zM5.1 13h3a15 15 0 0 0 1.3 5.4A8 8 0 0 1 5.1 13zm3-2h-3a8 8 0 0 1 4.3-5.4A15 15 0 0 0 8.1 11zM12 20c-.9-1.3-1.6-3.9-1.9-7h3.8c-.3 3.1-1 5.7-1.9 7zm2.6-1.6a15 15 0 0 0 1.3-5.4h3a8 8 0 0 1-4.3 5.4z"/></svg>',
  hackerrank: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0 1.6 6v12L12 24l10.4-6V6zM9 7h1.5v4h3V7H15v10h-1.5v-4.5h-3V17H9z"/></svg>',
  tryhackme: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v2h3v14H5V6h3zm2 2h4V5h-4zm-3 4v8h10v-8zm2 2h6v4H9z"/></svg>',
  code: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>',
  server: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="6" rx="1"/><rect x="3" y="14" width="18" height="6" rx="1"/><path d="M7 7h.01M7 17h.01"/></svg>',
  shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>',
  terminal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 17 6-6-6-6M12 19h8"/></svg>',
  sword: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
  cpu: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>',
  users: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
};

export const icon = (name) => ICONS[name] || ICONS.website;
