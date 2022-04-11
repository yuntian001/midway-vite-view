import App from './App.vue'
import { createSSRApp } from 'vue'
import { createRouter } from './router'
import {createStore} from './store'

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp() {
  const app = createSSRApp(App)
  const router = createRouter()
  app.use(router)
  const store = createStore();
  if(!import.meta.env.SSR && window._STORE_STATE){
    store.replaceState(window._STORE_STATE);
  }
  app.use(store)
  return { app, router,store }
}
