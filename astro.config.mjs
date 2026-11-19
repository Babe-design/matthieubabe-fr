import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://matthieubabe.fr",
  output: "static",
  vite: {
    build: {
      // Keep scripts external so the CSP can block inline JavaScript.
      assetsInlineLimit: assetPath => assetPath.endsWith(".js") ? false : undefined
    }
  },
  devToolbar: { enabled: false }
});
