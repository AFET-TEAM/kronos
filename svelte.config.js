import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'connect-src': [
          "'self'", 
          "ws://localhost:3000", 
          "http://localhost:4000",
          "https://api-kronos.afet.team",
          "https://api-kronos-dev.afet.team",
        ],
        'img-src': ["'self'", "data:", "https:"],
      }
    }
  },
  preprocess: vitePreprocess({
    scss: {
      prependData: '@use "src/lib/styles/_mixins.scss" as *;',
    },
  }),
};
export default config;
