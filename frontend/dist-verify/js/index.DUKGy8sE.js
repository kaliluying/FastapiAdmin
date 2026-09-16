import { _ as e } from "./index.SppbxYir.js";
import { _ as a } from "./index.vue_vue_type_script_setup_true_lang.B21S8Wni.js";
import {
  A as t,
  z as l,
  ax as i,
  e as s,
  U as o,
  p as r,
  a7 as n,
  a8 as d,
  a3 as p,
  u,
  J as m,
} from "./element-plus.BPg5EhXK.js";
import { b as c, _ as h, r as v } from "./useTableColumns.BKMFwI8S.js";
import { _ as f, a as g, c as _, b as y } from "./index.E8bA6rDJ.js";
import {
  z as b,
  ag as j,
  p as w,
  w as x,
  bu as k,
  bo as C,
  bt as S,
  aI as D,
  X as z,
  n as A,
  bv as I,
  v as T,
  ax as V,
  a4 as R,
  F as P,
  ao as O,
  m as B,
  o as U,
  al as F,
  j as W,
  ai as q,
  a1 as J,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as N } from "./FaAiPageHeader.vue_vue_type_script_setup_true_lang.DfUsWKjs.js";
import { A as H } from "./chat.C9VAl09h.js";
import { u as K } from "./useTable.DG3aa8Ve.js";
import { d as L, c as X, u as E, a as G } from "./useConfirm.CXh1xjds.js";
import { p as Q } from "./index.CJ_YH8gZ.js";
import "./file-saver.CjVB4eGa.js";
import { _ as M } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./index.vue_vue_type_script_setup_true_lang.CgkvK-LE.js";
import "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import "./dayjs.BHSg66Ch.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./ohash.BS5RKZcF.js";
import "./vue-draggable-plus.B5VWpxKS.js";
import "./@intlify.CbtlSmdZ.js";
import "./index.C8JPqYJk.js";
/* empty css                    */ import "./axios.Da-QW0H8.js";
import "./qs.USnEJzjK.js";
import "./side-channel.DybIsWO5.js";
import "./es-errors.DK26Ybqf.js";
import "./object-inspect.Ju1NJVd1.js";
import "./side-channel-list.BNQ44_ba.js";
import "./side-channel-map.ulHsYLML.js";
import "./get-intrinsic.BMeuD2ey.js";
import "./es-object-atoms.CyiuHMUS.js";
import "./math-intrinsics.BOBeVm3z.js";
import "./gopd.BudZp56J.js";
import "./es-define-property.F0aoeP8o.js";
import "./has-symbols.BcO-SUVM.js";
import "./get-proto.CBibeOPY.js";
import "./dunder-proto.CgDtQ3qe.js";
import "./call-bind-apply-helpers.ubnPuw6U.js";
import "./function-bind.DrnB-baK.js";
import "./hasown.BXcyoiLU.js";
import "./call-bound.Dizy2Qs1.js";
import "./side-channel-weakmap.CxmbhinV.js";
import "./mitt.BHPWSuhB.js";
import "./nprogress.E6tsCBSO.js";
import "./echarts.r3cQDZl7.js";
import "./highlight.Cxq3ZXHl.js";
import "./codemirror.CwY4WcCn.js";
import "./diff-match-patch.B0ZLOaK6.js";
import "./iconify-icons.PLu8Rxye.js";
import "./vue-web-terminal.B__atI2c.js";
const Y = { class: "fa-full-height" },
  Z = ["onClick"],
  $ = { key: 0 },
  ee = { key: 1 },
  ae = { class: "message-item" },
  te = { class: "message-header" },
  le = { key: 0, class: "message-time" },
  ie = { class: "message-content" },
  se = M(
    b({
      name: "ChatSession",
      inheritAttrs: !1,
      __name: "index",
      setup(b) {
        const M = F({ title: void 0, created_at: void 0, updated_at: void 0 }),
          se = F(!0),
          oe = F(null),
          re = {},
          { hasAuth: ne } = c(),
          de = W(() => [
            {
              label: "标题",
              key: "title",
              type: "input",
              placeholder: "请输入标题",
              clearable: !0,
              span: 6,
            },
          ]),
          pe = F(null),
          ue = F(!1),
          me = F(0),
          ce = W(() => [
            {
              label: "标题",
              key: "title",
              type: "input",
              span: 24,
              props: { placeholder: "请输入标题", maxlength: 100 },
            },
          ]),
          he = F(),
          ve = F(null),
          fe = F(""),
          ge = F(null),
          { selectedIds: _e, batchDeleting: ye, onTableSelectionChange: be } = L(),
          je = F(!1);
        async function we() {
          const e = _e.value;
          if (0 !== e.length)
            try {
              (await X(e.length),
                (ye.value = !0),
                await H.deleteSession(e),
                ge.value?.elTableRef?.clearSelection(),
                await Oe());
            } catch {
            } finally {
              ye.value = !1;
            }
        }
        const {
            columns: xe,
            columnChecks: ke,
            data: Ce,
            loading: Se,
            pagination: De,
            getData: ze,
            replaceSearchParams: Ae,
            resetSearchParams: Ie,
            handleSizeChange: Te,
            handleCurrentChange: Ve,
            refreshData: Re,
            refreshCreate: Pe,
            refreshRemove: Oe,
          } = K({
            core: {
              apiFn: H.getSessionList,
              apiParams: { page_no: 1, page_size: 10 },
              columnsFactory: () => [
                { type: "selection", width: 48, fixed: "left" },
                { type: "globalIndex", width: 56, label: "序号" },
                { prop: "session_id", label: "会话ID", minWidth: 180, showOverflowTooltip: !0 },
                {
                  prop: "title",
                  label: "标题",
                  minWidth: 200,
                  useSlot: !0,
                  slotName: "memory-title",
                },
                { prop: "user_id", label: "用户ID", minWidth: 120, visible: !1 },
                { prop: "team_id", label: "团队ID", minWidth: 120, visible: !1 },
                { prop: "team_name", label: "部门名称", minWidth: 120, showOverflowTooltip: !0 },
                {
                  prop: "agent_id",
                  label: "Agent ID",
                  minWidth: 120,
                  showOverflowTooltip: !0,
                  visible: !1,
                },
                {
                  prop: "summary",
                  label: "会话摘要",
                  minWidth: 200,
                  showOverflowTooltip: !0,
                  visible: !1,
                },
                { prop: "message_count", label: "消息数量", width: 100, align: "center" },
                { prop: "created_time", label: "创建时间", width: 168, showOverflowTooltip: !0 },
                { prop: "updated_time", label: "更新时间", width: 168, showOverflowTooltip: !0 },
                {
                  prop: "operation",
                  label: "操作",
                  width: 160,
                  fixed: "right",
                  align: "right",
                  formatter: (e) =>
                    (function (e) {
                      return v(
                        (function (e) {
                          const a = [
                            {
                              key: "detail",
                              label: "详情",
                              artType: "view",
                              perm: "module_ai:session:detail",
                              run: () => {
                                Ge("detail", e.id);
                              },
                            },
                            {
                              key: "delete",
                              label: "删除",
                              artType: "delete",
                              icon: "ri:delete-bin-4-line",
                              perm: "module_ai:session:delete",
                              run: () => {
                                !(async function (e) {
                                  try {
                                    (await G(),
                                      await H.deleteSession([e]),
                                      ge.value?.elTableRef?.clearSelection(),
                                      await Oe());
                                  } catch {}
                                })(e.id);
                              },
                            },
                          ];
                          return a.filter((e) => null != e.perm && ne(e.perm));
                        })(e),
                        {
                          wrapperClass:
                            "inline-flex flex-wrap items-center justify-end gap-1 memory-table-actions",
                        }
                      );
                    })(e),
                },
              ],
            },
          }),
          Be = F({ id: void 0, title: "" }),
          { dialogVisible: Ue, closeDialog: Fe } = E(),
          We = F({}),
          qe = [
            { label: "会话ID", prop: "session_id" },
            { label: "标题", prop: "title" },
            { label: "用户ID", prop: "user_id", span: 1 },
            { label: "团队ID", prop: "team_id", span: 1 },
            { label: "部门名称", prop: "team_name", span: 1 },
            { label: "Agent ID", prop: "agent_id", span: 1 },
            { label: "创建时间", prop: "created_time", span: 1 },
            { label: "更新时间", prop: "updated_time", span: 1 },
            { label: "消息数量", prop: "message_count", span: 1 },
            { label: "会话摘要", prop: "summary" },
            { label: "元数据", prop: "metadata", slot: "metadata" },
          ],
          Je = q({ title: [{ required: !0, message: "请输入标题", trigger: "blur" }] }),
          Ne = { id: void 0, title: "" };
        async function He(e) {
          var a;
          (await oe.value?.validate?.(),
            Ae({
              title: (a = e).title,
              created_at:
                Array.isArray(a.created_at) && 2 === a.created_at.length ? a.created_at : void 0,
              updated_at:
                Array.isArray(a.updated_at) && 2 === a.updated_at.length ? a.updated_at : void 0,
            }),
            ze());
        }
        async function Ke() {
          ((M.value = { title: void 0, created_at: void 0, updated_at: void 0 }), await Ie());
        }
        async function Le() {
          (pe.value?.resetFields(), pe.value?.clearValidate(), Object.assign(Be.value, Ne));
        }
        async function Xe() {
          (Fe(), await Le());
        }
        async function Ee() {
          je.value = !0;
          try {
            await Ge("create");
          } finally {
            je.value = !1;
          }
        }
        async function Ge(e, a) {
          if ((await Le(), (Ue.type = e), a)) {
            const t = await H.getSessionDetail(a);
            "detail" === e && ((Ue.title = "详情"), (We.value = t.data.data ?? {}));
          } else ((Ue.title = "新增会话"), (Be.value.id = void 0));
          ((me.value += 1), (Ue.visible = !0));
        }
        async function Qe(e) {
          if (ve.value !== e.id) return;
          const a = fe.value.trim();
          if (a)
            if (a !== e.title)
              try {
                (await H.updateSession(e.id, { title: a }), (e.title = a), (ve.value = null));
              } catch (t) {
                m.error("更新失败");
              }
            else ve.value = null;
          else m.warning("标题不能为空");
        }
        return (m, c) => {
          const v = f,
            b = _,
            F = g,
            W = t,
            q = l,
            K = y,
            L = s,
            X = h,
            E = r,
            G = p,
            ne = d,
            ze = n,
            Ae = u,
            Ie = o,
            Oe = a,
            Fe = e;
          return (
            j(),
            w("div", Y, [
              x(N, { title: "AI 记忆" }),
              k(
                x(
                  v,
                  {
                    ref_key: "searchBarRef",
                    ref: oe,
                    modelValue: M.value,
                    "onUpdate:modelValue": c[0] || (c[0] = (e) => (M.value = e)),
                    items: de.value,
                    rules: re,
                    "is-expand": !1,
                    "show-expand": !0,
                    "show-reset": !0,
                    "show-search": !0,
                    "disabled-search": !1,
                    "default-expanded": !1,
                    "include-audit": "",
                    onSearch: He,
                    onReset: Ke,
                  },
                  null,
                  8,
                  ["modelValue", "items"]
                ),
                [[C, se.value]]
              ),
              x(
                L,
                {
                  shadow: "hover",
                  class: "fa-table-card",
                  style: R({ "margin-top": se.value ? "12px" : "0" }),
                },
                {
                  default: S(() => [
                    x(
                      F,
                      {
                        columns: D(ke),
                        "onUpdate:columns": c[1] || (c[1] = (e) => (z(ke) ? (ke.value = e) : null)),
                        showSearchBar: se.value,
                        "onUpdate:showSearchBar": c[2] || (c[2] = (e) => (se.value = e)),
                        loading: D(Se),
                        onRefresh: D(Re),
                      },
                      {
                        left: S(() => [
                          x(
                            b,
                            {
                              "remove-ids": D(_e),
                              "perm-create": ["module_ai:chat:create"],
                              "perm-delete": ["module_ai:session:delete"],
                              "delete-loading": D(ye),
                              "create-loading": je.value,
                              onAdd: Ee,
                              onDelete: we,
                            },
                            null,
                            8,
                            ["remove-ids", "delete-loading", "create-loading"]
                          ),
                        ]),
                        _: 1,
                      },
                      8,
                      ["columns", "showSearchBar", "loading", "onRefresh"]
                    ),
                    x(
                      K,
                      {
                        ref_key: "faTableRef",
                        ref: ge,
                        "row-key": "id",
                        loading: D(Se),
                        data: D(Ce),
                        columns: D(xe),
                        pagination: D(De),
                        onSelectionChange: D(be),
                        "onPagination:sizeChange": D(Te),
                        "onPagination:currentChange": D(Ve),
                      },
                      {
                        "memory-title": S(({ row: e }) => [
                          ve.value === e.id
                            ? (j(),
                              A(
                                W,
                                {
                                  key: 0,
                                  ref_key: "titleInputRef",
                                  ref: he,
                                  modelValue: fe.value,
                                  "onUpdate:modelValue": c[3] || (c[3] = (e) => (fe.value = e)),
                                  size: "small",
                                  onBlur: (a) => Qe(e),
                                  onKeyup: I((a) => Qe(e), ["enter"]),
                                },
                                null,
                                8,
                                ["modelValue", "onBlur", "onKeyup"]
                              ))
                            : (j(),
                              w(
                                "span",
                                {
                                  key: 1,
                                  class: "editable-cell",
                                  title: "点击编辑",
                                  onClick: (a) =>
                                    (function (e) {
                                      ((ve.value = e.id),
                                        (fe.value = e.title || ""),
                                        J(() => {
                                          he.value?.focus?.();
                                        }));
                                    })(e),
                                },
                                [
                                  T(V(e.title || "未命名会话") + " ", 1),
                                  x(
                                    q,
                                    { class: "edit-icon" },
                                    { default: S(() => [x(D(i))]), _: 1 }
                                  ),
                                ],
                                8,
                                Z
                              )),
                        ]),
                        _: 1,
                      },
                      8,
                      [
                        "loading",
                        "data",
                        "columns",
                        "pagination",
                        "onSelectionChange",
                        "onPagination:sizeChange",
                        "onPagination:currentChange",
                      ]
                    ),
                  ]),
                  _: 1,
                },
                8,
                ["style"]
              ),
              x(
                Fe,
                {
                  modelValue: D(Ue).visible,
                  "onUpdate:modelValue": c[5] || (c[5] = (e) => (D(Ue).visible = e)),
                  title: D(Ue).title,
                  width: "920px",
                  "dialog-class": "session-detail-dialog",
                  "modal-class": "session-detail-dialog",
                  "form-mode": D(Ue).type,
                  "confirm-loading": ue.value,
                  onCancel: Xe,
                  onConfirm:
                    c[6] ||
                    (c[6] = (e) =>
                      "detail" === D(Ue).type
                        ? Xe()
                        : (async function () {
                            pe.value?.validate(async (e) => {
                              if (e)
                                try {
                                  (await H.createSession({ title: Be.value.title }),
                                    (Ue.visible = !1),
                                    await Le(),
                                    await Pe());
                                } catch (a) {}
                            });
                          })()),
                },
                {
                  default: S(() => [
                    "detail" === D(Ue).type
                      ? (j(),
                        A(
                          Ie,
                          { key: 0, "max-height": "70vh", "view-style": { overflowX: "hidden" } },
                          {
                            default: S(() => [
                              x(
                                X,
                                { column: 2, data: We.value, items: qe, scrollbar: !1 },
                                {
                                  metadata: S(({ row: e }) => [
                                    e?.metadata
                                      ? (j(),
                                        w("pre", $, V(JSON.stringify(e?.metadata, null, 2)), 1))
                                      : (j(), w("span", ee, "无")),
                                  ]),
                                  _: 1,
                                },
                                8,
                                ["data"]
                              ),
                              x(
                                E,
                                { "content-position": "left" },
                                {
                                  default: S(() => [...(c[7] || (c[7] = [T("消息记录", -1)]))]),
                                  _: 1,
                                }
                              ),
                              We.value.messages && We.value.messages.length > 0
                                ? (j(),
                                  A(
                                    ze,
                                    { key: 0 },
                                    {
                                      default: S(() => [
                                        (j(!0),
                                        w(
                                          P,
                                          null,
                                          O(
                                            We.value.messages,
                                            (e, a) => (
                                              j(),
                                              A(
                                                ne,
                                                {
                                                  key: a,
                                                  type: "user" === e.role ? "primary" : "success",
                                                  icon: "user" === e.role ? "User" : "ChatDotRound",
                                                },
                                                {
                                                  default: S(() => {
                                                    return [
                                                      B("div", ae, [
                                                        B("div", te, [
                                                          x(
                                                            G,
                                                            {
                                                              size: "small",
                                                              type:
                                                                "user" === e.role
                                                                  ? "primary"
                                                                  : "success",
                                                            },
                                                            {
                                                              default: S(() => [
                                                                T(
                                                                  V(
                                                                    "user" === e.role
                                                                      ? "用户"
                                                                      : "助手"
                                                                  ),
                                                                  1
                                                                ),
                                                              ]),
                                                              _: 2,
                                                            },
                                                            1032,
                                                            ["type"]
                                                          ),
                                                          e.created_at
                                                            ? (j(),
                                                              w(
                                                                "span",
                                                                le,
                                                                V(
                                                                  ((a = e.created_at),
                                                                  a ? Q(new Date(1e3 * a)) : "")
                                                                ),
                                                                1
                                                              ))
                                                            : U("", !0),
                                                        ]),
                                                        B("div", ie, V(e.content), 1),
                                                      ]),
                                                    ];
                                                    var a;
                                                  }),
                                                  _: 2,
                                                },
                                                1032,
                                                ["type", "icon"]
                                              )
                                            )
                                          ),
                                          128
                                        )),
                                      ]),
                                      _: 1,
                                    }
                                  ))
                                : (j(),
                                  A(Ae, { key: 1, description: "暂无消息记录", "image-size": 60 })),
                            ]),
                            _: 1,
                          }
                        ))
                      : (j(),
                        A(
                          Oe,
                          {
                            key: me.value,
                            ref_key: "dataFormRef",
                            ref: pe,
                            modelValue: Be.value,
                            "onUpdate:modelValue": c[4] || (c[4] = (e) => (Be.value = e)),
                            items: ce.value,
                            rules: Je,
                            "label-suffix": ":",
                            "label-width": 100,
                            "label-position": "right",
                            span: 24,
                            gutter: 16,
                            "show-reset": !1,
                            "show-submit": !1,
                            class: "crud-dialog-art-form",
                          },
                          null,
                          8,
                          ["modelValue", "items", "rules"]
                        )),
                  ]),
                  _: 1,
                },
                8,
                ["modelValue", "title", "form-mode", "confirm-loading"]
              ),
            ])
          );
        };
      },
    }),
    [["__scopeId", "data-v-d0a47db4"]]
  );
export { se as default };
