import { createSSRApp,createApp as createClientApp } from 'vue';
import App from './App.vue';
import { createRouter } from './router';
import { createPinia } from 'pinia';
import './style.css';
// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp() {
  const app = (typeof window!=='undefined' && window.document.querySelector('html')!.dataset.ssr==='true')?createSSRApp(App):createClientApp(App);
  const router = createRouter();
  const pinia = createPinia();
  app.use(pinia);
  if (!import.meta.env.SSR && window.__pinia) {
    pinia.state.value = window.__pinia;
  }
  app.use(router);
  return { app, router, pinia };
}
try{
  console.log(__AA__,)
}catch(e){

}
try{
  console.log(__BB__,)
}catch(e){

}
try{
  console.log(__CC__,)
}catch(e){

}
