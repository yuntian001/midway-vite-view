import { _ as _export_sfc, a as __vitePreload } from "./preload-helper.cff87cb4.js";
import { r as resolveComponent, o as openBlock, c as createElementBlock, a as createVNode, w as withCtx, b as createBlock, d as resolveDynamicComponent, S as Suspense, e as createTextVNode, f as createRouter$1, g as createWebHistory, h as createSSRApp } from "./vendor.0ab654a0.js";
var App_vue_vue_type_style_index_0_lang = "";
const _sfc_main = {};
const _hoisted_1 = /* @__PURE__ */ createTextVNode("Home");
const _hoisted_2 = /* @__PURE__ */ createTextVNode("| ");
const _hoisted_3 = /* @__PURE__ */ createTextVNode("About");
function _sfc_render(_ctx, _cache) {
  const _component_router_link = resolveComponent("router-link");
  const _component_router_view = resolveComponent("router-view");
  return openBlock(), createElementBlock("div", null, [
    createVNode(_component_router_link, { to: "/admin/" }, {
      default: withCtx(() => [
        _hoisted_1
      ]),
      _: 1
    }),
    _hoisted_2,
    createVNode(_component_router_link, { to: "/admin/about" }, {
      default: withCtx(() => [
        _hoisted_3
      ]),
      _: 1
    }),
    createVNode(_component_router_view, null, {
      default: withCtx(({ Component }) => [
        (openBlock(), createBlock(Suspense, null, {
          default: withCtx(() => [
            (openBlock(), createBlock(resolveDynamicComponent(Component)))
          ]),
          _: 2
        }, 1024))
      ]),
      _: 1
    })
  ]);
}
var App = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);
const pages = { "./pages/About.vue": () => true ? __vitePreload(() => import("./About.629c7fc3.js"), ["assets/About.629c7fc3.js","assets/About.80c81c90.css","assets/button.1693fc4f.js","assets/button.b36c2ed1.css","assets/vendor.0ab654a0.js","assets/preload-helper.cff87cb4.js"]) : null, "./pages/External.vue": () => true ? __vitePreload(() => import("./External.e86476da.js"), ["assets/External.e86476da.js","assets/ExampleExternalComponent.0f1a854e.js","assets/preload-helper.cff87cb4.js","assets/vendor.0ab654a0.js"]) : null, "./pages/Home.vue": () => true ? __vitePreload(() => import("./Home.acbe188f.js"), ["assets/Home.acbe188f.js","assets/Home.2ff55cb9.css","assets/preload-helper.cff87cb4.js","assets/_@nested-virtual-file.80c19286.js","assets/button.1693fc4f.js","assets/button.b36c2ed1.css","assets/vendor.0ab654a0.js"]) : null, "./pages/Store.vue": () => true ? __vitePreload(() => import("./Store.973d0c13.js"), ["assets/Store.973d0c13.js","assets/Store.b9225bd4.css","assets/vuex.esm-bundler.31c03e37.js","assets/vendor.0ab654a0.js","assets/preload-helper.cff87cb4.js"]) : null };
const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages(.*)\.vue$/)[1].toLowerCase();
  return {
    path: name === "/home" ? "/" : name,
    component: pages[path]
  };
});
function createRouter() {
  return createRouter$1({
    history: createWebHistory("/admin/"),
    routes
  });
}
function createApp() {
  const app2 = createSSRApp(App);
  const router2 = createRouter();
  app2.use(router2);
  return { app: app2, router: router2 };
}
const { app, router } = createApp();
router.isReady().then(() => {
  app.mount("#app");
});
