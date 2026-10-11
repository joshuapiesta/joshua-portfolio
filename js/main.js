/**
 * Entry point. Loads content, renders sections, wires effects.
 */
import { $ } from './utils.js';
import { loadContent, renderLoadError } from './data.js';
import { renderProfile, renderSkills, renderExperience, renderProjects, renderCertifications, renderEducation } from './render.js';
import { createMatrix } from './matrix.js';
import { runBoot, typewriter, initReveal, initNav, initLightbox, initUptime, initKonami, partyMode } from './effects.js';
import { initMode } from './mode.js';
import { createTerminal } from './terminal.js';

/** Set this to the date you launched the site; it powers the "uptime" line in the hero card. */
const LAUNCHED_AT = '2026-10-10T00:00:00Z';

async function fileExists(path) {
  if (!path) return false;
  try { return (await fetch(path, { method: 'HEAD' })).ok; } catch { return false; }
}

async function init() {
  const matrix = createMatrix($('#matrix'));
  const mode = initMode({
    onChange: (m) => (m === 'recruiter' ? matrix.stop() : matrix.start()),
  });

  let content;
  try {
    content = await loadContent();
  } catch (err) {
    console.error(err);
    renderLoadError(err);
    $('#boot').hidden = true;
    return;
  }

  const bootDone = runBoot(content.profile.name);
  const lightbox = initLightbox();

  // Hide the résumé button if the PDF hasn't been uploaded yet (no broken links for recruiters).
  content.profile.hasResume = await fileExists(content.profile.resume);
  renderProfile(content.profile, content.certifications.length);
  renderSkills(content.skills);
  renderExperience(content.experience);
  renderProjects(content.projects);
  renderCertifications(content.certifications, { onOpenImage: lightbox.open });
  renderEducation(content.education);

  initNav();
  initReveal();
  initUptime(LAUNCHED_AT);
  initKonami(partyMode);

  const terminal = createTerminal({ content, mode, matrix, onParty: partyMode });
  window.portfolio = { content, terminal, mode, matrix }; // handy for poking around in DevTools

  await bootDone;
  typewriter($('#typed-title'), content.profile.title);

  // Little nod to the technical crowd.
  console.log('%c>_ Hey, curious one.', 'color:#00ff9c;font-size:16px;font-weight:bold');
  console.log('%cTry `portfolio.terminal.open()` or press ` on the page.', 'color:#7fa996');
}

init();
