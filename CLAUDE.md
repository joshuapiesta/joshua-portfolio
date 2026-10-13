# Working on this repo

## Always finish with "what to do next"
Joshua maintains this site but is new to git and GitHub workflows. Every reply that changes code or content
must end with numbered, step-by-step instructions for applying and seeing the change:

1. where the change lives (branch name, pull request link),
2. how to merge it (GitHub in the browser: open the pull request, Merge, Confirm),
3. how to watch the deploy (Actions tab, "Deploy to GitHub Pages", green tick, about a minute),
4. how to verify it (open the live site, reload; hard-refresh with Ctrl+Shift+R or Cmd+Shift+R only if it looks stale).

Assume GitHub in the browser or GitHub Desktop. Do not hand over raw git commands without saying what each does.

## Project facts
- Pure HTML/CSS/JS, no build step. All content lives in `content/*.json`.
  `npm run check` validates the content, `npm run dev` previews at http://localhost:8080.
- Deploys to GitHub Pages from `main` via `.github/workflows/deploy.yml`. The deploy runs `scripts/stamp.js`,
  which appends `?v=<commit>` to the site's CSS/JS URLs so a browser never mixes fresh content JSON with a
  cached, older renderer. New local stylesheet/script tags in `index.html` and `from './x.js'` imports in `js/`
  must keep those shapes so the stamper finds them.
- Skills are plain checklists on purpose. Self-rated percentages or levels read as a red flag to recruiters;
  do not reintroduce them.
