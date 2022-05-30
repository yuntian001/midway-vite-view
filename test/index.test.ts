import { Application, Framework } from '@midwayjs/koa';
import { close, createApp, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';

import { remove, existsSync } from 'fs-extra';
import { CommandCore } from '@midwayjs/command-core';
import { BuildPlugin as ViteBuildPlugin } from '../src/cli/plugin/cli-plugin-build';
import * as assert from 'assert';

const cwd = join(__dirname, 'fixtures/base-react-app');
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

it('build ssr', async () => {
  const dist = join(cwd, 'public/html');
  if (existsSync(dist)) {
    await remove(dist);
  }
  await run(cwd, 'build', {
    viteConfigFile:'vite.config.ts',
  });
  assert(existsSync(join(dist, 'index.html')));
})

describe('/test/index.test.ts', () => {
  let app:Application;

  beforeAll(async () => {
    // 只创建一次 app，可以复用
    try {
      app = await createApp<Framework>(join(__dirname, 'fixtures', 'base-react-app'), {});
    } catch(err) {
        console.error('test beforeAll error', err);
      throw err;
    }
  });

  afterAll(async () => {
    await close(app);
  });

  it('home page', async () => {
    const result = await createHttpRequest(app).get('/');
    expect(result.status).toEqual(200);
    expect(result.text).toContain('<h1>Home</h1>')
  });

  it('about page', async () => {
    const result = await createHttpRequest(app).get('/about');
    expect(result.status).toEqual(200);
    expect(result.text).toContain('<h3>About</h3>')
  });
})
