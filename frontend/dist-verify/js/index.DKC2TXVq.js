import { _ as e, u as a, s as t, c as l } from "./query.CFyD4gup.js";
import { _ as s } from "./index.SppbxYir.js";
import {
  U as o,
  w as i,
  x as r,
  ae as n,
  z as d,
  aO as p,
  a4 as u,
  D as m,
  aw as c,
  d as f,
  J as g,
  e as v,
  b as h,
  V as b,
  M as y,
  ad as w,
  aR as _,
  K as x,
} from "./element-plus.BPg5EhXK.js";
import {
  z as j,
  a$ as k,
  ar as T,
  ag as U,
  p as V,
  w as C,
  bt as D,
  aI as R,
  m as z,
  v as P,
  ax as B,
  n as F,
  o as I,
  bu as S,
  $ as q,
  al as O,
  ai as A,
  X as E,
  bo as W,
  a4 as $,
  F as N,
  ao as L,
  j as M,
  a1 as Z,
  G as H,
} from "./vue-vendor.Dwx3gfQr.js";
import { _ as G } from "./index.BpYlApL9.js";
import { _ as K } from "./index.vue_vue_type_script_setup_true_lang.B21S8Wni.js";
import { b as Q, _ as X, r as J } from "./useTableColumns.BKMFwI8S.js";
import { _ as Y, r as ee } from "./statusFormatter.Df4Q0iE9.js";
import { _ as ae, a as te, c as le, b as se } from "./index.E8bA6rDJ.js";
import { F as oe } from "./index.C8JPqYJk.js";
import { Y as ie, a6 as re, q as ne, U as de, D as pe, h as ue } from "./index.CJ_YH8gZ.js";
import { u as me } from "./useTable.DG3aa8Ve.js";
import { d as ce, u as fe, c as ge, b as ve, a as he } from "./useConfirm.CXh1xjds.js";
import "./file-saver.CjVB4eGa.js";
import { D as be } from "./dept.qQ6KULTg.js";
import { R as ye } from "./role.Br_Al1vx.js";
import we from "./FaDeptTree.72mLgETB.js";
import { _ as _e } from "./_plugin-vue_export-helper.BCo6x5W8.js";
import "./exceljs.CGWu2obp.js";
import "./dayjs.BHSg66Ch.js";
import "./index.vue_vue_type_script_setup_true_lang.CgkvK-LE.js";
import "./index.vue_vue_type_script_setup_true_lang.CrFnUWqC.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
import "./@intlify.CbtlSmdZ.js";
import "./ohash.BS5RKZcF.js";
import "./vue-draggable-plus.B5VWpxKS.js";
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
const xe = { class: "crud-import-modal-host" },
  je = { class: "el-upload__text" },
  ke = { class: "el-upload__tip flex flex-wrap gap-2" },
  Te = { style: "padding-right: var(--el-dialog-padding-primary)" },
  Ue = j({
    name: "FaImportDialog",
    inheritAttrs: !1,
    __name: "index",
    props: q(
      {
        title: { default: "导入数据" },
        width: { default: "600px" },
        maxHeight: { default: "60vh" },
        accept: {
          default:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel",
        },
        limit: { default: 1 },
        showTemplateDownload: { type: Boolean, default: !0 },
        dropText: {},
        browseText: {},
        templateDownloadText: {},
        defaultTemplateFileName: {},
        cancelButtonText: {},
        confirmButtonText: {},
        note: { default: "注意事项：" },
        fileTypeWarning: { default: "格式为*.xlsx / *.xls，文件不超过 5MB" },
        uploadFileName: { default: "file" },
        uploadData: { default: () => ({}) },
        contentConfig: {},
        loading: { type: Boolean },
      },
      { modelValue: { type: Boolean, required: !0, default: !1 }, modelModifiers: {} }
    ),
    emits: q(
      ["import-success", "import-fail", "close", "download-template", "upload"],
      ["update:modelValue"]
    ),
    setup(e, { expose: a, emit: t }) {
      const l = e,
        v = k(e, "modelValue"),
        h = t,
        b = O(null),
        y = O(null),
        w = A({ files: [] }),
        _ = { files: [{ required: !0, message: "文件不能为空", trigger: "blur" }] },
        x = () => {
          g.warning(`只能上传${l.limit}个文件`);
        };
      async function j() {
        try {
          const e = l.contentConfig.importTemplate;
          if ("string" == typeof e) window.open(e);
          else if ("function" == typeof e) {
            const a = await e(),
              t = a.data,
              s = a.headers?.["content-disposition"];
            let o = l.defaultTemplateFileName || "template.xlsx";
            if (s)
              try {
                const e = s.split(";").find((e) => e.trim().startsWith("filename"));
                if (e) {
                  const a = e.split("=")[1]?.replace(/^"|"$/g, "");
                  a && (o = decodeURI(a));
                }
              } catch {}
            !(function (e, a) {
              const t = new Blob([e], {
                  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
                }),
                l = window.URL.createObjectURL(t),
                s = document.createElement("a");
              ((s.href = l),
                (s.download = a),
                document.body.appendChild(s),
                s.click(),
                document.body.removeChild(s),
                window.URL.revokeObjectURL(l));
            })(t, o);
          } else g.error("未配置importTemplate");
        } catch (e) {
          g.error("下载模板失败");
        }
      }
      const q = async () => {
          if (w.files.length)
            try {
              const e = w.files[0].raw,
                a = new FormData();
              (a.append(l.uploadFileName, e),
                Object.keys(l.uploadData).forEach((e) => {
                  a.append(e, l.uploadData[e]);
                }),
                h("upload", a, e));
            } catch (e) {
              (g.error("上传失败：" + e.message || e), h("import-fail", e));
            }
          else g.warning("请选择文件");
        },
        E = () => {
          ((w.files.length = 0), (v.value = !1), h("close"));
        };
      return (
        a({ handleClose: E }),
        (e, a) => {
          const t = d,
            g = u,
            h = m,
            k = n,
            O = r,
            A = i,
            W = o,
            $ = f,
            N = s,
            L = T("hasPerm");
          return (
            U(),
            V("div", xe, [
              C(
                N,
                {
                  modelValue: v.value,
                  "onUpdate:modelValue": a[1] || (a[1] = (e) => (v.value = e)),
                  title: l.title,
                  width: l.width,
                  "dialog-class": "crud-embed-dialog",
                  "modal-class": "crud-embed-dialog",
                  onClose: E,
                },
                {
                  footer: D(() => [
                    z("div", Te, [
                      C(
                        $,
                        { onClick: E },
                        { default: D(() => [P(B(l.cancelButtonText || "取 消"), 1)]), _: 1 }
                      ),
                      C(
                        $,
                        {
                          type: "primary",
                          disabled: 0 === w.files.length || l.loading,
                          loading: l.loading,
                          onClick: q,
                        },
                        { default: D(() => [P(B(l.confirmButtonText || "确 定"), 1)]), _: 1 },
                        8,
                        ["disabled", "loading"]
                      ),
                    ]),
                  ]),
                  default: D(() => [
                    C(
                      W,
                      { "max-height": l.maxHeight },
                      {
                        default: D(() => [
                          C(
                            A,
                            {
                              ref_key: "importFormRef",
                              ref: b,
                              style: "padding-right: var(--el-dialog-padding-primary)",
                              model: w,
                              rules: _,
                            },
                            {
                              default: D(() => [
                                C(
                                  O,
                                  { prop: "files" },
                                  {
                                    default: D(() => [
                                      C(
                                        k,
                                        {
                                          ref_key: "uploadRef",
                                          ref: y,
                                          "file-list": w.files,
                                          "onUpdate:fileList":
                                            a[0] || (a[0] = (e) => (w.files = e)),
                                          class: "w-full",
                                          accept: l.accept,
                                          drag: !0,
                                          limit: l.limit,
                                          "auto-upload": !1,
                                          "on-exceed": x,
                                        },
                                        {
                                          tip: D(() => [
                                            z("div", ke, [
                                              l.note
                                                ? (U(),
                                                  F(
                                                    g,
                                                    { key: 0, type: "warning", class: "mx-1" },
                                                    { default: D(() => [P(B(l.note), 1)]), _: 1 }
                                                  ))
                                                : I("", !0),
                                              l.fileTypeWarning
                                                ? (U(),
                                                  F(
                                                    g,
                                                    { key: 1, type: "danger", class: "mx-1" },
                                                    {
                                                      default: D(() => [
                                                        P(B(l.fileTypeWarning), 1),
                                                      ]),
                                                      _: 1,
                                                    }
                                                  ))
                                                : I("", !0),
                                              l.showTemplateDownload
                                                ? S(
                                                    (U(),
                                                    F(
                                                      h,
                                                      {
                                                        key: 2,
                                                        class:
                                                          "mx-1 inline-flex items-center gap-0.5",
                                                        type: "primary",
                                                        underline: "never",
                                                        onClick: j,
                                                      },
                                                      {
                                                        default: D(() => [
                                                          C(
                                                            t,
                                                            { class: "text-base" },
                                                            { default: D(() => [C(R(c))]), _: 1 }
                                                          ),
                                                          z(
                                                            "span",
                                                            null,
                                                            B(l.templateDownloadText || "下载模板"),
                                                            1
                                                          ),
                                                        ]),
                                                        _: 1,
                                                      }
                                                    )),
                                                    [
                                                      [
                                                        L,
                                                        [`${l.contentConfig.permPrefix}:download`],
                                                      ],
                                                    ]
                                                  )
                                                : I("", !0),
                                            ]),
                                          ]),
                                          default: D(() => [
                                            C(
                                              t,
                                              { class: "el-icon--upload" },
                                              { default: D(() => [C(R(p))]), _: 1 }
                                            ),
                                            z("div", je, [
                                              P(B(l.dropText || "将文件拖到此处，或") + " ", 1),
                                              z("em", null, B(l.browseText || "点击上传"), 1),
                                            ]),
                                          ]),
                                          _: 1,
                                        },
                                        8,
                                        ["file-list", "accept", "limit"]
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
                      },
                      8,
                      ["max-height"]
                    ),
                  ]),
                  _: 1,
                },
                8,
                ["modelValue", "title", "width"]
              ),
            ])
          );
        }
      );
    },
  }),
  Ve = { class: "fa-full-height user-manage-page" },
  Ce = { class: "fa-management-page" },
  De = {
    class: "user-manage-body box-border flex gap-4 h-full max-md:block max-md:gap-0 max-md:h-auto",
  },
  Re = { class: "user-dept-panel shrink-0 w-58 h-full max-md:w-full max-md:h-auto max-md:mb-5" },
  ze = { class: "user-main-panel flex flex-col grow min-w-0 min-h-0" },
  Pe = _e(
    j({
      name: "User",
      inheritAttrs: !1,
      __name: "index",
      setup(s) {
        const { hasAuth: i } = Q(),
          r = ie(),
          n = re();
        function d(e, a) {
          const t = (function (e, a) {
            const t = !0 === e.is_superuser;
            return [
              {
                key: "resetPwd",
                label: "重置密码",
                artType: "edit",
                icon: "ri:refresh-line",
                perm: "module_system:user:update",
                disabled: t,
                run: () => {
                  t || a.onResetPwd(e);
                },
              },
              {
                key: "detail",
                label: "详情",
                artType: "view",
                perm: "module_system:user:detail",
                run: () => a.onDetail(e.id),
              },
              {
                key: "edit",
                label: "编辑",
                artType: "edit",
                perm: "module_system:user:update",
                disabled: t,
                run: () => {
                  t || a.onEdit(e.id);
                },
              },
              {
                key: "delete",
                label: "删除",
                artType: "delete",
                perm: "module_system:user:delete",
                disabled: t,
                run: () => {
                  t || a.onDelete(e.id);
                },
              },
            ].filter((e) => null != e.perm && i(e.perm));
          })(e, a);
          return J(t, {
            wrapperClass: "inline-flex flex-wrap items-center justify-end gap-1 user-table-actions",
          });
        }
        const p = O(null),
          u = O(0),
          m = O(!1),
          c = O(!1),
          f = O(!1),
          j = O(!1),
          k = O(void 0),
          T = M(() => (r.device === pe.DESKTOP ? "450px" : "90%")),
          I = O(),
          q = O(),
          { importVisible: _e, exportVisible: xe, openImport: je, openExport: ke } = a(),
          Te = O({}),
          Pe = [
            { label: "编号", prop: "id" },
            { label: "头像", prop: "avatar", slot: "avatar" },
            // 自定义插槽渲染
            { label: "账号", prop: "username" },
            { label: "用户名", prop: "name" },
            { label: "性别", prop: "gender", slot: "gender" },
            // 三种状态 Tag
            { label: "部门", prop: "dept.name" },
            // 嵌套属性 a.b.c
            { label: "角色", prop: "roles", slot: "roles" },
            // 数组 join 渲染
            { label: "邮箱", prop: "email" },
            { label: "手机号", prop: "mobile" },
            {
              label: "是否超管",
              prop: "is_superuser",
              tag: {
                map: { true: { type: "success", text: "是" }, false: { type: "info", text: "否" } },
              },
            },
            {
              label: "状态",
              prop: "status",
              tag: {
                map: { 0: { type: "success", text: "启用" }, 1: { type: "danger", text: "停用" } },
              },
            },
            { label: "上次登录时间", prop: "last_login" },
            { label: "创建人", prop: "created_by.name" },
            { label: "更新人", prop: "updated_by.name" },
            { label: "创建时间", prop: "created_time" },
            { label: "更新时间", prop: "updated_time" },
            { label: "描述", prop: "description", span: 4 },
          ],
          Be = M(() => [
            {
              key: "username",
              label: "账号",
              type: "input",
              props: { placeholder: "请输入账号", disabled: !!ua.value.id },
            },
            { key: "name", label: "用户名", type: "input", props: { placeholder: "请输入用户名" } },
            {
              key: "gender",
              label: "性别",
              type: "select",
              props: {
                placeholder: "请选择性别",
                options: [
                  { label: "男", value: "0" },
                  { label: "女", value: "1" },
                  { label: "未知", value: "2" },
                ],
              },
            },
            {
              key: "mobile",
              label: "手机号",
              type: "input",
              props: { placeholder: "请输入手机号码", maxlength: 11 },
            },
            {
              key: "email",
              label: "邮箱",
              type: "input",
              props: { placeholder: "请输入邮箱", maxlength: 50 },
            },
            {
              key: "dept_id",
              label: "部门",
              type: "input",
              /* 实际渲染由 #dept_id 插槽接管 */
            },
            {
              key: "role_ids",
              label: "角色",
              type: "input",
              /* 实际渲染由 #role_ids 插槽接管 */
            },
            {
              key: "password",
              label: "密码",
              type: "input",
              hidden: !!ua.value.id,
              props: {
                placeholder: "请输入密码",
                type: "password",
                showPassword: !0,
                clearable: !0,
              },
            },
            { key: "is_superuser", label: "是否超管", type: "switch" },
            {
              key: "status",
              label: "状态",
              type: "radiogroup",
              props: {
                options: [
                  { label: "启用", value: 0 },
                  { label: "停用", value: 1 },
                ],
              },
            },
            {
              key: "description",
              label: "描述",
              type: "input",
              props: {
                type: "textarea",
                rows: 4,
                maxlength: 100,
                showWordLimit: !0,
                placeholder: "请输入描述",
              },
            },
          ]),
          Fe = O({
            username: void 0,
            name: void 0,
            status: void 0,
            created_id: void 0,
            created_time: void 0,
          }),
          Ie = O(!0),
          Se = O(null),
          qe = {},
          Oe = O([
            { label: "启用", value: 0 },
            { label: "停用", value: 1 },
          ]),
          Ae = M(() => [
            {
              label: "账号",
              key: "username",
              type: "input",
              placeholder: "请输入账号",
              clearable: !0,
              span: 6,
            },
            {
              label: "用户名",
              key: "name",
              type: "input",
              placeholder: "请输入用户名",
              clearable: !0,
              span: 6,
            },
            {
              label: "状态",
              key: "status",
              type: "select",
              props: { placeholder: "请选择状态", options: Oe.value, clearable: !0 },
              span: 6,
            },
          ]),
          Ee = O(null),
          {
            selectedRows: We,
            selectedIds: $e,
            batchDeleting: Ne,
            onTableSelectionChange: Le,
          } = ce();
        const Me = {
            onResetPwd: async function (e) {
              try {
                const { value: a } = await x.prompt(
                  `请输入用户【${e.username ?? ""}】的新密码`,
                  "重置密码",
                  { confirmButtonText: "确定", cancelButtonText: "取消" }
                );
                if (!a || a.length < 6) return void g.warning("密码至少需要6位字符，请重新输入");
                await de.resetUserPassword(e.id, { password: a });
              } catch {}
            },
            onDetail: (e) => {
              xa("detail", e);
            },
            onEdit: (e) => {
              xa("update", e);
            },
            onDelete: async function (e) {
              try {
                (await he(), await de.deleteUser([e]));
                const a = [e];
                (n.basicInfo.id && a.includes(n.basicInfo.id)
                  ? n.clearUserInfo()
                  : g.success("删除成功"),
                  Ee.value?.elTableRef?.clearSelection(),
                  await ia());
              } catch {}
            },
          },
          {
            columns: Ze,
            columnChecks: He,
            data: Ge,
            loading: Ke,
            pagination: Qe,
            searchParams: Xe,
            getData: Je,
            replaceSearchParams: Ye,
            resetSearchParams: ea,
            handleSizeChange: aa,
            handleCurrentChange: ta,
            refreshData: la,
            refreshCreate: sa,
            refreshUpdate: oa,
            refreshRemove: ia,
          } = me({
            core: {
              apiFn: function (e) {
                return de.listUser({
                  page_no: 1,
                  page_size: 10,
                  ...e,
                  dept_id:
                    void 0 !== k.value && null !== k.value && "" !== k.value
                      ? Number(k.value)
                      : void 0,
                });
              },
              apiParams: { page_no: 1, page_size: 20 },
              columnsFactory: ee(() => [
                { type: "selection", width: 48, fixed: "left" },
                { type: "globalIndex", width: 56, label: "序号" },
                {
                  prop: "avatar",
                  label: "头像",
                  width: 72,
                  align: "center",
                  formatter: (e) =>
                    H(h, { size: 28, src: e.avatar || void 0 }, () => (e.avatar ? void 0 : H(_))),
                },
                { prop: "username", label: "账号", minWidth: 100, showOverflowTooltip: !0 },
                { prop: "name", label: "用户名", minWidth: 100, showOverflowTooltip: !0 },
                {
                  prop: "status",
                  label: "状态",
                  width: 88,
                  status: {
                    0: { type: "success", text: "启用" },
                    1: { type: "danger", text: "停用" },
                  },
                },
                {
                  prop: "dept",
                  label: "部门",
                  minWidth: 100,
                  formatter: (e) => e.dept?.name ?? "—",
                },
                {
                  prop: "gender",
                  label: "性别",
                  width: 88,
                  status: {
                    0: { type: "success", text: "男" },
                    1: { type: "warning", text: "女" },
                  },
                },
                { prop: "created_time", label: "创建时间", width: 168, showOverflowTooltip: !0 },
                { prop: "updated_time", label: "更新时间", width: 168, showOverflowTooltip: !0 },
                {
                  prop: "operation",
                  label: "操作",
                  width: 280,
                  fixed: "right",
                  align: "right",
                  formatter: (e) => d(e, Me),
                },
              ]),
            },
          }),
          ra = M(() =>
            Ze.value.map((e) => {
              const a = e.type;
              return {
                prop: e.prop,
                label: e.label,
                type: "selection" === a ? "selection" : "default",
                show: !0,
              };
            })
          ),
          na = M(() => {
            const e = t(Xe);
            void 0 !== k.value &&
              null !== k.value &&
              "" !== k.value &&
              (e.dept_id = Number(k.value));
            const a = l(e);
            if ("string" == typeof a.status) {
              const e = a.status;
              ("true" !== e && "false" !== e) || (a.status = "true" === e);
            }
            return a;
          }),
          da = M(() => ({
            permPrefix: "module_system:user",
            cols: ra.value,
            indexAction: async () => ({}),
            importTemplate: () => de.downloadTemplateUser(),
          })),
          pa = M(() => ({
            permPrefix: "module_system:user",
            cols: ra.value,
            exportsBlobAction: async (e) => {
              const a = l({ ...na.value, ...e });
              if ("string" == typeof a.status) {
                const e = a.status;
                ("true" !== e && "false" !== e) || (a.status = "true" === e);
              }
              return (await de.exportUser(a)).data;
            },
          })),
          ua = O({
            id: void 0,
            username: void 0,
            name: void 0,
            dept_id: void 0,
            dept_name: void 0,
            role_ids: void 0,
            role_names: void 0,
            password: void 0,
            gender: void 0,
            email: void 0,
            mobile: void 0,
            is_superuser: !1,
            status: 0,
            description: void 0,
          }),
          { dialogVisible: ma } = fe(),
          ca = A({
            username: [{ required: !0, message: "请输入账号", trigger: "blur" }],
            name: [{ required: !0, message: "请输入用户名", trigger: "blur" }],
            password: [{ required: !0, message: "请输入密码", trigger: "blur" }],
            gender: [{ required: !1, message: "请选择性别", trigger: "blur" }],
            email: [
              {
                pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
                message: "请输入正确的邮箱地址",
                trigger: "blur",
              },
            ],
            mobile: [
              {
                pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
                message: "请输入正确的手机号码",
                trigger: "blur",
              },
            ],
            is_superuser: [{ required: !0, message: "请选择是否超管", trigger: "blur" }],
            status: [{ required: !0, message: "请选择状态", trigger: "blur" }],
          }),
          fa = {
            id: void 0,
            username: void 0,
            name: void 0,
            dept_id: void 0,
            dept_name: void 0,
            role_ids: void 0,
            role_names: void 0,
            password: void 0,
            gender: void 0,
            email: void 0,
            mobile: void 0,
            is_superuser: !1,
            status: 0,
            description: void 0,
          };
        async function ga(e) {
          var a;
          (await Se.value?.validate?.(),
            Ye({
              username: (a = e).username,
              name: a.name,
              status: a.status,
              created_id: a.created_id,
              created_time:
                Array.isArray(a.created_time) && 2 === a.created_time.length
                  ? a.created_time
                  : void 0,
            }),
            await Je());
        }
        function va() {
          ((Fe.value = {
            username: void 0,
            name: void 0,
            status: void 0,
            created_id: void 0,
            created_time: void 0,
          }),
            (k.value = void 0),
            ea());
        }
        async function ha() {
          await Je();
        }
        async function ba(e) {
          c.value = !0;
          try {
            const a = await de.importUser(e);
            a.data.code === ue.SUCCESS
              ? (g.success(`${a.data.msg}，${a.data.data}`), (_e.value = !1), await la())
              : g.error(a.data.msg || "导入失败");
          } catch (a) {
            g.error("上传失败");
          } finally {
            c.value = !1;
          }
        }
        async function ya() {
          (p.value && (p.value.resetFields(), p.value.clearValidate()),
            Object.assign(ua.value, fa));
        }
        async function wa() {
          ((ma.visible = !1), await ya());
        }
        async function _a() {
          f.value = !0;
          try {
            await xa("create");
          } finally {
            f.value = !1;
          }
        }
        async function xa(e, a) {
          if (((ma.type = e), a)) {
            const t = await de.detailUser(a);
            "detail" === e
              ? ((ma.title = "用户详情"), Object.assign(Te.value, t.data.data ?? {}))
              : "update" === e &&
                ((ma.title = "修改用户"),
                Object.assign(ua.value, t.data.data),
                (ua.value.role_ids = (t.data.data.roles || []).map((e) => e.id)));
          } else
            ((ma.title = "新增用户"),
              Object.assign(ua.value, fa),
              (ua.value.id = void 0),
              (u.value += 1));
          ((ma.visible = !0), await Z(), p.value && p.value.clearValidate());
          const t = await be.listDept({});
          I.value = ne(t.data.data);
          const l = (await ye.listRole()).data.data.items ?? [];
          q.value = l
            .filter((e) => void 0 !== e.id && void 0 !== e.name)
            .map((e) => ({ value: e.id, label: e.name, disabled: 1 === e.status }))
            .filter((e) => !e.disabled);
        }
        async function ja() {
          const e = $e.value;
          if (0 !== e.length)
            try {
              (await ge(e.length),
                (Ne.value = !0),
                await de.deleteUser(e),
                n.basicInfo.id && e.includes(n.basicInfo.id) && n.clearUserInfo(),
                (We.value = []),
                await ia());
            } catch {
            } finally {
              Ne.value = !1;
            }
        }
        async function ka(e) {
          const a = $e.value;
          if (a.length)
            try {
              (await ve(e), (j.value = !0), await de.batchUser({ ids: a, status: e }), await la());
            } catch {
            } finally {
              j.value = !1;
            }
          else g.warning("请先选择要操作的数据");
        }
        return (a, t) => {
          const l = o,
            s = v,
            i = ae,
            r = le,
            d = te,
            g = se,
            _ = Y,
            x = X,
            O = w,
            A = y,
            M = b,
            Z = K,
            H = G,
            Q = Ue,
            J = e;
          return (
            U(),
            V("div", Ve, [
              C(oe, { title: "用户管理" }),
              z("div", Ce, [
                z("div", De, [
                  z("div", Re, [
                    C(
                      s,
                      { class: "tree-card fa-card-xs flex flex-col h-full mt-0", shadow: "hover" },
                      {
                        header: D(() => [...(t[11] || (t[11] = [z("b", null, "部门", -1)]))]),
                        default: D(() => [
                          C(
                            l,
                            { class: "dept-tree-scroll min-h-0 flex-1" },
                            {
                              default: D(() => [
                                C(
                                  we,
                                  {
                                    modelValue: R(k),
                                    "onUpdate:modelValue":
                                      t[0] || (t[0] = (e) => (E(k) ? (k.value = e) : null)),
                                    class: "dept-tree-inner",
                                    onNodeClick: ha,
                                  },
                                  null,
                                  8,
                                  ["modelValue"]
                                ),
                              ]),
                              _: 1,
                            }
                          ),
                        ]),
                        _: 1,
                      }
                    ),
                  ]),
                  z("div", ze, [
                    S(
                      C(
                        i,
                        {
                          ref_key: "searchBarRef",
                          ref: Se,
                          modelValue: R(Fe),
                          "onUpdate:modelValue":
                            t[1] || (t[1] = (e) => (E(Fe) ? (Fe.value = e) : null)),
                          items: R(Ae),
                          rules: qe,
                          "is-expand": !1,
                          "show-expand": !0,
                          "show-reset": !0,
                          "show-search": !0,
                          "disabled-search": !1,
                          "default-expanded": !1,
                          "include-audit": "",
                          onSearch: ga,
                          onReset: va,
                        },
                        null,
                        8,
                        ["modelValue", "items"]
                      ),
                      [[W, R(Ie)]]
                    ),
                    C(
                      s,
                      {
                        shadow: "hover",
                        class: "fa-table-card",
                        style: $({ "margin-top": R(Ie) ? "12px" : "0" }),
                      },
                      {
                        default: D(() => [
                          C(
                            d,
                            {
                              columns: R(He),
                              "onUpdate:columns":
                                t[2] || (t[2] = (e) => (E(He) ? (He.value = e) : null)),
                              showSearchBar: R(Ie),
                              "onUpdate:showSearchBar":
                                t[3] || (t[3] = (e) => (E(Ie) ? (Ie.value = e) : null)),
                              loading: R(Ke),
                              onRefresh: R(la),
                            },
                            {
                              left: D(() => [
                                C(
                                  r,
                                  {
                                    "remove-ids": R($e),
                                    "perm-create": ["module_system:user:create"],
                                    "perm-import": ["module_system:user:import"],
                                    "perm-export": ["module_system:user:export"],
                                    "perm-delete": ["module_system:user:delete"],
                                    "perm-patch": ["module_system:user:patch"],
                                    "import-loading": R(c),
                                    "delete-loading": R(Ne),
                                    "create-loading": R(f),
                                    "more-loading": R(j),
                                    onAdd: _a,
                                    onImport: R(je),
                                    onExport: R(ke),
                                    onDelete: ja,
                                    onMore: ka,
                                  },
                                  null,
                                  8,
                                  [
                                    "remove-ids",
                                    "import-loading",
                                    "delete-loading",
                                    "create-loading",
                                    "more-loading",
                                    "onImport",
                                    "onExport",
                                  ]
                                ),
                              ]),
                              _: 1,
                            },
                            8,
                            ["columns", "showSearchBar", "loading", "onRefresh"]
                          ),
                          C(
                            g,
                            {
                              ref_key: "faTableRef",
                              ref: Ee,
                              "row-key": "id",
                              loading: R(Ke),
                              data: R(Ge),
                              columns: R(Ze),
                              pagination: R(Qe),
                              onSelectionChange: R(Le),
                              "onPagination:sizeChange": R(aa),
                              "onPagination:currentChange": R(ta),
                            },
                            null,
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
                  ]),
                ]),
                C(
                  H,
                  {
                    modelValue: R(ma).visible,
                    "onUpdate:modelValue": t[7] || (t[7] = (e) => (R(ma).visible = e)),
                    title: R(ma).title,
                    "append-to-body": "",
                    size: R(T),
                    "form-mode": R(ma).type,
                    "confirm-loading": R(m),
                    onCancel: wa,
                    onConfirm:
                      t[8] ||
                      (t[8] = (e) =>
                        "detail" === R(ma).type
                          ? wa()
                          : (async function () {
                              p.value?.validate(async (e) => {
                                if (!e) return;
                                m.value = !0;
                                const a = ua.value.id;
                                try {
                                  (a
                                    ? (await de.updateUser(a, ua.value), await oa())
                                    : (await de.createUser(ua.value), await sa()),
                                    (ma.visible = !1),
                                    await ya(),
                                    a === n.basicInfo.id && (await n.getUserInfo()));
                                } catch (t) {
                                } finally {
                                  m.value = !1;
                                }
                              });
                            })()),
                  },
                  {
                    default: D(() => [
                      "detail" === R(ma).type
                        ? (U(),
                          F(
                            x,
                            { key: 0, column: 2, data: R(Te), items: Pe, scrollbar: !1 },
                            {
                              avatar: D(({ row: e }) => [
                                e?.avatar
                                  ? (U(),
                                    F(R(h), { key: 0, src: e?.avatar, size: "small" }, null, 8, [
                                      "src",
                                    ]))
                                  : (U(), F(R(h), { key: 1, icon: "UserFilled", size: "small" })),
                              ]),
                              gender: D(({ row: e }) => [
                                "0" === e?.gender
                                  ? (U(), F(_, { key: 0, type: "success", label: "男" }))
                                  : "1" === e?.gender
                                    ? (U(), F(_, { key: 1, type: "warning", label: "女" }))
                                    : (U(), F(_, { key: 2, type: "info", label: "未知" })),
                              ]),
                              roles: D(({ row: e }) => [
                                P(B(e?.roles ? e.roles.map((e) => e.name).join("、") : ""), 1),
                              ]),
                              _: 1,
                            },
                            8,
                            ["data"]
                          ))
                        : (U(),
                          F(
                            Z,
                            {
                              key: R(u),
                              ref_key: "dataFormRef",
                              ref: p,
                              modelValue: R(ua),
                              "onUpdate:modelValue":
                                t[6] || (t[6] = (e) => (E(ua) ? (ua.value = e) : null)),
                              items: R(Be),
                              rules: R(ca),
                              "label-suffix": ":",
                              "label-width": 100,
                              "label-position": "right",
                              span: 24,
                              gutter: 16,
                              "show-reset": !1,
                              "show-submit": !1,
                              class: "crud-dialog-art-form",
                            },
                            {
                              dept_id: D(() => [
                                C(
                                  O,
                                  {
                                    modelValue: R(ua).dept_id,
                                    "onUpdate:modelValue":
                                      t[4] || (t[4] = (e) => (R(ua).dept_id = e)),
                                    placeholder: "请选择上级部门",
                                    data: R(I),
                                    props: {
                                      children: "children",
                                      label: "label",
                                      disabled: "disabled",
                                    },
                                    filterable: "",
                                    "check-strictly": "",
                                    "render-after-expand": !1,
                                  },
                                  null,
                                  8,
                                  ["modelValue", "data"]
                                ),
                              ]),
                              role_ids: D(() => [
                                C(
                                  M,
                                  {
                                    modelValue: R(ua).role_ids,
                                    "onUpdate:modelValue":
                                      t[5] || (t[5] = (e) => (R(ua).role_ids = e)),
                                    multiple: "",
                                    placeholder: "请选择角色",
                                  },
                                  {
                                    default: D(() => [
                                      (U(!0),
                                      V(
                                        N,
                                        null,
                                        L(
                                          R(q),
                                          (e) => (
                                            U(),
                                            F(
                                              A,
                                              {
                                                key: e.value,
                                                label: e.label,
                                                value: e.value,
                                                disabled: e.disabled,
                                              },
                                              null,
                                              8,
                                              ["label", "value", "disabled"]
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
                            },
                            8,
                            ["modelValue", "items", "rules"]
                          )),
                    ]),
                    _: 1,
                  },
                  8,
                  ["modelValue", "title", "size", "form-mode", "confirm-loading"]
                ),
                C(
                  Q,
                  {
                    modelValue: R(_e),
                    "onUpdate:modelValue": t[9] || (t[9] = (e) => (E(_e) ? (_e.value = e) : null)),
                    "content-config": R(da),
                    "default-template-file-name": "user_import_template.xlsx",
                    loading: R(c),
                    onUpload: ba,
                  },
                  null,
                  8,
                  ["modelValue", "content-config", "loading"]
                ),
                C(
                  J,
                  {
                    modelValue: R(xe),
                    "onUpdate:modelValue":
                      t[10] || (t[10] = (e) => (E(xe) ? (xe.value = e) : null)),
                    "content-config": R(pa),
                    "query-params": R(na),
                    "page-data": R(Ge),
                    "selection-data": R(We),
                  },
                  null,
                  8,
                  ["modelValue", "content-config", "query-params", "page-data", "selection-data"]
                ),
              ]),
            ])
          );
        };
      },
    }),
    [["__scopeId", "data-v-466da0b7"]]
  );
export { Pe as default };
