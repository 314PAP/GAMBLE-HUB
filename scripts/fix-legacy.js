#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const CSS_BUTTONS = path.join(ROOT, 'src/css/_buttons.css');

function readFile(fp) {
  try { return fs.readFileSync(fp, 'utf8'); }
  catch { return null; }
}

function writeFile(fp, data) {
  fs.writeFileSync(fp, data, 'utf8');
  console.log(`Patched: ${path.relative(ROOT, fp)}`);
}

function checkHTML() {
  const html = readFile(INDEX);
  if (!html) { console.warn('index.html not found'); return; }

  const checks = {
    doctype: html.includes('<!DOCTYPE html>'),
    closingHtml: html.includes('</html>'),
    infoPanel: html.includes('id="info-panel"'),
    closingBody: html.includes('</body>'),
    mainScript: html.includes('src="/src/main.js"'),
  };

  console.log('HTML integrity check:', checks);

  if (!checks.closingHtml || !checks.closingBody || !checks.infoPanel) {
    console.warn('HTML appears truncated – manual fix recommended');
  }
}

function patchButtonsCSS() {
  const css = readFile(CSS_BUTTONS);
  if (!css) { console.warn('_buttons.css not found'); return; }

  const criticalProps = [
    'position: relative',
    'background:',
    'border: none',
    'color:',
    'text-shadow:',
    'box-shadow:',
  ];

  let changes = 0;
  const lines = css.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    for (const prop of criticalProps) {
      if (trimmed.startsWith(prop) && !trimmed.includes('!important')) {
        // Only patch the .btn base block (avoid padding/min-height which differ intentionally)
        if (i > 4 && i < 40 && lines[i + 1]?.includes('border-radius')) {
          lines[i] = lines[i].replace(/;(\s*)$/, ' !important;');
          changes++;
          break;
        }
      }
    }
  }

  if (changes > 0) {
    writeFile(CSS_BUTTONS, lines.join('\n'));
    console.log(`CSS changes: ${changes} base .btn properties forced with !important`);
  } else {
    console.log('CSS already properly flagged – no changes needed');
  }
}

checkHTML();
patchButtonsCSS();
console.log('Done.');
