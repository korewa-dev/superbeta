const fs = require('fs');

// Read source
const enBodies = JSON.parse(fs.readFileSync('scripts/english_bodies.json', 'utf8'));
let deJson = JSON.parse(fs.readFileSync('hoved/locales/de.json', 'utf8'));

// Helper: split HTML into tokens: text segments and tag segments
function tokenizeHtml(html) {
  const tokens = [];
  let remaining = html;
  while (remaining.length > 0) {
    // Check for tag
    const tagStart = remaining.indexOf('<');
    if (tagStart === 0) {
      // Find end of tag
      const tagEnd = remaining.indexOf('>');
      if (tagEnd !== -1) {
        tokens.push({ type: 'tag', content: remaining.substring(0, tagEnd + 1) });
        remaining = remaining.substring(tagEnd + 1);
      } else {
        tokens.push({ type: 'text', content: remaining });
        remaining = '';
      }
    } else if (tagStart > 0) {
      tokens.push({ type: 'text', content: remaining.substring(0, tagStart) });
      remaining = remaining.substring(tagStart);
    } else {
      tokens.push({ type: 'text', content: remaining });
      remaining = '';
    }
  }
  return tokens;
}

// Translation map: English -> German
// This will be populated from the English text extraction
const en2de = {};

// First pass: extract all English text segments
const allEnglishTexts = {};
for (const [key, html] of Object.entries(enBodies)) {
  const tokens = tokenizeHtml(html);
  const texts = [];
  for (const tok of tokens) {
    if (tok.type === 'text' && tok.content.trim()) {
      texts.push(tok.content);
    }
  }
  allEnglishTexts[key] = texts;
}

// Now I need to translate each text. Since I can't call a translation API,
// I'll use a Node.js script approach where I provide all translations.
// Let me save all English texts to a file so I can work with them,
// then build the translation map.

console.log(JSON.stringify(allEnglishTexts, null, 2));
