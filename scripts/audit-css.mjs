/**
 * Reports CSS class selectors in styles.css (and optional component CSS files)
 * that do not appear in Angular templates / TS.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src');

const STATE_CLASSES = new Set([
  'active', 'open', 'show', 'sel', 'on', 'visible', 'unread',
  'urgent', 'warn', 'ok', 'up', 'dn', 'flat', 'pending', 'progress',
  'resolved', 'high', 'med', 'low', 'or', 'gr', 'bl', 'pu', 're',
  'hi', 'orange', 'green', 'blue', 'amber', 'slate', 'violet',
  'qm-is-active', 'sr-only',
]);

const THEME_IDS = ['orange', 'teal', 'indigo', 'emerald', 'violet', 'slate'];

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === 'seo-pages') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(html|ts)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

function collectUsed(files) {
  const used = new Set(STATE_CLASSES);
  for (const id of THEME_IDS) used.add(`theme-${id}`);

  const patterns = [
    /class\s*=\s*["']([^"']+)["']/g,
    /class\s*=\s*`([^`]+)`/g,
    /\[class\.([a-zA-Z0-9_-]+)\]/g,
    /\[class\]\s*=\s*["']([^"']+)["']/g,
    /ngClass\]\s*=\s*["'{][^"']*["']([a-zA-Z0-9_-]+)/g,
    /routerLinkActive\s*=\s*["']([^"']+)["']/g,
    /classList\.add\(\s*['"]([a-zA-Z0-9_-]+)['"]/g,
    /'badge\s+'\s*\+\s*([a-zA-Z0-9_]+)/g,
    /\bclass:\s*['"]([a-zA-Z0-9_-]+)['"]/g,
    /["']([a-zA-Z][a-zA-Z0-9_-]*)["']\s*:\s*true/g,
  ];

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const re of patterns) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text))) {
        const chunk = m[1];
        if (!chunk) continue;
        chunk.split(/\s+/).forEach((c) => {
          c = c.replace(/^\./, '').trim();
          if (c && /^[a-zA-Z]/.test(c)) used.add(c);
        });
      }
    }
    // badge ' + fn() patterns in templates
    const badge = text.matchAll(/['"]badge\s+['"]\s*\+/g);
    if (badge) used.add('badge');
    // ids used in CSS
    const ids = text.matchAll(/\bid\s*=\s*["']([^"']+)["']/g);
    for (const im of ids) used.add(`#${im[1]}`);
  }

  return used;
}

function classesInSelector(sel) {
  const out = [];
  const re = /\.([a-zA-Z_][\w-]*)/g;
  let m;
  while ((m = re.exec(sel))) out.push(m[1]);
  return out;
}

function parseRules(css) {
  const rules = [];
  let i = 0;
  const len = css.length;

  while (i < len) {
    while (i < len && /\s/.test(css[i])) i++;
    if (i >= len) break;

    if (css[i] === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? len : end + 2;
      continue;
    }

    const start = i;
    let depth = 0;
    let selector = '';
    while (i < len) {
      const ch = css[i];
      if (ch === '{') {
        if (depth === 0) selector = css.slice(start, i).trim();
        depth++;
        i++;
        continue;
      }
      if (ch === '}') {
        depth--;
        i++;
        if (depth === 0) {
          const body = css.slice(css.indexOf('{', start) + 1, i - 1);
          rules.push({ selector, body, start, end: i });
          break;
        }
        continue;
      }
      i++;
    }
    if (depth !== 0) break;
  }
  return rules;
}

function auditFile(cssPath, used, label) {
  const css = fs.readFileSync(cssPath, 'utf8');
  const rules = parseRules(css);
  const unused = [];

  for (const r of rules) {
    const sels = r.selector.split(',').map((s) => s.trim());
    for (let sel of sels) {
      if (!sel || sel.startsWith('@')) continue;
      if (sel.includes(':root') || sel.includes('html') || sel.includes('body')) continue;
      if (/^#(landing|mobile-block)/.test(sel)) continue;
      if (sel.includes('::') || sel.includes(':hover') || sel.includes(':focus')) {
        sel = sel.replace(/:hover|:focus|:active|:focus-within|:focus-visible|:disabled|:checked|:first-child|:last-child|:nth-child\([^)]+\)|::before|::after/g, '');
      }
      const cls = classesInSelector(sel);
      if (!cls.length) continue;
      const allUnused = cls.every((c) => !used.has(c));
      if (allUnused) unused.push({ selector: sel, classes: cls });
    }
  }

  const unique = [...new Map(unused.map((u) => [u.selector, u])).values()];
  console.log(`\n=== ${label} (${path.relative(root, cssPath)}) ===`);
  console.log(`Rules scanned: ${rules.length}, possibly unused selectors: ${unique.length}`);
  unique.slice(0, 40).forEach((u) => console.log(`  .${u.classes.join(', .')}  →  ${u.selector.slice(0, 80)}`));
  if (unique.length > 40) console.log(`  ... +${unique.length - 40} more`);
  return unique;
}

const files = walk(srcDir);
const used = collectUsed(files);
console.log(`Used tokens from app sources: ${used.size}`);

auditFile(path.join(srcDir, 'styles.css'), used, 'Global styles');

const qmPublic = path.join(srcDir, 'app/features/public-pages/qm-public.css');
if (fs.existsSync(qmPublic)) {
  const pubFiles = files.filter((f) =>
    /about-page|contact-page|terms|privacy/.test(f),
  );
  auditFile(qmPublic, collectUsed(pubFiles), 'qm-public.css');
}
