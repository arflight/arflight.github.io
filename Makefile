# Every target runs on the Node version in .nvmrc (via nvm when available).
SHELL := /bin/bash
NODE := source $$HOME/.nvm/nvm.sh >/dev/null 2>&1 && nvm use >/dev/null 2>&1;

.PHONY: check serve build

## Gate: generated pages up to date, script-free CSP, IP-leak guard, links, anchors, copy, SEO.
check:
	$(NODE) npm run check

## Rebuild site/features.html and site/sitemap.xml from scripts/product-data.mjs.
build:
	$(NODE) npm run build

## Serve site/ at http://127.0.0.1:4175/.
serve:
	$(NODE) npm run serve
