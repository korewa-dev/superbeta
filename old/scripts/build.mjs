import fs from "fs-extra";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const root = process.cwd();
const siteRoot = path.join(root, "base_patched_site");
const contentRoot = path.join(root, "content");
const perPage = 12;

const sections = [
  {
    key: "news",
    source: path.join(contentRoot, "d_events", "news"),
    output: path.join(siteRoot, "pages", "d_events", "news"),
    title: "News",
    sectionLabel: "D Events / News",
    breadcrumb: "Home → Events → News",
    intro: "News related to Atheism, Secularism & Islam around Bangladesh and Globally",
    nav: [
      { label: "News", href: "index.html" },
      { label: "Politics", href: "../lex/index.html" },
      { label: "Economy", href: "../econ/index.html" },
    ],
  },
  {
    key: "politics",
    source: path.join(contentRoot, "d_events", "politics"),
    output: path.join(siteRoot, "pages", "d_events", "lex"),
    title: "Politics",
    sectionLabel: "D Events / Politics",
    breadcrumb: "Home → Events → Politics",
    intro: "Collection-style archive for politics articles.",
    nav: [
      { label: "News", href: "../news/index.html" },
      { label: "Politics", href: "index.html" },
      { label: "Economy", href: "../econ/index.html" },
    ],
  },
  {
    key: "economy",
    source: path.join(contentRoot, "d_events", "economy"),
    output: path.join(siteRoot, "pages", "d_events", "econ"),
    title: "Economy",
    sectionLabel: "D Events / Economy",
    breadcrumb: "Home → Events → Economy",
    intro: "Economic influence of Atheism and Islam",
    nav: [
      { label: "News", href: "../news/index.html" },
      { label: "Politics", href: "../lex/index.html" },
      { label: "Economy", href: "index.html" },
    ],
  },
  {
    key: "pen",
    source: path.join(contentRoot, "e_posts", "pen"),
    output: path.join(siteRoot, "pages", "e_posts", "pen"),
    title: "Personal Articles",
    sectionLabel: "E Posts / Pen",
    breadcrumb: "Home → Posts → Pen",
    intro: "Collection-style index page rendered from markdown entries.",
    nav: [
      { label: "Pen", href: "index.html" },
      { label: "Feed", href: "../feed/index.html" },
      { label: "QA", href: "../qa/index.html" },
    ],
  },
  {
    key: "feed",
    source: path.join(contentRoot, "e_posts", "feed"),
    output: path.join(siteRoot, "pages", "e_posts", "feed"),
    title: "Comments",
    sectionLabel: "E Posts / Feed",
    breadcrumb: "Home → Posts → Feed",
    intro: "Collection-style index page rendered from markdown entries.",
    nav: [
      { label: "Pen", href: "../pen/index.html" },
      { label: "Feed", href: "index.html" },
      { label: "QA", href: "../qa/index.html" },
    ],
  },
  {
    key: "qa",
    source: path.join(contentRoot, "e_posts", "qa"),
    output: path.join(siteRoot, "pages", "e_posts", "qa"),
    title: "Interviews",
    sectionLabel: "E Posts / QA",
    breadcrumb: "Home → Posts → QA",
    intro: "Collection-style index page rendered from markdown entries.",
    nav: [
      { label: "Pen", href: "../pen/index.html" },
      { label: "Feed", href: "../feed/index.html" },
      { label: "QA", href: "index.html" },
    ],
  },
];

const globalHeader = `<div class="nav"><div class="container nav-inner"><a class="brand" href="../../../index.html"><span class="logo">◔</span><span>Vanga Vitanastika</span></a><div class="nav-wrap open"><div class="nav-top"><a href="../../../index.html">Home</a><a href="../../../pages/b_history/vanga.html">History</a><a href="../../../pages/c_ism/nastikbad.html">Philosophy</a><a href="../../../pages/d_events/news/index.html">Events</a><a href="../../../pages/e_posts/pen/index.html">Posts</a><a href="../../../pages/f_info/kontakt.html">Info</a></div></div></div></div>`;
const footer = `<footer><div class="container footer-inner"><span>© Vanga Vitanastika</span><a href="../../../pages/f_info/fine.html">Terms of Service</a></div></footer>`;

function slugify(text) {
  return (
    String(text || "article")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "article"
  );
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function previewText(description, html) {
  if (description && description.trim()) return description.trim();
  const words = stripHtml(html).split(/\s+/).filter(Boolean).slice(0, 10);
  return words.join(" ") + (words.length ? "…" : "");
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeLeadingMarkdownTitle(content, title) {
  if (!content) return "";

  let cleaned = content.replace(/^\uFEFF/, "").trimStart();

  const titlePattern = new RegExp(
    `^#\\s+${escapeRegExp(title)}\\s*(?:\\r?\\n)+`,
    "i"
  );

  if (title && titlePattern.test(cleaned)) {
    cleaned = cleaned.replace(titlePattern, "");
    return cleaned.trimStart();
  }

  return cleaned;
}

function articleTemplate({ title, sectionLabel, breadcrumb, backHref, backLabel, htmlBody }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | Vanga Vitanastika</title>
  <link rel="stylesheet" href="../../../assets/styles.css">
</head>
<body>
${globalHeader}
<main class="container">
  <section class="hero compact">
    <div>
      <div class="eyebrow">${sectionLabel}</div>
      <div class="breadcrumb">${breadcrumb} → ${title}</div>
      <h1 class="gradient-text">${title}</h1>
      <div class="hero-actions"><a class="btn soft" href="${backHref}">${backLabel}</a></div>
    </div>
  </section>
  <section>
    <div class="feature-card">
      <h2>Article overview</h2>
      ${htmlBody}
    </div>
  </section>
</main>
${footer}
<script src="../../../assets/app.js"></script>
</body>
</html>`;
}

function paginationLinks(totalPages, currentPage) {
  if (totalPages <= 1) return "";

  let html = '<nav class="hero-actions" aria-label="Pagination">';

  if (currentPage > 1) {
    html += `<a class="btn soft" href="${currentPage === 2 ? "index.html" : `page-${currentPage - 1}.html`}">Prev</a>`;
  }

  for (let i = 1; i <= totalPages; i += 1) {
    const href = i === 1 ? "index.html" : `page-${i}.html`;
    const cls = i === currentPage ? "btn primary" : "btn soft";
    html += `<a class="${cls}" href="${href}">${i}</a>`;
  }

  if (currentPage < totalPages) {
    html += `<a class="btn soft" href="page-${currentPage + 1}.html">Next</a>`;
  }

  html += "</nav>";
  return html;
}

function listingTemplate({ title, sectionLabel, breadcrumb, intro, tabsHtml, cardsHtml, pagerHtml }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | Vanga Vitanastika</title>
  <link rel="stylesheet" href="../../../assets/styles.css">
</head>
<body>
${globalHeader}
<main class="container">
  <section class="hero compact">
    <div>
      <div class="eyebrow">${sectionLabel}</div>
      <div class="breadcrumb">${breadcrumb}</div>
      <h1 class="gradient-text">${title}</h1>
      <p class="lead">${intro}</p>
      <div class="hero-actions">${tabsHtml}</div>
    </div>
  </section>
  <section>
    <div class="grid-3">
      ${cardsHtml || '<div class="feature-card"><p>No articles yet.</p></div>'}
    </div>
  </section>
  <section>
    ${pagerHtml}
  </section>
</main>
${footer}
<script src="../../../assets/app.js"></script>
</body>
</html>`;
}

function sortEntries(entries) {
  return entries.sort((a, b) => a.title.localeCompare(b.title));
}

async function readEntries(dir) {
  if (!(await fs.pathExists(dir))) return [];

  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  const entries = [];

  for (const file of files) {
    const full = path.join(dir, file);
    const raw = await fs.readFile(full, "utf8");
    const parsed = matter(raw);

    const title = parsed.data.title || path.basename(file, ".md");
    const slug = slugify(parsed.data.slug || title);

    const cleanedMarkdown = removeLeadingMarkdownTitle(parsed.content || "", title);
    const htmlBody = marked.parse(cleanedMarkdown);

    entries.push({
      title,
      slug,
      description: parsed.data.description || "",
      htmlBody,
    });
  }

  return sortEntries(entries);
}

async function buildSection(section) {
  await fs.ensureDir(section.output);

  const entries = await readEntries(section.source);
  const articleFiles = [];

  for (const entry of entries) {
    const fileName = `${entry.slug}.html`;
    const articlePath = path.join(section.output, fileName);

    const html = articleTemplate({
      title: entry.title,
      sectionLabel: section.sectionLabel,
      breadcrumb: section.breadcrumb,
      backHref: "index.html",
      backLabel: `Back to ${section.title}`,
      htmlBody: entry.htmlBody,
    });

    await fs.writeFile(articlePath, html, "utf8");

    articleFiles.push({
      ...entry,
      fileName,
      preview: previewText(entry.description, entry.htmlBody),
    });
  }

  const totalPages = Math.max(1, Math.ceil(articleFiles.length / perPage));
  const tabsHtml = section.nav
    .map((item) => `<a class="btn soft" href="${item.href}">${item.label}</a>`)
    .join("");

  for (let page = 1; page <= totalPages; page += 1) {
    const pageEntries = articleFiles.slice((page - 1) * perPage, page * perPage);

    const cardsHtml = pageEntries
      .map(
        (item) => `
      <article class="feature-card">
        <h3>${item.title}</h3>
        <p>${item.preview}</p>
        <p><a class="btn soft" href="${item.fileName}">Open</a></p>
      </article>`
      )
      .join("");

    const pagerHtml = paginationLinks(totalPages, page);

    const html = listingTemplate({
      title: section.title,
      sectionLabel: section.sectionLabel,
      breadcrumb: section.breadcrumb,
      intro: section.intro,
      tabsHtml,
      cardsHtml,
      pagerHtml,
    });

    const fileName = page === 1 ? "index.html" : `page-${page}.html`;
    await fs.writeFile(path.join(section.output, fileName), html, "utf8");
  }
}

async function copyAdmin() {
  const adminSource = path.join(root, "admin");
  const adminOutput = path.join(siteRoot, "admin");

  if (await fs.pathExists(adminSource)) {
    await fs.ensureDir(adminOutput);
    await fs.copy(adminSource, adminOutput, { overwrite: true });
    console.log("Admin copied");
  } else {
    console.warn("No admin folder found at project root");
  }
}

async function run() {
  for (const section of sections) {
    await buildSection(section);
  }

  await copyAdmin();

  console.log("Build complete");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});