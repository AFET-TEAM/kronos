import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
  },
  preprocess: vitePreprocess({
    scss: {
      prependData: '@use "src/lib/styles/_mixins.scss" as *;',
    },
  }),
};
export default config;
