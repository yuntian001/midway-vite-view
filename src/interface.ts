export interface ViteViewConfig {
  prod?: boolean;
  clientIndex: Array<string>;
  entryServers?: Array<string>;
  outPrefix: string;
  viteConfigFile?: string;
  staticFileKey: string;
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
