import { F as t } from "./index.C8JPqYJk.js";
import { z as e, ag as s, n as a, bt as i, ap as o } from "./vue-vendor.Dwx3gfQr.js";
const n = e({
  name: "FaAiPageHeader",
  __name: "FaAiPageHeader",
  props: { title: {}, description: {} },
  setup: (e) => (n, r) => (
    s(),
    a(
      t,
      { title: e.title, description: e.description },
      { actions: i(() => [o(n.$slots, "context"), o(n.$slots, "actions")]), _: 3 },
      8,
      ["title", "description"]
    )
  ),
});
export { n as _ };
