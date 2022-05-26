export interface ViteViewOptions {
  prod: boolean;
  clientIndex: Array<string>;
  entryServers: Array<string>;
}

export interface CommandOptions {
  type: 1 | 2;
  config: string;
  outDir: string;
  viteConfigFile: string;
  viewDir: string;
}
