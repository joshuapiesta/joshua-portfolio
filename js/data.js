/**
 * Loads all content JSON files. Add a new file here if you add a new section.
 * Files live in /content and are the only thing you need to edit to update the site.
 */
const FILES = {
  profile: 'content/profile.json',
  skills: 'content/skills.json',
  experience: 'content/experience.json',
  projects: 'content/projects.json',
  certifications: 'content/certifications.json',
  education: 'content/education.json',
};

async function fetchJson(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

export async function loadContent() {
  const entries = await Promise.all(
    Object.entries(FILES).map(async ([key, path]) => [key, await fetchJson(path)])
  );
  return Object.fromEntries(entries);
}

/** Friendly explanation shown when JSON can't be loaded (usually file:// or a typo in JSON). */
export function renderLoadError(err) {
  const main = document.getElementById('main');
  if (!main) return;
  const isFile = location.protocol === 'file:';
  main.innerHTML = `
    <section class="section"><div class="container">
      <h2 class="section__title"><span class="prompt">!</span> content failed to load</h2>
      <p>${isFile
        ? 'Browsers block <code>fetch()</code> on <code>file://</code> pages. Run <code>npm run dev</code> and open <code>http://localhost:8080</code> instead.'
        : 'Check the JSON files in <code>/content</code> for syntax errors (run <code>npm run check</code>).'}</p>
      <pre class="empty">${String(err?.message || err)}</pre>
    </div></section>`;
}
