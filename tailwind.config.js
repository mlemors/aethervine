/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wow-gold': '#ffd700',
        'wow-legendary': '#ff8000',
        'wow-epic': '#a335ee',
        'wow-rare': '#0070dd',
        'wow-uncommon': '#1eff00',
        'wow-common': '#ffffff',
        'wow-poor': '#9d9d9d',
        // Logo colors
        'aether-cyan': '#00d9ff',
        'aether-cyan-dark': '#00a8cc',
        'aether-teal': '#00ffcc',
        'aether-gold': '#ffcc00',
      },
    },
  },
  plugins: [],
}
