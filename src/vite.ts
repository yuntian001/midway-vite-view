const {createServer: createViteServer} = require('vite')
let vite;
//获取可用端口
const net = require('net');
const tryUsePort = async function(port){
  function portUsed(port){
    return new Promise((resolve, reject)=>{
      let server = net.createServer().listen(port);
      server.on('listening',function(){
        server.close();
        resolve(port);
      });
      server.on('error',function(err){
        if(err.code == 'EADDRINUSE'){
          resolve(err);
        }
      });
    });
  }

  let res = await portUsed(port);
  if(res instanceof Error){
    console.log(`端口：${port}被占用\n`);
    port++;
    return await tryUsePort(port);
  }else{
    return port;
  }
}
export const createVite = async () => {
  if (!vite) {
    vite = await createViteServer({
      server: {
        middlewareMode: 'ssr',
        hmr:{
          clientPort: await tryUsePort(24678),//socket热更新默认端口
        },
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100
        }
      },
      root: process.cwd(),
      logLevel: 'info',
    });
  }
  return vite;
}

