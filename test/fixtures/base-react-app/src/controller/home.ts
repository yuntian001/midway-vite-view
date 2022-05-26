
import { Controller, Get, Inject, Provide } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Provide()
@Controller()
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('*')
  async reactView(): Promise<string> {
    return this.ctx.render('index.html', {
      entry: 'src/entry-server.tsx',
      assign: { title: 'viteView hello' }, //html中{{title}}的会被替换为vite midway
    });
  }
}
