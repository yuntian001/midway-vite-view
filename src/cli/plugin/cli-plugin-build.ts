// eslint-disable-next-line node/no-extraneous-import
import { BasePlugin } from '@midwayjs/command-core';
import { loadConfigFromFile, build as buildVite } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import * as fsPromises from 'fs/promises';
import { CommandOptions, ViteViewConfig } from '../../interface';
import { resolve } from 'path';
import { normalizePath } from 'vite';
import * as extend from 'extend2';
//递归遍历文件并执行callback
const fileDisplay = async function (
  filePath: string,
  callback: (filename: string, filedir: string) => void
) {
  const files = await fsPromises.readdir(filePath);
  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    //获取当前文件的绝对路径
    const filedir = path.join(filePath, filename);
    //根据文件路径获取文件信息，返回一个fs.Stats对象
    const stats = fs.statSync(filedir);
    if (stats.isFile()) {
      await callback(filename, filedir);
    } else if (stats.isDirectory()) {
      await fileDisplay(filedir, callback); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
    }
  }
};

export class BuildPlugin extends BasePlugin {
  public options = {} as CommandOptions;
  private pages = {} as Record<string, {
    clientIndex: string[],
    entryServers: string[],
    viteConfigFile?: string,
    outPrefix?: string,
    rootDir: string
  }>
  private env = 'prod';
  private midwayConfig = {
    viteView: {
      views: {},
      outPrefix: 'html',
      staticFileKey: 'default',
    } as ViteViewConfig,
    staticFile: {
      dirs: {
        default: {
          prefix: '/public',
          dir: 'public',
        },
      },
    },
  };
  private viteCofigs: any = {};
  private rootDir = this.core.cwd;
  commands = {
    build: {
      lifecycleEvents: ['formatOptions', 'setFile', 'run'],
      options: {
        type: {
          usage:
            '构建方式:1=根据配置文件自动构建，2=自动寻找viewDir文件夹下的index.html和entry-server.js进行构建 默认为1',
          shortcut: 't',
        },
        config: {
          usage: '配置文件夹/配置文件，默认为src/config',
        },
        outDir: {
          usage:
            '编译输出目录默认为，默认为staticFile.dirs[staticFileKey].dir或public',
        },
        viteConfigFile: {
          usage: 'vite 配置文件 默认为viteView.viteConfigFile或vite.config.js',
        },
        viewDir: {
          usage: 'views dir 默认 view',
        },
        prefix: {
          usage:
            '静态缓存前缀 默认为staticFile.dirs[staticFileKey].prefix或/public',
        },
        outPrefix: {
          usage: '编译输出前缀 默认为viteView.outPrefix或html',
        },
        staticFileKey: {
          usage:
            '使用的staticFile.dirs的key  默认为viteView.staticFileKey或default',
        },
      },
    },
  };
  hooks = {
    'build:formatOptions': this.formatOptions.bind(this),
    'build:setFile': this.setFile.bind(this),
    'build:run': this.run.bind(this),
  };
  initEnv() {
    if (process.env.MIDWAY_SERVER_ENV) {
      this.env = process.env.MIDWAY_SERVER_ENV;
    } else if (process.env.NODE_ENV) {
      this.env = process.env.NODE_ENV;
    }
  }
  async getConfig() {
    if (+this.options.type === 1) {
      try {
        let configFiles;
        const stat = await fs.statSync(this.options.config);
        if (stat.isFile()) {
          configFiles = [this.options.config];
        } else {
          configFiles = [
            this.options.config + '/config.default.ts',
            this.options.config + `/config.${this.env}.ts`,
          ].filter(file => fs.existsSync(file));
        }
        await Promise.all(
          configFiles.map(file => {
            return (async () => {
              const { config } = await loadConfigFromFile(undefined, file);
              this.midwayConfig = extend(true, this.midwayConfig, config);
            })();
          })
        );
      } catch (e) {
        console.error(
          '解析midway配置失败你可以使用-t 2 用文件名匹配模式进行构建'
        );
        throw e;
      }
    }
  }
  getViteFilePath(filePath?: string) {
    if (filePath) {
      if (!fs.existsSync(filePath)) {
        throw new Error(`vite 配置文件 ${filePath} 不存在`);
      }
      return filePath;
    }
    filePath = this.getDiskPath('vite.config.js');
    if (!fs.existsSync(filePath)) {
      filePath = this.getDiskPath('vite.config.ts');
    }
    if (!fs.existsSync(filePath)) {
      throw new Error(`vite 配置文件 vite.config.js、${filePath} 不存在`);
    }
    return filePath;
  }
  async getViteConfig(path?: string) {
    const { config } = await loadConfigFromFile(
      { command: 'build', mode: this.env, ssrBuild: true },
      this.getViteFilePath(path ?? this.options.viteConfigFile)
    );
    this.viteCofigs[path ?? 'default'] = config;
    if (
      config.build &&
      config.build.rollupOptions &&
      config.build.rollupOptions.input
    ) {
      console.warn(
        '[vite view] vite配置文件中指定了rollupOptions.input，打包时将应用此构建，如果不确定配置值是否正确，请删除build.rollupOptions.input配置'
      );
    }
    return this.viteCofigs[path ?? 'default'];
  }
  async formatOptions() {
    this.initEnv();
    if (!this.options.config) {
      this.options.config = 'src/config';
    }
    if (!this.options.type) {
      this.options.type = 1;
    }
    await this.getConfig();
    this.options.staticFileKey =
      this.options.staticFileKey ?? this.midwayConfig.viteView.staticFileKey;
    this.options.outDir =
      this.options.outDir ??
      this.midwayConfig.staticFile.dirs[this.options.staticFileKey].dir;
    this.options.prefix =
      this.options.prefix ??
      this.midwayConfig.staticFile.dirs[this.options.staticFileKey].prefix;
    this.options.viteConfigFile =
      this.options.viteConfigFile ?? this.midwayConfig.viteView.viteConfigFile;
    this.options.outPrefix =
      this.options.outPrefix ?? this.midwayConfig.viteView.outPrefix;
    if (!this.options.viewDir) {
      this.options.viewDir = 'view';
    }
    // set absolute path
    Object.keys(this.options).forEach(key => {
      if (['config', 'outDir', 'viteConfigFile', 'viewDir'].includes(key)) {
        this.options[key] = this.getDiskPath(this.options[key]);
      }
    });
    this.options.outDir = normalizePath(
      this.options.outDir + `/${this.options.outPrefix}/`
    );
    this.options.prefix = normalizePath(
      this.options.prefix + `/${this.options.outPrefix}/`
    );
  }

  async setFile() {
    if (+this.options.type === 1) {
      this.setFileByConfig();
    } else {
      this.setFileByFileName();
    }
  }

  async run() {
    for (const [, info] of Object.entries(this.pages)) {
      console.log('[vite view] build ' + (info.outPrefix ?? '') + '  ' + (info.viteConfigFile ?? '') + '\n')
      await this.buildClient(
        info.clientIndex,
        normalizePath(this.options.prefix + `/${info.outPrefix}/`),
        path.resolve(this.options.outDir, info.outPrefix),
        info.viteConfigFile
      );
      await info.entryServers.length && this.buildSSR(
        info.entryServers,
        normalizePath(this.options.prefix + `/${info.outPrefix}/`),
        path.resolve(this.options.outDir, info.outPrefix),
        info.viteConfigFile,
        info.rootDir
      )
    }
  }

  async buildClient(input: string[], prefix: string, outDir: string, viteConfigFile: string) {
    console.log('[vite view] build client\n');
    await buildVite({
      base: prefix,
      publicDir: false,
      configFile: viteConfigFile,
      build: {
        outDir: outDir,
        ssrManifest: true,
        rollupOptions: { input },
        ssr: false,
      },
    });
    const content = fs.readFileSync(
      outDir + 'ssr-manifest.json',
      'utf8'
    );
    const viteConfig = await this.getViteConfig(viteConfigFile);
    fs.writeFileSync(
      outDir + 'ssr-manifest.json',
      content.replace(
        new RegExp('"/' + (viteConfig.build?.assetsDir || 'assets'), 'g'),
        '"' + prefix + (viteConfig.build?.assetsDir || 'assets')
      )
    );
  }

  async buildSSR(entryServers: string[], prefix: string, outDir: string, viteConfigFile: string,rootDir:string) {
    console.log('[vite view] build ssr\n');
    await Promise.all(entryServers.map((file:string)=>async () => {
      await buildVite({
        base: prefix,
        publicDir: false,
        configFile: viteConfigFile,
        build: {
          emptyOutDir: false,
          outDir: path.resolve(outDir, 
            path.relative(rootDir, file.slice(0, -path.basename(file).length))
          ),
          ssrManifest: false,
          ssr: file,
        },
      });
    }))
  }

  async setFileByConfig() {
    for (const [index, ssr] of Object.entries(
      this.midwayConfig.viteView.views
    )) {
      const rootDir = (await this.getViteConfig(typeof ssr === 'string' ? undefined : ssr.viteConfigFile)).root ?? this.rootDir;
      if (typeof ssr === 'string') {
        if (!this.pages['default--undefined']) {
          this.pages['default--undefined'] = {
            clientIndex: [],
            entryServers: [],
            outPrefix: '',
            viteConfigFile: this.options.viteConfigFile,
            rootDir,
          }
        }
        this.pages['default--undefined'].clientIndex.push(
          path.resolve(rootDir, index)
        );
        this.pages['default--undefined'].entryServers.push(
          path.resolve(rootDir, ssr)
        );
      } else {
        if (!this.pages[(ssr.viteConfigFile ?? 'default') + '--' + ssr.outPrefix]) {
          this.pages[(ssr.viteConfigFile ?? 'default') + '--' + ssr.outPrefix] = {
            clientIndex: [],
            entryServers: [],
            viteConfigFile: ssr.viteConfigFile ?? this.options.viteConfigFile,
            outPrefix: ssr.outPrefix ?? '',
            rootDir
          }
        }
        this.pages[(ssr.viteConfigFile ?? 'default') + '--' + ssr.outPrefix].clientIndex.push(
          path.resolve(rootDir, index)
        );
        this.pages[(ssr.viteConfigFile ?? 'default') + '--' + ssr.outPrefix].entryServers.push(path.resolve(rootDir, ssr.entryServer));
      }
    }
  }

  async setFileByFileName() {
    this.pages['default--undefined'] = {
      clientIndex: [],
      entryServers: [],
      viteConfigFile: this.options.viteConfigFile,
      rootDir:this.rootDir
    }
    await fileDisplay(this.options.viewDir, (fileName, filePath) => {
      if (fileName === 'index.html') {
        this.pages['default--undefined'].clientIndex.push(filePath);
      } else if (['entry-server.js', 'entry-server.jsx', 'entry-server.tsx'].includes(fileName)) {
        this.pages['default--undefined'].entryServers.push(fileName);
      }
    });
  }

  private getDiskPath(path?: string) {
    if (typeof path === 'string') {
      if (!path) {
        return this.core.cwd;
      }
      return resolve(this.core.cwd, path);
    } else {
      return path;
    }
  }
}
