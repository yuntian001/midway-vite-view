export { MidwayViteViewConfiguration as Configuration } from './configuration';
export { viteView } from './lib/view';
export * from './vite.middleware';

// 标准的扩展声明
declare module '@midwayjs/core/dist/interface' {
  // 将配置合并到 MidwayConfig 中
  interface MidwayConfig {
    viteView?: {
      prod?: boolean; //是否是发布环境 用以区分
      // viteConfigFile?:string,//vite配置文件地址
      clientIndex: string[]; //客户端渲染index.html列表
      entryServers?: string[]; //服务端渲染entry-server.js地址
    };
  }
}
