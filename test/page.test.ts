import { Application, Framework } from '@midwayjs/koa';
import { close, createApp, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';

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

  // it('production asset preloading', async () => {})
})
