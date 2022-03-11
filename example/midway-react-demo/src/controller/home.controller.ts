import {Controller, Get, Inject} from '@midwayjs/decorator';
import {Context} from "@midwayjs/koa";

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('*')
  async home(): Promise<string> {
    //服务端渲染
    return this.ctx.render('index.html', {
      entry: 'src/entry-server.jsx',
      assign:{title:'vite midway'},//html中{{title}}的会被替换为vite midway
    });
  }
}
