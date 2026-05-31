// Builds the static public site (src/public) into docs/ for GitHub Pages.
// - Replaces __WA_NUMBER__ with the WhatsApp number
// - Rewrites absolute /asset.svg paths to relative (Pages serves under /realhands/)
// Run: node build-site.js
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src', 'public');
const OUT = path.join(__dirname, 'docs');
const WA = process.env.WA_NUMBER || '917845148919';

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

for (const f of fs.readdirSync(SRC)) {
  const sp = path.join(SRC, f);
  const op = path.join(OUT, f);
  if (f.endsWith('.html')) {
    let h = fs.readFileSync(sp, 'utf8');
    h = h.replace(/__WA_NUMBER__/g, WA)
         .replace(/(src|href)="\/([\w.-]+\.svg)"/g, '$1="$2"');
    fs.writeFileSync(op, h);
  } else {
    fs.copyFileSync(sp, op);
  }
}
console.log('Built docs/ ->', fs.readdirSync(OUT).filter(f => f !== '.nojekyll').join(', '));
