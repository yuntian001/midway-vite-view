import { Controller,Inject,Get } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/admin')
  @Get('/admin/*')
  async admin(): Promise<string> {
    return this.ctx.render('admin/index.html', //admin为viteView.view的key
    {
      ssr:false,//传false代表强制客户端渲染，否则根据配置自行判断
    });
  }

  @Get('*')
  async home(): Promise<string> {
    return this.ctx.render('index/index.html', {
      assign:{
        title:'midway-vite-view'
      }
    });
  }
}
