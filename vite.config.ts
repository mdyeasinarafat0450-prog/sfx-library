import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    viteSingleFile(),
    {
      name: 'remove-type-module',
      enforce: 'post',
      transformIndexHtml(html) {
        return html.replace(/type="module" crossorigin/g, '');
      }
    }
  ],
  base: './',
  build: {
    target: 'es2015',
    outDir: 'dist',
    emptyOutDir: true,
  }
})
