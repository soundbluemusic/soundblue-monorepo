import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    preset: "static",
    prerender: {
      routes: ["/", "/ko", "/ja", "/about", "/ko/about", "/ja/about"],
      crawlLinks: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "~": "/src",
      },
    },
  },
});
