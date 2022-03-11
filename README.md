# midway-vite-view

midway+vite 服务端渲染和客户端渲染组件


### github
[https://github.com/yuntian001/midway-vite-view](https://github.com/yuntian001/midway-vite-view)

### 使用示例
[https://github.com/yuntian001/midway-vite-view/tree/main/example](https://github.com/yuntian001/midway-vite-view/tree/main/example)

## 使用说明

- 安装组件扩展包
```bash
$ npm install midway-vite-view -d
```
- view 文件夹下创建放入对应视图文件

- 修改 vite.config.js root 参数为process.cwd()+'/view'

- midway configuration.ts中引入视图文件
```
import * as viteView from 'midway-vite-view';//引入view组件
@Configuration({
  imports: [
    //其余代码不变
    viteView, //导入view组件
  ],
})
//其余代码不变
```

- midway 中加入配置文件

```
  view: { //midwayjs 视图配置 说明参考 https://midwayjs.org/docs/extensions/render
    defaultViewEngine: 'viteView',
  },
  viteView: { midway-vite-view 配置配置详细说明见下方
    clientIndex: ['index/index.html', 'admin/index.html'],
    entryServers: [
      'index/src/entry-server.js',
      'admin/src/entry-server.js',
    ],
  },

```

- 控制器中调用
```
    //服务端渲染
    return this.ctx.render('index/index.html', {
      entry: 'index/src/entry-server.js',
      assign:{keyWords:'vite midway'},//html中{{keyWords}}的会被替换为vite midway
    });

    //客户端渲染
    return this.ctx.render('index/index.html',{
      assign:{keyWords:'vite midway'},//html中{{keyWords}}的会被替换为vite midway
    });

```

- package.json中打包命令加入 && vite-view build
```
     "build": "midway-bin build -c && vite-view build"
```
## 配置说明

| 配置项      |类型|是否必须 | 说明 |
| -----------| ----------- | ----------- |----------- |
| prod      | boolean| 否 |是否是发布环境 如果不传用运行环境是否为prod以区分|
|clientIndex|array|是|客户端渲染index.html列表 路径相对于view文件夹|
|entryServers|array|否|服务端渲染entry-server.js地址 路径相对于view文件夹|

## 打包命令 vite-view build 参数说明
传参方式为 vite-view build --type 1

| 参数项      |默认值 | 说明 |
| ---------- | ----------- |----------- |
|type | 1 | 构建方式:1=根据配置文件自动构建，2=自动寻找viewDir文件夹下的index.html和entry-server.js进行构建|
|config|src/config|midway配置文件夹/配置文件|
|outDir|public|编译输出目录|
|viteConfigFile|命令根目录 vite.config.js|vite 配置文件 |
|viewDir|view|视图文件夹 仅在type2模式下使用|
