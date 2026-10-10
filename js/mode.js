/**
 * Hacker <-> Recruiter view switch.
 * Persisted in localStorage; overridable with ?mode=recruiter in the URL,
 * so you can send recruiters a link that opens the clean view directly.
 */
import { $, toast } from './utils.js';

const KEY = 'portfolio-mode';
const MODES = ['hacker', 'recruiter'];

export function initMode({ onChange }) {
  const html = document.documentElement;
  const param = new URLSearchParams(location.search).get('mode');
  let mode = MODES.includes(param) ? param : (localStorage.getItem(KEY) || 'hacker');

  const apply = (next, { announce = false } = {}) => {
    mode = MODES.includes(next) ? next : 'hacker';
    html.dataset.mode = mode;
    localStorage.setItem(KEY, mode);
    $('#mode-switch')?.setAttribute('aria-checked', String(mode === 'recruiter'));
    $('meta[name="theme-color"]')?.setAttribute('content', mode === 'recruiter' ? '#f7f8fa' : '#050a0e');
    onChange?.(mode);
    if (announce) toast(mode === 'recruiter' ? 'Recruiter view: clean and printable.' : 'Hacker view: effects on.');
  };

  apply(mode);
  $('#mode-switch')?.addEventListener('click', () => apply(mode === 'hacker' ? 'recruiter' : 'hacker', { announce: true }));

  return { get: () => mode, set: (m) => apply(m, { announce: true }) };
}
