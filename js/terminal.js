/**
 * In-page terminal. Commands are data-driven from the loaded content.
 * Open with the nav button, the hero button, or the ` key.
 */
import { $, esc, fmtDate, toast } from './utils.js';

export function createTerminal({ content, mode, matrix, onParty }) {
  const root = $('#terminal');
  const out = $('#terminal-out');
  const form = $('#terminal-form');
  const input = $('#terminal-input');
  const { profile, skills, experience, projects, certifications, education } = content;

  const history = [];
  let histPos = 0;
  let sudoAttempts = 0;

  /* ---------- Output helpers ---------- */
  const print = (html, cls = '') => {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.innerHTML = html;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
  };
  const line = (text, cls) => print(esc(text), cls);
  const head = (text) => print(`<span class="t-head">${esc(text)}</span>`);
  const link = (url, label = url) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`;
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) { el.scrollIntoView({ behavior: 'smooth' }); return true; } return false; };

  /* ---------- Commands ---------- */
  const commands = {
    help: {
      desc: 'List available commands',
      run() {
        head('Available commands');
        Object.entries(commands)
          .filter(([, c]) => !c.hidden)
          .forEach(([name, c]) => print(`  <span class="t-cmd">${name.padEnd(12)}</span><span class="t-dim">${esc(c.desc)}</span>`));
        line('');
        line('Tip: Tab autocompletes, ↑/↓ browse history, Esc closes.', 't-dim');
      },
    },
    whoami: { desc: 'Who is this person?', run() { line(`${profile.name} — ${profile.title}`); line(profile.tagline, 't-dim'); } },
    about: {
      desc: 'Short bio',
      run() { head(profile.name); profile.bio.forEach((p) => line(p)); line(`📍 ${profile.location} · ${profile.availability}`, 't-dim'); },
    },
    skills: {
      desc: 'Skill summary by category',
      run() {
        skills.categories.forEach((cat) => {
          head(cat.name);
          cat.skills.forEach((s) => {
            const filled = Math.round((s.level || 0) / 10);
            print(`  ${esc(s.name.padEnd(36))} <span class="t-cmd">${'█'.repeat(filled)}</span><span class="t-dim">${'░'.repeat(10 - filled)}</span> ${s.level}%`);
          });
        });
      },
    },
    experience: {
      desc: 'Work history',
      run() {
        experience.forEach((x) => {
          head(`${x.role} @ ${x.company}`);
          line(`${fmtDate(x.start)} – ${fmtDate(x.end)} · ${x.location || ''}`, 't-dim');
          (x.bullets || []).forEach((b) => line(`  • ${b}`));
        });
      },
    },
    projects: {
      desc: 'Projects with links',
      run() {
        if (!projects.length) return line('No projects listed. Check out `certs` instead.', 't-dim');
        projects.forEach((p) => {
          head(`${p.name}${p.featured ? ' ★' : ''}`);
          line(`  ${p.description}`);
          line(`  stack: ${(p.tech || []).join(', ')}`, 't-dim');
          if (p.repo) print(`  repo: ${link(p.repo)}`);
          if (p.demo) print(`  demo: ${link(p.demo)}`);
        });
      },
    },
    certs: {
      desc: 'Certifications',
      run() {
        if (!certifications.length) return line('No certifications listed yet.', 't-dim');
        certifications.forEach((c) => {
          head(c.title);
          line(`  ${c.issuer}${c.issued ? ` · issued ${fmtDate(c.issued)}` : ''}${c.expires ? ` · expires ${fmtDate(c.expires)}` : ''}${c.status === 'exam-passed' ? ' · exam passed' : ''}`, 't-dim');
          if (c.note) line(`  ${c.note}`, 't-dim');
          if (c.credentialId) line(`  id: ${c.credentialId}`, 't-dim');
          if (c.verifyUrl) print(`  verify: ${link(c.verifyUrl)}`);
        });
      },
    },
    education: {
      desc: 'Education',
      run() { education.forEach((e) => { head(`${e.degree}, ${e.field}`); line(`  ${e.school} · ${e.start} – ${e.end || 'Present'}`, 't-dim'); }); },
    },
    contact: {
      desc: 'How to reach me',
      run() {
        head('Contact');
        print(`  email: ${link(`mailto:${profile.email}`, profile.email)}`);
        profile.links.forEach((l) => print(`  ${esc(l.label.toLowerCase().padEnd(10))} ${link(l.url)}`));
      },
    },
    resume: {
      desc: 'Open my résumé (PDF)',
      run() {
        if (!profile.hasResume) return line('No résumé uploaded yet. Use the recruiter view and print this page instead (Ctrl+P).', 't-dim');
        window.open(profile.resume, '_blank', 'noopener');
        line('Opening résumé…', 't-dim');
      },
    },
    open: {
      desc: 'open <section> — scroll to a section',
      run(args) {
        const id = (args[0] || '').toLowerCase();
        if (!id) return line('usage: open <about|skills|experience|projects|certifications|education|contact>', 't-dim');
        scrollTo(id) ? line(`→ ${id}`, 't-dim') : line(`no such section: ${id}`, 't-err');
      },
    },
    ls: {
      desc: 'List sections (and some files)',
      run() { print(['about/', 'skills/', 'experience/', projects.length ? 'projects/' : null, 'certifications/', 'education/', 'contact/', 'resume.pdf', 'secrets.txt'].filter(Boolean).map((f) => `<span class="${f.endsWith('/') ? 't-cmd' : ''}">${f}</span>`).join('  ')); },
    },
    cat: {
      desc: 'cat <file> — read a file',
      run(args) {
        const f = args[0] || '';
        if (f === 'secrets.txt') return line('cat: secrets.txt: Permission denied. Nice try though. 😉', 't-err');
        if (f === 'resume.pdf') return commands.resume.run();
        if (f.replace(/\/$/, '') in commands) return commands[f.replace(/\/$/, '')].run([]);
        line(`cat: ${f || '<file>'}: No such file or directory`, 't-err');
      },
    },
    mode: {
      desc: 'mode <hacker|recruiter> — switch the view',
      run(args) {
        const m = args[0];
        if (!m) return line(`current mode: ${mode.get()}`, 't-dim');
        if (!['hacker', 'recruiter'].includes(m)) return line('usage: mode hacker | mode recruiter', 't-err');
        mode.set(m);
        line(`mode set to ${m}`, 't-dim');
      },
    },
    matrix: { desc: 'Toggle the matrix background', run() { line(matrix.toggle() ? 'matrix: on' : 'matrix: off', 't-dim'); } },
    fortune: { desc: 'A random fact about me', run() { const f = profile.funFacts || []; line(f.length ? f[Math.floor(Math.random() * f.length)] : 'No fortunes configured.'); } },
    date: { desc: 'Current date and time', run() { line(new Date().toString()); } },
    echo: { desc: 'echo <text>', run(args) { line(args.join(' ')); } },
    history: { desc: 'Command history', run() { history.forEach((h, i) => line(`${String(i + 1).padStart(4)}  ${h}`, 't-dim')); } },
    clear: { desc: 'Clear the screen', run() { out.innerHTML = ''; } },
    exit: { desc: 'Close the terminal', run() { close(); } },
    banner: {
      desc: 'Print the banner',
      run() {
        print(`<span class="t-cmd">${esc([
          ' _       __     __                         ',
          '| |     / /__  / /________  ____ ___  ___ ',
          '| | /| / / _ \\/ / ___/ __ \\/ __ `__ \\/ _ \\',
          '| |/ |/ /  __/ / /__/ /_/ / / / / / /  __/',
          '|__/|__/\\___/_/\\___/\\____/_/ /_/ /_/\\___/ ',
        ].join('\n'))}</span>`);
        line(`${profile.name} · ${profile.title}`, 't-dim');
        line("Type 'help' to get started.", 't-dim');
      },
    },
    /* hidden easter eggs */
    sudo: {
      hidden: true,
      run(args) {
        if (args.join(' ').replace(/^-\w+\s*/, '') === 'hire me' || args.join(' ') === 'hire-me') {
          head('✔ Request approved.');
          print(`Great choice. Email me at ${link(`mailto:${profile.email}`, profile.email)} and let's talk.`);
          return;
        }
        sudoAttempts++;
        line(sudoAttempts < 3 ? `${profile.handle} is not in the sudoers file. This incident will be reported.` : 'Seriously, stop. The admin has been notified. 👀', 't-err');
      },
    },
    hire: { hidden: true, run() { commands.sudo.run(['hire', 'me']); } },
    rm: { hidden: true, run() { line("rm: refusing to delete the portfolio. It's the only copy.", 't-err'); } },
    party: { hidden: true, run() { onParty?.(); } },
    konami: { hidden: true, run() { onParty?.(); } },
    hack: {
      hidden: true,
      run() {
        const steps = ['Initialising exploit…', 'Bypassing firewall… 0%', 'Bypassing firewall… 48%', 'Bypassing firewall… 100%', 'Dumping credentials…', 'Just kidding. This is a portfolio, not a target. 🙂'];
        steps.forEach((s, i) => setTimeout(() => line(s, i === steps.length - 1 ? 't-cmd' : 't-dim'), i * 450));
      },
    },
    pwd: { hidden: true, run() { line('/home/joshua/portfolio'); } },
    uname: { hidden: true, run() { line('PortfolioOS 1.0.0 x86_64 GNU/Linux'); } },
    neofetch: { hidden: true, run() { commands.banner.run(); commands.whoami.run(); } },
  };

  /* ---------- Input handling ---------- */
  function exec(raw) {
    const text = raw.trim();
    print(`<span class="t-dim">joshua@portfolio:~$</span> <span class="t-cmd">${esc(text)}</span>`);
    if (!text) return;
    history.push(text);
    histPos = history.length;
    const [name, ...args] = text.split(/\s+/);
    const cmd = commands[name.toLowerCase()];
    if (cmd) cmd.run(args);
    else line(`${name}: command not found. Type 'help' for a list of commands.`, 't-err');
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); exec(input.value); input.value = ''; });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); if (histPos > 0) input.value = history[--histPos] || ''; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); histPos = Math.min(history.length, histPos + 1); input.value = history[histPos] || ''; }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const match = Object.keys(commands).filter((c) => !commands[c].hidden && c.startsWith(input.value.toLowerCase()));
      if (match.length === 1) input.value = `${match[0]} `;
      else if (match.length > 1) line(match.join('  '), 't-dim');
    } else if (e.key === 'Escape') close();
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); commands.clear.run(); }
  });

  /* ---------- Open / close ---------- */
  let booted = false;
  function open() {
    root.hidden = false;
    requestAnimationFrame(() => root.classList.add('is-open'));
    if (!booted) { booted = true; commands.banner.run(); }
    input.focus();
    $('#terminal-toggle')?.setAttribute('aria-expanded', 'true');
  }
  function close() {
    root.classList.remove('is-open');
    $('#terminal-toggle')?.setAttribute('aria-expanded', 'false');
    setTimeout(() => { root.hidden = true; }, 300);
  }
  function toggle() { root.hidden || !root.classList.contains('is-open') ? open() : close(); }

  $('#terminal-toggle')?.addEventListener('click', toggle);
  $('#hero-terminal')?.addEventListener('click', open);
  $('#terminal-close')?.addEventListener('click', close);
  window.addEventListener('keydown', (e) => {
    const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
    if (e.key === '`' && !typing) { e.preventDefault(); toggle(); }
  });
  root.hidden = true;

  return { open, close, toggle, exec };
}
