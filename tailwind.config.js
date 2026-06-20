// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.js",
    "./src/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        "neon-blue": "hsl(210, 100%, 55%)",
        "neon-green": "hsl(150, 100%, 55%)",
        "neon-pink": "hsl(320, 100%, 55%)",
        "neon-purple": "hsl(270, 100%, 55%)",
      },
      boxShadow: {
        premium: "0 4px 30px rgba(0,0,0,0.5)"
      }
    }
  },
  plugins: [],
};
