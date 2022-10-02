import { MidwayConfig } from '@midwayjs/core';
import { join } from 'path';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1646293954127_7861',
  koa: {
    port: 7001,
  },
  view: {
    defaultViewEngine: 'viteView',
  },
  staticFile: {
    dirs: {
      default: {
        prefix: '/p',
        dir: join(__dirname, '../../public'),
      },
    },
  },
  viteView: {
    // prod: true,
    views: {
      'index/index.html': 'index/src/entry-server.js',
      'admin/index.html': 'admin/src/entry-server.js',
    },
  },
} as MidwayConfig;
