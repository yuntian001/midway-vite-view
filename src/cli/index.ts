// eslint-disable-next-line node/no-extraneous-import
import { CoreBaseCLI } from '@midwayjs/command-core';
import { BuildPlugin } from './plugin/cli-plugin-build';
const cli = async argv => {
  const coreBaseCLI = new CoreBaseCLI(argv);
  coreBaseCLI.core.addPlugin(BuildPlugin); // 载入插件，插件支持 class / 'npm:provider:packageName' / 'local:provider:path' 三种形式
  await coreBaseCLI.start(); // 执行默认命令
};
module.exports = cli;
