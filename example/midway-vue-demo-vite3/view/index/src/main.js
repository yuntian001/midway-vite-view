import { createSSRApp } from 'vue'
import App from './App.vue'
import { createRouter } from './router'
import { createPinia } from 'pinia'

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp() {
  const app = createSSRApp(App)
  const router = createRouter()
  const pinia = createPinia();
  app.use(pinia)
  if(!import.meta.env.SSR && window.__pinia){
    pinia.state.value = window.__pinia;
  }
  app.use(router)
  return { app, router, pinia}
}
