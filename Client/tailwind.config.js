/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        blink: {
          "0%": { backgroundColor: "#00d100", opacity: "0.7" }, // Bright green
          "50%": { backgroundColor: "#ffffff", opacity: "0.9" }, // Darker green
          "100%": { backgroundColor: "#00ff00", opacity: "0.7" }, // Bright green
        },
      },
      animation: {
        blink: "blink 1s infinite", // Adjust duration as needed
      },
    },
  },
  plugins: [],
};
