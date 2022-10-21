import { ViteMiddleware } from './middware/vite.middware';
import { Configuration, Inject, App, Config } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import * as view from '@midwayjs/view';
import { ViteView } from './lib/view';
import * as koa from '@midwayjs/koa';
import * as staticFile from '@midwayjs/static-file';
import { ViteViewConfig } from './interface';

@Configuration({
  namespace: 'viteView',
  imports: [koa, view, staticFile],
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class MidwayViteViewConfiguration {
  @Inject()
  viewManager: view.ViewManager;

  @App()
  app: koa.Application;

  @Config('viteView')
  viteViewConfig: ViteViewConfig;

  async onReady() {
    if (
      this.viteViewConfig.prod === false ||
      !['prod', 'production'].includes(this.app.getEnv())
    ) {
      this.app.useMiddleware(ViteMiddleware);
    }
    this.viewManager.use('viteView', ViteView);
  }
}
