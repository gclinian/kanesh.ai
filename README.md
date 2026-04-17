# Kanesh — Website

Landing page for **Kanesh (卡納科技)** — the privacy-preserving collaborative-training
infrastructure for the EDA industry.

> **Tagline:** Data stays home. Value goes global.

## Live site

After the first push to `main`, GitHub Pages will be available at:

```
https://<your-github-username>.github.io/<repo-name>/
```

## Structure

```
.
├── webpage/              # The site (deployed by GitHub Pages)
│   ├── index.html        # Landing page
│   ├── css/style.css     # All styles (no build step)
│   ├── js/main.js        # Progressive enhancement only
│   └── assets/           # Favicon, images
└── .github/workflows/
    └── deploy.yml        # Builds and publishes webpage/ to Pages
```

No framework, no bundler, no build step — just HTML / CSS / vanilla JS. That keeps
deploys instant and the attack surface tiny.

## Local preview

Any static server works. Two one-liners:

```bash
# Python
python3 -m http.server 8000 --directory webpage

# Node
npx serve webpage
```

Then open <http://localhost:8000>.

## Deploying

Every push to `main` that touches `webpage/` (or the workflow file itself) rebuilds
the site via `.github/workflows/deploy.yml`. To force a redeploy without a code change,
run the **Deploy Kanesh website to GitHub Pages** workflow manually from the Actions
tab (`workflow_dispatch`).

### First-time GitHub Pages setup

1. In the repo on GitHub → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Push to `main`. The Actions tab will show the build and expose the live URL.

## Editing content

All copy lives in [`webpage/index.html`](webpage/index.html). The page is intentionally
a single file so non-engineers can edit it directly. Colours, spacing, and typography
live in [`webpage/css/style.css`](webpage/css/style.css) as CSS custom properties at
the top of the file.

## License

© 2026 Kanesh Technologies. All rights reserved.
