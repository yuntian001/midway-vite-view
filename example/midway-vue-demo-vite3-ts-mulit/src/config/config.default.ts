import { MidwayConfig } from '@midwayjs/core';
import { join } from 'path';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1664780731986_5763',
  koa: {
    port: 7001,
  },
  staticFile:{
    gzip:true,
    usePrecompiledGzip:true
  },
  view: {
    //midwayjs 视图配置 说明参考 https://midwayjs.org/docs/extensions/render
    defaultViewEngine: 'viteView',
  },
  viteView: {
    //midway-vite-view 配置配置详细说明见下方
    views: {
      'index/index.html': {
        entryServer: 'index/src/entry-server.ts',
        root: 'index',
        viteConfigFile: join(__dirname, '../../view/index/vite.config.ts')
      },
      'admin/index.html': {
        entryServer: 'admin/src/entry-server.ts',
        root: 'admin',
        viteConfigFile: join(__dirname, '../../view/admin/vite.config.ts')
      },
    },
    viteConfigFile: join(__dirname, '../../view/vite.config.ts'),
  },
} as MidwayConfig;
