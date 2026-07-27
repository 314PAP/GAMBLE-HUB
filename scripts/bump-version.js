import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const packageJsonPath = path.join(root, 'package.json');
const manifestPath = path.join(root, 'public', 'manifest.json');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Determine base path from environment
const basePath = process.env.VITE_BASE || '/';
const startUrl = basePath === '/' ? '/' : `${basePath}`;

// Update manifest.json
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.version = version;
manifest.start_url = startUrl;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

// Update sw.js cache name
const swPath = path.join(root, 'public', 'sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');
swContent = swContent.replace(
  /const CACHE_NAME = 'gamblehub-[^']+'/,
  `const CACHE_NAME = 'gamblehub-${version}'`
);
fs.writeFileSync(swPath, swContent);

console.log(`✓ Version bumped to ${version}`);
console.log(`✓ manifest.json updated (start_url: ${startUrl})`);
console.log(`✓ sw.js cache name updated`);
