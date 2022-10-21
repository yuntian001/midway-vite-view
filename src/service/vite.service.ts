import { ViteViewConfig } from './../interface';
import { Config, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { createServer, ViteDevServer } from 'vite';
import { version } from 'vite/package.json';
import { getPort } from '../utils';
import * as c2k from 'koa2-connect';

const hmrPortPlugin = () => ({
  name: 'vite-plugin-auto-server-hmr-port-plugin',
  async config(config: any) {
    if (!config.server.hmr) {
      const port = await getPort(24678);
      config.server.hmr = {
        clientPort: port,
        port: port,
      };
    }
  }
});

export type MiddlewareArr = { middleware: any, prefix: string }[];

@Provide()
@Scope(ScopeEnum.Singleton)
export class ViteService {
  @Config('viteView')
  viteViewConfig: ViteViewConfig;

  private vite = {} as { [key: string]: ViteDevServer };
  private middlewareArr = [] as MiddlewareArr;
  //生成vite server
  async createVite(configFile?: string) {
    if (!this.vite[configFile]) {
      this.vite[configFile] = version.startsWith('2.')
        ? await createServer({
          configFile,
          plugins: [
            hmrPortPlugin()
          ],
          server: {
            middlewareMode: 'ssr',
            watch: {
              // During tests we edit the files too fast and sometimes chokidar
              // misses change events, so enforce polling for consistency
              usePolling: true,
              interval: 100,
            },
          },
        })
        : await createServer({
          configFile,
          appType: 'custom',
          plugins: [
            hmrPortPlugin()
          ],
          server: {
            middlewareMode: true,
            watch: {
              // During tests we edit the files too fast and sometimes chokidar
              // misses change events, so enforce polling for consistency
              usePolling: true,
              interval: 100,
            },
          },
        });
    }
    return this.vite[configFile];
  }


  getMiddlewareIndex(prefix:string) {
    for (var i = 0; i < this.middlewareArr.length; i ++) { 
        if(this.middlewareArr[i].prefix.length <= prefix.length){
          return i;
        }
    }
    return 0;
  }

  //获取全部vite中间件数组
  async getViteMiddlewareArr() {
    if(this.middlewareArr.length){
      return this.middlewareArr;
    }
    for (const [, view] of Object.entries(this.viteViewConfig.views)) {
      if (typeof view === 'object') {
        const viteServer = await this.createVite(view.viteConfigFile);
        this.middlewareArr.splice(this.getMiddlewareIndex(viteServer.config.base), 0, {
          middleware: c2k(viteServer.middlewares),
          prefix: viteServer.config.base
        });
      } else {
        const viteServer = await this.createVite(this.viteViewConfig.viteConfigFile);
        this.middlewareArr.splice(this.getMiddlewareIndex(viteServer.config.base), 0, {
          middleware: c2k(viteServer.middlewares),
          prefix: viteServer.config.base
        });
      }
    }
    return this.middlewareArr;
  }
}
