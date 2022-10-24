# midway-vite-view

midway+vite 服务端渲染和客户端渲染组件,支持Vite2、Vite3,支持多vite项目并存。

当前说明对应`^2.0.0`版本，`^1.0.0`(仅支持Vite2)文档请查看 [v1](https://github.com/yuntian001/midway-vite-view/tree/v1) 分支


### github
[https://github.com/yuntian001/midway-vite-view](https://github.com/yuntian001/midway-vite-view)

### 使用示例
[https://github.com/yuntian001/midway-vite-view/tree/main/example](https://github.com/yuntian001/midway-vite-view/tree/main/example)

## 使用说明

midway+vite 依赖于静态文件托管组件：[@midwayjs/static-file@3](https://midwayjs.org/docs/extensions/static_file)

所有静态文件需要按照@midwayjs/static-file@3规则放在对应的文件夹中,@midwayjs/static-file@3默认的静态文件夹为public

| web 支持情况| |
|     ---    | --- |
| @midwayjs/koa |	✅ |
| @midwayjs/faas | ✅ |
| @midwayjs/web	 | ✅ |
| @midwayjs/express	| ❌ |

## 代码示例

[example/](./example/)

## 快速开始
- 安装组件扩展包
```bash
$ npm install vite
$ npm install midway-vite-view
```
- 项目根目录下新建public文件夹
- view 文件夹下创建放入对应vue项目
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
  viteView: { //midway-vite-view 配置配置详细说明见下方
    views:{
     'index/index.html':'index/src/entry-server.js',
     'admin/index.html':'admin/src/entry-server.js',
    }
  },

```

- vite 配置文件中 按[示例](./example/)进行更改

- 控制器中调用
```
    //服务端渲染 
    return this.ctx.render('admin/index.html', {
      assign:{keyWords:'vite midway'},//html中{{keyWords}}的会被替换为vite midway
    });

    //客户端渲染
    return this.ctx.render('index/index.html',{
      ssr:false, //false代表强制客户端渲染,默认会根据配置自动匹配
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
| prod      | boolean| 否 |是否是发布环境 如果不传用运行环境是否为prod/production以区分|
| views | `{[key:string]:string\|object}`  | 是 | key为index.html路径(相对于view文件夹)，value为服务端渲染entry-server路径(相对于view文件夹,如果没有entry-server，填'')|
| outPrefix | string | 否 | 打包前缀目录，会在static-file文件夹下创建子文件夹进行打包,默认为html |
| viteConfigFile | string | 否 | vite配置文件地址，默认按vite规则选择vite.config.js/vite.config.ts | 
| staticFileKey | string | 否 | 对应的staticFile.dirs的key 默认为default |
| root | string | 否 | vite.coinfig的root根目录相对于view文件夹的相对路径 默认为`''`|

| views      |类型|是否必须 | 说明 |
| -----------| ----------- | ----------- |----------- |
| entryServer | string | 否 | 服务端渲染entry-server路径(相对于view文件夹,如果没有entry-server，填'') |
| viteConfigFile | string | 否 | vite config的文件地址，多vite项目时需要分别设置此参数，默认使用外层配置的viteConfigFile |
| root | string | 否 | vite.coinfig的root根目录相对于view文件夹的相对路径 默认使用外层配置的`root`|

## 打包命令 vite-view build 参数说明
传参方式为 vite-view build --type 1

| 参数项      | 默认值 | 说明 |
| ---------- | ----------- |----------- |
|type | 1 | 构建方式:1=根据配置文件自动构建，2=自动寻找viewDir文件夹下的index.html和entry-server.js进行构建|
| config | src/config |midway配置文件夹/配置文件|
| staticFileKey |viteView.staticFileKey 或 default|使用的staticFile.dirs的key|
| outDir | staticFile.dirs[staticFileKey].dir 或 public |编译输出目录|
| viteConfigFile |命令根目录 vite.config.js、vite.config.ts|vite 配置文件 |
| viewDir | view | 视图文件夹 |
| prefix | staticFile.dirs[staticFileKey].prefix 或 /public | 静态缓存前缀 |
| outPrefix | viteView.outPrefix 或 html | 编译输出前缀,会在static-file文件夹下创建子文件夹进行打包 |


