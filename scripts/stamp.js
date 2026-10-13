/**
 * Cache-busting for deploys.
 * Appends ?v=<version> to the site's own CSS and JS URLs so a browser that cached the
 * previous deploy fetches the new code on its next load. Without this, GitHub Pages'
 * 10-minute cache can serve fresh content JSON together with a stale renderer
 * (symptom: skill cards with empty names and 0% everywhere).
 *
 * The deploy workflow runs it on its throwaway checkout:   node scripts/stamp.js <version>
 * Never run it on your own copy: the rewritten files must not be committed.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const version = (process.argv[2] || '').trim();
if (!/^[\w.-]+$/.test(version)) {
  console.error('usage: node scripts/stamp.js <version>   (letters, digits, dot, dash or underscore only)');
  process.exit(1);
}

let count = 0;
function rewrite(file, pattern) {
  const before = readFileSync(file, 'utf8');
  const after = before.replace(pattern, (match, url) => { count++; return match.replace(url, `${url}?v=${version}`); });
  if (after !== before) writeFileSync(file, after);
}

// index.html:  href="css/styles.css"   src="js/main.js"
rewrite(join(ROOT, 'index.html'), /\b(?:href|src)="((?:css|js)\/[^"?]+\.(?:css|js))"/g);
// js/*.js:     import { … } from './utils.js'
for (const name of readdirSync(join(ROOT, 'js')).filter((f) => f.endsWith('.js'))) {
  rewrite(join(ROOT, 'js', name), /\bfrom\s+'(\.\/[^'?]+\.js)'/g);
}
console.log(`stamped ${count} URL(s) with ?v=${version}`);
