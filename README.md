# สารานุกรมไดโนเสาร์ (dino-wiki)

A Thai-language dinosaur encyclopedia. Fully static Next.js (App Router) site, ~1,500 dinosaur
pages built from the Paleobiology Database (PBDB), Wikidata, and Wikimedia Commons, plus
hand-written Thai content layered on top.

## Data pipeline

Scientific data (classification, age range, fossil locality countries, naming author/year,
image attribution) comes from three public APIs and is rebuilt with:

```bash
npm run fetch:dinosaurs
```

This writes `data/dinosaurs.json` and `data/meta.json`. It hits live APIs (no API keys needed)
and takes a couple of minutes. Set `WIKIMEDIA_UA` to a descriptive user agent string
(`name/version (contact info)`) — Wikimedia's APIs expect one.

Images are downloaded and converted to WebP separately:

```bash
npm run fetch:images
```

This reads `data/dinosaurs.json`, downloads each dinosaur's lead image via Wikimedia's own
thumbnailing service (at the two widths Wikimedia allows on demand — 330px and 960px — see the
comment in `scripts/fetch-images.ts`), converts to WebP with `sharp`, and writes the files into
`public/images/dinos/`. It also patches `localSmall`/`localLarge` back into `data/dinosaurs.json`.
It's rate-limited and safe to re-run — already-downloaded images are skipped. Set `IMAGE_LIMIT=20`
to test against a small subset first.

**The site never fetches images from `upload.wikimedia.org` at runtime** — only the local files
this script produces.

Hand-written Thai content (name meaning, size comparison, description, fun facts) lives in
`data/content-th.json`, keyed by slug. Nothing in the pipeline ever overwrites this file — add
entries by hand. A dinosaur with no entry there still gets a full page from the scientific data
alone.

## Development

```bash
npm run dev      # dev server at localhost:3000
npm run build    # static export to out/
npm run lint
```

`npm run build` produces a plain static `out/` folder — no server runtime required.

## Deploying to Cloudflare Pages

1. Connect the GitHub repo in the Cloudflare Pages dashboard (Workers & Pages → Create →
   Pages → Connect to Git).
2. Build settings:
   - Build command: `npm run build`
   - Build output directory: `out`
3. Environment variable: `NEXT_PUBLIC_SITE_URL` defaults to `https://dinocodex.com` (used for
   `sitemap.xml`, `robots.txt`, and Open Graph tags) — only set it explicitly if deploying
   under a different domain (e.g. a preview/staging URL).
4. Do **not** run `fetch:dinosaurs`/`fetch:images` as part of the Cloudflare build — the
   generated data and images are committed to the repo so the build never depends on live
   third-party APIs. Re-run them locally and commit the results when you want fresh data.

`public/_headers` sets long-lived cache headers for hashed static assets and images; Cloudflare
Pages picks this file up automatically.

The same `out/` output also deploys to Vercel, Netlify, GitHub Pages, or any static host.

## Attribution

Data: [Paleobiology Database](https://paleobiodb.org) (CC BY 4.0), [Wikidata](https://www.wikidata.org)
(CC0). Images: [Wikimedia Commons](https://commons.wikimedia.org), per-file licenses shown on
each dinosaur page. See `/about` for details.
