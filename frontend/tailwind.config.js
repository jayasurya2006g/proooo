/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0F1A",
          900: "#111629",
          800: "#171D35",
          700: "#232B4A",
          600: "#323C64",
          500: "#4A5580",
        },
        paper: {
          100: "#F4F6FB",
          200: "#DEE3F0",
          300: "#B7C0DA",
        },
        signal: {
          amber: "#F5A623",
          teal: "#3FD6C5",
          coral: "#FF6B6B",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        "node-grid":
          "radial-gradient(circle at 1px 1px, rgba(183,192,218,0.08) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
