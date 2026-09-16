import { L as e } from "./index.CJ_YH8gZ.js";
import "./element-plus.BPg5EhXK.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import "./vue-vendor.Dwx3gfQr.js";
const t = "/ai/chat",
  o = {
    getSessionList: (o) => e({ url: `${t}/list`, method: "get", params: o }),
    createSession: (o) => e({ url: `${t}/create`, method: "post", data: o }),
    updateSession: (o, s) => e({ url: `${t}/update/${o}`, method: "put", data: s }),
    deleteSession: (o) => e({ url: `${t}/delete`, method: "delete", data: o }),
    chat: (o) => e({ url: `${t}/ai-chat`, method: "post", data: o }),
    getSessionDetail: (o) => e({ url: `${t}/detail/${o}`, method: "get" }),
    getModelConfig: () => e({ url: `${t}/model-config`, method: "get" }),
  };
export { o as A };
