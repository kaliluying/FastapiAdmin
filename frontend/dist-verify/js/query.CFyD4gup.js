import { _ as e } from "./index.SppbxYir.js";
import {
  U as a,
  w as o,
  x as l,
  A as t,
  V as n,
  M as s,
  h as r,
  g as i,
  d,
  J as c,
} from "./element-plus.BPg5EhXK.js";
import { E as u } from "./exceljs.CGWu2obp.js";
import {
  z as p,
  a$ as m,
  ag as f,
  p as v,
  w as g,
  bt as h,
  F as b,
  ao as x,
  n as y,
  o as w,
  m as V,
  aI as _,
  v as C,
  $ as k,
  j as U,
  al as A,
  ai as R,
  a1 as j,
  ba as B,
} from "./vue-vendor.Dwx3gfQr.js";
const E = { class: "crud-export-modal-host" },
  L = { style: "padding-right: var(--el-dialog-padding-primary)" },
  D = p({
    name: "FaExportDialog",
    inheritAttrs: !1,
    __name: "index",
    props: k(
      { contentConfig: {}, queryParams: {}, pageData: {}, selectionData: {} },
      { modelValue: { type: Boolean, required: !0, default: !1 }, modelModifiers: {} }
    ),
    emits: ["update:modelValue"],
    setup(p, { expose: k }) {
      const D = p,
        F = U(() => !(!D.contentConfig.exportsAction && !D.contentConfig.exportsBlobAction)),
        q = m(p, "modelValue"),
        O = A(),
        $ = R({
          filename: "",
          sheetname: "",
          fields: [],
          origin: "current",
          /* CURRENT */
        }),
        z = {
          fields: [{ required: !0, message: "请选择字段" }],
          origin: [{ required: !0, message: "请选择数据源" }],
        },
        M = U(() =>
          D.contentConfig.cols.map(
            (e) => (
              e.initFn && e.initFn(e),
              void 0 === e.show && (e.show = !0),
              void 0 !== e.prop &&
                void 0 === e.columnKey &&
                void 0 === e["column-key"] &&
                (e.columnKey = e.prop),
              "selection" === e.type &&
                void 0 === e.reserveSelection &&
                void 0 === e["reserve-selection"] &&
                (e.reserveSelection = !0),
              e
            )
          )
        );
      function P() {
        ((q.value = !1),
          O.value?.resetFields(),
          j(() => {
            O.value?.clearValidate();
          }));
      }
      async function I() {
        try {
          const e = $.filename ? $.filename : D.contentConfig.permPrefix || "export",
            a = $.sheetname ? $.sheetname : "sheet",
            o = new u.Workbook(),
            l = o.addWorksheet(a),
            t = [];
          if (
            (M.value.forEach((e) => {
              e.label &&
                e.prop &&
                $.fields.includes(e.prop) &&
                t.push({ header: e.label, key: e.prop });
            }),
            (l.columns = t),
            "remote" === $.origin)
          ) {
            const a = D.queryParams ?? {};
            if (D.contentConfig.exportsBlobAction) {
              return (
                (function (e, a) {
                  const o = /\.xlsx?$/i.test(a) ? a : `${a}.xlsx`,
                    l = URL.createObjectURL(e),
                    t = document.createElement("a");
                  ((t.href = l), (t.download = o), t.click(), URL.revokeObjectURL(l));
                })(await D.contentConfig.exportsBlobAction(a), e),
                void c.success("导出成功")
              );
            }
            if (D.contentConfig.exportsAction) {
              const t = await D.contentConfig.exportsAction(a);
              l.addRows(t);
              S(await o.xlsx.writeBuffer(), e);
            } else c.error("未配置 exportsAction 或 exportsBlobAction");
          } else if ("selected" === $.origin) {
            const a = D.selectionData ?? [];
            l.addRows(a);
            S(await o.xlsx.writeBuffer(), e);
          } else {
            const a = D.pageData ?? [];
            l.addRows(a);
            S(await o.xlsx.writeBuffer(), e);
          }
        } catch (e) {
          c.error("导出失败");
        }
      }
      (() => {
        const e = [];
        (M.value.forEach((a) => {
          void 0 !== a.prop && e.push(a.prop);
        }),
          ($.fields = e));
      })();
      const K = B(() => {
        O.value?.validate((e) => {
          e && (I(), P());
        });
      }, 3e3);
      function S(e, a) {
        try {
          const o = new Blob([e], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
            }),
            l = window.URL.createObjectURL(o),
            t = document.createElement("a");
          ((t.href = l),
            (t.download = a),
            document.body.appendChild(t),
            t.click(),
            document.body.removeChild(t),
            window.URL.revokeObjectURL(l));
        } catch (o) {
          c.error("保存文件失败");
        }
      }
      return (
        k({ handleCloseExportsModal: P }),
        (c, u) => {
          const m = t,
            k = l,
            U = s,
            A = n,
            R = i,
            j = r,
            B = o,
            D = a,
            I = d,
            S = e;
          return (
            f(),
            v("div", E, [
              g(
                S,
                {
                  modelValue: q.value,
                  "onUpdate:modelValue": u[4] || (u[4] = (e) => (q.value = e)),
                  title: "导出数据",
                  width: "600px",
                  "dialog-class": "crud-embed-dialog",
                  "modal-class": "crud-embed-dialog",
                  onClose: P,
                },
                {
                  footer: h(() => [
                    V("div", L, [
                      g(
                        I,
                        { type: "primary", onClick: _(K) },
                        { default: h(() => [...(u[5] || (u[5] = [C("确 定", -1)]))]), _: 1 },
                        8,
                        ["onClick"]
                      ),
                      g(
                        I,
                        { onClick: P },
                        { default: h(() => [...(u[6] || (u[6] = [C("取 消", -1)]))]), _: 1 }
                      ),
                    ]),
                  ]),
                  default: h(() => [
                    g(
                      D,
                      { "max-height": "60vh" },
                      {
                        default: h(() => [
                          g(
                            B,
                            {
                              ref_key: "exportsFormRef",
                              ref: O,
                              style: "padding-right: var(--el-dialog-padding-primary)",
                              model: $,
                              rules: z,
                            },
                            {
                              default: h(() => [
                                g(
                                  k,
                                  { label: "文件名", prop: "filename" },
                                  {
                                    default: h(() => [
                                      g(
                                        m,
                                        {
                                          modelValue: $.filename,
                                          "onUpdate:modelValue":
                                            u[0] || (u[0] = (e) => ($.filename = e)),
                                          placeholder: "请输入文件名",
                                          clearable: "",
                                        },
                                        null,
                                        8,
                                        ["modelValue"]
                                      ),
                                    ]),
                                    _: 1,
                                  }
                                ),
                                g(
                                  k,
                                  { label: "工作表名", prop: "sheetname" },
                                  {
                                    default: h(() => [
                                      g(
                                        m,
                                        {
                                          modelValue: $.sheetname,
                                          "onUpdate:modelValue":
                                            u[1] || (u[1] = (e) => ($.sheetname = e)),
                                          placeholder: "请输入工作表名",
                                          clearable: "",
                                        },
                                        null,
                                        8,
                                        ["modelValue"]
                                      ),
                                    ]),
                                    _: 1,
                                  }
                                ),
                                g(
                                  k,
                                  { label: "数据源", prop: "origin" },
                                  {
                                    default: h(() => [
                                      g(
                                        A,
                                        {
                                          modelValue: $.origin,
                                          "onUpdate:modelValue":
                                            u[2] || (u[2] = (e) => ($.origin = e)),
                                        },
                                        {
                                          default: h(() => [
                                            g(
                                              U,
                                              {
                                                label: "当前数据 (当前页的数据)",
                                                value: "current",
                                                disabled: !p.pageData?.length,
                                              },
                                              null,
                                              8,
                                              ["value", "disabled"]
                                            ),
                                            g(
                                              U,
                                              {
                                                label: "选中数据 (所有选中的数据)",
                                                value: "selected",
                                                disabled: !p.selectionData?.length,
                                              },
                                              null,
                                              8,
                                              ["value", "disabled"]
                                            ),
                                            g(
                                              U,
                                              {
                                                label: "全量数据 (所有分页的数据)",
                                                value: "remote",
                                                disabled: !F.value,
                                              },
                                              null,
                                              8,
                                              ["value", "disabled"]
                                            ),
                                          ]),
                                          _: 1,
                                        },
                                        8,
                                        ["modelValue"]
                                      ),
                                    ]),
                                    _: 1,
                                  }
                                ),
                                g(
                                  k,
                                  { label: "字段", prop: "fields" },
                                  {
                                    default: h(() => [
                                      g(
                                        j,
                                        {
                                          modelValue: $.fields,
                                          "onUpdate:modelValue":
                                            u[3] || (u[3] = (e) => ($.fields = e)),
                                        },
                                        {
                                          default: h(() => [
                                            (f(!0),
                                            v(
                                              b,
                                              null,
                                              x(
                                                M.value,
                                                (e) => (
                                                  f(),
                                                  v(
                                                    b,
                                                    { key: e.prop },
                                                    [
                                                      e.prop
                                                        ? (f(),
                                                          y(
                                                            R,
                                                            {
                                                              key: 0,
                                                              value: e.prop,
                                                              label: e.label,
                                                            },
                                                            null,
                                                            8,
                                                            ["value", "label"]
                                                          ))
                                                        : w("", !0),
                                                    ],
                                                    64
                                                  )
                                                )
                                              ),
                                              128
                                            )),
                                          ]),
                                          _: 1,
                                        },
                                        8,
                                        ["modelValue"]
                                      ),
                                    ]),
                                    _: 1,
                                  }
                                ),
                              ]),
                              _: 1,
                            },
                            8,
                            ["model"]
                          ),
                        ]),
                        _: 1,
                      }
                    ),
                  ]),
                  _: 1,
                },
                8,
                ["modelValue"]
              ),
            ])
          );
        }
      );
    },
  });
function F() {
  const e = A(!1),
    a = A(!1);
  return {
    importVisible: e,
    exportVisible: a,
    openImport: () => {
      e.value = !0;
    },
    openExport: () => {
      a.value = !0;
    },
  };
}
function q(e, a = ["created_time", "updated_time"]) {
  const o = { ...e };
  for (const l of a) Array.isArray(o[l]) && 0 === o[l].length && (o[l] = void 0);
  return o;
}
function O(e, a = ["current", "size", "page_no", "page_size"]) {
  const o = { ...e };
  for (const l of a) delete o[l];
  return o;
}
export { D as _, q as c, O as s, F as u };
