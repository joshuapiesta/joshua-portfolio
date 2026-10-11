/**
 * Validates the content JSON files before you deploy.
 *   npm run check
 * Exits non-zero on errors so the GitHub Actions deploy fails early instead of shipping a broken site.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const errors = [];
const warnings = [];

const DATE = /^\d{4}(-(0[1-9]|1[0-2]))?$/;
const isDate = (v) => v == null || DATE.test(String(v));
const isUrl = (v) => !v || /^(https?:\/\/|mailto:)/.test(v);

function load(name) {
  const path = join(ROOT, 'content', `${name}.json`);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    errors.push(`content/${name}.json: ${e.message}`);
    return null;
  }
}

function require(obj, fields, where) {
  for (const f of fields) if (obj[f] == null || obj[f] === '') errors.push(`${where}: missing "${f}"`);
}

function fileExists(rel, where) {
  if (!rel) return;
  if (/^https?:\/\//.test(rel)) return;
  if (!existsSync(join(ROOT, rel))) errors.push(`${where}: file not found: ${rel}`);
}

/* ---- profile ---- */
const profile = load('profile');
if (profile) {
  require(profile, ['name', 'title', 'email', 'tagline'], 'profile');
  fileExists(profile.avatar, 'profile.avatar');
  if (profile.resume && !existsSync(join(ROOT, profile.resume))) warnings.push(`profile.resume: ${profile.resume} not found. The "download resume" button stays hidden until you add it.`);
  (profile.highlights || []).forEach((h, i) => { if (h.since && !isDate(h.since)) errors.push(`profile.highlights[${i}]: "since" must be "YYYY-MM"`); });
  (profile.links || []).forEach((l, i) => { require(l, ['label', 'url'], `profile.links[${i}]`); if (!isUrl(l.url)) errors.push(`profile.links[${i}].url must start with http(s):// or mailto:`); });
}

/* ---- skills ---- */
const skills = load('skills');
if (skills) {
  if (!Array.isArray(skills.categories)) errors.push('skills.categories must be an array');
  (skills.categories || []).forEach((c, i) => {
    require(c, ['name', 'skills'], `skills.categories[${i}]`);
    (c.skills || []).forEach((s, j) => {
      require(s, ['name'], `skills.categories[${i}].skills[${j}]`);
      if (s.level != null && (s.level < 0 || s.level > 100)) errors.push(`skills "${s.name}": level must be 0–100`);
    });
  });
}

/* ---- experience ---- */
const experience = load('experience');
if (experience) {
  if (!Array.isArray(experience)) errors.push('experience.json must be an array');
  (experience || []).forEach((x, i) => {
    require(x, ['role', 'company', 'start'], `experience[${i}]`);
    if (!isDate(x.start) || !isDate(x.end)) errors.push(`experience[${i}] (${x.role}): dates must be "YYYY-MM" or "YYYY", end may be null`);
    if (x.type && !['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'].includes(x.type)) warnings.push(`experience[${i}] (${x.role}): unusual type "${x.type}" (expected Full-time, Part-time, Contract, Internship or Freelance)`);
  });
}

/* ---- projects ---- */
const projects = load('projects');
if (projects) {
  if (!Array.isArray(projects)) errors.push('projects.json must be an array');
  (projects || []).forEach((p, i) => {
    require(p, ['name', 'description'], `projects[${i}]`);
    if (!isUrl(p.repo) || !isUrl(p.demo)) errors.push(`projects[${i}] (${p.name}): repo/demo must be full URLs or empty`);
    if (p.status && !['active', 'archived'].includes(p.status)) errors.push(`projects[${i}] (${p.name}): status must be "active" or "archived"`);
  });
}

/* ---- certifications ---- */
const certs = load('certifications');
if (certs) {
  if (!Array.isArray(certs)) errors.push('certifications.json must be an array');
  (certs || []).forEach((c, i) => {
    const where = `certifications[${i}] (${c.title || '?'})`;
    require(c, ['title', 'issuer'], where);
    if (!c.issued && c.status !== 'exam-passed') warnings.push(`${where}: no "issued" date. Card will show no date and sort last.`);
    if (c.status && c.status !== 'exam-passed') errors.push(`${where}: status must be "exam-passed" or omitted`);
    fileExists(c.file, `${where}.file`);
    if (!isDate(c.issued) || !isDate(c.expires)) errors.push(`${where}: issued/expires must be "YYYY-MM" or "YYYY", expires may be null`);
    if (!isUrl(c.verifyUrl)) errors.push(`${where}: verifyUrl must be a full URL or empty`);
    fileExists(c.image, `${where}.image`);
    if (!c.image && !c.file) warnings.push(`${where}: no image or file. Card will show text only.`);
    if (/example-certificate/.test(c.image || '') || /delete me/i.test(c.title || '')) warnings.push(`${where}: this is the sample entry. Replace it with a real certificate.`);
  });
}

/* ---- education ---- */
const education = load('education');
if (education) {
  if (!Array.isArray(education)) errors.push('education.json must be an array');
  (education || []).forEach((e, i) => require(e, ['school', 'degree'], `education[${i}]`));
}

/* ---- report ---- */
warnings.forEach((w) => console.warn(`⚠  ${w}`));
if (errors.length) {
  errors.forEach((e) => console.error(`✖  ${e}`));
  console.error(`\n${errors.length} error(s). Fix the JSON above and re-run \`npm run check\`.`);
  process.exit(1);
}
console.log(`✔  Content OK (${warnings.length} warning${warnings.length === 1 ? '' : 's'}).`);
