/**
 * Interactive helper to add a certification.
 *   npm run add-cert
 * It copies your certificate file into assets/certs/ and appends an entry to content/certifications.json.
 * You can also skip this and edit the JSON by hand; see README.
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { copyFileSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CERTS_DIR = join(ROOT, 'assets', 'certs');
const JSON_PATH = join(ROOT, 'content', 'certifications.json');
const rl = createInterface({ input: stdin, output: stdout });

const ask = async (q, def = '') => {
  const a = (await rl.question(def ? `${q} [${def}]: ` : `${q}: `)).trim();
  return a || def;
};
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

console.log('\n  Add a certification. Press Enter to accept a default; leave optional fields blank.\n');

const title = await ask('Title (e.g. "CompTIA Security+")');
const issuer = await ask('Issuer (e.g. "CompTIA")');
const issued = await ask('Issued date, YYYY-MM', new Date().toISOString().slice(0, 7));
const expires = await ask('Expiry date, YYYY-MM (blank = never)');
const credentialId = await ask('Credential ID (optional)');
const verifyUrl = await ask('Verification URL (optional)');
const skillsRaw = await ask('Skills, comma-separated (optional)');
const source = await ask('Path to the certificate image or PDF (optional, drag the file into the terminal)');
rl.close();

if (!title || !issuer) { console.error('\n✖ Title and issuer are required.'); process.exit(1); }

let image = '';
if (source) {
  const src = source.replace(/^['"]|['"]$/g, '');
  if (!existsSync(src)) { console.error(`\n✖ File not found: ${src}`); process.exit(1); }
  mkdirSync(CERTS_DIR, { recursive: true });
  const ext = extname(src).toLowerCase();
  const name = `${slug(`${issuer}-${title}`)}${ext || extname(basename(src))}`;
  copyFileSync(src, join(CERTS_DIR, name));
  image = `assets/certs/${name}`;
  console.log(`\n  Copied → ${image}`);
}

const list = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
const cleaned = list.filter((c) => !/delete me/i.test(c.title || '')); // drop the sample entry on first real add
cleaned.push({
  title, issuer, issued,
  expires: expires || null,
  credentialId, verifyUrl, image,
  skills: skillsRaw ? skillsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [],
});
writeFileSync(JSON_PATH, JSON.stringify(cleaned, null, 2) + '\n');
console.log(`  Added "${title}" to content/certifications.json (${cleaned.length} total).`);
console.log('\n  Next: npm run check  →  git add -A && git commit -m "Add cert" && git push\n');
