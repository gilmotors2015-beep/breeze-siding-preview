import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const tag = '<script src="/analytics.js?v=ga-1" defer></script>';
const skipPrefixes = ['admin', 'admin-login'];
const changed = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === '.git' || entry === 'node_modules') continue;
    const full = join(dir, entry);
    const rel = relative(root, full).split(sep).join('/');
    const top = rel.split('/')[0];
    if (skipPrefixes.includes(top)) continue;

    const stats = statSync(full);
    if (stats.isDirectory()) {
      walk(full);
      continue;
    }
    if (!entry.endsWith('.html')) continue;

    let html = readFileSync(full, 'utf8');
    if (html.includes('/analytics.js') || html.includes('G-6F5K9JGX39') || !html.toLowerCase().includes('</head>')) continue;

    html = html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
    writeFileSync(full, html);
    changed.push(rel);
  }
}

walk(root);

if (changed.length) {
  console.log(`Added Analytics tag to ${changed.length} page(s):`);
  for (const file of changed) console.log(`- ${file}`);
} else {
  console.log('Analytics tag already present on public HTML pages.');
}
