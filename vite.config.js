
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src', 
  plugins: [
    tailwindcss(),
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: '../dist', 
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        matchIngredients: resolve(__dirname, 'src/match-ingredients/index.html'),
        browseRecipes: resolve(__dirname, 'src/browse-recipes/index.html'),
        recipeBox: resolve(__dirname, 'src/recipe-box/index.html')
      }
    }
  }
});