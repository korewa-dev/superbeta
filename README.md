# Vanga Vitanastika + Sveltia structure

## Folder arrangement
- `admin/config.yml` -> Sveltia CMS config
- `content/d_events/news` -> markdown entries for News
- `content/d_events/politics` -> markdown entries for Politics
- `content/d_events/economy` -> markdown entries for Economy
- `content/e_posts/pen` -> markdown entries for Pen
- `content/e_posts/feed` -> markdown entries for Feed / Comments
- `content/e_posts/qa` -> markdown entries for QA / Interviews
- `base_patched_site/` -> your existing static site output folder
- `scripts/build.mjs` -> markdown-to-HTML builder with 12-card pagination

## What the builder does
1. Reads markdown entries from each collection.
2. Creates one article HTML page per entry.
3. Rebuilds each section index page with preview cards.
4. Limits each section page to 12 previews.
5. Adds numbered pagination and Prev / Next links.
6. Uses `description` if present; otherwise uses the first 5-10 words from the article body.

## Expected workflow
1. Open `/admin`
2. Create a post in News, Politics, Economy, Pen, Feed, or QA
3. Sveltia saves a `.md` file into the matching `content/...` folder
4. Run `npm install`
5. Run `npm run build`
6. Deploy `base_patched_site`

## Hosting
- Cloudflare Pages build command: `npm install && npm run build`
- Cloudflare Pages output folder: `base_patched_site`
- GitHub Pages: run build in GitHub Actions, then publish `base_patched_site`
