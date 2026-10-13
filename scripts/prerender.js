/**
 * Bakes the content into index.html at deploy time.
 *
 * Why: search engines, LinkedIn/Slack link previews and the AI assistants recruiters paste a
 * URL into do not run JavaScript. Without this step they see an empty shell: nav labels,
 * section headings and nothing else. With it, index.html carries the full CV (bio, skills,
 * experience, certifications, education) plus the schema.org Person block.
 *
 * The browser JS still re-renders every section on load from the same templates, so the live
 * page looks and behaves exactly as before.
 *
 * Runs in the deploy workflow on its throwaway checkout:   node scripts/prerender.js
 * Never run it on your own copy: the rewritten index.html must not be committed.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc } from '../js/utils.js';
import {
  bioHtml, highlightsHtml, linksHtml, statusRowsHtml, jsonLd,
  skillsHtml, experienceHtml, educationHtml, projectsHtml,
  sortCerts, certIssuers, certsHtml, certFiltersHtml,
} from '../js/templates.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const INDEX = join(ROOT, 'index.html');
const read = (name) => JSON.parse(readFileSync(join(ROOT, 'content', `${name}.json`), 'utf8'));
const content = Object.fromEntries(['profile', 'skills', 'experience', 'projects', 'certifications', 'education'].map((n) => [n, read(n)]));
const { profile, projects, certifications } = content;
const certCount = certifications.length;

let html = readFileSync(INDEX, 'utf8');
const filled = [];

/** Put `inner` inside the empty element with this id. Refuses to run twice or on unexpected markup. */
function fill(id, inner) {
  const re = new RegExp(`(<(\\w+)\\b[^>]*\\bid="${id}"[^>]*>)\\s*(</\\2>)`);
  if (!re.test(html)) throw new Error(`prerender: no empty element with id="${id}" in index.html (already prerendered, or the markup changed)`);
  html = html.replace(re, (m, open, tag, close) => `${open}${inner}${close}`);
  filled.push(`#${id}`);
}

/** Set the text of every element carrying data-bind="key" (the JS does the same at runtime). */
function bind(key, text) {
  const re = new RegExp(`(<[^>]*\\bdata-bind="${key}"[^>]*>)[^<]*(<)`, 'g');
  if (!re.test(html)) throw new Error(`prerender: no element with data-bind="${key}"`);
  html = html.replace(re, (m, open, lt) => `${open}${esc(text ?? '')}${lt}`);
  filled.push(`[data-bind=${key}]`);
}

/** Overwrite a <meta ... content="..."> that already exists in index.html. */
function meta(selector, value) {
  if (!value) return;
  const re = new RegExp(`(<meta\\s+${selector}\\s+content=")[^"]*(")`);
  if (re.test(html)) { html = html.replace(re, (m, a, b) => `${a}${esc(value)}${b}`); filled.push(`meta ${selector}`); }
}

/* Head */
html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(profile.name)} — Portfolio</title>`);
meta('name="description"', profile.seo?.description);
meta('property="og:title"', `${profile.name} — ${profile.title}`);
meta('property="og:description"', profile.seo?.description);
if (profile.seo?.keywords?.length && !/name="keywords"/.test(html)) {
  html = html.replace('</head>', `  <meta name="keywords" content="${esc(profile.seo.keywords.join(', '))}">\n</head>`);
  filled.push('meta keywords');
}
// JSON-LD lives inside <script>, so "<" must never appear raw in it.
fill('jsonld', JSON.stringify(jsonLd(content)).replace(/</g, '\\u003c'));

/* Hero + contact */
bind('name', profile.name);
bind('handle', profile.handle);
bind('tagline', profile.tagline);
fill('status-card', statusRowsHtml(profile, certCount));
fill('hero-links', linksHtml(profile));
fill('contact-links', linksHtml(profile));
html = html.replace(/href="mailto:"/, `href="mailto:${esc(profile.email)}"`);
if (profile.resume && existsSync(join(ROOT, profile.resume))) {
  html = html.replace(/href="assets\/resume\.pdf"/g, `href="${esc(profile.resume)}"`);
} else {
  html = html.replace(/<a class="([^"]*\bresume-link\b[^"]*)"/g, '<a class="$1" hidden');
}
fill('year', String(new Date().getFullYear()));

/* Sections */
fill('bio', bioHtml(profile));
fill('highlights', highlightsHtml(profile, certCount));
fill('skills-grid', skillsHtml(content.skills));
fill('experience-list', experienceHtml(content.experience));
fill('education-list', educationHtml(content.education));
if (projects.length) {
  fill('projects-grid', projectsHtml(projects));
} else {
  // Same as the browser JS: no projects, no section, no nav link.
  html = html.replace(/<section class="section" id="projects">/, '<section class="section" id="projects" hidden>');
  html = html.replace(/<li><a href="#projects">projects<\/a><\/li>/, '<li hidden><a href="#projects">projects</a></li>');
  filled.push('#projects (hidden: no projects yet)');
}
const sorted = sortCerts(certifications);
const issuers = certIssuers(sorted);
fill('certs-grid', certsHtml(sorted));
if (issuers.length > 1) fill('cert-filters', certFiltersHtml(issuers));

writeFileSync(INDEX, html);
console.log(`prerendered ${filled.length} targets into index.html: ${filled.join(', ')}`);
