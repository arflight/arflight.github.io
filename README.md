# arflight.github.io

The static, script-free product site for **Line Up**, published at
[flylineup.com](https://flylineup.com/).

Line Up is a head-up display and cockpit companion for general aviation pilots.

## What is here

| Path | Holds |
| --- | --- |
| `site/` | Published static files: pages, `styles.css`, self-hosted B612 fonts, images, `CNAME` |
| `scripts/` | `product-data.mjs` (pilot-facing feature catalog), `build-pages.mjs` (generator), `check-site.mjs` (gate + IP leak check), `serve.mjs` (local preview) |
| `.github/workflows/` | `deploy.yml`: runs the gate and deploys `site/` to GitHub Pages |

## Development

No external npm dependencies are required. Requires Node 20+ (`.nvmrc` pins `24.16.0`).

```bash
make build   # Regenerate site/features.html and site/sitemap.xml
make check   # Run the full static gate and IP-leak check
make serve   # Preview at http://127.0.0.1:4175/
```

## Updating as pilot-facing features expand

1. Edit `scripts/product-data.mjs` (pilot-facing features only; never internal architecture,
   roadmaps, build logs, or test plans).
2. Run `make build && make check`.
3. Commit the updated data and generated HTML together.

## Hosting and DNS (GitHub Pages + Cloudflare)

This repository lives at `https://github.com/arflight/arflight.github.io`.

1. In GitHub repository settings under **Pages**, set Source to **GitHub Actions** and Custom
   domain to `flylineup.com` (matching `site/CNAME`). Enable **Enforce HTTPS**.
2. In Cloudflare DNS for `flylineup.com`:
   - Add four `A` records for `@` pointing to GitHub Pages IPs (`185.199.108.153`,
     `185.199.109.153`, `185.199.110.153`, `185.199.111.153`), DNS only (grey cloud) while GitHub
     provisions the TLS certificate.
   - Add a `CNAME` record for `www` pointing to `arflight.github.io`.
3. Optional redirect for `ar-flight.com`: in Cloudflare, configure a Redirect Rule sending
   `https://ar-flight.com/*` and `https://www.ar-flight.com/*` (301) to `https://flylineup.com/$1`.
