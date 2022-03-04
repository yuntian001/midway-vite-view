import { Controller,Inject,Get } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/admin')
  @Get('/admin/*')
  async admin(): Promise<string> {
    return this.ctx.render('admin/index.html', {
      entry: 'admin/src/entry-server.js',
    });
  }

  @Get('*')
  async home(): Promise<string> {
    return this.ctx.render('index/index.html', {
      entry: 'index/src/entry-server.js',
    });
  }
}
