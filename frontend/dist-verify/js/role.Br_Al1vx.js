import { L as e } from "./index.CJ_YH8gZ.js";
import "./element-plus.BPg5EhXK.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import "./vue-vendor.Dwx3gfQr.js";
const t = "/system/role",
  o = {
    listRole: (o) => e({ url: `${t}/list`, method: "get", params: o }),
    detailRole: (o) => e({ url: `${t}/detail/${o}`, method: "get" }),
    createRole: (o) => e({ url: `${t}/create`, method: "post", data: o }),
    updateRole: (o, a) => e({ url: `${t}/update/${o}`, method: "put", data: a }),
    deleteRole: (o) => e({ url: `${t}/delete`, method: "delete", data: o }),
    batchRole: (o) => e({ url: `${t}/status/batch`, method: "patch", data: o }),
    setPermission: (o) => e({ url: `${t}/permission`, method: "put", data: o }),
    exportRole: (o) => e({ url: `${t}/export`, method: "post", data: o, responseType: "blob" }),
  };
export { o as R };
