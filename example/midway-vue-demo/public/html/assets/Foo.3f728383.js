import { j as defineComponent, a as createVNode, e as createTextVNode } from "./vendor.0ab654a0.js";
var foo = "";
const Foo = defineComponent({
  name: "foo",
  setup() {
    return () => createVNode("div", {
      "class": "jsx"
    }, [createTextVNode("from JSX")]);
  }
});
export { Foo };
