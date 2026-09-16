import { L as e } from "./index.CJ_YH8gZ.js";
import "./element-plus.BPg5EhXK.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import "./vue-vendor.Dwx3gfQr.js";
const t = "/ai/knowledge",
  o = {
    listKnowledgeBase: (o) => e({ url: `${t}/list`, method: "get", params: o }),
    createKnowledgeBase: (o) => e({ url: `${t}/create`, method: "post", data: o }),
    updateKnowledgeBase: (o, d) => e({ url: `${t}/update/${o}`, method: "put", data: d }),
    optionselect: () => e({ url: `${t}/optionselect`, method: "get" }),
    deleteKnowledgeBase: (o) => e({ url: `${t}/delete`, method: "delete", data: o }),
    listDocument: (o) => e({ url: `${t}/document/list`, method: "get", params: o }),
    uploadDocument: (o) =>
      e({
        url: `${t}/document/upload`,
        method: "post",
        headers: { "Content-Type": "multipart/form-data" },
        data: o,
      }),
    reindexDocument: (o) => e({ url: `${t}/document/${o}/reindex`, method: "post" }),
    deleteDocument: (o) => e({ url: `${t}/document/delete`, method: "delete", data: o }),
    testRetrieval: (o) => e({ url: `${t}/retrieval/test`, method: "post", data: o }),
  };
export { o as K };
