import { IMiddleware, Init, Inject } from '@midwayjs/core';
import { Middleware } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';
import { ViteService, MiddlewareArr } from '../service/vite.service';

@Middleware()
export class ViteMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  viteService: ViteService;

  private viteMiddlewareArr: MiddlewareArr = [];

  @Init()
  async init() {
    this.viteMiddlewareArr = await this.viteService.getViteMiddlewareArr();
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      for (let i = 0; i < this.viteMiddlewareArr.length; i++) {
        if (ctx.originalUrl.startsWith(this.viteMiddlewareArr[i].prefix)) {
          return await this.viteMiddlewareArr[i].middleware(ctx, next);
        }
      }
      return await next();
    };
  }

  static getName(): string {
    return 'viteView';
  }
}
