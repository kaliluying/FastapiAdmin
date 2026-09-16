import { ai as t, al as e, j as n } from "./vue-vendor.Dwx3gfQr.js";
import { K as i } from "./element-plus.BPg5EhXK.js";
function a() {
  const e = t({ title: "", visible: !1, type: "create" });
  return {
    dialogVisible: e,
    openDialog: function (t, n) {
      ((e.type = t),
        (e.title = "create" === t ? (n ?? "新增") : "update" === t ? (n ?? "修改") : (n ?? "详情")),
        (e.visible = !0));
    },
    closeDialog: function () {
      e.visible = !1;
    },
  };
}
function o() {
  const t = e([]),
    i = n(() => t.value.map((t) => t.id).filter((t) => null != t && !Number.isNaN(t))),
    a = e(!1);
  return {
    selectedRows: t,
    selectedIds: i,
    batchDeleting: a,
    onTableSelectionChange: function (e) {
      t.value = e;
    },
    clearSelection: function () {
      t.value = [];
    },
  };
}
async function c(t = "确认删除该项数据?") {
  await i.confirm(t, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  });
}
async function l(t) {
  await i.confirm(`确定删除选中的 ${t} 条数据吗？`, "批量删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  });
}
async function s(t) {
  await i.confirm(`确认${0 === t ? "启用" : "停用"}该项数据?`, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  });
}
export { c as a, s as b, l as c, o as d, a as u };
