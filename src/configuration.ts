import { Configuration, Inject, App } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import * as view from '@midwayjs/view';
import { viteView } from './lib/view';
import * as koa from '@midwayjs/koa';
import { ViteMiddleware } from './vite.middleware';
import * as staticFile from '@midwayjs/static-file';

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

  async onReady() {
    this.app.useMiddleware(ViteMiddleware);
    this.viewManager.use('viteView', viteView);
  }
}
