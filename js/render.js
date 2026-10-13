/**
 * DOM glue: writes the templates from templates.js into the page and wires the interactive
 * bits (meta tags, cert filters, lightbox). All markup lives in templates.js so the deploy
 * can prerender the same HTML without a browser.
 */
import { $ } from './utils.js';
import {
  bioHtml, highlightsHtml, linksHtml, statusRowsHtml, jsonLd,
  skillsHtml, experienceHtml, educationHtml, projectsHtml,
  sortCerts, certIssuers, certsHtml, certFiltersHtml,
} from './templates.js';

/* ---------- Profile / hero / about / contact ---------- */
export function renderProfile(content) {
  const { profile } = content;
  const certCount = (content.certifications || []).length;
  document.title = `${profile.name} — Portfolio`;
  $$bind('name', profile.name);
  $$bind('handle', profile.handle);
  $$bind('tagline', profile.tagline);
  $('.hero__name')?.setAttribute('data-text', profile.name);

  $('#avatar').src = profile.avatar || 'assets/img/avatar.svg';
  $('#avatar').alt = `${profile.name} avatar`;
  document.querySelectorAll('.resume-link').forEach((a) => {
    a.href = profile.resume || '#';
    a.hidden = !profile.hasResume;
  });
  $('#contact-email').href = `mailto:${profile.email}`;
  $('#year').textContent = new Date().getFullYear();

  // Meta tags + JSON-LD for search engines and link previews.
  setMeta('name', 'description', profile.seo?.description);
  setMeta('name', 'keywords', (profile.seo?.keywords || []).join(', '));
  setMeta('property', 'og:title', `${profile.name} — ${profile.title}`);
  setMeta('property', 'og:description', profile.seo?.description);
  if (profile.siteUrl) setMeta('property', 'og:url', profile.siteUrl);
  $('#jsonld').textContent = JSON.stringify(jsonLd(content));

  $('#status-card').innerHTML = statusRowsHtml(profile, certCount);

  const links = linksHtml(profile);
  $('#hero-links').innerHTML = links;
  $('#contact-links').innerHTML = links;

  $('#bio').innerHTML = bioHtml(profile);
  $('#highlights').innerHTML = highlightsHtml(profile, certCount);
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
  $('#skills-grid').innerHTML = skillsHtml(skills);
}

/* ---------- Experience / education timelines ---------- */
export function renderExperience(items) {
  $('#experience-list').innerHTML = experienceHtml(items);
}

export function renderEducation(items) {
  $('#education-list').innerHTML = educationHtml(items);
}

/* ---------- Projects ---------- */
export function renderProjects(projects) {
  // No projects? Hide the whole section plus its nav link and hero button.
  if (!projects.length) {
    $('#projects').hidden = true;
    document.querySelectorAll('a[href="#projects"]').forEach((a) => { a.closest('li')?.remove(); a.remove(); });
    return;
  }
  $('#projects-grid').innerHTML = projectsHtml(projects);
}

/* ---------- Certifications ---------- */
export function renderCertifications(certs, { onOpenImage }) {
  const grid = $('#certs-grid');
  const filters = $('#cert-filters');
  const sorted = sortCerts(certs);
  const issuers = certIssuers(sorted);

  const draw = (filter) => {
    const list = filter === 'all' ? sorted : sorted.filter((c) => c.issuer === filter);
    grid.innerHTML = certsHtml(list);
    grid.querySelectorAll('[data-cert]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const c = list[Number(btn.dataset.cert)];
        onOpenImage(c.image, `${c.title} — ${c.issuer}`);
      });
    });
    grid.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  };

  filters.innerHTML = certFiltersHtml(issuers);
  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    filters.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === btn));
    draw(btn.dataset.filter);
  });
  if (issuers.length < 2) filters.hidden = true;
  draw('all');
}
