/* eslint-disable node/no-unpublished-import */
import { defineConfig } from 'vite';
import px2vp = require('postcss-px2vp');
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import {AntdResolve, createStyleImportPlugin } from 'vite-plugin-style-import'
/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  root: process.cwd() + '/view',
  plugins: [
    react({
      // fastRefresh: false,
    }),
    legacy({
      targets: ['chrome 52'], // 需要兼容的目标列表，可以设置多个
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'], // 面向IE11时需要此插件
    }),
    tsconfigPaths({
      root: process.cwd() + '/view',
    }),
    createStyleImportPlugin({
      resolves: [
        AntdResolve()
      ]
    }),
  ],
  server: {
    host: true,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
    // postcss: {
    //   plugins: [
    //     px2vp({
    //       propList: ['*', '!font*'],
    //       viewportWidth(rule) {
    //         const file = rule.source?.input.file;
    //         // 根据文件名动态配置viewport width
    //         if (file?.includes('vant')) return 375;
    //         return 750;
    //       },
    //     }),
    //   ],
    // },
  },
  build: {
    minify: true,
    emptyOutDir: true,
  },
});
