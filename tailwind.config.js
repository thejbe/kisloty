/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#e29578",
        "secondary": "#e5e5e5",
        "background-light": "#f9f9f9",
        "background-dark": "#1A1816",
        "text-light": "#4A4A4A",
        "text-dark": "#D1D1D1",
        "card-light": "#FFFFFF",
        "card-dark": "#242220",
        "muted-light": "#A1A1A1",
        "muted-dark": "#7A7A7A",
        "bubble-light": "#F4F2EF",
        "bubble-dark": "#2a2825",
        "bubble-user-light": "#E8EDE7",
        "bubble-user-dark": "#313830",
        "chip-light": "#F4F2EF",
        "chip-dark": "#2a2825",
        "chip-border-light": "#EAE8E4",
        "chip-border-dark": "#3c3a37",
        "secondary-light": "#e5e5e5",
        "secondary-dark": "#2A2A2A"
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "1.5rem",
        "xl": "2rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
