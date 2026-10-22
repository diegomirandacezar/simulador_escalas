const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('js/app.js', 'utf8');

const idRegex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const ids = new Set();
while ((match = idRegex.exec(app)) !== null) {
  ids.add(match[1]);
}

let missing = 0;
for (const id of ids) {
  if (!html.includes(`id="${id}"`) && !html.includes(`id='${id}'`)) {
    console.error('MISSING ID in index.html:', id);
    missing++;
  } else {
    console.log('ID OK:', id);
  }
}

if (missing === 0) {
  console.log(`\nPERFEITO! Todos os ${ids.size} IDs referenciados em js/app.js existem no index.html!`);
} else {
  console.error(`\nATENÇÃO: ${missing} IDs faltando!`);
  process.exit(1);
}
