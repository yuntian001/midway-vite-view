import { ViteViewConfig } from './../interface';
import { Config, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { createServer } from 'vite';
import { version } from 'vite/package.json';
const c2k = require('koa2-connect');

@Provide()
@Scope(ScopeEnum.Singleton)
export class ViteService {
    @Config('viteView')
    viteViewConfig:ViteViewConfig;

    //生成vite server
    async createVite(configFile?: string) {
        return version.startsWith('2.')
            ? await createServer({
                configFile,
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

    //生成vite中间件
    async createViteMiddleware(configFile ?: string){
        const vite = await this.createVite(configFile);
        return c2k(vite.middlewares);
    }

    //获取全部vite中间件数组
    async getViteMiddlewareArr(){
        const configSet = new Set<string>();
        const middlewareArr = [];
        configSet.add( this.viteViewConfig.viteConfigFile ?? 'vite.config.ts');
        middlewareArr.push(this.createViteMiddleware(this.viteViewConfig.viteConfigFile));
        for (const [, view] of Object.entries(this.viteViewConfig.views)) {
            if(typeof view !== 'string' && view.viteConfigFile && !configSet.has(view.viteConfigFile)){
                configSet.add( view.viteConfigFile ?? 'vite.config.ts');
                middlewareArr.push(this.createViteMiddleware(view.viteConfigFile));
            }
        }
        return middlewareArr;
    }
}