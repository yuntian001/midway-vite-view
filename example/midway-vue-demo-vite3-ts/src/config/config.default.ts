import { MidwayConfig } from '@midwayjs/core';
import {join} from 'path';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1664780731986_5763',
  koa: {
    port: 7001,
  },
  view: {
    //midwayjs 视图配置 说明参考 https://midwayjs.org/docs/extensions/render
    defaultViewEngine: 'viteView',
  },
  viteView: {
    //midway-vite-view 配置配置详细说明见下方
    views: {
      'index/index.html': 'index/src/entry-server.ts',
      'admin/index.html': 'admin/src/entry-server.ts',
    },
    viteConfigFile: join(__dirname, '../../view/vite.config.ts'),
  },
} as MidwayConfig;
