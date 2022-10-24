import { ViteViewConfig } from './../interface';
import { App, MidwayConfig } from '@midwayjs/core';
import { Config, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { createServer, ViteDevServer, normalizePath } from 'vite';
import { version } from 'vite/package.json';
import { getPort } from '../utils';
import * as c2k from 'koa2-connect';
import * as path from 'path';
import * as koa from '@midwayjs/koa';

let cachePostfix = '';
const vitePlugin = (viewRoot: string, appDir: string) => ({
  name: 'vite-plugin-midway-vite-view',
  async config(config: any) {
    if (!config.server.hmr) {
      const port = await getPort(24678);
      config.server.hmr = {
        clientPort: port,
        port: port,
      };
    }
    if (!config.cacheDir) {
      config.cacheDir = path.resolve(
        appDir,
        `node_modules/.vite${cachePostfix}`
      );
      cachePostfix = cachePostfix + '_';
    }
    if (!config.base) {
      config.base = normalizePath(
        '/' +
          path.relative(viewRoot, path.resolve(process.cwd(), config.root)) +
          '/'
      );
    }
  },
});

export type MiddlewareArr = { middleware: any; prefix: string }[];

@Provide()
@Scope(ScopeEnum.Singleton)
export class ViteService {
  @Config('viteView')
  viteViewConfig: ViteViewConfig;

  @Config('view')
  viewConfig: MidwayConfig['view'];

  @App()
  koaApp: koa.Application;

  private vite = {} as { [key: string]: ViteDevServer };
  private middlewareArr = [] as MiddlewareArr;
  //生成vite server
  async createVite(configFile?: string) {
    if (!this.vite[configFile]) {
      this.vite[configFile] = version.startsWith('2.')
        ? await createServer({
            configFile,
            plugins: [
              vitePlugin(
                this.viewConfig.rootDir.default,
                this.koaApp.getAppDir()
              ),
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
              vitePlugin(
                this.viewConfig.rootDir.default,
                this.koaApp.getAppDir()
              ),
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

  getMiddlewareIndex(prefix: string) {
    for (let i = 0; i < this.middlewareArr.length; i++) {
      if (this.middlewareArr[i].prefix.length <= prefix.length) {
        return i;
      }
    }
    return 0;
  }

  //获取全部vite中间件数组
  async getViteMiddlewareArr() {
    if (this.middlewareArr.length) {
      return this.middlewareArr;
    }
    const configSet = new Set<string | undefined>();
    for (const [, view] of Object.entries(this.viteViewConfig.views)) {
      if (typeof view === 'object' && !configSet.has(view.viteConfigFile)) {
        const viteServer = await this.createVite(view.viteConfigFile);
        this.middlewareArr.splice(
          this.getMiddlewareIndex(viteServer.config.base),
          0,
          {
            middleware: c2k(viteServer.middlewares),
            prefix: viteServer.config.base,
          }
        );
        configSet.add(view.viteConfigFile);
      } else if (!configSet.has(undefined)) {
        const viteServer = await this.createVite(
          this.viteViewConfig.viteConfigFile
        );
        this.middlewareArr.splice(
          this.getMiddlewareIndex(viteServer.config.base),
          0,
          {
            middleware: c2k(viteServer.middlewares),
            prefix: viteServer.config.base,
          }
        );
        configSet.add(undefined);
      }
    }
    return this.middlewareArr;
  }
}
