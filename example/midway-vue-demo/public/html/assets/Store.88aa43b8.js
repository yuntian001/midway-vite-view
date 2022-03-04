import { c as createStore } from "./vuex.esm-bundler.31c03e37.js";
import { _ as _export_sfc } from "./preload-helper.cff87cb4.js";
import { o as openBlock, c as createElementBlock, t as toDisplayString } from "./vendor.0ab654a0.js";
var Store_vue_vue_type_style_index_0_scoped_true_lang = "";
const _sfc_main = {
  async setup() {
    const store = createStore({
      state: {
        foo: "bar"
      }
    });
    return store.state;
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("h1", null, toDisplayString(_ctx.foo), 1);
}
var Store = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1a3ce348"]]);
export { Store as default };
