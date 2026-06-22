#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const cssPath = path.join(__dirname, 'src/css/_components.css');

let html = fs.readFileSync(indexPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Opravit truncovaný konec explorer modalu a info-panel
// Hledáme znak, kde se to seklo – "Jak se hraje"
const truncationPoint = html.indexOf('Jak se hraje');
if (truncationPoint !== -1) {
  // Zjistit, co tam je po "Jak se hraje"
  const after = html.substring(truncationPoint);
  console.log('After truncation point:', JSON.stringify(after.substring(0, 200)));
}

// 2. Přidat !important do .btn základu pro poražení Tailwind base-layer
// Přidáme !important na: background, border, color, text-shadow, box-shadow, border-radius, padding, min-height
const btnBaseSelectors = [
  'background:',
  'border: var(--mech-btn-border) solid var(--neon-cyan);',
  'color: var(--neon-gold);',
  'text-shadow: 0 0 8px var(--neon-gold-glow), 0 0 14px var(--neon-gold-glow);',
  'box-shadow: var(--mech-btn-shadow-base);',
  'border-radius: var(--mech-btn-border-radius);',
  'padding: 14px 20px;',
  'min-height: var(--mech-btn-height);',
];

for (const prop of btnBaseSelectors) {
  // Nahradit backgroundColor: hodnota; za backgroundColor: hodnota !important;
  const regex = new RegExp(prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/;$/, '') + '([^;]*);', 'g');
  if (regex.test(css)) {
    css = css.replace(regex, (match, value) => {
      if (value.includes('!important')) return match;
      return prop.replace(/;$/, '') + value.trim() + ' !important;';
    });
  }
}

fs.writeFileSync(cssPath, css);
console.log('CSS patch applied – !important added to .btn base properties');

// 3. Opravit HTML – pokud je truncovaný, přidat chybějící části
const missingEnd = `
<div id="info-panel" class="info-panel" onclick="zavriInfoPanel()">
    <div class="info-panel-content" onclick="event.stopPropagation()">
        <div class="info-panel-header">
            <span id="info-panel-title">Jak se hraje</span>
            <button class="info-panel-close" onclick="zavriInfoPanel()">✕</button>
        </div>
        <div id="info-panel-body" class="info-panel-body"></div>
    </div>
</div>


</body>
<script type="module" src="/src/main.js"></script>
</html>`;

// Pokud chybí info-panel na konci
if (!html.includes('id="info-panel"') && html.includes('Jak se hraje')) {
  // Najít místo, kde začal truncation – hledáme "Jak se hraje" a nahradíme za plnou verzi
  const idx = html.lastIndexOf('Jak se hraje');
  if (idx !== -1) {
    // Zkontrolovat, zda je po něm uzavřený tag
    const afterText = html.substring(idx);
    if (!afterText.includes('</div>') || afterText.indexOf('</div>') > 200) {
      // Je truncovaný – nahradit toast sekci za plnou
      const before = html.substring(0, idx);
      html = before + missingEnd;
      console.log('HTML truncated – fixed missing closing tags');
    }
  }
}

fs.writeFileSync(indexPath, html);
console.log('Done – index.html patched');
