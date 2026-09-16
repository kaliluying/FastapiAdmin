import { L as e } from "./index.CJ_YH8gZ.js";
import "./element-plus.BPg5EhXK.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import "./vue-vendor.Dwx3gfQr.js";
const t = "/platform/menu",
  a = {
    listMenu: (a) => e({ url: `${t}/tree`, method: "get", params: a }),
    detailMenu: (a) => e({ url: `${t}/detail/${a}`, method: "get" }),
    createMenu: (a) => e({ url: `${t}/create`, method: "post", data: a }),
    updateMenu: (a, d) => e({ url: `${t}/update/${a}`, method: "put", data: d }),
    deleteMenu: (a) => e({ url: `${t}/delete`, method: "delete", data: a }),
    batchMenu: (a) => e({ url: `${t}/status/batch`, method: "patch", data: a }),
  };
export { a as M };
