//src/config/config.prod.ts
import { MidwayConfig } from '@midwayjs/core';
import * as path from "path";
export default {
  view:{
    defaultViewEngine: 'viteView',
    rootDir: {//用来规避prod没有view文件夹问题
      default: path.join(__dirname, '../../public/html'),
    }
  }
} as MidwayConfig;