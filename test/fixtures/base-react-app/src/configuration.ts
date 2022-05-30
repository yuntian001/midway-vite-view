import { Configuration } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import { join } from 'path';
import * as viteView from '../../../../src';

@Configuration({
  imports: [koa, viteView],
  importConfigs: [join(__dirname, 'config')]
})
export class AutoConfiguration {
  async onReady(){
  }
}
