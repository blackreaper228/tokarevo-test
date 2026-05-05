import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/tokarevo-test/',
  plugins: [tailwindcss()],
});
