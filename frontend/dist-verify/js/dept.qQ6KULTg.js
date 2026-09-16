import { L as t } from "./index.CJ_YH8gZ.js";
import "./element-plus.BPg5EhXK.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import "./vue-vendor.Dwx3gfQr.js";
const e = "/system/dept",
  a = {
    listDept: (a) => t({ url: `${e}/tree`, method: "get", params: a }),
    detailDept: (a) => t({ url: `${e}/detail/${a}`, method: "get" }),
    createDept: (a) => t({ url: `${e}/create`, method: "post", data: a }),
    updateDept: (a, d) => t({ url: `${e}/update/${a}`, method: "put", data: d }),
    deleteDept: (a) => t({ url: `${e}/delete`, method: "delete", data: a }),
    batchDept: (a) => t({ url: `${e}/status/batch`, method: "patch", data: a }),
  };
export { a as D };
