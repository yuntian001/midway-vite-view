import { createServer } from 'vite';
import { version } from 'vite/package.json';
let vite;
export const createVite = async (configFile?: string) => {
  if (!vite) {
    vite = version.startsWith('2.')
      ? await createServer({
          configFile,
          server: {
            middlewareMode: 'ssr',
            watch: {
              // During tests we edit the files too fast and sometimes chokidar
              // misses change events, so enforce polling for consistency
              usePolling: true,
              interval: 100,
            },
          },
        })
      : await createServer({
          configFile,
          appType: 'custom',
          server: {
            middlewareMode: true,
            watch: {
              // During tests we edit the files too fast and sometimes chokidar
              // misses change events, so enforce polling for consistency
              usePolling: true,
              interval: 100,
            },
          },
        });
  }
  return vite;
};
