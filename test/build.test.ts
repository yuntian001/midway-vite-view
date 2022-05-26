import { join } from 'path';
import { remove, existsSync } from 'fs-extra';
import { CommandCore } from '@midwayjs/command-core';
import { BuildPlugin as ViteBuildPlugin } from '../src/cli/plugin/cli-plugin-build';
import * as assert from 'assert';

const run = async (cwd: string, command: string, options = {}) => {
  const core = new CommandCore({
    commands: [command],
    options: {
      buildCache: true,
      ...options,
    },
    log: {
      log: console.log,
    },
    cwd,
  });
  core.addPlugin(ViteBuildPlugin);
  await core.ready();
  await core.invoke();
};

const cwd = join(__dirname, 'fixtures/base-react-app');
describe('test/build.test.ts', () => {
  it('build', async () => {
    const dist = join(cwd, 'public/html');
    if (existsSync(dist)) {
      await remove(dist);
    }
    await run(cwd, 'build', {
      viteConfigFile:'vite.config.ts',
    });
    assert(existsSync(join(dist, 'index.html')));
  })
})
