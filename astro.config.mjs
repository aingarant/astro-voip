import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"
export default defineConfig({
  srcDir: "./src/client",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
  build: {
    outDir: "./dist/client",
  },
})
