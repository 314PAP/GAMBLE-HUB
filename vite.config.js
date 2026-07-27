export default {
  base: process.env.VITE_BASE ?? '/',
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
  }
};
