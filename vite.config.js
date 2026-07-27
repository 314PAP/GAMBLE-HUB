import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    base: env.VITE_BASE || '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'gsap': ['gsap'],
            'firebase': ['firebase/app', 'firebase/firestore'],
            'chart': ['chart.js'],
            'sweetalert': ['sweetalert2'],
            'confetti': ['canvas-confetti'],
          },
        },
      },
    },
  };
});
