import fs from 'fs-extra';
import path from 'path';

const locales = ['bd','bl','ch','de','in','jp','pk','sa'];
const LOCALES_DIR = path.resolve('hoved/locales');

function isMojibaked(str) {
  // Double-encoded Devanagari/CJK will contain sequences like à¤ (C3 A0 C2 A4)
  // which are overlong UTF-8 representations
  const latinChars = str.match(/[\u00C0-\u00FF]{3,}/g);
  return latinChars && latinChars.length > 0;
}

function fixDoubleEncoding(str) {
  // Take each char's codepoint as the original UTF-8 byte
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const cp = str.charCodeAt(i);
    if (cp <= 0xFF) {
      bytes.push(cp);
    } else {
      // Already a proper Unicode char, keep as-is via UTF-8
      const encoder = new TextEncoder();
      const encoded = encoder.encode(str[i]);
      for (const b of encoded) bytes.push(b);
    }
  }
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(new Uint8Array(bytes));
}

for (const loc of locales) {
  const raw = fs.readFileSync(path.join(LOCALES_DIR, `${loc}.json`), 'utf8');
  // Remove BOM if present
  const clean = raw.replace(/^\uFEFF/, '');
  const data = JSON.parse(clean);
  
  let fixedCount = 0;
  
  // Fix nav values
  if (data.nav) {
    for (const [k, v] of Object.entries(data.nav)) {
      if (typeof v === 'string' && isMojibaked(v)) {
        console.log(`  ${loc}.nav.${k}: "${v}" → "${fixDoubleEncoding(v)}"`);
        data.nav[k] = fixDoubleEncoding(v);
        fixedCount++;
      }
    }
  }
  
  // Fix footer values
  if (data.footer) {
    for (const [k, v] of Object.entries(data.footer)) {
      if (typeof v === 'string' && isMojibaked(v)) {
        console.log(`  ${loc}.footer.${k}: "${v}" → "${fixDoubleEncoding(v)}"`);
        data.footer[k] = fixDoubleEncoding(v);
        fixedCount++;
      }
    }
  }
  
  // Fix sections
  if (data.sections) {
    for (const [sk, sv] of Object.entries(data.sections)) {
      if (typeof sv === 'object') {
        for (const [k, v] of Object.entries(sv)) {
          if (typeof v === 'string' && isMojibaked(v)) {
            console.log(`  ${loc}.sections.${sk}.${k}: mojibaked`);
            data.sections[sk][k] = fixDoubleEncoding(v);
            fixedCount++;
          }
        }
      }
    }
  }
  
  // Fix tabs
  if (data.tabs) {
    for (const [tk, tv] of Object.entries(data.tabs)) {
      if (typeof tv === 'string' && isMojibaked(tv)) {
        console.log(`  ${loc}.tabs.${tk}: mojibaked`);
        data.tabs[tk] = fixDoubleEncoding(tv);
        fixedCount++;
      }
    }
  }
  
  // Fix staticTabs
  if (data.staticTabs) {
    for (const [sk, sv] of Object.entries(data.staticTabs)) {
      if (typeof sv === 'object') {
        for (const [k, v] of Object.entries(sv)) {
          if (typeof v === 'string' && isMojibaked(v)) {
            console.log(`  ${loc}.staticTabs.${sk}.${k}: mojibaked`);
            data.staticTabs[sk][k] = fixDoubleEncoding(v);
            fixedCount++;
          }
        }
      }
    }
  }
  
  // Fix pages
  if (data.pages) {
    for (const [pk, pv] of Object.entries(data.pages)) {
      if (typeof pv === 'object') {
        for (const [k, v] of Object.entries(pv)) {
          if (typeof v === 'string' && isMojibaked(v)) {
            console.log(`  ${loc}.pages.${pk}.${k}: mojibaked`);
            data.pages[pk][k] = fixDoubleEncoding(v);
            fixedCount++;
          }
        }
      }
    }
  }
  
  // Fix ui values
  if (data.ui) {
    for (const [k, v] of Object.entries(data.ui)) {
      if (typeof v === 'string' && isMojibaked(v)) {
        console.log(`  ${loc}.ui.${k}: mojibaked`);
        data.ui[k] = fixDoubleEncoding(v);
        fixedCount++;
      }
    }
  }
  
  if (fixedCount > 0) {
    fs.writeFileSync(path.join(LOCALES_DIR, `${loc}.json`), JSON.stringify(data, null, 2), 'utf8');
    console.log(`${loc}: fixed ${fixedCount} fields`);
  } else {
    console.log(`${loc}: no issues found`);
  }
}
