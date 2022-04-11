const react = require('@vitejs/plugin-react')

/**
 * @type {import('vite').UserConfig}
 */
module.exports = {
  root:process.cwd()+'/view',
  plugins: [react()],
  build: {
    minify: false,
    emptyOutDir:true,
  }
}
