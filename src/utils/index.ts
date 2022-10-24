import * as net from 'net';
export const getCurrentEnvironment = () => {
  return process.env['MIDWAY_SERVER_ENV'] || process.env['NODE_ENV'] || 'prod';
};

export function get(object: any, path: string): any {
  const keys = path.split('.');
  let result = object;

  keys.forEach(key => {
    result = result[key] ?? '';
  });

  return result;
}

//获取可用端口号
export function getPort(port: number) {
  return new Promise<number>(resolve => {
    const server = net.createServer().on('error', () => {
      getPort(++port).then(resolve);
    });
    server.listen(port, () => {
      server.close(() => resolve(port));
    });
  });
}
