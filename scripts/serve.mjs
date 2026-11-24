// Local preview server for site/ on 127.0.0.1:4175. Development only, zero dependencies.
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, resolve, sep } from 'node:path'

const site = resolve(new URL('../site', import.meta.url).pathname)
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

createServer((req, res) => {
  const reqPath = decodeURIComponent(new URL(req.url ?? '/', 'http://127.0.0.1').pathname)
  let filePath = resolve(site, '.' + reqPath)
  if (filePath !== site && !filePath.startsWith(site + sep)) {
    filePath = join(site, '404.html')
  }
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html')
  }
  const found = existsSync(filePath) && statSync(filePath).isFile()
  const target = found ? filePath : join(site, '404.html')
  res.writeHead(found ? 200 : 404, {
    'content-type': TYPES[extname(target)] ?? 'application/octet-stream',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
  })
  res.end(readFileSync(target))
}).listen(4175, '127.0.0.1', () => console.log('http://127.0.0.1:4175/'))
