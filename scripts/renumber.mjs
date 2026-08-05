#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';

const ROOT = path.resolve('hoved/content');
const DIRS = ['d_eve/eko', 'd_eve/lex', 'd_eve/nytt', 'e_post/feed', 'e_post/pen', 'e_post/qa'];

const natSort = (a, b) => a.localeCompare(b, undefined, { numeric: true });

for (const d of DIRS) {
  const full = path.join(ROOT, d);
  if (!fs.existsSync(full)) continue;
  const files = fs.readdirSync(full).filter(f => /^side_\d+\.md$/.test(f));
  if (files.length === 0) continue;
  files.sort(natSort);

  const nums = files.map(f => parseInt(f.replace('side_', '').replace('.md', ''), 10));
  let needsRename = nums.length !== Math.max(...nums) || nums.some((n, i) => n !== i + 1);
  if (!needsRename) continue;

  const tmp = (base, i) => `${base}_tmp_${i}.md`;
  files.forEach((f, i) => fs.moveSync(path.join(full, f), path.join(full, tmp(f, i))));
  let counter = 1;
  for (let i = 0; i < files.length; i++) {
    const target = `side_${String(counter).padStart(2, '0')}.md`;
    fs.moveSync(path.join(full, tmp(files[i], i)), path.join(full, target));
    console.log(`${d}/${files[i]} -> ${target}`);
    counter++;
  }
}
