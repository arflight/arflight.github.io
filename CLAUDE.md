# arflight.github.io

The static, script-free public product site for **Line Up**, published from `site/` to
`https://flylineup.com/` via GitHub Pages.

## Commands

| Command | Purpose |
| --- | --- |
| `make build` | Rebuild `site/features.html` and `site/sitemap.xml` from `scripts/product-data.mjs` |
| `make check` | Verify generated pages are up to date, then run `scripts/check-site.mjs` (the gate) |
| `make serve` | Serve `site/` locally at `http://127.0.0.1:4175/` |

Run `make build && make check` before calling any site change done; CI runs `npm run check` on
every push and pull request.

## Non-negotiables

- **Pilot-facing product copy only (IP protection).** Market Line Up the way ForeFlight markets a
  product: focus strictly on what pilots experience in the cockpit. Never publish internal
  roadmaps, build logs, specs, packet IDs, system architecture, hardware choices, data pipeline
  details, or test-bed plans. `scripts/check-site.mjs` enforces an internal-term blocklist on
  every published file under `site/`.
- **No `<script>`, inline handlers, `style` attributes, or service worker.** Every page carries a
  strict CSP with `script-src 'none'`.
- **No third-party requests.** B612 fonts and all images live in `site/`.
- **Design system parity.** Colours and type mirror `../specs/28-design.md`: Chart paper (day) and
  Panel graphite (cockpit) via `prefers-color-scheme`, Airway blue primary, Chart sepia accent,
  self-hosted B612 font with `OFL.txt`. Additive HUD green appears only inside dark HUD previews.
- **Writing standards.** Follow `../devtools/skills/writing-standards/SKILL.md` (Google,
  Microsoft, and Apple style guides). Active voice, concrete verbs, straight ASCII quotes, no
  em-dashes, en-dashes, or exclamation marks, and no AI-slop words or negative-parallelism
  templates (`scripts/check-site.mjs` enforces the blocklist). Keep supplemental
  situational-awareness wording intact.
- **Generated pages.** `site/features.html` and `site/sitemap.xml` are generated from
  `scripts/product-data.mjs`. Edit `scripts/product-data.mjs`, run `make build`, and commit the
  output. Never edit generated pages by hand; the gate fails on drift.
