'use strict';
/**
 * Syntax-check every first-party JS file.
 * `node --check a.js b.js` only checks `a.js`; this script checks each path.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', 'test-results', '.git']);

function walk(dir, acc) {
  let names;
  try { names = fs.readdirSync(dir); } catch (e) { return; }
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    if (SKIP_DIRS.has(name)) continue;
    const p = path.join(dir, name);
    let st;
    try { st = fs.statSync(p); } catch (e) { continue; }
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith('.js')) acc.push(p);
  }
}

const files = [];
walk(path.join(root, 'src'), files);
walk(path.join(root, 'tools'), files);
walk(path.join(root, 'e2e'), files);
walk(path.join(root, 'test'), files);
files.push(path.join(root, 'sw.js'));
files.push(path.join(root, 'playwright.config.js'));

const unique = Array.from(new Set(files)).sort();
let failed = 0;
for (let i = 0; i < unique.length; i++) {
  const f = unique[i];
  try {
    execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
  } catch (err) {
    failed++;
    const rel = path.relative(root, f);
    process.stderr.write(rel + '\n');
    const out = (err.stderr && err.stderr.toString()) || (err.stdout && err.stdout.toString()) || String(err);
    process.stderr.write(out);
  }
}

if (failed) {
  process.stderr.write('syntax check failed: ' + failed + ' of ' + unique.length + ' files\n');
  process.exit(1);
}
process.stdout.write('checked ' + unique.length + ' files\n');
