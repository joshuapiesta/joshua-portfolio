# Joshua Piesta — Portfolio

A personal portfolio with a hacker-terminal theme, built to impress both the hiring team and the technical team.

- **Zero dependencies.** Plain HTML, CSS and JavaScript. No build step, nothing to install.
- **Content lives in JSON.** Update your details by editing files in `content/`. You never touch HTML.
- **Two views, one site.** `hacker` (matrix rain, boot screen, in-page terminal) and `recruiter` (clean, light, printable). Toggle in the nav, or share `?mode=recruiter` with recruiters directly.
- **Interactive terminal.** Press `` ` `` anywhere. `help`, `skills`, `projects`, `certs`, `contact`… and a few easter eggs (`sudo hire me`, `hack`, the Konami code).
- **Certifications gallery** with lightbox, issuer filters, expiry badges and verify links.
- **Auto-deploys** to GitHub Pages on every push to `main`, after validating your JSON.
- **SEO-ready**: meta tags, Open Graph image, JSON-LD Person schema. Accessible: keyboard navigation, reduced-motion support, skip link.
- **Print = résumé.** `Ctrl+P` in recruiter view prints a clean one-pager.

## Quick start

```bash
npm run dev        # preview at http://localhost:8080
npm run check      # validate content JSON + referenced files
npm run add-cert   # interactive helper to add a certification
```

> Opening `index.html` directly from disk will not work, because browsers block `fetch()` on `file://` pages. Use `npm run dev` or any static server.

## Deploy to GitHub Pages (one-time)

1. Push this repo to GitHub.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` validates the content and publishes the site.
4. Your site will be at `https://<username>.github.io/<repo>/`. Put that URL into `content/profile.json` → `siteUrl`.

To use a custom domain, add a `CNAME` file containing your domain and configure DNS per GitHub's docs.

## Updating your details

Everything is in `content/`:

| File | What it controls |
| --- | --- |
| `profile.json` | Name, title, tagline, bio, location, email, social links, highlight stats, fun facts, SEO description |
| `skills.json` | Skill categories with 0–100 levels, plus soft skills |
| `experience.json` | Work history (newest first). `end: null` means current role |
| `projects.json` | Projects. `featured: true` pins to the top; `status` is `active` or `archived` |
| `certifications.json` | Certifications (see below) |
| `education.json` | Schools and degrees |

Dates are `"YYYY-MM"` (or `"YYYY"`). Run `npm run check` after editing. It tells you exactly what is wrong if a file is invalid.

Other things to replace:

- `assets/img/avatar.svg` → your photo (keep the filename or update `avatar` in `profile.json`).
- `assets/resume.pdf` → your résumé. The "download resume" button hides itself until this file exists.
- `assets/img/og.png` → the 1200×630 image shown when your link is shared on LinkedIn, Slack, etc.
- `LAUNCHED_AT` in `js/main.js` → the date you went live (powers the "uptime" line in the hero card).
- `index.html` `<title>` and the default `<meta>` tags (the JS overrides them at runtime, but crawlers that don't run JS see these).

## Adding a certification

**Option A, the helper script:**

```bash
npm run add-cert
```

It asks for the title, issuer, dates, credential ID, verify URL and the path to your certificate file, copies the file into `assets/certs/` and appends the entry to `content/certifications.json`.

**Option B, by hand:**

1. Drop the image or PDF into `assets/certs/` (PNG, JPG, WebP, SVG or PDF).
2. Add an entry to `content/certifications.json`:

```json
{
  "title": "CompTIA Security+",
  "issuer": "CompTIA",
  "issued": "2025-03",
  "expires": "2028-03",
  "credentialId": "COMP001234567",
  "verifyUrl": "https://www.certmetrics.com/comptia/public/verification.aspx",
  "image": "assets/certs/comptia-security-plus.png",
  "skills": ["Network security", "Threat analysis"]
}
```

3. `npm run check`, then commit and push.

Notes:
- `expires: null` shows "No expiry". Expired certs get a red badge, certs expiring within 3 months get an amber badge.
- Images open in a lightbox; PDFs open in a new tab.
- The "Certifications" highlight in `profile.json` is set to `"auto"` and counts entries automatically.
- Delete the sample "Example Certificate (delete me)" entry once you add a real one (the helper script does this for you).

## Project layout

```
index.html              page shell; sections are filled from JSON
css/styles.css          all styles; hacker/recruiter themes are CSS variables
js/main.js              entry point
js/data.js              loads content/*.json
js/render.js            turns JSON into HTML for each section
js/terminal.js          the in-page terminal and its commands
js/matrix.js            matrix rain canvas
js/effects.js           boot screen, typewriter, scroll reveal, nav, lightbox, Konami
js/mode.js              hacker/recruiter switch (localStorage + ?mode=)
js/utils.js             helpers and inline SVG icons
content/*.json          YOUR DATA — the only files you need to edit
assets/certs/           certificate images / PDFs
assets/img/             avatar, favicon, Open Graph image
scripts/                dev server, validator, add-cert helper
.github/workflows/      GitHub Pages deploy
```

## Customising

- **Colours**: edit the tokens at the top of `css/styles.css` (`--accent`, `--bg`, …). Recruiter colours are under `html[data-mode="recruiter"]`.
- **Terminal commands**: add an entry to the `commands` object in `js/terminal.js`. Each has a `desc` and a `run(args)`.
- **Social icons**: `links[].icon` in `profile.json` accepts `github`, `linkedin`, `mail`, `twitter`, `website`, `hackerrank`, `tryhackme`. Anything else falls back to a globe.
- **New section**: add a container in `index.html`, a JSON file in `content/`, register it in `js/data.js`, and write a `render*` function in `js/render.js`.

## License

MIT. Fork it, make it yours.
