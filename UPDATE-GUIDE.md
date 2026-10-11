# How to update this site (no coding needed)

Everything you'll ever want to change is a **text file in the `content` folder** or a **file you drop into the `assets` folder**.
You can do all of it from the GitHub website in your browser. No installs, no terminal.

If you'd rather not touch files at all, open a Claude Code session on this repo and say what you want changed.

---

## The golden rule

Edit **only** these places:

| Want to change… | Edit this |
| --- | --- |
| Name, job title, tagline, bio, location, email, social links, stats | `content/profile.json` |
| Work experience | `content/experience.json` |
| Certifications | `content/certifications.json` + drop the file in `assets/certs/` |
| Skills and percentages | `content/skills.json` |
| Projects (section is hidden while this list is empty `[]`) | `content/projects.json` |
| Education | `content/education.json` |
| Résumé | upload `assets/resume.pdf` |
| Profile photo | upload `assets/img/avatar.jpg` and set `"avatar": "assets/img/avatar.jpg"` in `profile.json` |

You never need to open `index.html`, the `css` folder or the `js` folder.

---

## How to edit a text file on GitHub

1. Open the repo on github.com and click into the `content` folder.
2. Click the file (for example `profile.json`).
3. Click the **pencil icon** (top right of the file).
4. Make your change. Keep the quotes and commas exactly as they are. Only change the words between the quotes.
5. Scroll down, click **Commit changes**, then **Commit changes** again.

The site rebuilds itself in about a minute. If you made a typo that breaks the file, the build fails and the
**Actions** tab shows a message like `experience[2]: missing "start"` telling you exactly what to fix. The live site stays as it was until you fix it.

### JSON in 30 seconds

```json
{ "label": "text goes here", "number": 85, "nothing": null, "list": ["one", "two"] }
```

- Text always sits inside double quotes. Numbers and `null` don't.
- Every item except the last one in a list or block ends with a comma.
- `null` means "none", for example `"end": null` means "I still work here".
- Dates are `"YYYY-MM"`, for example `"2025-09"`.

---

## Add a certification

1. Go to the `assets/certs` folder on GitHub → **Add file → Upload files** → drop in the image or PDF → **Commit changes**.
   Use a simple filename with no spaces, like `comptia-security-plus.png`.
2. Open `content/certifications.json`, click the pencil, and add a block like this inside the square brackets:

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

3. If it isn't the last block in the list, put a comma after its closing `}`.
4. Delete the sample `"Example Certificate (delete me)"` block the first time you do this.
5. **Commit changes**.

Tips:
- `"expires": null` if it never expires.
- `"credentialId"`, `"verifyUrl"` and `"skills"` can be left as `""` or `[]` if you don't have them.
- Newest certs show first automatically. Expired ones get a red badge, ones expiring within 3 months get amber.

## Replace your résumé

Go to the `assets` folder → **Add file → Upload files** → drop in your new PDF named exactly `resume.pdf` → **Commit changes**.
The "download resume" buttons appear on the site automatically once the file exists, and update instantly when you replace it.

## Add a new job

Open `content/experience.json` and add a block at the **top** of the list (newest first):

```json
{
  "role": "Senior Penetration Tester",
  "company": "Company Name",
  "companyUrl": "https://company.com",
  "type": "Full-time",
  "location": "Philippines · Remote",
  "start": "2026-01",
  "end": null,
  "summary": "One sentence about the role.",
  "bullets": [
    "What you did, with a result if you have one.",
    "Another thing you did."
  ],
  "tech": ["Burp Suite", "Python"]
},
```

When you leave a job, change its `"end": null` to the month you left, for example `"end": "2026-06"`.

## Change your bio, title or tagline

Open `content/profile.json`. The fields are named in plain English: `"title"`, `"tagline"`, `"bio"` (a list of paragraphs), `"location"`, `"availability"`.
The `"highlights"` block controls the four stat tiles under your bio. Tiles with `"value": "auto"` update themselves: the certifications tile counts your certs, and a tile with a `"since": "2023-01"` date shows the years elapsed (for example "3+"). You never need to bump those numbers.

## Update your photo

Upload a square photo (JPG or PNG, about 500×500) to `assets/img/`, then in `profile.json` set `"avatar": "assets/img/your-photo.jpg"`.

---

## If something looks wrong

- **Site didn't update:** check the **Actions** tab on GitHub. A red ✖ means a file has a typo. Click it to read the message.
- **"Unexpected token" error:** a missing comma or quote in a JSON file. Compare your block with the examples above.
- **Certificate image doesn't show:** the `"image"` path must match the uploaded filename exactly, including capital letters and extension.
- Still stuck? Paste the error message into a Claude Code session on this repo and ask it to fix it.
