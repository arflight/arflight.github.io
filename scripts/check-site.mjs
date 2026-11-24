// The site's static gate. Enforces:
// - Script-free CSP (script-src 'none'), no <script>, no inline handlers, no style attributes
// - No third-party requests (external links restricted to ALLOWED_HOSTS)
// - No em-dashes (U+2014), no exclamation marks in HTML body copy, no banned filler words
// - IP protection: no internal codenames, hardware, architecture, roadmap, or test-bed terms in site/
// - Valid internal links, anchors, and image alt attributes
// - SEO/Open Graph/canonical/sitemap parity on every indexable page
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const site = join(root, 'site')
const EM = '\u2014'
const EN = '\u2013'
const CURLY_QUOTES = /[\u2018\u2019\u201c\u201d]/
const ORIGIN = 'https://flylineup.com'
const ALLOWED_HOSTS = new Set(['flylineup.com'])
const SEO_PROPERTIES = ['og:title', 'og:description', 'og:url', 'og:image', 'og:type']
const BANNED_WORDS = [
  'seamless',
  'powerful',
  'oops',
  'simply',
  'calm',
  'sparse',
  'honest',
  'delight',
  'effortless',
  'intuitive',
  'revolutionary',
  'incredible',
]
const BANNED_PHRASES = [
  'earns its place',
  'never a surprise',
  'without clutter',
  'with confidence',
  'quiet when normal',
  'rather than',
  'serves as',
  'acts as',
  'stands as',
]

// Internal/IP terms that must never appear in any published file under site/
const INTERNAL_IP_TERMS = [
  'xrflight',
  'xreal',
  'aura',
  'pixel 10',
  'accord',
  'ktys',
  'kdkx',
  'knoxville',
  'cfii',
  'x-plane',
  'msfs',
  'simbridge',
  'navdata',
  'flightdata',
  'jetpack',
  'detekt',
  'cifp',
  'nasr',
  'mrms',
  'stratux',
  'gdl 90',
  'connext',
  'stage a',
  'stage b',
  'stage c',
  'stage d',
  'phase 0',
  'phase 1',
  'spec v',
  'packet',
  'puck',
  'marker board',
  'build log',
  'roadmap',
  '28-design',
]

function urlPathOf(file) {
  const rel = '/' + relative(site, file).split('\\').join('/')
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel
}

const sitemapXml = existsSync(join(site, 'sitemap.xml'))
  ? readFileSync(join(site, 'sitemap.xml'), 'utf8')
  : ''
const sitemapPaths = new Set(
  [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(ORIGIN, '')),
)
const indexable = new Set()

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) yield* walk(full)
    else yield full
  }
}

const failures = []
const fail = (file, message) => failures.push(`${relative(root, file)}: ${message}`)

for (const file of walk(root)) {
  if (!/\.(md|html|css|txt)$/.test(file)) continue
  if (file.endsWith('OFL.txt')) continue
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (line.includes(EM) && !line.includes('em-dash-ok')) {
        fail(file, `em-dash on line ${i + 1}`)
      }
      if (line.includes(EN)) {
        fail(file, `en-dash on line ${i + 1}`)
      }
      if (CURLY_QUOTES.test(line)) {
        fail(file, `curly quote or apostrophe on line ${i + 1}`)
      }
    })
}

// IP protection scan across all published text/HTML/CSS/SVG files under site/
for (const file of walk(site)) {
  if (!/\.(html|css|svg|txt|xml)$/.test(file)) continue
  if (file.endsWith('OFL.txt')) continue
  const text = readFileSync(file, 'utf8').toLowerCase()
  for (const term of INTERNAL_IP_TERMS) {
    if (text.includes(term)) {
      fail(file, `published file contains internal/IP term "${term}"`)
    }
  }
}

const pages = [...walk(site)].filter((f) => f.endsWith('.html'))
for (const page of pages) {
  const html = readFileSync(page, 'utf8')
  const csp = /http-equiv="Content-Security-Policy"\s+content="([^"]+)"/.exec(html)?.[1] ?? ''
  if (!csp.includes("script-src 'none'")) fail(page, "missing a CSP with script-src 'none'")
  if (/<script\b/i.test(html)) fail(page, 'contains a <script>')
  if (/\son[a-z]+=/i.test(html)) fail(page, 'contains an inline event handler')
  if (/\sstyle="/i.test(html)) fail(page, 'contains a style attribute (blocked by the CSP)')
  if (/serviceWorker/.test(html)) fail(page, 'mentions serviceWorker')
  if (!/<html lang="/.test(html)) fail(page, 'html has no lang')
  if (!/<title>[^<]+<\/title>/.test(html)) fail(page, 'has no title')

  const bodyText = html
    .replace(/<head[\s\S]*?<\/head>/i, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
  if (bodyText.includes('!')) fail(page, 'contains an exclamation mark in copy')
  for (const word of BANNED_WORDS) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(bodyText)) {
      fail(page, `contains banned slop/filler word "${word}"`)
    }
  }
  const lowerBody = bodyText.toLowerCase()
  for (const phrase of BANNED_PHRASES) {
    if (lowerBody.includes(phrase)) {
      fail(page, `contains banned AI-slop phrase "${phrase}"`)
    }
  }

  const path = urlPathOf(page)
  const meta = (attr, name) =>
    new RegExp(`<meta\\s+${attr}="${name}"\\s+content="([^"]+)"`).exec(html)?.[1]

  if (/<meta\s+name="robots"\s+content="[^"]*noindex/.test(html)) {
    if (sitemapPaths.has(path)) fail(page, 'is noindex but listed in sitemap.xml')
  } else {
    indexable.add(path)
    const canonical = /<link\s+rel="canonical"\s+href="([^"]+)"/.exec(html)?.[1]
    if (canonical !== ORIGIN + path) fail(page, `canonical should be ${ORIGIN + path}`)
    if (!meta('name', 'description')) fail(page, 'has no meta description')
    for (const property of SEO_PROPERTIES) {
      if (!meta('property', property)) fail(page, `has no ${property}`)
    }
    if (meta('property', 'og:url') !== canonical) fail(page, 'og:url differs from the canonical')
    if (!meta('name', 'twitter:card')) fail(page, 'has no twitter:card')
    if (!sitemapPaths.has(path)) fail(page, 'is missing from sitemap.xml')
  }

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(m[0])) fail(page, `image without alt: ${m[0].slice(0, 60)}`)
  }

  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
  const urls = [
    ...[...html.matchAll(/\s(?:href|src|srcset)="([^"]+)"/g)].map((m) => m[1]),
    meta('property', 'og:image'),
  ].filter(Boolean)

  for (const raw of urls) {
    const url = raw.startsWith(ORIGIN + '/') ? raw.slice(ORIGIN.length) : raw
    if (url.startsWith('#')) {
      if (!ids.has(url.slice(1))) fail(page, `anchor ${url} has no target`)
      continue
    }
    if (/^https?:/.test(url)) {
      const host = new URL(url).hostname
      if (url.startsWith('http:')) fail(page, `insecure link ${url}`)
      else if (!ALLOWED_HOSTS.has(host)) fail(page, `link to unlisted host ${host}`)
      continue
    }
    if (/^(mailto|data|javascript):/.test(url)) {
      fail(page, `disallowed URL scheme in ${url}`)
      continue
    }
    const cleanPath = url.split('#')[0].split('?')[0]
    const target = cleanPath.startsWith('/') ? join(site, cleanPath) : join(dirname(page), cleanPath)
    const resolved =
      cleanPath === '' || cleanPath.endsWith('/') ? join(target, 'index.html') : target
    if (!existsSync(resolved)) fail(page, `broken link ${url}`)
  }
}

for (const path of sitemapPaths) {
  if (!indexable.has(path)) fail(join(site, 'sitemap.xml'), `lists ${path}, which is not a page`)
}

if (failures.length) {
  for (const f of failures) console.error(f)
  process.exit(1)
}
console.log(
  `site: ${pages.length} pages script-free, IP-clean, links and anchors resolve, copy and SEO checks pass`,
)
