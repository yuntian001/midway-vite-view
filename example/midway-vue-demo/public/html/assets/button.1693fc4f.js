import { j as defineComponent, a as createVNode } from "./vendor.0ab654a0.js";
var button = "";
var Button = defineComponent({
  setup() {
    return () => {
      return createVNode("div", {
        class: "btn"
      }, "dynamicBtn");
    };
  }
});
export { Button as B };
