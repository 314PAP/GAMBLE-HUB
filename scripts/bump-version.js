import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const packageJsonPath = path.join(root, 'package.json');
const manifestPath = path.join(root, 'public', 'manifest.json');
const swPath = path.join(root, 'public', 'sw.js');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Update manifest.json
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.version = version;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

// Update sw.js cache name
let swContent = fs.readFileSync(swPath, 'utf8');
swContent = swContent.replace(
  /const CACHE_NAME = 'gamblehub-[^']+'/,
  `const CACHE_NAME = 'gamblehub-${version}'`
);
fs.writeFileSync(swPath, swContent);

console.log(`✓ Version bumped to ${version}`);
console.log(`✓ manifest.json updated`);
console.log(`✓ sw.js cache name updated`);
