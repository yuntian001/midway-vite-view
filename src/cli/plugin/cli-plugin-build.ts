// eslint-disable-next-line node/no-extraneous-import
import { BasePlugin } from '@midwayjs/command-core';
import { loadConfigFromFile, build as buildVite } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import * as fsPromises from 'fs/promises';
import { MidwayInvalidConfigError } from '@midwayjs/core';
import { isAbsolute, resolve } from 'path';
import { CommandOptions, ViteViewOptions } from '../../interface';
import { get, getCurrentEnvironment } from '../../utils';

//递归遍历文件并执行callback
const fileDisplay = async function (
  filePath: string,
  callback: (fileName: string, filePath: string) => void
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
  private config: Partial<ViteViewOptions> = {
    clientIndex: [],
    entryServers: [],
  };
  private midwayConfig: any = {};
  private viteCofig: any = {};
  private rootDir = this.core.cwd;

  commands = {
    build: {
      lifecycleEvents: ['formatOptions', 'setFile', 'run'],
      options: {
        type: {
          usage:
            '构建方式:1=根据配置文件自动构建，2=自动寻找view文件夹下的index.html和entry-server.js进行构建 默认为1',
          shortcut: 't',
        },
        config: {
          usage: '配置文件夹/配置文件，默认为src/config',
        },
        outDir: {
          usage: '编译输出目录默认为public',
        },
        viteConfigFile: {
          usage: 'vite 配置文件 默认为命令根目录 vite.config.js',
        },
        viewDir: {
          usage: 'views dir 默认 view',
        },
      },
    },
  };
  hooks = {
    'build:formatOptions': this.formatOptions.bind(this),
    'build:setFile': this.setFile.bind(this),
    'build:run': this.run.bind(this),
  };
  async loadMidwayConfig() {
    let configFiles;
    const stat = await fs.statSync(this.options.config);
    if (stat.isFile()) {
      configFiles = [this.options.config];
    } else {
      const env = getCurrentEnvironment();
      configFiles = [
        this.options.config + '/config.default.ts',
        this.options.config + `/config.${env}.ts`,
      ].filter(file => fs.existsSync(file));
    }
    await Promise.all(
      configFiles.map(file => {
        return (async () => {
          const c = (await this.loadFile(this.getDiskPath(file))) as any;
          this.midwayConfig = Object.assign(this.config, c);
        })();
      })
    );
  }

  async getViteConfig() {
    const { config } = await loadConfigFromFile(
      undefined,
      this.options.viteConfigFile || 'vite.config.js'
    );
    this.viteCofig = config;
    this.rootDir = this.viteCofig.root || this.rootDir;
    if (
      this.viteCofig.build &&
      this.viteCofig.build.rollupOptions &&
      this.viteCofig.build.rollupOptions.input
    ) {
      console.warn(
        'vite配置文件中指定了rollupOptions.input，打包时将应用此构建，如果不确定配置值是否正确，请删除build.rollupOptions.input配置'
      );
    }
  }
  async formatOptions() {
    const defaultCommandOptions = {
      type: 1,
      config: 'src/config',
      outDir: 'public/html/',
      viteConfigFile: 'vite.config.js',
      viewDir: 'view',
    } as CommandOptions;

    this.options = Object.assign({}, defaultCommandOptions, this.options);
    // set absolute path
    Object.keys(this.options).forEach(key => {
      if (['config', 'outDir', 'viteConfigFile', 'viewDir'].includes(key)) {
        this.options[key] = this.getDiskPath(this.options[key]);
      }
    });

    if (this.options.type === 1) {
      try {
        await this.loadMidwayConfig();
      } catch (e) {
        console.error(
          '解析midway配置失败你可以使用-t 2 用文件名匹配模式进行构建 j%',
          e
        );
        throw e;
      }
    }

    this.config = Object.assign(
      this.config,
      get(this.midwayConfig, 'viteView')
    );

    await this.getViteConfig();
  }

  async setFile() {
    if (this.options.type === 2) {
      this.setFileByFileName();
    }
  }

  async run() {
    const input = [];
    this.config.clientIndex.forEach(file => {
      input.push(path.resolve(this.core.cwd, this.options.viewDir, file));
    });
    // client build
    this.core.cli.log('[vite-view] vite build client');
    await buildVite({
      root: this.options.viewDir,
      base: this.options.outDir + '/',
      publicDir: false,
      configFile: this.options.viteConfigFile,
      build: {
        outDir: this.options.outDir,
        ssrManifest: true,
        rollupOptions: { input },
        ssr: false,
      },
    });
    const content = fs.readFileSync(
      this.options.outDir + '/ssr-manifest.json',
      'utf8'
    );
    fs.writeFileSync(
      this.options.outDir + '/ssr-manifest.json',
      content.replace(
        new RegExp('"/' + (this.viteCofig.build?.assetsDir || 'assets'), 'g'),
        '"' +
          this.options.outDir +
          '/html' +
          (this.viteCofig.build?.assetsDir || 'assets')
      )
    );

    // server build
    this.core.cli.log('[vite-view] vite build server');
    if (this.config.entryServers.length) {
      for (const file of this.config.entryServers) {
        const fileName = path.resolve(this.rootDir, file);
        await buildVite({
          root: this.options.viewDir,
          base: this.options.outDir + '/',
          publicDir: false,
          configFile: this.options.viteConfigFile,
          build: {
            emptyOutDir: false,
            outDir:
              this.options.outDir +
              '/' +
              fileName
                .substring(this.rootDir.length + 1)
                .slice(0, -path.basename(file).length),
            ssrManifest: false,
            ssr: file,
          },
        });
      }
    }
  }

  async setFileByFileName() {
    await fileDisplay(this.options.viewDir, (fileName, filePath) => {
      if (fileName === 'index.html') {
        this.config.clientIndex.push(filePath);
      } else if (fileName === 'entry-server.js') {
        this.config.entryServers.push(filePath);
      }
    });
  }

  private loadConfig(
    configFilename
  ): (...args) => any | Record<string, unknown> {
    let exports =
      typeof configFilename === 'string'
        ? require(configFilename)
        : configFilename;

    if (exports && exports.default) {
      if (Object.keys(exports).length > 1) {
        throw new MidwayInvalidConfigError(
          `${configFilename} should not have both a default export and named export`
        );
      }
      exports = exports.default;
    }

    return exports;
  }

  private async loadFile(fileName: string) {
    try {
      return this.loadConfig(fileName); // test环境
    } catch (error) {
      const { config: c } = await loadConfigFromFile(undefined, fileName); // build
      return c;
    }
  }

  private getDiskPath(path: string) {
    if (isAbsolute(path)) return path;
    return resolve(this.core.cwd, path);
  }
}
