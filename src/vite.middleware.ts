import { IMiddleware } from '@midwayjs/core';
import { Middleware } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';
import { createVite } from './vite';
const c2k = require('koa2-connect');

@Middleware()
export class ViteMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const vite = await createVite();
      return await c2k(vite.middlewares)(ctx, next);
    };
  }
}
