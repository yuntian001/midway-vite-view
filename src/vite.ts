import { createServer } from 'vite';
let vite;
export const createVite = async (configFile?: string) => {
  if (!vite) {
    vite = await createServer({
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
    });
  }
  return vite;
};
