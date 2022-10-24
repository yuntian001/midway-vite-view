"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const entryServer = require("../entry-server.js");
require("node:path");
require("crypto");
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(` Home `);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = entryServer.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/home.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const home = /* @__PURE__ */ entryServer._export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
exports.default = home;
