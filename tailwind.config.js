/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors:{
        'space-purple': "#2f1275",
        'ocean-blue' : "#004aad",
        'linear1' : "#cdffd8",
        'linear2' : "#94b9ff",
        'pacific-gradient-1': "#4184e8",
        'pacific-gradient-2': "#000d28",
        'custom-blue': '#b2d5ea'
      }
    }
  },
  plugins: []
};