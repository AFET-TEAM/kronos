import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  publicDir: "static",
  plugins: [sveltekit()],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        additionalData: '@use "./lib/styles/_mixins.scss" as *;',
      },
    },
  },
});
