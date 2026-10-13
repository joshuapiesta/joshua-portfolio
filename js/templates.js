/**
 * Pure HTML templates: data in, HTML string out. No DOM access anywhere in this file.
 *
 * Used in two places:
 *   - js/render.js, in the browser, on every page load;
 *   - scripts/prerender.js, at deploy time, which bakes the same markup into index.html so
 *     search engines, link previews and the AI tools recruiters paste a URL into (none of
 *     which run JavaScript) still see the full CV instead of an empty shell.
 * Keep this file free of `document`/`window`, or the deploy breaks.
 */
import { esc, fmtDate, fmtDuration, monthsBetween, certStatus, icon } from './utils.js';

export const tags = (list = [], cls = 'tag') => list.map((t) => `<span class="${cls}">${esc(t)}</span>`).join('');

/* ---------- Profile ---------- */
export const bioHtml = (profile) => (profile.bio || []).map((p) => `<p>${esc(p)}</p>`).join('');

/**
 * "auto" highlight values:
 *  - with a "since": "YYYY-MM" field → whole years elapsed, e.g. "3+"
 *  - with "cert" in the label → number of certifications
 */
export function highlightValue(h, certCount) {
  if (h.value !== 'auto') return h.value;
  if (h.since) return `${Math.floor(monthsBetween(h.since) / 12)}+`;
  if (/cert/i.test(h.label)) return String(certCount);
  return '';
}

/** Tiles with "hackerOnly": true are jokes for the hacker view; recruiter view and print hide them. */
export const highlightsHtml = (profile, certCount) => (profile.highlights || []).map((h) => {
  const value = highlightValue(h, certCount);
  return `<li${h.hackerOnly ? ' data-hacker-only' : ''}><strong data-count="${esc(value)}">${esc(value)}</strong><span>${esc(h.label)}</span></li>`;
}).join('');

export const linksHtml = (profile) => (profile.links || []).map((l) =>
  `<li><a href="${esc(l.url)}" ${l.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${icon(l.icon)}<span>${esc(l.label)}</span></a></li>`
).join('');

/** Rows of the status.sh window in the hero. uptime and last_login only make sense in hacker view. */
export const statusRowsHtml = (profile, certCount, lastLogin = new Date()) => [
  ['status', `<span class="ok">${esc(profile.availability || 'online')}</span>`],
  ['role', esc(profile.title)],
  ['location', esc(profile.location)],
  ['certs', `${certCount} verified`],
  ['uptime', '<span id="uptime">0d 0h 0m</span>', true],
  ['last_login', esc(lastLogin.toLocaleDateString('en', { dateStyle: 'medium' })), true],
].map(([k, v, hackerOnly]) => `<div class="row"${hackerOnly ? ' data-hacker-only' : ''}><span class="k">${k}</span><span class="v">${v}</span></div>`).join('');

/* ---------- Skills ---------- */
/**
 * Every skill card is a plain checklist: no self-rated percentages. Recruiters read
 * "Python 55%" as a weakness and "85%" as unverifiable; depth is shown by the
 * experience, projects and certification sections instead.
 * A skill entry is a string; `{ "name": "..." }` objects from the old format still work.
 */
export const skillName = (s) => (typeof s === 'string' ? s : s?.name || '');

const skillCard = (title, iconName, items, extraClass = '') => `
  <div class="skill-group ${extraClass} reveal">
    <h3>${icon(iconName)}${esc(title)}</h3>
    <ul class="skill-list">${items.map((s) => `<li>${esc(skillName(s))}</li>`).join('')}</ul>
  </div>`;

export function skillsHtml(skills) {
  const cards = (skills.categories || []).map((cat) => skillCard(cat.name, cat.icon || 'code', cat.skills || []));
  if (skills.soft?.length) cards.push(skillCard('Soft Skills', 'users', skills.soft, 'skill-group--soft'));
  return cards.join('');
}

/* ---------- Experience / education timelines ---------- */
export const experienceHtml = (items = []) => items.map((x) => `
    <li class="reveal">
      <div class="tl__head">
        <h3>${esc(x.role)}</h3>
        <span class="tl__org">@ ${x.companyUrl ? `<a href="${esc(x.companyUrl)}" target="_blank" rel="noopener">${esc(x.company)}</a>` : esc(x.company)}</span>
        <span class="tl__meta">${x.type ? `${esc(x.type)} · ` : ''}${fmtDate(x.start)} – ${fmtDate(x.end)} · ${fmtDuration(x.start, x.end)}${x.location ? ` · ${esc(x.location)}` : ''}</span>
      </div>
      ${x.summary ? `<p class="tl__summary">${esc(x.summary)}</p>` : ''}
      ${x.bullets?.length ? `<ul class="tl__bullets">${x.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
      ${x.tech?.length ? `<div class="tl__tags">${tags(x.tech)}</div>` : ''}
    </li>`).join('') || '<li class="empty">Nothing here yet.</li>';

export const educationHtml = (items = []) => items.map((e) => `
    <li class="reveal">
      <div class="tl__head">
        <h3>${esc(e.degree)}${e.field ? `, ${esc(e.field)}` : ''}</h3>
        <span class="tl__org">@ ${esc(e.school)}</span>
        <span class="tl__meta">${esc(e.start)} – ${esc(e.end || 'Present')}</span>
      </div>
      ${e.details?.length ? `<ul class="tl__bullets">${e.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
    </li>`).join('') || '<li class="empty">Nothing here yet.</li>';

/* ---------- Projects ---------- */
export const sortProjects = (projects = []) => [...projects].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));

export const projectsHtml = (projects = []) => sortProjects(projects).map((p) => `
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

/* ---------- Certifications ---------- */
export const STATUS_LABEL = { active: 'valid', expiring: 'expires soon', expired: 'expired', 'exam-passed': 'exam passed' };

/** Newest first. */
export const sortCerts = (certs = []) => [...certs].sort((a, b) => String(b.issued || '').localeCompare(String(a.issued || '')));
export const certIssuers = (certs = []) => [...new Set(certs.map((c) => c.issuer).filter(Boolean))];

/** `i` is the card's index in the list being drawn; the lightbox button carries it as data-cert. */
export function certCardHtml(c, i) {
  const status = c.status === 'exam-passed' ? 'exam-passed' : certStatus(c.expires);
  const pdf = c.file || (/\.pdf(\?|$)/i.test(c.image || '') ? c.image : '');
  const img = c.image && c.image !== pdf ? c.image : '';
  const thumb = img
    ? `<button class="cert__thumb" type="button" data-cert="${i}" aria-label="View ${esc(c.title)} certificate"><img src="${esc(img)}" alt="${esc(c.title)}" loading="lazy"></button>`
    : pdf
      ? `<a class="cert__thumb cert__thumb--pdf" href="${esc(pdf)}" target="_blank" rel="noopener">📄<small>open PDF</small></a>`
      : '';
  const dates = c.issued
    ? `Issued ${fmtDate(c.issued)}${c.expires ? ` · Expires ${fmtDate(c.expires)}` : ' · No expiry'}`
    : (c.expires ? `Expires ${fmtDate(c.expires)}` : '');
  return `
        <article class="card reveal" data-issuer="${esc(c.issuer)}">
          ${thumb}
          <h3>${esc(c.title)}</h3>
          <p class="card__tagline">${esc(c.issuer)} <span class="badge badge--${status}">${STATUS_LABEL[status]}</span></p>
          <p class="cert__meta">
            ${dates}
            ${c.credentialId ? `${dates ? '<br>' : ''}ID <code>${esc(c.credentialId)}</code>` : ''}
          </p>
          ${c.note ? `<p class="cert__note">${esc(c.note)}</p>` : ''}
          ${c.skills?.length ? `<div class="card__tags">${tags(c.skills)}</div>` : ''}
          <div class="card__links">
            ${c.verifyUrl ? `<a href="${esc(c.verifyUrl)}" target="_blank" rel="noopener">verify</a>` : ''}
            ${pdf ? `<a href="${esc(pdf)}" target="_blank" rel="noopener">open PDF</a>` : ''}
            ${img ? `<a href="${esc(img)}" target="_blank" rel="noopener">open image</a>` : ''}
          </div>
        </article>`;
}

export const certsHtml = (list = []) => list.map(certCardHtml).join('') || '<p class="empty">No certifications added yet. See README for how to add one.</p>';

export const certFiltersHtml = (issuers = []) => ['all', ...issuers].map((name, i) =>
  `<button type="button" data-filter="${esc(name)}" class="${i === 0 ? 'is-active' : ''}">${esc(name)}</button>`).join('');

/* ---------- Structured data ---------- */
/**
 * schema.org Person for search engines and AI assistants: who, where, current employer,
 * school, skills and every certification with its issuer and dates.
 */
export function jsonLd({ profile, skills = {}, experience = [], certifications = [], education = [] }) {
  const current = experience.find((x) => !x.end);
  const clean = (o) => JSON.parse(JSON.stringify(o)); // drops undefined fields
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    description: profile.seo?.description,
    email: profile.email,
    url: profile.siteUrl,
    address: profile.location,
    sameAs: (profile.links || []).map((l) => l.url).filter((u) => u.startsWith('http')),
    worksFor: current ? { '@type': 'Organization', name: current.company, url: current.companyUrl || undefined } : undefined,
    alumniOf: education.map((e) => ({ '@type': 'EducationalOrganization', name: e.school })),
    // Skills plus every certification's tags, de-duplicated: the keyword list AI tools and search engines read.
    knowsAbout: [...new Set([
      ...(skills.categories || []).flatMap((c) => (c.skills || []).map(skillName)),
      ...certifications.flatMap((c) => c.skills || []),
    ])].filter(Boolean),
    hasCredential: certifications.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.title,
      credentialCategory: 'certification',
      recognizedBy: { '@type': 'Organization', name: c.issuer },
      dateCreated: c.issued || undefined,
      expires: c.expires || undefined,
      url: c.verifyUrl || undefined,
    })),
  });
}
