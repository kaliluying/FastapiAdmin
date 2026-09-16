import { _ as e } from "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import { z as t, ag as o, p as n, a2 as r, w as s, ap as a } from "./vue-vendor.Dwx3gfQr.js";
const i = t({
  name: "FaIconButton",
  __name: "index",
  props: { icon: {}, circle: { type: Boolean } },
  setup: (t) => (i, c) => {
    const l = e;
    return (
      o(),
      n(
        "div",
        {
          class: r([
            "size-8.5 inline-flex flex items-center justify-center cursor-pointer text-g-600 dark:text-g-800 text-xl rounded transition duration-300 hover:bg-hover-color",
            { "rounded-full": t.circle },
          ]),
        },
        [s(l, { icon: t.icon }, null, 8, ["icon"]), a(i.$slots, "default")],
        2
      )
    );
  },
});
export { i as _ };
