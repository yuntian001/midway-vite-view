<template>
  <h1>Home</h1>
  <p>
    <img src="../assets/logo.png" alt="logo" />
  </p>
  <button @click="state.count++">count is: {{ state.count }}</button>
  <Foo />
  <p class="virtual">msg from virtual module: {{ foo.msg }}</p>
  <p class="inter">this will be styled with a font-face</p>
  <p class="import-meta-url">{{ state.url }}</p>
  <p class="protocol">{{ state.protocol }}</p>
  <p class="nested-virtual">msg from nested virtual module: {{ virtualMsg }}</p>
  <Button>CommonButton</Button>
  <div>
    encrypted message:
    <p class="encrypted-msg"></p>
  </div>

  <ImportType />
</template>

<script setup>
import foo from '@foo'
import { msg as virtualMsg } from '@virtual-file'
import { reactive, defineAsyncComponent } from 'vue'
import Button from '../components/button'
import { useStore } from 'vuex'
const store = useStore();//store会在服务端与客户端共享
console.log('========counte=====',store.state.count);
store.commit('increment')//因为setup 在服务端核客户端都会调用 所以这里会被调用两遍(服务端一遍客户端一遍count最终会变成2)
console.log('========counte=====',store.state.count);
const ImportType = load('ImportType')
const Foo = defineAsyncComponent(() =>
  import('../components/Foo').then((mod) => mod.Foo)
)
function load(file) {
  return defineAsyncComponent(() => import(`../components/${file}.vue`))
}
const url = import.meta.env.SSR
  ? import.meta.url
  : document.querySelector('.import-meta-url').textContent;
console.log(url,import.meta)
const protocol = new URL(url).protocol

const state = reactive({
  count: 0,
  protocol,
  url
})
</script>

<style scoped>
h1,
a {
  color: green;
}
</style>
