export interface ViteViewConfig {
  prod?: boolean;
  views: Record<
    string,
    | string
    | {
        entryServer?: string;
        viteConfigFile?: string; //vite config的文件地址
        root?: string; //vite config的root地址(相对于view文件夹)
      }
  >;
  outPrefix: string; //打包文件夹前缀 默认为html
  viteConfigFile?: string; //vite config的文件地址
  staticFileKey: string; //staticFile的key默认为default
  root?: string; //vite config的root地址(相对于view文件夹)
}

export interface CommandOptions {
  [x: string]: any;
  type: 1 | 2;
  config: string;
  outDir: string;
  viteConfigFile: string;
  viewDir: string;
  prefix: string;
  outPrefix: string;
  staticFileKey: string;
}
