import fs from 'fs';
import path from 'path';

const BASE = path.resolve('base_patched_site/hoved');

const PAGES = [
  { key: 'home', file: 'pages/a_hus/en.html' },
  { key: 'ftid', file: 'pages/b_ftid/ftid.html' },
  { key: 'vanga', file: 'pages/b_ftid/vanga.html' },
  { key: 'bangla', file: 'pages/b_ftid/bangla.html' },
  { key: 'bdatheism', file: 'pages/b_ftid/bdatheism.html' },
  { key: 'fil', file: 'pages/c_ism/fil.html' },
  { key: 'ath', file: 'pages/c_ism/ath.html' },
  { key: 'lens', file: 'pages/c_ism/lens.html' },
  { key: 'sync', file: 'pages/c_ism/sync.html' },
  { key: 'si', file: 'pages/f_info/si.html' },
  { key: 'ask', file: 'pages/f_info/ask.html' },
  { key: 'fine', file: 'pages/f_info/fine.html' },
  { key: 'talk', file: 'pages/f_info/talk.html' },
];

const bodies = {};

for (const pg of PAGES) {
  const html = fs.readFileSync(path.join(BASE, pg.file), 'utf8');
  // Extract the second section (body section)
  const sections = html.match(/<section[^>]*>([\s\S]*?)<\/section>/g);
  if (sections && sections.length >= 2) {
    // Get the inner content of the second section
    const secondSection = sections[1];
    const inner = secondSection.replace(/^<section[^>]*>\s*/, '').replace(/\s*<\/section>$/, '');
    bodies[pg.key] = inner.trim();
    console.log(`${pg.key}: ${bodies[pg.key].length} chars`);
  } else {
    console.log(`${pg.key}: WARNING - only ${sections ? sections.length : 0} sections found`);
  }
}

// Save to a temp file for translation
fs.writeFileSync('scripts/english_bodies.json', JSON.stringify(bodies, null, 2), 'utf8');
console.log('\nSaved to scripts/english_bodies.json');
