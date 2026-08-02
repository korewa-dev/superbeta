import fs from 'fs';
import path from 'path';

const locales = ['bd','bl','ch','de','in','jp','pk','sa'];

for (const loc of locales) {
  const raw = fs.readFileSync(path.join('hoved/locales', `${loc}.json`), 'utf8').replace(/^\uFEFF/, '');
  const data = JSON.parse(raw);
  
  let issues = [];
  
  function findReplacementChars(obj, path) {
    if (!obj || typeof obj !== 'object') return;
    for (const [k, v] of Object.entries(obj)) {
      const curPath = path ? `${path}.${k}` : k;
      if (typeof v === 'string') {
        const count = (v.match(/\uFFFD/g) || []).length;
        if (count > 0) {
          issues.push(`${curPath}: ${count} replacement chars`);
        }
      } else if (typeof v === 'object' && v !== null) {
        findReplacementChars(v, curPath);
      }
    }
  }
  
  findReplacementChars(data, '');
  
  if (issues.length > 0) {
    console.log(`${loc}: ${issues.length} fields with U+FFFD`);
    for (const issue of issues.slice(0, 5)) {
      console.log(`  ${issue}`);
    }
    if (issues.length > 5) console.log(`  ... and ${issues.length - 5} more`);
  } else {
    console.log(`${loc}: clean`);
  }
}
