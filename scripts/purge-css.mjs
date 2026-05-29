/**
 * Removes CSS rules not referenced in Angular templates/TS.
 * Strict: every class in a selector chain must appear in app sources.
 * Also purges inside @media blocks.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const STATE = new Set([
  'active', 'open', 'show', 'sel', 'on', 'visible', 'unread',
  'urgent', 'warn', 'ok', 'up', 'dn', 'flat', 'pending', 'progress',
  'resolved', 'high', 'med', 'low', 'or', 'gr', 'bl', 'pu', 're',
  'hi', 'orange', 'green', 'blue', 'amber', 'slate', 'violet',
  'qm-is-active', 'sr-only', 'reveal',
]);

const THEMES = ['orange', 'teal', 'indigo', 'emerald', 'violet', 'slate'];
const KEEP_IDS = new Set(['landing', 'mobile-block']);

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === 'seo-pages') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(html|ts)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

function collectFromSources(srcRoot) {
  const used = new Set(STATE);
  for (const id of THEMES) used.add(`theme-${id}`);

  const patterns = [
    /class\s*=\s*["']([^"']+)["']/g,
    /class\s*=\s*`([^`]+)`/g,
    /\[class\.([a-zA-Z0-9_-]+)\]/g,
    /routerLinkActive\s*=\s*["']([^"']+)["']/g,
    /classList\.add\(\s*['"]([a-zA-Z0-9_-]+)['"]/g,
    /\bid\s*=\s*["']([^"']+)["']/g,
    /ngClass\]\s*=\s*["'][^"']*["']([a-zA-Z0-9_-]+)/g,
  ];

  for (const file of walk(srcRoot)) {
    const text = fs.readFileSync(file, 'utf8');
    for (const re of patterns) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text))) {
        m[1].split(/\s+/).forEach((c) => {
          c = c.replace(/^\./, '').trim();
          if (c && /^[a-zA-Z]/.test(c)) used.add(c);
        });
      }
    }
    if (/\bbadge\b/.test(text)) used.add('badge');
  }
  return used;
}

function stripPseudo(sel) {
  return sel
    .replace(/:hover|:focus|:active|:focus-within|:focus-visible|:disabled|:checked|:not\([^)]+\)|:first-child|:last-child|:nth-child\([^)]+\)|::before|::after|::-webkit-scrollbar(-thumb)?/g, '')
    .trim();
}

function classesIn(sel) {
  const out = [];
  const re = /\.([a-zA-Z_][\w-]*)/g;
  let m;
  while ((m = re.exec(sel))) out.push(m[1]);
  return out;
}

function idsIn(sel) {
  const out = [];
  const re = /#([a-zA-Z][\w-]*)/g;
  let m;
  while ((m = re.exec(sel))) out.push(m[1]);
  return out;
}

function selectorPartUsed(part, used) {
  const clean = stripPseudo(part);
  if (!clean) return true;
  const ids = idsIn(clean);
  if (ids.some((id) => KEEP_IDS.has(id))) return true;
  const cls = classesIn(clean);
  if (!cls.length) return ids.length === 0;
  return cls.every((c) => used.has(c));
}

function ruleKeeps(selector, used) {
  const raw = selector.trim();
  if (!raw) return true;
  if (raw.startsWith('@')) return true;
  if (raw.includes(':root') || /^html\b/.test(raw) || /^body\b/.test(raw)) return true;
  if (/^body\.theme-/.test(raw)) return true;
  if (/^\*/.test(raw)) return true;

  const parts = raw.split(',').map((s) => s.trim());
  return parts.some((p) => selectorPartUsed(p, used));
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

    if (css[i] === '@') {
      const atStart = i;
      while (i < len && css[i] !== '{') i++;
      if (i >= len) break;
      const prelude = css.slice(atStart, i).trim();
      i++;
      const innerStart = i;
      let depth = 1;
      while (i < len && depth > 0) {
        if (css[i] === '{') depth++;
        if (css[i] === '}') depth--;
        i++;
      }
      const inner = css.slice(innerStart, i - 1);
      rules.push({ type: 'at', prelude, inner, text: css.slice(atStart, i) });
      continue;
    }

    const start = i;
    let depth = 0;
    let selector = '';
    while (i < len) {
      if (css[i] === '{') {
        if (depth === 0) selector = css.slice(start, i).trim();
        depth++;
        i++;
        continue;
      }
      if (css[i] === '}') {
        depth--;
        i++;
        if (depth === 0) break;
        continue;
      }
      i++;
    }
    rules.push({ type: 'rule', selector, text: css.slice(start, i) });
  }
  return rules;
}

function purgeBlock(css, used) {
  const rules = parseRules(css);
  const out = [];
  let removed = 0;

  for (const r of rules) {
    if (r.type === 'at') {
      const innerPurged = purgeBlock(r.inner, used);
      removed += innerPurged.removed;
      if (!innerPurged.css.trim()) continue;
      out.push(`${r.prelude}{${innerPurged.css}}`);
      continue;
    }
    if (ruleKeeps(r.selector, used)) {
      out.push(r.text);
    } else {
      removed++;
      console.log('  −', r.selector.slice(0, 100));
    }
  }

  return { css: out.join(''), removed };
}

function purgeFile(relPath, srcRoot) {
  const filePath = path.join(root, relPath);
  if (!fs.existsSync(filePath)) return;
  const before = fs.readFileSync(filePath, 'utf8');
  const used = collectFromSources(srcRoot);
  const { css, removed } = purgeBlock(before, used);
  if (removed > 0) fs.writeFileSync(filePath, css);
  console.log(`\n${relPath}: removed ${removed} rule(s), ${before.length} → ${css.length} bytes`);
  return removed;
}

const used = collectFromSources(path.join(root, 'src'));
console.log(`Template-used classes: ${used.size}`);

purgeFile('src/styles.css', path.join(root, 'src'));

// Component CSS — scope source scan to pages that load each file
const bookPartnerStatus = walk(path.join(root, 'src')).filter((f) =>
  /book|partner|status/.test(f),
);
const legalPages = walk(path.join(root, 'src')).filter((f) =>
  /terms|privacy/.test(f),
);

function purgeFileWithFiles(relPath, files) {
  const filePath = path.join(root, relPath);
  const before = fs.readFileSync(filePath, 'utf8');
  const used = new Set(STATE);
  for (const id of THEMES) used.add(`theme-${id}`);
  const patterns = [
    /class\s*=\s*["']([^"']+)["']/g,
    /\[class\.([a-zA-Z0-9_-]+)\]/g,
    /routerLinkActive\s*=\s*["']([^"']+)["']/g,
  ];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const re of patterns) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text))) {
        m[1].split(/\s+/).forEach((c) => {
          if (c && /^[a-zA-Z]/.test(c)) used.add(c.trim());
        });
      }
    }
  }
  const { css, removed } = purgeBlock(before, used);
  if (removed > 0) fs.writeFileSync(filePath, css);
  console.log(`\n${relPath}: removed ${removed} rule(s), ${before.length} → ${css.length} bytes`);
}

/* Component CSS (public-shell, qm-public, qm-legal) — only purge via audit; formatted files skip auto-purge. */
