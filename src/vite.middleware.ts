import { IMiddleware } from '@midwayjs/core';
import { Config, Middleware } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';
import { ViteViewConfig } from './interface';
import { createVite } from './vite';
const c2k = require('koa2-connect');

@Middleware()
export class ViteMiddleware implements IMiddleware<Context, NextFunction> {
  @Config('viteView')
  viteViewConfig: ViteViewConfig;
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const vite = await createVite(this.viteViewConfig.viteConfigFile);
      return await c2k(vite.middlewares)(ctx, next);
    };
  }
}
