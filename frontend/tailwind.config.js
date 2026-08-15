/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#0B0F19",
          card: "#111827",
          border: "#1F2937",
          accent: "#3B82F6",
          alert: "#EF4444",
          success: "#10B981",
          warning: "#F59E0B",
          glow: "rgba(59, 130, 246, 0.15)"
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
