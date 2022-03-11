import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1646896633407_6393',
  koa: {
    port: 7001,
  },
  view: { //midwayjs 视图配置 说明参考 https://midwayjs.org/docs/extensions/render
    defaultViewEngine: 'viteView',
  },
  viteView: { //midway-vite-view 配置配置详细说明见下方
    clientIndex: ['index.html'],
    entryServers: [
      'src/entry-server.js',
    ],
  },
} as MidwayConfig;

