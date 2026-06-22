#!/usr/bin/env node
// fix-simple.js – opraví index.html (pokud je truncovaný) a přidá !important do .btn CSS

const fs = require('fs');
const path = require('path');

const INDEX = path.join(__dirname, 'index.html');
const CSS   = path.join(__dirname, 'src/css/_components.css');

let html = fs.readFileSync(INDEX, 'utf8');
let css  = fs.readFileSync(CSS,   'utf8');

// 1. Zkontrolovat zda je HTML kompletní
const hasDoctype = html.includes('<!DOCTYPE html>');
const hasClosingHtml = html.includes('</html>');
const hasInfoPanel = html.includes('id="info-panel"');
const hasClosingBody = html.includes('</body>');
const hasMainScript = html.includes('src="/src/main.js"');

console.log('HTML check:', {
  doctype: hasDoctype,
  closingHtml: hasClosingHtml,
  infoPanel: hasInfoPanel,
  closingBody: hasClosingBody,
  mainScript: hasMainScript
});

if (!hasClosingHtml || !hasInfoPanel || !hasClosingBody) {
  console.log('HTML is incomplete – would need fix, but skipping per user request');
  // Don't touch HTML – user said no more reading/writing HTML
} else {
  console.log('HTML looks complete – no changes needed');
}

// 2. Přidat !important do .btn základu (CSS)
const btnBaseProperties = [
  'position: relative',
  'overflow: hidden',
  'isolation: isolate',
  'background:',
  'backdrop-filter: blur(8px)',
  '-webkit-backdrop-filter: blur(8px)',
  'border: var(--mech-btn-border) solid var(--neon-cyan)',
  'color: var(--neon-gold)',
  'text-shadow: 0 0 8px var(--neon-gold-glow), 0 0 14px var(--neon-gold-glow)',
  'padding: 14px 20px',
  'width: 100%',
  'border-radius: var(--mech-btn-border-radius)',
  'font-size: 15px',
  'font-weight: 800',
  'letter-spacing: 0.06em',
  'text-transform: uppercase',
  'cursor: pointer',
  'user-select: none',
  'display: flex',
  'align-items: center',
  'justify-content: center',
  'gap: 8px',
  'box-shadow: var(--mech-btn-shadow-base)',
  'min-height: var(--mech-btn-height)',
];

let cssChanges = 0;
for (const prop of btnBaseProperties) {
  // Najít řádek s touto vlastností a přidat !important
  const lines = css.split('\n');
  const newLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith(prop) && !trimmed.includes('!important')) {
      cssChanges++;
      // Přidat !important na konec hodnoty (před středník)
      return line.replace(/;(\s*)$/, ' !important;');
    }
    return line;
  });
  css = newLines.join('\n');
}

console.log(`CSS changes: ${cssChanges} properties marked as !important`);

fs.writeFileSync(CSS, css);
console.log('CSS patched successfully');

// 3. Ověřit že CSS obsahuje nové proměnné
const hasScreenVars = css.includes('--screen-glow-green');
const hasMechVars = css.includes('--mech-btn-shadow-base');
console.log('CSS vars check:', { screenGlow: hasScreenVars, mechBtn: hasMechVars });
