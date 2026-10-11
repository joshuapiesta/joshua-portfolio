# Joshua Bobb Piesta — Portfolio

Personal portfolio with a hacker-terminal theme, built for both hiring teams and technical reviewers.

**Live site:** https://joshuapiesta.github.io/joshua-portfolio/
**Recruiter-friendly link:** https://joshuapiesta.github.io/joshua-portfolio/?mode=recruiter

> **Updating your details?** Read [UPDATE-GUIDE.md](UPDATE-GUIDE.md). It covers every common change (new certificate, new job, new title, email, photo, résumé) using only the GitHub website.

## What's in it

- **Zero dependencies.** Plain HTML, CSS and JavaScript. No build step.
- **Content lives in JSON.** Everything personal is in `content/`. You never edit HTML or JS to update the site.
- **Two views, one site.** `hacker` (matrix rain, boot screen, in-page terminal) and `recruiter` (clean, light, printable). Toggle in the nav or share `?mode=recruiter`.
- **Interactive terminal.** Press `` ` `` anywhere. Commands read your real data; a few easter eggs for the technical crowd.
- **Certifications gallery** with thumbnails, lightbox, issuer filters, expiry badges and issuer verify links.
- **Self-updating numbers.** The years-of-experience tiles and the certification count compute themselves.
- **Hidden-when-empty sections.** Projects is hidden while `content/projects.json` is `[]`.
- **Auto-deploy.** Every push to `main` validates the JSON, then publishes to GitHub Pages.
- **SEO and accessibility.** Meta tags, Open Graph image, JSON-LD Person schema, keyboard navigation, reduced-motion support, print stylesheet.

## Quick start (local preview)

```bash
npm run dev        # http://localhost:8080
npm run check      # validate content JSON and referenced files
npm run add-cert   # interactive helper to add a certification
```

Opening `index.html` straight from disk does not work, because browsers block `fetch()` on `file://` pages.

## Deploying

The workflow in `.github/workflows/deploy.yml` runs on every push to `main`. One-time setup: repo **Settings → Pages → Source: GitHub Actions**. The repo must be public for GitHub Pages on a free plan.

If a push contains invalid JSON, the deploy fails and the **Actions** tab shows the exact field to fix. The live site keeps the previous version until the fix is pushed.

## Content files

| File | Controls |
| --- | --- |
| `content/profile.json` | Name, title, tagline, bio, location, email, availability, social links, stat tiles, fun facts, SEO description |
| `content/experience.json` | Jobs, newest first. `"end": null` = current role. `type` = Full-time / Contract / Internship |
| `content/certifications.json` | Certifications. See the privacy rules below |
| `content/skills.json` | Skill groups with 0–100 levels, plus the soft-skills card |
| `content/education.json` | Schools and degrees |
| `content/projects.json` | Projects. Leave as `[]` to hide the section |

Dates are `"YYYY-MM"` or `"YYYY"`. Stat tiles with `"value": "auto"` compute themselves: add `"since": "YYYY-MM"` for a years counter, or put "cert" in the label for a certificate count.

Other files you may replace: `assets/img/joshua.jpg` (photo, referenced by `avatar` in `profile.json`), `assets/Joshua_Piesta_Resume.pdf` (résumé, referenced by `resume`), `assets/img/og.png` (1200×630 social preview), and `LAUNCHED_AT` in `js/main.js` (powers the uptime counter).

## Certificates: what to publish and what not to

This repo is public. Treat certificate files accordingly.

- **Publish a screenshot, not the original PDF.** A PNG or JPG about 600 px wide is enough to recognise the certificate and too small to clone cleanly. Original high-resolution PDFs are easy to forge or pass off as someone else's.
- **Blur private details first.** Some certificates print a private verification code (CompTIA does) or extra personal data such as a middle name. Mask those before uploading.
- **Prefer verification links.** Set `verifyUrl` to the issuer's public page (Credly, Accredible / credential.net, Aspen, AWS verification). A working "verify" button proves the credential better than a hosted file.
- **Credential IDs printed on the certificate are fine to show.** Issuers design them to be shared; they are useless without the issuer's verification page.
- **Anything committed stays in history.** If you ever push the wrong file, deleting it is not enough. Ask for help rewriting history before the next deploy.

Entry format:

```json
{
  "title": "CompTIA Security+",
  "issuer": "CompTIA",
  "issued": "2023-06",
  "expires": "2026-06",
  "credentialId": "COMP001022267804",
  "verifyUrl": "https://www.credly.com/badges/<id>/public_url",
  "image": "assets/certs/comptia-security-plus.png",
  "skills": ["Security Fundamentals", "Threats & Vulnerabilities"]
}
```

`"expires": null` means no expiry. Expired certs get a red badge, ones expiring within 3 months an amber one. A passed exam whose certificate is still pending can use `"status": "exam-passed"` with a `"note"` and `"issued"` set to the exam month.

## Hacker view vs recruiter view

The same site serves two audiences without two codebases.

| | Hacker (default) | Recruiter |
| --- | --- | --- |
| Look | Dark, neon green, monospace | Light, clean, sans-serif |
| Effects | Matrix rain, boot screen, typewriter, glitch, scanlines | None. Nothing animates, nothing is hidden |
| Terminal | Available (`` ` `` key) | Still available, just less prominent |
| Printing | Works, but busy | `Ctrl+P` gives a clean one-page résumé |
| Best for | Engineers, security folks, first impressions | Non-technical recruiters, phones, skimming |

Switch with the toggle in the nav or the terminal command `mode recruiter`. The choice is remembered in the browser.
To decide what visitors see first, pick the link you share:

- `https://<your-site>/` opens the hacker view.
- `https://<your-site>/?mode=recruiter` opens the clean view (good for LinkedIn and job applications).

## Terminal guide

The terminal is a toy for technical visitors: a fake shell inside the page that answers with your real data.
Everything it prints comes from `content/*.json`, so it updates itself when you update your content.

**Opening it:** press the `` ` `` (backtick) key anywhere, click **terminal** in the nav, or **open terminal** in the hero.
**Closing it:** `Esc`, the `×` button, the `` ` `` key again, or the `exit` command.

### Commands

| Command | What it does |
| --- | --- |
| `help` | Lists all public commands |
| `whoami` | Name, title and tagline |
| `about` | Bio, location and availability |
| `skills` | Skills as ASCII progress bars, grouped by category |
| `experience` | Work history with bullet points |
| `projects` | Projects with stack, repo and demo links |
| `certs` | Certifications with issue/expiry dates, credential IDs and verify links |
| `education` | Schools and degrees |
| `contact` | Email and social links (clickable) |
| `resume` | Opens your résumé PDF (or explains it isn't uploaded yet) |
| `open <section>` | Scrolls to a section, e.g. `open projects` |
| `mode <hacker\|recruiter>` | Switches the view. `mode` alone prints the current one |
| `matrix` | Toggles the matrix-rain background |
| `fortune` | A random fun fact from `profile.json` → `funFacts` |
| `banner` | Re-prints the ASCII welcome banner |
| `ls` | Lists the "files" (sections) |
| `cat <file>` | Prints a section, e.g. `cat about` |
| `echo <text>` | Prints the text |
| `date` | Current date and time |
| `history` | Commands typed so far |
| `clear` | Clears the screen (also `Ctrl+L`) |
| `exit` | Closes the terminal |

### Shortcuts

| Key | Action |
| --- | --- |
| `Tab` | Autocomplete a command (lists matches if ambiguous) |
| `↑` / `↓` | Browse command history |
| `Ctrl+L` | Clear the screen |
| `Esc` | Close the terminal |

### Easter eggs

These are hidden from `help`. They exist to make a technical visitor smile.

| Command | Response |
| --- | --- |
| `sudo hire me` (or `hire`) | "✔ Request approved" with your email |
| `sudo <anything else>` | "…is not in the sudoers file. This incident will be reported." Gets sassier on the third try |
| `cat secrets.txt` | "Permission denied. Nice try though." |
| `hack` | Fake "bypassing firewall" progress, ending with "Just kidding. This is a portfolio, not a target." |
| `rm` | Refuses: "It's the only copy." |
| `party` / `konami` | Rainbow party mode for 8 seconds |
| `pwd`, `uname`, `neofetch` | Shell-flavoured replies |
| **Konami code** on the page (↑ ↑ ↓ ↓ ← → ← → B A) | Party mode, no terminal needed |
| **Browser DevTools console** | A greeting with a hint to open the terminal |
| **Hover the name** in the hero | Glitch effect (hacker view only) |

### Other special behaviour

- **Boot screen** plays once per browser session. Any key or click skips it. It is skipped entirely in recruiter view and for users with "reduce motion" enabled.
- **Status card** in the hero shows availability, location, verified cert count and an "uptime" counter since `LAUNCHED_AT` in `js/main.js`.
- **Résumé button** hides itself until `assets/resume.pdf` exists, so there is never a broken link.
- **Certification badges** are computed from `expires`: green "valid", amber "expires soon" (within 3 months), red "expired".
- **Matrix rain** pauses when the tab is hidden, caps at ~20 fps, and is disabled for reduced-motion users and in recruiter view.
- **`window.portfolio`** is exposed in DevTools: `portfolio.terminal.open()`, `portfolio.mode.set('recruiter')`, `portfolio.content`.

### Adding your own command

Open `js/terminal.js` and add an entry to the `commands` object:

```js
blog: {
  desc: 'Links to my writing',          // shown in `help`; add `hidden: true` for an easter egg
  run(args) {                           // args = words typed after the command
    head('Blog');
    print(`  ${link('https://example.com/blog')}`);
  },
},
```

Helpers available inside `run`: `line(text, cssClass)` for plain text, `print(html)` for HTML, `head(text)` for a cyan heading,
`link(url, label)` for a clickable link, `scrollTo(id)` to jump to a section.

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
assets/certs/           certificate thumbnails (PNG/JPG, ~600 px wide)
assets/img/             photo, favicon, Open Graph image
scripts/                dev server, validator, add-cert helper
.github/workflows/      GitHub Pages deploy (validates content first)
```

## Customising

- **Colours:** tokens at the top of `css/styles.css`. Recruiter colours are under `html[data-mode="recruiter"]`.
- **Terminal commands:** add an entry to the `commands` object in `js/terminal.js`.
- **Social icons:** `links[].icon` in `profile.json` accepts `linkedin`, `mail`, `github`, `twitter`, `website`, `hackerrank`, `tryhackme`. Unknown names fall back to a globe.
- **New section:** add a container in `index.html`, a JSON file in `content/`, register it in `js/data.js`, and write a render function in `js/render.js`.

## Security notes

- No analytics, no trackers, no third-party scripts. The only external request is Google Fonts.
- The site never displays a phone number by design. Contact is email and LinkedIn. The résumé PDF is the one place a phone number could appear; decide deliberately what goes in it.
- Everything in this repo, including commit history, is public once Pages is enabled.

## License

MIT.
