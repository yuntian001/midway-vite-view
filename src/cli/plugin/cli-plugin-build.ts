// eslint-disable-next-line node/no-extraneous-import
import { BasePlugin } from '@midwayjs/command-core';
import { loadConfigFromFile, build as buildVite } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import * as fsPromises from 'fs/promises';
import { CommandOptions } from '../../interface';
import { isAbsolute, resolve } from 'path';

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
  private config: any = {
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
            '构建方式:1=根据配置文件自动构建，2=自动寻找viewDir文件夹下的index.html和entry-server.js进行构建 默认为1',
          shortcut: 't',
        },
        config: {
          usage: '配置文件夹/配置文件，默认为src/config',
        },
        outDir: {
          usage: '编译输出目录默认为，staticFile.dirs.default.dir或public',
        },
        viteConfigFile: {
          usage: 'vite 配置文件 默认为viteView.viteConfigFile或vite.config.js',
        },
        viewDir: {
          usage: 'views dir 默认 view',
        },
        prefix: {
          usage: '静态缓存前缀 默认为staticFile.dirs.default.prefix或/public',
        },
        outPrefix: {
          usage: '编译输出文件夹 默认为viteView.outPrefix或html',
        },
      },
    },
  };
  hooks = {
    'build:formatOptions': this.formatOptions.bind(this),
    'build:setFile': this.setFile.bind(this),
    'build:run': this.run.bind(this),
  };
  async getConfig() {
    let configFiles;
    const stat = await fs.statSync(this.options.config);
    if (stat.isFile()) {
      configFiles = [this.options.config];
    } else {
      let env = 'prod';
      if (process.env.MIDWAY_SERVER_ENV) {
        env = process.env.MIDWAY_SERVER_ENV;
      } else if (process.env.NODE_ENV) {
        env = process.env.NODE_ENV;
      }
      configFiles = [
        this.options.config + '/config.default.ts',
        this.options.config + `/config.${env}.ts`,
      ].filter(file => fs.existsSync(file));
    }
    await Promise.all(
      configFiles.map(file => {
        return (async () => {
          const { config: c } = await loadConfigFromFile(undefined, file);
          this.midwayConfig = Object.assign(this.config, c);
        })();
      })
    );
  }

  async getViteConfig() {
    let filePath = this.options.viteConfigFile;
    if (filePath) {
      if (!fs.existsSync(filePath)) {
        throw new Error(`vite 配置文件 ${filePath} 不存在`);
      }
    }
    filePath = this.getDiskPath('vite.config.js');
    if (!fs.existsSync(filePath)) {
      filePath = this.getDiskPath('vite.config.ts');
    }
    if (!fs.existsSync(filePath)) {
      throw new Error(`vite 配置文件 ${filePath} 不存在`);
    }
    const { config } = await loadConfigFromFile(undefined, filePath);
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
    if (!this.options.config) {
      this.options.config = 'src/config';
    }
    if (!this.options.type) {
      this.options.type = 1;
    }
    if (+this.options.type === 1) {
      try {
        await this.getConfig();
      } catch (e) {
        console.error(
          '解析midway配置失败你可以使用-t 2 用文件名匹配模式进行构建'
        );
        throw e;
      }
    }
    this.options.outDir =
      this.options.outDir ??
      (this.midwayConfig?.staticFile?.dirs?.default?.dir || 'public');
    this.options.prefix =
      this.options.prefix ??
      (this.midwayConfig?.staticFile?.dirs?.default?.prefix || '/public');
    this.options.viteConfigFile =
      this.options.viteConfigFile ??
      this.midwayConfig?.viteView?.viteConfigFile;
    this.options.outPrefix =
      this.options.outPrefix ??
      (this.midwayConfig?.viteView?.outPrefix || 'html');
    this.options.outDir += `/${this.options.outPrefix}/`;
    this.options.prefix += `/${this.options.outPrefix}/`;
    if (!this.options.viewDir) {
      this.options.viewDir = 'view';
    }
    // set absolute path
    Object.keys(this.options).forEach(key => {
      if (['config', 'outDir', 'viteConfigFile', 'viewDir'].includes(key)) {
        this.options[key] = this.getDiskPath(this.options[key]);
      }
    });
    Object.assign(this.config, this.options);
    await this.getViteConfig();
  }

  async setFile() {
    if (+this.config.type === 1) {
      this.setFileByConfig();
    } else {
      this.setFileByFileName();
    }
  }

  async run() {
    const input = [];
    this.config.clientIndex.forEach((file: string) => {
      input.push(path.resolve(this.rootDir, file));
    });
    await buildVite({
      base: this.config.prefix,
      publicDir: false,
      configFile: this.config.viteConfigFile,
      build: {
        outDir: this.config.outDir,
        ssrManifest: true,
        rollupOptions: { input },
        ssr: false,
      },
    });
    const content = fs.readFileSync(
      this.config.outDir + 'ssr-manifest.json',
      'utf8'
    );
    fs.writeFileSync(
      this.config.outDir + 'ssr-manifest.json',
      content.replace(
        new RegExp('"/' + (this.viteCofig.build?.assetsDir || 'assets'), 'g'),
        '"' + this.config.prefix + (this.viteCofig.build?.assetsDir || 'assets')
      )
    );
    if (this.config.entryServers.length) {
      // const input ={};
      this.config.entryServers.forEach(async (file: string) => {
        const fileName = path.resolve(this.rootDir, file);
        // input[fileName.substring(this.rootDir.length+1).slice(0,-path.extname(file).length)] = file;
        await buildVite({
          base: this.config.prefix,
          publicDir: false,
          configFile: this.config.viteConfigFile,
          build: {
            emptyOutDir: false,
            outDir:
              this.config.outDir +
              fileName
                .substring(this.rootDir.length + 1)
                .slice(0, -path.basename(file).length),
            ssrManifest: false,
            // rollupOptions:{input},
            ssr: file,
          },
        });
      });
    }
  }

  async setFileByConfig() {
    this.config.clientIndex = this.midwayConfig.viteView.clientIndex;
    this.config.entryServers = this.midwayConfig.viteView?.entryServers || [];
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

  private getDiskPath(path?: string) {
    if (!path || isAbsolute(path)) return path;
    return resolve(this.core.cwd, path);
  }
}
