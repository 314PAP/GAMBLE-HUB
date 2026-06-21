import { defineConfig } from 'vite';

export default defineConfig({
  base: '/GAMBLE-HUB/',
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 5179
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
});
