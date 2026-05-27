/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        hand: ["var(--font-hand)", "cursive"],
        serif: ["var(--font-serif)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        ink: "#0a0a0a",
        bone: "#d4c9b8",
        blood: "#8b1a1a",
        rust: "#c14040",
      },
      animation: {
        flicker: "flicker 4s infinite",
        breathe: "breathe 6s ease-in-out infinite",
        glitch: "glitch 2.5s infinite",
      },
      keyframes: {
        flicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: 1 },
          "20%, 24%, 55%": { opacity: 0.4 },
        },
        breathe: {
          "0%, 100%": { opacity: 0.6 },
          "50%": { opacity: 1 },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-1px, 1px)" },
          "40%": { transform: "translate(-1px, -1px)" },
          "60%": { transform: "translate(1px, 1px)" },
          "80%": { transform: "translate(1px, -1px)" },
        },
      },
    },
  },
  plugins: [],
};
