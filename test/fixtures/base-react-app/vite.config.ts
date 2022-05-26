/* eslint-disable node/no-unpublished-import */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [
    react({
    }),
    tsconfigPaths({}),
  ],
  build: {
    minify: false,
    emptyOutDir:true,
  }
});
