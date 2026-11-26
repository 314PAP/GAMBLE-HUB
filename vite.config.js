import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

function htmlPartialsPlugin() {
  return {
    name: 'html-partials',
    transformIndexHtml(html) {
      return html.replace(/<!--\s*@include\s+([^\s]+)\s*-->/g, (_, relPath) => {
        return fs.readFileSync(path.resolve(process.cwd(), relPath), 'utf-8');
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const base = env.VITE_BASE || '/';
  console.debug(`[Vite] mode=${mode} VITE_BASE=${env.VITE_BASE} base=${base}`);
  return {
    base,
    plugins: [htmlPartialsPlugin()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'gsap': ['gsap'],
            'firebase-app': ['firebase/app'],
            'firebase-firestore': ['firebase/firestore'],
            'sweetalert': ['sweetalert2'],
            'confetti': ['canvas-confetti'],
          },
        },
      },
    },
  };
});
