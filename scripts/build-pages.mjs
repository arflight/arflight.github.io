// Generates site/features.html and site/sitemap.xml from scripts/product-data.mjs.
// Pass --check to verify the files on disk match without writing.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { FEATURE_GROUPS, PRODUCT, STATIC_PAGES } from './product-data.mjs'

const root = new URL('..', import.meta.url).pathname
const site = join(root, 'site')
const checkOnly = process.argv.includes('--check')

const CSP =
  "default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; script-src 'none'; base-uri 'none'; form-action 'none'"

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function renderFeatures() {
  const canonical = `${PRODUCT.origin}/features.html`
  const title = 'Features: Line Up'
  const description =
    'Explore pilot-facing capabilities in Line Up: highway in the sky approaches, traffic pattern guidance, traffic and terrain awareness, weather briefings, and phase-aware checklists.'

  const jumpLinks = FEATURE_GROUPS.map(
    (g) => `<a href="#${g.id}">${esc(g.title)}</a>`,
  ).join('\n            ')

  const sections = FEATURE_GROUPS.map((g, idx) => {
    const bandClass = idx % 2 === 0 ? 'section section--band' : 'section'
    const cards = g.items
      .map(
        (item) => `            <article class="card stack">
              <h3>${esc(item.name)}</h3>
              <p class="muted">${esc(item.detail)}</p>
            </article>`,
      )
      .join('\n')

    return `      <section id="${g.id}" class="${bandClass}">
        <div class="wrap stack stack--loose">
          <div class="section-head stack">
            <p class="eyebrow">${esc(g.eyebrow)}</p>
            <h2>${esc(g.title)}</h2>
            <p class="muted">${esc(g.summary)}</p>
          </div>
          <div class="feature-grid">
${cards}
          </div>
        </div>
      </section>`
  }).join('\n\n')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- Generated from scripts/product-data.mjs. Edit that file and run make build. -->
    <meta http-equiv="Content-Security-Policy" content="${CSP}" />
    <meta name="referrer" content="no-referrer" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(PRODUCT.name)}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${PRODUCT.origin}/assets/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(PRODUCT.name)}: ${esc(PRODUCT.tagline)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="color-scheme" content="light dark" />
    <meta name="theme-color" content="#f7f4ec" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#121416" media="(prefers-color-scheme: dark)" />
    <link rel="icon" href="favicon.ico" sizes="48x48" />
    <link rel="icon" href="assets/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="assets/apple-touch-icon.png" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="wrap">
        <a class="brand" href="./" aria-label="${esc(PRODUCT.name)} home">
          <img src="assets/favicon.svg" alt="" width="36" height="36" />
          <span>Line <span class="brand__accent">Up</span></span>
        </a>
        <nav class="site-nav" aria-label="Site">
          <a href="features.html" aria-current="page">Features</a>
          <a class="optional" href="./#display">Display</a>
          <a href="safety.html">Safety</a>
          <a class="optional" href="./#faq">Questions</a>
        </nav>
      </div>
    </header>

    <main id="main">
      <section class="hero hero--page">
        <div class="wrap stack">
          <nav class="crumbs" aria-label="Breadcrumb">
            <ol>
              <li><a href="./">Home</a></li>
              <li aria-current="page">Features</li>
            </ol>
          </nav>
          <p class="eyebrow">Capabilities</p>
          <h1>Built for every phase of flight.</h1>
          <p class="lead lead--wide">
            From preflight briefing and taxi to the traffic pattern and final approach, Line Up
            puts the flight picture ahead of you so your eyes stay outside.
          </p>
          <nav class="jump" aria-label="Jump to section">
            ${jumpLinks}
          </nav>
        </div>
      </section>

${sections}
    </main>

    <footer class="site-footer">
      <div class="wrap stack">
        <nav aria-label="Footer">
          <a href="./">Home</a>
          <a href="features.html">Features</a>
          <a href="safety.html">Safety and philosophy</a>
        </nav>
        <p>
          Line Up is a supplemental situational-awareness system for general aviation. It does not
          replace certified aircraft instruments, avionics, or official flight publications. The
          pilot in command remains responsible for the safe operation of every flight.
        </p>
      </div>
    </footer>
  </body>
</html>
`
}

function renderSitemap() {
  const paths = [...STATIC_PAGES, '/features.html']
  const urls = paths
    .map((p) => `  <url>\n    <loc>${PRODUCT.origin}${p}</loc>\n  </url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

const outputs = [
  [join(site, 'features.html'), renderFeatures()],
  [join(site, 'sitemap.xml'), renderSitemap()],
]

let drift = false
for (const [file, content] of outputs) {
  if (checkOnly) {
    const current = existsSync(file) ? readFileSync(file, 'utf8') : ''
    if (current !== content) {
      console.error(`drift: ${file} does not match scripts/product-data.mjs (run make build)`)
      drift = true
    }
  } else {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, content, 'utf8')
  }
}

if (drift) process.exit(1)
console.log(
  checkOnly
    ? `pages: ${outputs.length} generated files match scripts/product-data.mjs`
    : `built ${outputs.length} generated files`,
)
