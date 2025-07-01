/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        "space-purple": "#2f1275",
        "ocean-blue": "#004aad",
        "linear1": "#cdffd8",
        "linear2": "#94b9ff",
        "pacific-gradient-1": "#4184e8",
        "pacific-gradient-2": "#000d28",
        "custom-blue": "#b2d5ea",
        "primary": "#18a0fb",
        "secondary": "#ffae3b",
        "sapphire": "#0f52ba",
        "blue-ribbon": "#1590e1",
        "blue-azure": "#1272b1",
        "white-ghost": "rgba(248, 250, 253, 0.93)",
        "white": "#ffffff",
        "blue-steel": "#1e4a6d",
        "blue-charcoal": "#1c4463",
        "blue-midnight": "#173b57",
        "green-teal": "#24786d",
        "blue-royal": "#2b3c7e",
        "light-gray-transparent": "rgba(248, 250, 253, 0.93)",
        "charcoal-transparent": "rgba(30, 30, 30, 0.93)",
        "dark-gray": "#2d2d2d",
        "mid-gray": "#4d4d4d",
        "light-gray": "#999999",
      },
    },
  },
  plugins: [],
};
