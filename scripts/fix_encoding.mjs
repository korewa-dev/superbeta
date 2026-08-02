import fs from 'fs-extra';
import path from 'path';

const LOCALES_DIR = path.resolve('hoved/locales');

// Windows-1252 byte → Unicode codepoint mapping for 0x80-0x9F range
const WIN1252_TO_UNICODE = {
  0x80: 0x20AC, 0x81: 0xFFFD, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E,
  0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6, 0x89: 0x2030,
  0x8A: 0x0160, 0x8B: 0x2039, 0x8C: 0x0152, 0x8D: 0xFFFD, 0x8E: 0x017D,
  0x8F: 0xFFFD, 0x90: 0xFFFD, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201C,
  0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014, 0x98: 0x02DC,
  0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A, 0x9C: 0x0153, 0x9D: 0xFFFD,
  0x9E: 0x017E, 0x9F: 0x0178,
};

// Reverse: Unicode codepoint → Windows-1252 byte (for chars that came from Win-1252)
const UNICODE_TO_WIN1252 = {};
for (const [byte, cp] of Object.entries(WIN1252_TO_UNICODE)) {
  if (cp !== 0xFFFD) UNICODE_TO_WIN1252[cp] = parseInt(byte);
}

// Also Latin-1 direct mapping: codepoints 0x80-0xFF map to same byte values
// But Windows-1252 overrides some of them (0x80-0x9F)

function fixDoubleEncoding(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const cp = str.charCodeAt(i);
    
    // Handle surrogate pairs (for chars > U+FFFF)
    if (cp >= 0xD800 && cp <= 0xDBFF && i + 1 < str.length) {
      const low = str.charCodeAt(i + 1);
      if (low >= 0xDC00 && low <= 0xDFFF) {
        const fullCp = (cp - 0xD800) * 0x400 + (low - 0xDC00) + 0x10000;
        // This shouldn't happen in mojibaked text, but handle gracefully
        bytes.push(0xEF, 0xBF, 0xBD); // replacement char
        i++;
        continue;
      }
    }
    
    if (cp <= 0x7F) {
      // ASCII - original byte
      bytes.push(cp);
    } else if (UNICODE_TO_WIN1252[cp] !== undefined) {
      // Character from Windows-1252 0x80-0x9F range
      bytes.push(UNICODE_TO_WIN1252[cp]);
    } else if (cp >= 0x00A0 && cp <= 0x00FF) {
      // Latin-1 supplement: codepoint IS the byte value
      bytes.push(cp);
    } else if (cp >= 0x0100 && cp <= 0x024F) {
      // Latin Extended: these are NOT from double encoding of UTF-8
      // They're legitimate characters, return as-is
      const encoder = new TextEncoder();
      const encoded = encoder.encode(str[i]);
      for (const b of encoded) bytes.push(b);
    } else {
      // Unknown character - try to find it in Win1252 or just pass through
      // This shouldn't normally happen in double-encoded text
      const encoder = new TextEncoder();
      const encoded = encoder.encode(str[i]);
      for (const b of encoded) bytes.push(b);
    }
  }
  
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    // If strict decode fails, try lossy
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
  }
}

function detectMojibake(str) {
  // Double-encoded text will have chars in 0x80-0xFF range that form 
  // valid UTF-8 sequences when treated as bytes
  let suspiciousCount = 0;
  for (let i = 0; i < str.length; i++) {
    const cp = str.charCodeAt(i);
    if ((cp >= 0x00C0 && cp <= 0x00DF) || // 2-byte UTF-8 lead
        (cp >= 0x00E0 && cp <= 0x00EF) || // 3-byte UTF-8 lead
        (cp >= 0x00F0 && cp <= 0x00F4)) { // 4-byte UTF-8 lead
      suspiciousCount++;
    }
  }
  // Also check for Win-1252 chars in the 0x80-0x9F mapped range
  for (let i = 0; i < str.length; i++) {
    const cp = str.charCodeAt(i);
    if (UNICODE_TO_WIN1252[cp] !== undefined) suspiciousCount++;
  }
  return suspiciousCount > 2;
}

const locales = ['bd','bl','ch','de','in','jp','pk','sa'];

for (const loc of locales) {
  const filePath = path.join(LOCALES_DIR, `${loc}.json`);
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const data = JSON.parse(raw);
  
  let totalFixed = 0;
  
  function fixObj(obj, path) {
    if (!obj || typeof obj !== 'object') return;
    for (const [k, v] of Object.entries(obj)) {
      const curPath = path ? `${path}.${k}` : k;
      if (typeof v === 'string' && v.length > 0) {
        if (detectMojibake(v)) {
          const fixed = fixDoubleEncoding(v);
          if (fixed !== v) {
            console.log(`  ${loc}.${curPath}: FIXED`);
            obj[k] = fixed;
            totalFixed++;
          }
        }
      } else if (typeof v === 'object' && v !== null) {
        fixObj(v, curPath);
      }
    }
  }
  
  fixObj(data, '');
  
  if (totalFixed > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`${loc}: ${totalFixed} fields fixed`);
  } else {
    console.log(`${loc}: clean`);
  }
}
