import fs from 'fs';

const raw = fs.readFileSync('hoved/locales/in.json', 'utf8');

// Find 'events' in nav
const idx = raw.indexOf('"events"');
const valStart = raw.indexOf('"', idx + 9) + 1;
const valEnd = raw.indexOf('"', valStart);
const val = raw.substring(valStart, valEnd);
console.log('events value:', JSON.stringify(val));
console.log('Codepoints:');
for (let i = 0; i < val.length; i++) {
  const cp = val.charCodeAt(i);
  console.log(`  [${i}] U+${cp.toString(16).padStart(4, '0')} len=${cp > 0xFFFF ? 2 : 1}`);
}

// Also check a known-good Hindi field
const idx2 = raw.indexOf('"history"');
const valStart2 = raw.indexOf('"', idx2 + 10) + 1;
const valEnd2 = raw.indexOf('"', valStart2);
const val2 = raw.substring(valStart2, valEnd2);
console.log('\nhistory value:', JSON.stringify(val2));
console.log('Codepoints:');
for (let i = 0; i < val2.length; i++) {
  const cp = val2.charCodeAt(i);
  console.log(`  [${i}] U+${cp.toString(16).padStart(4, '0')} len=${cp > 0xFFFF ? 2 : 1}`);
}
