import { Provide, Config, App, Inject } from '@midwayjs/decorator';
import { StaticFileOptions } from '@midwayjs/static-file';
import { IViewEngine, RenderOptions } from '@midwayjs/view';
import { createVite } from '../vite';
import * as fs from 'fs';
import * as path from 'path';
import { Application } from '@midwayjs/koa';
import { Context } from '@midwayjs/koa';
import { ViteViewConfig } from '../interface';

@Provide()
export class viteView implements IViewEngine {
  @Config('staticFile')
  staticFileConfig: StaticFileOptions;

  @Config('viteView')
  viteViewConfig: ViteViewConfig;

  @App()
  app: Application;

  @Inject()
  ctx: Context;

  private prodPath: string;
  private prod: boolean;

  async getSsrHtml(
    indexName: string,
    entryServerUrl: string,
    url: string,
    assign: object | undefined
  ) {
    const vite = await createVite();
    try {
      let template,
        render,
        manifest = {};
      template = fs.readFileSync(indexName, 'utf-8');

      if (!this.prod) {
        // always read fresh template in dev
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule(entryServerUrl)).render;
      } else {
        manifest = require(this.staticFileConfig.dirs[
          this.viteViewConfig.staticFileKey
        ].dir + `/${this.viteViewConfig.outPrefix}/ssr-manifest.json`);
        render = require(entryServerUrl).render;
      }
      const context = {};
      const [appHtml, preloadLinks] = await render(url, manifest, context);
      if (context['url']) {
        // Somewhere a `<Redirect>` was rendered
        return this.ctx.redirect(context['url']);
      }
      let html = template
        .replace('<!--preload-links-->', preloadLinks)
        .replace('<!--app-html-->', appHtml)
        .replace('<html', '<html data-ssr="true"');
      if (assign) {
        for (const [key, value] of Object.entries(assign)) {
          html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
      }
      return html;
    } catch (e) {
      vite && vite.ssrFixStacktrace(e);
      console.error('服务端渲染失败，执行客户端渲染逻辑', e);
      return await this.getClientHtml(indexName, assign);
    }
  }

  async getClientHtml(indexName, assign: object | undefined) {
    let html = fs
      .readFileSync(indexName, 'utf-8')
      .replace('<!--preload-links-->', '')
      .replace('<!--app-html-->', '');
    if (assign) {
      for (const [key, value] of Object.entries(assign)) {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    }
    return html;
  }

  async render(
    name: string,
    locals?: Record<string, any>,
    options?: RenderOptions
  ) {
    return (locals.ctx.body = await this.renderString(name, locals, options));
  }

  async renderString(
    name: string,
    locals?: Record<string, any>,
    options?: RenderOptions
  ) {
    let tpl = options.name;
    if (this.viteViewConfig.prod !== undefined) {
      this.prod = this.viteViewConfig.prod;
    } else {
      this.prod = ['prod', 'production'].includes(this.app.getEnv());
    }
    let entry = this.viteViewConfig.views[options.name];
    if (this.prod) {
      this.prodPath =
        this.staticFileConfig.dirs[this.viteViewConfig.staticFileKey].dir +
        `/${this.viteViewConfig.outPrefix}`;
      tpl = path.resolve(this.prodPath, tpl);
      entry =
        locals.ssr !== false && entry
          ? path
              .resolve(this.prodPath, entry)
              .replace(/(\.[jt]sx)|(\.ts)$/, '.js')
          : '';
    } else {
      tpl = path.resolve(options.root, tpl);
      entry =
        locals.ssr !== false && entry ? path.resolve(options.root, entry) : '';
    }

    if (entry) {
      return await this.getSsrHtml(
        tpl,
        entry,
        locals.ctx.originalUrl,
        locals['assign']
      );
    }
    return await this.getClientHtml(tpl, locals['assign']);
  }
}
