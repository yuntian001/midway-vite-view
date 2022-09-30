export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1646896633407_6393',
  koa: {
    port: 7001,
  },
  view: {
    defaultViewEngine: 'viteView',
  },
  viteView: {
    // prod:true,
    views:{
      'index.html':'src/entry-server.tsx',
    }
  },
};

