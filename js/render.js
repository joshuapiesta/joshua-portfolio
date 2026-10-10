/**
 * Renders every section from the loaded content.
 * Each function is pure-ish: takes data, writes HTML into a container.
 */
import { $, esc, fmtDate, fmtDuration, certStatus, icon } from './utils.js';

const tags = (list = [], cls = 'tag') => list.map((t) => `<span class="${cls}">${esc(t)}</span>`).join('');

/* ---------- Profile / hero / about / contact ---------- */
export function renderProfile(profile, certCount) {
  document.title = `${profile.name} — Portfolio`;
  $$bind('name', profile.name);
  $$bind('handle', profile.handle);
  $$bind('tagline', profile.tagline);
  $('.hero__name')?.setAttribute('data-text', profile.name);

  $('#avatar').src = profile.avatar || 'assets/img/avatar.svg';
  $('#avatar').alt = `${profile.name} avatar`;
  $('#resume-link').href = profile.resume || '#';
  $('#resume-link').hidden = !profile.hasResume;
  $('#contact-email').href = `mailto:${profile.email}`;
  $('#year').textContent = new Date().getFullYear();

  // Meta tags + JSON-LD for search engines and link previews.
  setMeta('name', 'description', profile.seo?.description);
  setMeta('name', 'keywords', (profile.seo?.keywords || []).join(', '));
  setMeta('property', 'og:title', `${profile.name} — ${profile.title}`);
  setMeta('property', 'og:description', profile.seo?.description);
  if (profile.siteUrl) setMeta('property', 'og:url', profile.siteUrl);
  $('#jsonld').textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    email: profile.email,
    url: profile.siteUrl,
    address: profile.location,
    sameAs: (profile.links || []).map((l) => l.url).filter((u) => u.startsWith('http')),
  });

  // Status card in hero.
  $('#status-card').innerHTML = [
    ['status', `<span class="ok">${esc(profile.availability || 'online')}</span>`],
    ['role', esc(profile.title)],
    ['location', esc(profile.location)],
    ['certs', `${certCount} verified`],
    ['uptime', `<span id="uptime">0d 0h 0m</span>`],
    ['last_login', esc(new Date().toLocaleDateString('en', { dateStyle: 'medium' }))],
  ].map(([k, v]) => `<div class="row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('');

  // Social links (hero + contact).
  const links = (profile.links || []).map((l) =>
    `<li><a href="${esc(l.url)}" ${l.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${icon(l.icon)}<span>${esc(l.label)}</span></a></li>`
  ).join('');
  $('#hero-links').innerHTML = links;
  $('#contact-links').innerHTML = links;

  // Bio + highlights.
  $('#bio').innerHTML = (profile.bio || []).map((p) => `<p>${esc(p)}</p>`).join('');
  $('#highlights').innerHTML = (profile.highlights || []).map((h) => {
    const value = h.value === 'auto' && /cert/i.test(h.label) ? String(certCount) : h.value;
    return `<li><strong data-count="${esc(value)}">${esc(value)}</strong><span>${esc(h.label)}</span></li>`;
  }).join('');
}

function $$bind(key, value) {
  document.querySelectorAll(`[data-bind="${key}"]`).forEach((el) => { el.textContent = value ?? ''; });
}

function setMeta(attr, key, value) {
  if (!value) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', value);
}

/* ---------- Skills ---------- */
export function renderSkills(skills) {
  $('#skills-grid').innerHTML = (skills.categories || []).map((cat) => `
    <div class="skill-group reveal">
      <h3>${icon(cat.icon || 'code')}${esc(cat.name)}</h3>
      ${(cat.skills || []).map((s) => `
        <div class="skill">
          <div class="skill__head"><span>${esc(s.name)}</span><span>${Number(s.level) || 0}%</span></div>
          <div class="bar" role="progressbar" aria-valuenow="${Number(s.level) || 0}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(s.name)}"><i style="--w:${Number(s.level) || 0}%"></i></div>
        </div>`).join('')}
    </div>`).join('');
  $('#soft-skills').innerHTML = tags(skills.soft, 'tag tag--accent');
}

/* ---------- Experience / education timelines ---------- */
export function renderExperience(items) {
  $('#experience-list').innerHTML = items.map((x) => `
    <li class="reveal">
      <div class="tl__head">
        <h3>${esc(x.role)}</h3>
        <span class="tl__org">@ ${x.companyUrl ? `<a href="${esc(x.companyUrl)}" target="_blank" rel="noopener">${esc(x.company)}</a>` : esc(x.company)}</span>
        <span class="tl__meta">${fmtDate(x.start)} – ${fmtDate(x.end)} · ${fmtDuration(x.start, x.end)}${x.location ? ` · ${esc(x.location)}` : ''}</span>
      </div>
      ${x.summary ? `<p class="tl__summary">${esc(x.summary)}</p>` : ''}
      ${x.bullets?.length ? `<ul class="tl__bullets">${x.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
      ${x.tech?.length ? `<div class="tl__tags">${tags(x.tech)}</div>` : ''}
    </li>`).join('') || '<li class="empty">Nothing here yet.</li>';
}

export function renderEducation(items) {
  $('#education-list').innerHTML = items.map((e) => `
    <li class="reveal">
      <div class="tl__head">
        <h3>${esc(e.degree)}${e.field ? `, ${esc(e.field)}` : ''}</h3>
        <span class="tl__org">@ ${esc(e.school)}</span>
        <span class="tl__meta">${esc(e.start)} – ${esc(e.end || 'Present')}</span>
      </div>
      ${e.details?.length ? `<ul class="tl__bullets">${e.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
    </li>`).join('') || '<li class="empty">Nothing here yet.</li>';
}

/* ---------- Projects ---------- */
export function renderProjects(projects) {
  const sorted = [...projects].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  $('#projects-grid').innerHTML = sorted.map((p) => `
    <article class="card reveal ${p.featured ? 'card--featured' : ''}">
      <h3>${esc(p.name)} ${p.status ? `<span class="badge badge--${esc(p.status)}">${esc(p.status)}</span>` : ''}</h3>
      ${p.tagline ? `<p class="card__tagline">${esc(p.tagline)}</p>` : ''}
      <p class="card__desc">${esc(p.description)}</p>
      <div class="card__tags">${tags(p.tech)}</div>
      <div class="card__links">
        ${p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">source</a>` : ''}
        ${p.demo ? `<a href="${esc(p.demo)}" target="_blank" rel="noopener">live demo</a>` : ''}
      </div>
    </article>`).join('') || '<p class="empty">No projects yet.</p>';
}

/* ---------- Certifications ---------- */
export function renderCertifications(certs, { onOpenImage }) {
  const grid = $('#certs-grid');
  const filters = $('#cert-filters');
  const sorted = [...certs].sort((a, b) => String(b.issued).localeCompare(String(a.issued)));
  const issuers = [...new Set(sorted.map((c) => c.issuer).filter(Boolean))];

  const STATUS_LABEL = { active: 'valid', expiring: 'expires soon', expired: 'expired' };

  const draw = (filter) => {
    const list = filter === 'all' ? sorted : sorted.filter((c) => c.issuer === filter);
    grid.innerHTML = list.map((c, i) => {
      const isPdf = /\.pdf(\?|$)/i.test(c.image || '');
      const status = certStatus(c.expires);
      const thumb = !c.image
        ? ''
        : isPdf
          ? `<a class="cert__thumb cert__thumb--pdf" href="${esc(c.image)}" target="_blank" rel="noopener">📄<small>open PDF</small></a>`
          : `<button class="cert__thumb" type="button" data-cert="${i}" aria-label="View ${esc(c.title)} certificate"><img src="${esc(c.image)}" alt="${esc(c.title)}" loading="lazy"></button>`;
      return `
        <article class="card reveal" data-issuer="${esc(c.issuer)}">
          ${thumb}
          <h3>${esc(c.title)}</h3>
          <p class="card__tagline">${esc(c.issuer)} <span class="badge badge--${status}">${STATUS_LABEL[status]}</span></p>
          <p class="cert__meta">
            Issued ${fmtDate(c.issued, '—')}${c.expires ? ` · Expires ${fmtDate(c.expires)}` : ' · No expiry'}
            ${c.credentialId ? `<br>ID <code>${esc(c.credentialId)}</code>` : ''}
          </p>
          ${c.skills?.length ? `<div class="card__tags">${tags(c.skills)}</div>` : ''}
          <div class="card__links">
            ${c.verifyUrl ? `<a href="${esc(c.verifyUrl)}" target="_blank" rel="noopener">verify</a>` : ''}
            ${c.image && !isPdf ? `<a href="${esc(c.image)}" target="_blank" rel="noopener">open image</a>` : ''}
          </div>
        </article>`;
    }).join('') || '<p class="empty">No certifications added yet. See README for how to add one.</p>';

    grid.querySelectorAll('[data-cert]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const c = list[Number(btn.dataset.cert)];
        onOpenImage(c.image, `${c.title} — ${c.issuer}`);
      });
    });
    grid.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  };

  filters.innerHTML = ['all', ...issuers].map((name, i) =>
    `<button type="button" data-filter="${esc(name)}" class="${i === 0 ? 'is-active' : ''}">${esc(name)}</button>`).join('');
  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    filters.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === btn));
    draw(btn.dataset.filter);
  });
  if (issuers.length < 2) filters.hidden = true;
  draw('all');
}
