import { Controller, Get, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('*')
  async home(): Promise<string> {
    console.log(123);
    if(this.ctx.originalUrl.startsWith('/admin')){
      return this.ctx.render('admin/index.html');
    }
    return this.ctx.render('index/index.html');
  }
}
