# Movers & Packers website

## Run locally

Requires Node.js 20 or later. No package installation is needed.

```powershell
node server.mjs
```

Open <http://localhost:4173>. Set `PORT` to use another port.

## Before launch

- Update the central company details and verified figures in `config.mjs`.
- Replace `https://example.com` in `config.mjs`, `index.html`, `robots.txt` and `sitemap.xml` with the production domain.
- Replace placeholder review content with permissioned, verified customer feedback.
- Update the privacy and terms text to match the operator's actual policies.
- Quote and contact requests are appended to `data/submissions.jsonl` on the server. Protect and back up that file in production; use an established database or hosted form service when deploying across multiple server instances.
- Images and fonts load from Unsplash and Google Fonts.
