import { Controller, Get, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/*')
  async home(): Promise<string> {
    return this.ctx.render('index/index.html');
  }

  @Get('/admin')
  @Get('/admin/*')
  async admin(): Promise<string> {
    return this.ctx.render('admin/index.html');
  }
}
