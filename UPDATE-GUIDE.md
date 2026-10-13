# How to update this site (no coding needed)

Everything personal is either a **text file in the `content` folder** or a **file in the `assets` folder**. All of it can be changed from the GitHub website in your browser. No installs, no terminal.

The site rebuilds itself about a minute after every change you commit on the `main` branch.

---

## The two skills you need

### Editing a text file on GitHub

1. Open the file on GitHub (links for each file are below).
2. Click the **pencil icon** (top right of the file box).
3. Change the words **between the quotes**. Keep the quotes, commas and brackets exactly as they are.
4. Scroll down, click the green **Commit changes…** button, then **Commit changes** again in the popup.

JSON in 30 seconds:

```json
{ "text": "goes in quotes", "number": 85, "nothing": null, "list": ["one", "two"] }
```

- Every item except the last one in a list or block ends with a comma.
- `null` means "none" (for example `"end": null` = "I still work here").
- Dates are `"YYYY-MM"`, for example `"2026-03"`.

### Uploading a file on GitHub

1. Open the upload page for the right folder (links below).
2. Drag the file in and wait for the green check.
3. Scroll down, keep **"Commit directly to the main branch"** selected, click **Commit changes**.

Uploading a file with the **same name** as an existing one replaces it.

---

## Common changes

### Add a new certificate

Prepare the image first: a screenshot or PNG/JPG export of the certificate, roughly 600–800 px wide. **Do not upload the original PDF.** If the certificate prints a private verification code or personal details beyond your name, blur them before uploading.

1. Upload the image here → https://github.com/joshuapiesta/joshua-portfolio/upload/main/assets/certs
   Use a simple filename with no spaces, e.g. `oscp.png`.
2. Edit the list → https://github.com/joshuapiesta/joshua-portfolio/edit/main/content/certifications.json
   Paste this block right after the opening `[` at the top, keeping the comma after its `}`:

```json
{
  "title": "Certificate Name",
  "issuer": "Issuer Name",
  "issued": "2026-05",
  "expires": null,
  "credentialId": "ABC123",
  "verifyUrl": "https://www.credly.com/badges/.../public_url",
  "image": "assets/certs/oscp.png",
  "skills": ["Skill one", "Skill two"]
},
```

3. Commit. The card appears, the certification count on the About tile goes up, and the issuer filter chip is added automatically.

Tips: `"expires": null` if it never expires. Leave `credentialId` or `verifyUrl` as `""` if you don't have them. The `image` must match the uploaded filename exactly, including capitals.

### Change your job title, tagline or bio

Edit → https://github.com/joshuapiesta/joshua-portfolio/edit/main/content/profile.json

- `"title"` is the line under your name and in the browser tab, e.g. `"Senior Penetration Tester"`.
- `"tagline"` is the one-liner in the hero.
- `"bio"` is a list of paragraphs. Each paragraph is one quoted string; keep the commas between them.
- `"availability"` is the green status line in the hero card, e.g. `"Open to opportunities"` or `"Not looking right now"`.
- `"location"` is shown in the hero card and the terminal.

### Change your email

Edit → https://github.com/joshuapiesta/joshua-portfolio/edit/main/content/profile.json

Change it in **two places** in that file: the `"email"` field near the top, and the `"url": "mailto:..."` entry inside `"links"`. Both must match.

### Change your phone number

The site **does not display a phone number** on purpose: a public phone number mostly attracts spam and spoofed recruiter calls. Contact is email and LinkedIn. The only place a phone number can appear is inside your résumé PDF. To change it there, update your résumé and upload the new PDF (next section).

If you ever do want a phone number on the site, ask for a `phone` field to be added; it's a small change.

### Replace your résumé

Upload the new PDF, named exactly `Joshua_Piesta_Resume.pdf`, here → https://github.com/joshuapiesta/joshua-portfolio/upload/main/assets

It replaces the old one. The "download resume" buttons keep working with no other change. Before uploading, decide whether you want your phone number in a public PDF, and double-check the email address printed on it.

### Add a new job

Edit → https://github.com/joshuapiesta/joshua-portfolio/edit/main/content/experience.json

Paste at the **top** of the list, right after the opening `[`:

```json
{
  "role": "Senior Penetration Tester",
  "company": "Company Name",
  "companyUrl": "https://company.com",
  "type": "Full-time",
  "location": "Philippines · Remote",
  "start": "2026-06",
  "end": null,
  "summary": "One sentence about the role.",
  "bullets": [
    "What you did, with a result if you have one.",
    "Another thing you did."
  ],
  "tech": ["Burp Suite", "Python"]
},
```

When you leave a job, change its `"end": null` to the month you left, e.g. `"end": "2026-05"`.

### Update skills

Edit → https://github.com/joshuapiesta/joshua-portfolio/edit/main/content/skills.json

Each category has a `"skills"` list of plain strings, e.g. `"Burp Suite, Nmap, Metasploit, Kali Linux"`. Add, remove or reorder freely. The `"soft"` list at the bottom is the Soft Skills card.

There are deliberately no percentages or skill levels. Recruiters read self-ratings as unverifiable at best and as weaknesses at worst ("Python 55%"). Show depth through your experience bullets, projects and certifications instead.

### Change the stat tiles under your bio

In `profile.json`, the `"highlights"` block. Tiles with `"value": "auto"` update themselves:
- a tile with `"since": "2022-10"` shows the years elapsed (e.g. "4+") and ticks up each year
- the certifications tile counts your certs

You only ever edit the `"label"` text or the `"since"` date.

### Change your photo

Upload a square JPG or PNG (about 500×500) here → https://github.com/joshuapiesta/joshua-portfolio/upload/main/assets/img

If you name it `joshua.jpg` it replaces the current photo with no other change. If you use a different name, update `"avatar"` in `profile.json` to match.

### Add a social link

In `profile.json`, inside `"links"`, add e.g. `{ "label": "Medium", "url": "https://medium.com/@joshuapiesta", "icon": "website" }`. Icons: `linkedin`, `mail`, `github`, `twitter`, `website`, `hackerrank`, `tryhackme`.

### Update education

Edit → https://github.com/joshuapiesta/joshua-portfolio/edit/main/content/education.json

---

## If something looks wrong

- **Site didn't update:** open the **Actions** tab. A red ✖ means a file has a typo. Click it to read a message like `certifications[2]: missing "issuer"`.
- **"Unexpected token" error:** a missing comma or quote. Compare your block with the examples above.
- **Image doesn't show:** the `"image"` path must match the uploaded filename exactly, including capital letters and extension.
- **You pushed a file you shouldn't have** (an original PDF, something with private data): deleting it is not enough because Git keeps history. Keep the repo private if it isn't already and ask for help rewriting history.
- Still stuck? Open a Claude Code session on this repo, paste the error, and ask it to fix it.
