#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const SRC = path.resolve('hoved');
const OUT = path.resolve('hoved');
const LOCALES_DIR = path.resolve('hoved/locales');
const CARDS_PER_PAGE = 12;

const COLLECTIONS = [
  {
    slug: 'nytt', contentDir: 'content/d_eve/nytt', outputDir: 'pages/d_eve',
    pageTitle: 'News', sectionTitle: 'News', eyebrow: 'Events / News',
    breadcrumb: 'Home \u2192 Events \u2192 News',
    description: 'News related to Atheism, Secularism & Islam around Bangladesh and Globally',
    activeGroup: 'd_eve',
    tabs: [
      { label: 'News', href: 'nytt.html', key: 'news' },
      { label: 'Politics', href: 'lex.html', key: 'politics' },
      { label: 'Economy', href: 'eko.html', key: 'economy' },
    ],
  },
  {
    slug: 'lex', contentDir: 'content/d_eve/lex', outputDir: 'pages/d_eve',
    pageTitle: 'Politics', sectionTitle: 'Politics', eyebrow: 'Events / Politics',
    breadcrumb: 'Home \u2192 Events \u2192 Politics',
    description: 'Political influence of Atheism and Islam',
    activeGroup: 'd_eve',
    tabs: [
      { label: 'News', href: 'nytt.html', key: 'news' },
      { label: 'Politics', href: 'lex.html', key: 'politics' },
      { label: 'Economy', href: 'eko.html', key: 'economy' },
    ],
  },
  {
    slug: 'eko', contentDir: 'content/d_eve/eko', outputDir: 'pages/d_eve',
    pageTitle: 'Economy', sectionTitle: 'Economy', eyebrow: 'Events / Economy',
    breadcrumb: 'Home \u2192 Events \u2192 Economy',
    description: 'Economic influence of Atheism and Islam',
    activeGroup: 'd_eve',
    tabs: [
      { label: 'News', href: 'nytt.html', key: 'news' },
      { label: 'Politics', href: 'lex.html', key: 'politics' },
      { label: 'Economy', href: 'eko.html', key: 'economy' },
    ],
  },
  {
    slug: 'pen', contentDir: 'content/e_post/pen', outputDir: 'pages/e_post',
    pageTitle: 'Personal Articles', sectionTitle: 'Personal Articles', eyebrow: 'Posts / Personal Articles',
    breadcrumb: 'Home \u2192 Posts \u2192 Personal Articles',
    description: 'Collection-style archive for personal articles.',
    activeGroup: 'e_post',
    tabs: [
      { label: 'Personal Articles', href: 'pen.html', key: 'personalArticles' },
      { label: 'Interviews', href: 'qa.html', key: 'interviews' },
      { label: 'Comments', href: 'feed.html', key: 'comments' },
    ],
  },
  {
    slug: 'qa', contentDir: 'content/e_post/qa', outputDir: 'pages/e_post',
    pageTitle: 'Interviews', sectionTitle: 'Interviews', eyebrow: 'Posts / Interviews',
    breadcrumb: 'Home \u2192 Posts \u2192 Interviews',
    description: 'Collection-style archive for interview articles.',
    activeGroup: 'e_post',
    tabs: [
      { label: 'Personal Articles', href: 'pen.html', key: 'personalArticles' },
      { label: 'Interviews', href: 'qa.html', key: 'interviews' },
      { label: 'Comments', href: 'feed.html', key: 'comments' },
    ],
  },
  {
    slug: 'feed', contentDir: 'content/e_post/feed', outputDir: 'pages/e_post',
    pageTitle: 'Comments', sectionTitle: 'Comments', eyebrow: 'Posts / Comments',
    breadcrumb: 'Home \u2192 Posts \u2192 Comments',
    description: 'Collection-style archive for comments.',
    activeGroup: 'e_post',
    tabs: [
      { label: 'Personal Articles', href: 'pen.html', key: 'personalArticles' },
      { label: 'Interviews', href: 'qa.html', key: 'interviews' },
      { label: 'Comments', href: 'feed.html', key: 'comments' },
    ],
  },
];

const NAV_ITEMS = [
  { label: 'Home', href: 'index.html', group: null, key: 'home' },
  { label: 'History', href: 'pages/b_ftid/ftid.html', group: 'b_ftid', key: 'history' },
  { label: 'Philosophy', href: 'pages/c_ism/fil.html', group: 'c_ism', key: 'philosophy' },
  { label: 'Events', href: 'pages/d_eve/nytt.html', group: 'd_eve', key: 'events' },
  { label: 'Posts', href: 'pages/e_post/pen.html', group: 'e_post', key: 'posts' },
  { label: 'Info', href: 'pages/f_info/si.html', group: 'f_info', key: 'info' },
];

const LANG_FLAGS = [
  { code: 'en', title: 'English', img: 'gb.svg', alt: 'EN' },
  { code: 'bd', title: 'Bengali', img: 'bd.svg', alt: 'BD' },
  { code: 'bl', title: 'Bengali-Latin', img: 'bdl.svg', alt: 'BL' },
  { code: 'ch', title: 'Chinese', img: 'cn.svg', alt: 'CH' },
  { code: 'de', title: 'German', img: 'de.svg', alt: 'DE' },
  { code: 'in', title: 'Hindi', img: 'in.svg', alt: 'IN' },
  { code: 'jp', title: 'Japanese', img: 'jp.svg', alt: 'JP' },
  { code: 'pk', title: 'Urdu', img: 'pk.svg', alt: 'PK' },
  { code: 'sa', title: 'Arabic', img: 'sa.svg', alt: 'SA' },
];

const NON_ENGLISH = LANG_FLAGS.filter(f => f.code !== 'en');

const BCP47 = { bd: 'bn', bl: 'bn-Latn', ch: 'zh-Hans', de: 'de', in: 'hi', jp: 'ja', pk: 'ur', sa: 'ar', en: 'en' };

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function flagHref(curLang, tgtLang, slug, curDepth) {
  if (curLang === 'en') {
    if (slug === 'index') return tgtLang === 'en' ? 'en.html' : `${tgtLang}.html`;
    if (tgtLang === 'en') return `${slug}.html`;
    return `${tgtLang}/${slug}.html`;
  }
  if (tgtLang === 'en') {
    if (slug === 'index') return `${'../'.repeat(curDepth)}pages/a_hus/en.html`;
    return `${'../'.repeat(Math.max(0, curDepth - 2))}${slug}.html`;
  }
  if (curLang === tgtLang) return slug === 'index' ? `${tgtLang}.html` : `${slug}.html`;
  if (slug === 'index') return `${tgtLang}.html`;
  return `../${tgtLang}/${slug}.html`;
}

function navHref(item, prefix, lang, activeGroup) {
  if (lang === 'en') {
    if (item.group === null) return `${prefix}pages/a_hus/en.html`;
    return `${prefix}${item.href}`;
  }
  if (item.group === null) return `${prefix}pages/a_hus/${lang}.html`;
  const TRANSLATED_GROUPS = ['b_ftid', 'c_ism', 'f_info'];
  if (item.group === activeGroup) {
    return item.href.split('/').pop();
  }
  if (item.group && TRANSLATED_GROUPS.includes(item.group)) {
    const secSlug = item.href.split('/').pop().replace('.html', '');
    return `${prefix}pages/${item.group}/${lang}/${secSlug}.html`;
  }
  return `${prefix}${item.href}`;
}

function buildNav(activeGroup, prefix, lang, slug, t, curDepth, englishOnly) {
  const links = NAV_ITEMS.map(n => {
    const cls = n.group === activeGroup ? 'active' : '';
    const lbl = t ? (t.nav[n.key] || n.label) : n.label;
    const href = navHref(n, prefix, lang, activeGroup);
    return `          <a class="${cls}" href="${href}">${lbl}</a>`;
  }).join('\n');

  let langMenu;
  if (englishOnly) {
    langMenu = `              <p class="notice-text" style="margin: 0 0 10px 0; white-space: nowrap; font-size: 13px;">This page is mostly in English</p>
              <a href="?lang=en" class="flag" title="English"><img src="${prefix}assets/flags/gb.svg" alt="EN" /></a>`;
  } else {
    const flags = LANG_FLAGS.map(f => {
      const href = flagHref(lang, f.code, slug, curDepth);
      return `              <a href="${href}" class="flag" title="${f.title}"><img src="${prefix}assets/flags/${f.img}" alt="${f.alt}" /></a>`;
    }).join('\n');
    langMenu = flags;
  }

  const brandHref = `${prefix}pages/a_hus/${lang}.html`;
  return `  <nav class="nav">
    <div class="container nav-inner">
      <a class="brand" href="${brandHref}">
        <div class="logo">
          <img src="${prefix}assets/flags/logo.svg" alt="" style="width: 100%; height: 100%; display: block; object-fit: contain;" />
        </div>
        <span>Vanga Vitanastika</span>
      </a>
      <button class="menu-btn" id="menuBtn" aria-label="Toggle navigation">\u2630</button>
      <div class="nav-wrap" id="navWrap">
        <div class="nav-top">
${links}
          <div class="lang-dropdown">
            <button class="lang-trigger" aria-label="Switch Language" type="button">\uD83C\uDF10</button>
            <div class="lang-menu"${englishOnly ? ' style="display: flex; flex-direction: column; align-items: center; text-align: center; min-width: 180px; padding: 12px;"' : ''}>
${langMenu}
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>`;
}

function buildFooter(prefix, t) {
  const contact = t ? (t.footer.contact || 'Contact') : 'Contact';
  const terms = t ? (t.footer.terms || 'Terms of Service') : 'Terms of Service';
  return `  <footer>
    <div class="container footer-inner">
      <div style="display:flex;align-items:center;gap:.6rem;">
        <button id="themeBtn" title="Toggle theme" class="footer-toggle">
          <span id="themeIcon">\uD83C\uDF19</span>
        </button>
        <span>\u00A9 2016 - <span id="year"></span> VV. All rights reserved. <a> \u2503 </a> Atheism, Life & Bangladesh</span>
      </div>
      <span>
        <a href="${prefix}pages/f_info/talk.html" style="color:inherit;text-decoration:none">${contact}</a>
        <a> \u2503 </a>
        <a href="${prefix}pages/f_info/fine.html" style="color:inherit;text-decoration:none">${terms}</a>
      </span>
    </div>
  </footer>`;
}

function buildCard(title, desc, href, t) {
  const openLbl = t ? (t.ui.open || 'Open') : 'Open';
  return `        <article class="feature-card">
          <h3>${esc(title)}</h3>
          <p>${esc(desc)}</p>
          <p><a class="btn soft" href="${href}">${openLbl}</a></p>
        </article>`;
}

function buildPagination(current, total, slug, t) {
  if (total <= 1) return '';
  const prevLbl = t ? (t.ui.prev || 'Prev') : 'Prev';
  const nextLbl = t ? (t.ui.next || 'Next') : 'Next';
  const items = [];

  if (current > 1) {
    const prev = current === 2 ? `${slug}.html` : `${slug}-page-${current - 1}.html`;
    items.push(`        <a class="btn soft" href="${prev}">${prevLbl}</a>`);
  }
  for (let i = 1; i <= total; i++) {
    const href = i === 1 ? `${slug}.html` : `${slug}-page-${i}.html`;
    const cls = i === current ? 'btn primary' : 'btn soft';
    items.push(`        <a class="${cls}" href="${href}">${i}</a>`);
  }
  if (current < total) {
    items.push(`        <a class="btn soft" href="${slug}-page-${current + 1}.html">${nextLbl}</a>`);
  }
  return `    <section>
      <nav class="hero-actions" aria-label="Pagination">
${items.join('\n')}
      </nav>
    </section>`;
}

function sectionPage(col, articles, pg, total, lang, t) {
  const prefix = lang === 'en' ? '../../' : '../../../';
  const langAttr = BCP47[lang] || lang;

  const sd = t && t.sections && t.sections[col.slug] ? t.sections[col.slug] : null;
  const pgTitle = sd ? sd.pageTitle : `${col.pageTitle} \u2503 Vanga Vitanastika`;
  const sTitle = sd ? sd.title : col.sectionTitle;
  const eyebrow = sd ? sd.eyebrow : col.eyebrow;
  const breadcrumb = sd ? sd.breadcrumb : col.breadcrumb;
  const desc = sd ? sd.description : col.description;

  const tabs = col.tabs.map(tab => {
    const lbl = t && t.tabs ? (t.tabs[tab.key] || tab.label) : tab.label;
    return `          <a class="btn soft" href="${tab.href}">${lbl}</a>`;
  }).join('\n');

  const cards = articles.map(a => buildCard(a.title, a.desc, `${col.slug}/${a.slug}.html`, t)).join('\n\n');
  const pag = buildPagination(pg, total, col.slug, t);

  return `<!DOCTYPE html>
<html lang="${langAttr}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(pgTitle)}</title>
  <link rel="icon" type="image/svg+xml" href="${prefix}assets/flags/logo.svg" />
  <link rel="stylesheet" href="${prefix}assets/styles.css" />
</head>
<body>
  <div class="orb one"></div><div class="orb two"></div><div class="orb three"></div>
${buildNav(col.activeGroup, prefix, lang, col.slug, t, undefined, true)}

  <main class="container">
    <section class="hero compact">
      <div>
        <div class="eyebrow">${esc(eyebrow)}</div>
        <div class="breadcrumb">${esc(breadcrumb)}</div>
        <h1 class="gradient-text">${esc(sTitle)}</h1>
        <p class="lead">${esc(desc)}</p>
        <div class="hero-actions">
${tabs}
        </div>
      </div>
    </section>

    <section>
      <div class="grid-3">
${cards}
      </div>
    </section>
${pag}
  </main>

${buildFooter(prefix, t)}
  <script src="${prefix}assets/app.js"></script>
</body>
</html>`;
}

function articlePage(title, desc, body, group, lang, slug, colSlug, sectionTitle, t) {
  const prefix = lang === 'en' ? '../../../' : '../../../../';
  const langAttr = BCP47[lang] || lang;

  return `<!DOCTYPE html>
<html lang="${langAttr}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)} \u2503 Vanga Vitanastika</title>
  <link rel="icon" type="image/svg+xml" href="${prefix}assets/flags/logo.svg" />
  <link rel="stylesheet" href="${prefix}assets/styles.css" />
</head>
<body>
  <div class="orb one"></div><div class="orb two"></div><div class="orb three"></div>
${buildNav(group, prefix, lang, slug, t, undefined, true)}

  <main class="container">
    <section class="hero compact">
      <div>
        <div class="hero-actions">
          <a class="btn soft" href="../${colSlug}.html">\u2190 Back to ${esc(sectionTitle)}</a>
        </div>
        <h1 class="gradient-text">${esc(title)}</h1>
        <p class="lead">${esc(desc)}</p>
      </div>
    </section>

    <section>
      <article class="feature-card">
${body}
      </article>
    </section>
  </main>

${buildFooter(prefix, t)}
  <script src="${prefix}assets/app.js"></script>
</body>
</html>`;
}

const STATIC_PAGES = [
  { src: 'index.html', outDir: '', group: null, slug: 'index', pageKey: 'home', isHome: true },
  { src: 'pages/b_ftid/ftid.html', outDir: 'pages/b_ftid', group: 'b_ftid', slug: 'ftid', pageKey: 'ftid' },
  { src: 'pages/b_ftid/vanga.html', outDir: 'pages/b_ftid', group: 'b_ftid', slug: 'vanga', pageKey: 'vanga' },
  { src: 'pages/b_ftid/bangla.html', outDir: 'pages/b_ftid', group: 'b_ftid', slug: 'bangla', pageKey: 'bangla' },
  { src: 'pages/b_ftid/bdatheism.html', outDir: 'pages/b_ftid', group: 'b_ftid', slug: 'bdatheism', pageKey: 'bdatheism' },
  { src: 'pages/c_ism/fil.html', outDir: 'pages/c_ism', group: 'c_ism', slug: 'fil', pageKey: 'fil' },
  { src: 'pages/c_ism/ath.html', outDir: 'pages/c_ism', group: 'c_ism', slug: 'ath', pageKey: 'ath' },
  { src: 'pages/c_ism/lens.html', outDir: 'pages/c_ism', group: 'c_ism', slug: 'lens', pageKey: 'lens' },
  { src: 'pages/c_ism/sync.html', outDir: 'pages/c_ism', group: 'c_ism', slug: 'sync', pageKey: 'sync' },
  { src: 'pages/f_info/si.html', outDir: 'pages/f_info', group: 'f_info', slug: 'si', pageKey: 'si' },
  { src: 'pages/f_info/ask.html', outDir: 'pages/f_info', group: 'f_info', slug: 'ask', pageKey: 'ask' },
  { src: 'pages/f_info/fine.html', outDir: 'pages/f_info', group: 'f_info', slug: 'fine', pageKey: 'fine' },
  { src: 'pages/f_info/talk.html', outDir: 'pages/f_info', group: 'f_info', slug: 'talk', pageKey: 'talk' },
];

const STATIC_TAB_GROUPS = {
  b_ftid: [
    { href: 'vanga.html', key: 'vanga', enLabel: 'Vanga' },
    { href: 'bangla.html', key: 'bangla', enLabel: 'Bangla' },
    { href: 'bdatheism.html', key: 'atheism', enLabel: 'Atheism' },
  ],
  c_ism: [
    { href: 'ath.html', key: 'atheism', enLabel: 'Atheism' },
    { href: 'sync.html', key: 'faith', enLabel: 'Faith' },
    { href: 'lens.html', key: 'stances', enLabel: 'Stances' },
  ],
  f_info: [
    { href: 'talk.html', key: 'contact', enLabel: 'Contact' },
    { href: 'ask.html', key: 'questions', enLabel: 'Questions & Guidelines' },
    { href: 'fine.html', key: 'terms', enLabel: 'Terms of Service' },
  ],
};

async function translateStaticPage(sp, lang, t) {
  const srcPath = path.join(SRC, sp.src);
  let html = await fs.readFile(srcPath, 'utf8');
  const langAttr = BCP47[lang] || lang;
  const isEn = lang === 'en';

  if (sp.isHome) {
    html = html.replace(/"assets\//g, `"../../assets/`);
    html = html.replace(/href="(?:\.\.\/)?pages\//g, 'href="../../pages/');
  } else if (!isEn) {
    html = html.replace(/"\.\.\/\.\.\//g, `"../../../`);
  }
  if (!isEn) {
    html = html.replace(/<html lang="en">/, `<html lang="${langAttr}">`);
  }

  const prefix = isEn
    ? (sp.isHome ? '../../' : '../../')
    : (sp.isHome ? '../../' : '../../../');
  const curDepth = isEn
    ? (sp.isHome ? 2 : 2)
    : (sp.isHome ? 2 : 3);
  html = html.replace(/<nav class="nav">[\s\S]*?<\/nav>/, buildNav(sp.group, prefix, lang, sp.slug, t, curDepth));
  html = html.replace(/<footer>[\s\S]*?<\/footer>/, buildFooter(prefix, t));

  if (sp.isHome) {
    html = html.replace(/<a class="brand" href="[^"]*">/, `<a class="brand" href="../../pages/a_hus/${lang}.html">`);
  }

  const pg = t && t.pages ? t.pages[sp.pageKey] : null;
  if (pg) {
    if (pg.title) {
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${pg.title}</title>`);
    }
    if (pg.eyebrow) {
      html = html.replace(/(<div class="eyebrow">)[^<]*(<\/div>)/, `$1${pg.eyebrow}$2`);
    }
    if (pg.breadcrumb) {
      html = html.replace(/(<div class="breadcrumb">)[^<]*(<\/div>)/, `$1${pg.breadcrumb}$2`);
    }
    if (pg.h1) {
      html = html.replace(/(<h1 class="gradient-text">)[^<]*(<\/h1>)/, `$1${pg.h1}$2`);
      html = html.replace(/(<h1><span class="gradient-text">)[^<]*(<\/span><\/h1>)/, `$1${pg.h1}$2`);
    }
    if (pg.lead) {
      html = html.replace(/(<p class="lead"(?:\s+style="[^"]*")?>)[^<]*(<\/p>)/, `$1${pg.lead}$2`);
    }
    if (pg.lead2) {
      html = html.replace(/(<p class="lead">)[^<]*(<\/p>)/, `$1${pg.lead2}$2`);
    }
  }

  if (sp.group && STATIC_TAB_GROUPS[sp.group] && t && t.staticTabs && t.staticTabs[sp.group]) {
    const tabDefs = STATIC_TAB_GROUPS[sp.group];
    const translatedTabs = t.staticTabs[sp.group];
    for (const tab of tabDefs) {
      const label = translatedTabs[tab.key] || tab.enLabel;
      const re = new RegExp(`(<a[^>]*href="${tab.href}"[^>]*>)\\s*[^<]*\\s*(<\\/a>)`);
      html = html.replace(re, `$1${label}$2`);
    }
  }

  if (pg && pg.body) {
    let cleanBody = pg.body;
    if (cleanBody.includes('<!DOCTYPE') || cleanBody.includes('<html')) {
      const innerMatch = cleanBody.match(/<body[^>]*>([\s\S]*?)<\/body>/);
      if (innerMatch) {
        cleanBody = innerMatch[1];
      }
      const sections = [...cleanBody.matchAll(/<section[^>]*>([\s\S]*?)<\/section>/g)];
      if (sections.length >= 2) {
        cleanBody = sections[1][1].trim();
      } else if (sections.length === 1) {
        cleanBody = sections[0][1].trim();
      } else {
        cleanBody = cleanBody.replace(/<[^>]+>/g, '').trim();
      }
    }
    if (sp.isHome) {
      cleanBody = cleanBody.replace(/"assets\//g, `"../../assets/`);
      cleanBody = cleanBody.replace(/href="(?:\.\.\/)?pages\//g, 'href="../../pages/');
    }
    const bodySectionRegex = /(<main class="container">[\s\S]*?<section class="hero(?:\s+compact)?">[\s\S]*?<\/section>\s*)(<section[^>]*>[\s\S]*?<\/section>)/;
    const bodyMatch = html.match(bodySectionRegex);
    if (bodyMatch) {
      html = html.replace(bodySectionRegex, `$1<section>\n${cleanBody}\n    </section>`);
    }
  }

  return html;
}

async function build() {
  console.log('Building site...');

  const STALE_ARTICLE_DIRS = COLLECTIONS.map(col => `pages/${col.activeGroup}/${col.slug}`);
  for (const d of STALE_ARTICLE_DIRS) {
    await fs.remove(path.join(OUT, d));
  }
  await fs.remove(path.join(OUT, 'pages', 'd_eve', 'index.html'));
  await fs.remove(path.join(OUT, 'pages', 'e_post', 'index.html'));

  for (const col of COLLECTIONS) {
    const cDir = path.join(SRC, col.contentDir);
    const sDir = path.join(OUT, col.outputDir);
    const aDir = path.join(OUT, col.outputDir, col.slug);
    if (!await fs.pathExists(cDir)) continue;
    await fs.ensureDir(sDir);
    await fs.ensureDir(aDir);

    const files = (await fs.readdir(cDir)).filter(f => f.endsWith('.md'));
    const articles = [];

    for (const file of files) {
      const raw = await fs.readFile(path.join(cDir, file), 'utf8');
      const { data, content } = matter(raw);
      const slug = file.replace(/\.md$/, '');
      const title = data.title || slug;
      const desc = data.description || content.split(/\s+/).slice(0, 10).join(' ') + '\u2026';
      const body = marked.parse(content);

      await fs.writeFile(path.join(aDir, `${slug}.html`), articlePage(title, desc, body, col.activeGroup, 'en', slug, col.slug, col.sectionTitle, null));
      articles.push({ title, desc, slug, body });
    }

    articles.sort((a, b) => {
      const numA = Number((a.slug.match(/(\d+)/) || [])[1] ?? NaN);
      const numB = Number((b.slug.match(/(\d+)/) || [])[1] ?? NaN);
      if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numB - numA;
      return a.title.localeCompare(b.title);
    });
    const pages = Math.max(1, Math.ceil(articles.length / CARDS_PER_PAGE));

    for (let i = 1; i <= pages; i++) {
      const start = (i - 1) * CARDS_PER_PAGE;
      const pageArticles = articles.slice(start, start + CARDS_PER_PAGE);
      const name = i === 1 ? col.slug : `${col.slug}-page-${i}`;
      await fs.writeFile(path.join(sDir, `${name}.html`), sectionPage(col, pageArticles, i, pages, 'en', null));
    }

    console.log(`  ${col.slug}: ${articles.length} articles \u2192 ${pages} page(s)`);
  }

  const redirect = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=pages/a_hus/en.html" />
  <link rel="canonical" href="pages/a_hus/en.html" />
  <title>Vanga Vitanastika</title>
</head>
<body>
  <script>window.location.replace('pages/a_hus/en.html');</script>
  <p><a href="pages/a_hus/en.html">Enter Vanga Vitanastika</a></p>
</body>
</html>`;
  await fs.writeFile(path.join(OUT, 'index.html'), redirect);

  console.log('Done \u2192 hoved/');
}

build().catch(err => { console.error(err); process.exit(1); });