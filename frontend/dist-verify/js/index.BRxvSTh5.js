import { ag as e } from "./element-plus.BPg5EhXK.js";
import "./index.CJ_YH8gZ.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import "./vue-vendor.Dwx3gfQr.js";
function i(e) {
  const i = e?.trim();
  return !!i && i.startsWith("el-icon");
}
function r(r) {
  const l = r?.trim();
  if (!l) return null;
  const n = i(l) ? l.replace(/^el-icon-?/i, "").trim() : l;
  if (!n) return null;
  const t = e;
  let o = t[n];
  if (o) return o;
  if (/[-_]/.test(n)) {
    const e = (function (e) {
      return e
        .split(/[-_]/)
        .filter(Boolean)
        .map((e) => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase())
        .join("");
    })(n);
    if (((o = t[e]), o)) return o;
  }
  const s = n.charAt(0).toUpperCase() + n.slice(1);
  return s !== n && ((o = t[s]), o) ? o : null;
}
function l(e) {
  const i = e?.trim();
  return !!i && i.includes(":");
}
function n(e) {
  const i = (function (e) {
    const i = e.trim();
    return i
      ? /[A-Z]/.test(i)
        ? i
            .replace(/([a-z\d])([A-Z])/g, "$1-$2")
            .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
            .toLowerCase()
        : i.replace(/_/g, "-").toLowerCase()
      : "";
  })(e.replace(/^el-icon-/i, "").trim());
  return i ? `ep:${i}` : "ep:menu";
}
const t = {
    close: "ri:file-close-line",
    copy: "ri:file-copy-line",
    css: "ri:file-code-line",
    dir: "ri:folder-line",
    excel: "ri:file-excel-2-line",
    exe: "ri:file-settings-line",
    html: "ri:file-code-line",
    image: "ri:file-image-line",
    js: "ri:file-code-line",
    json: "ri:file-code-line",
    music: "ri:file-music-line",
    open: "ri:folder-open-line",
    other: "ri:file-unknow-line",
    pdf: "ri:file-pdf-line",
    ppt: "ri:file-ppt-line",
    rar: "ri:file-zip-line",
    txt: "ri:file-text-line",
    video: "ri:file-video-line",
    wps: "ri:file-word-line",
    zip: "ri:file-zip-line",
  },
  o = {
    ai: "ri:robot-2-line",
    api: "ri:plug-line",
    arco: "ri:circle-line",
    "avatar-man": "ri:user-line",
    "avatar-woman": "ri:user-smile-line",
    backtop: "ri:arrow-up-circle-line",
    bell: "ri:notification-3-line",
    bilibili: "ri:movie-2-line",
    browser: "ri:chrome-line",
    captcha: "ri:shield-keyhole-line",
    cascader: "ri:filter-3-line",
    client: "ri:computer-line",
    close: "ri:close-line",
    close_all: "ri:close-circle-line",
    close_left: "ri:arrow-left-s-line",
    close_other: "ri:links-line",
    close_right: "ri:arrow-right-s-line",
    cnblogs: "ri:article-line",
    code: "ri:code-s-slash-line",
    collapse: "ri:menu-fold-line",
    csdn: "ri:article-line",
    dict: "ri:book-2-line",
    document: "ri:file-text-line",
    down: "ri:arrow-down-s-line",
    download: "ri:download-cloud-line",
    enter: "ri:login-box-line",
    esc: "ri:close-line",
    file: "ri:file-text-line",
    fullscreen: "ri:fullscreen-line",
    "fullscreen-exit": "ri:fullscreen-exit-line",
    gitcode: "ri:git-repository-line",
    gitee: "ri:git-branch-line",
    github: "ri:github-fill",
    homepage: "ri:home-4-line",
    java: "ri:cup-line",
    juejin: "ri:book-read-line",
    language: "ri:translate-2",
    layout_leftbar_close_line: "ri:menu-fold-line",
    layout_leftbar_open_line: "ri:menu-unfold-line",
    menu: "ri:menu-line",
    message: "ri:message-3-line",
    monitor: "ri:computer-line",
    project: "ri:projector-line",
    python: "ri:terminal-box-line",
    qq: "ri:qq-fill",
    refresh: "ri:refresh-line",
    role: "ri:admin-line",
    search: "ri:search-line",
    setting: "ri:settings-3-line",
    size: "ri:font-size-2",
    sql: "ri:database-2-line",
    system: "ri:settings-2-line",
    table: "ri:table-line",
    time: "ri:time-line",
    todo: "ri:checkbox-line",
    tree: "ri:node-tree",
    typescript: "ri:typescript-line",
    up: "ri:arrow-up-s-line",
    upload_file: "ri:upload-cloud-2-line",
    "upload-file": "ri:upload-cloud-2-line",
    upload_folder: "ri:folder-upload-line",
    "upload-folder": "ri:folder-upload-line",
    user: "ri:user-line",
    visitor: "ri:user-heart-line",
    vite: "ri:rocket-line",
    vue: "ri:vuejs-line",
    wechat: "ri:wechat-fill",
    xml: "ri:code-s-slash-line",
    people: "ri:team-line",
    "menu-about": "ri:information-line",
    "menu-analyse": "ri:line-chart-line",
    "menu-crud": "ri:database-2-line",
    "menu-detail": "ri:file-list-line",
    "menu-document": "ri:file-text-line",
    "menu-error": "ri:error-warning-line",
    "menu-example": "ri:lightbulb-line",
    "menu-file": "ri:folder-2-line",
    "menu-form": "ri:file-list-3-line",
    "menu-gitee": "ri:git-branch-line",
    "menu-home": "ri:home-4-line",
    "menu-layout": "ri:layout-line",
    "menu-multi": "ri:layout-grid-line",
    "menu-result": "ri:bar-chart-box-line",
    "menu-system": "ri:settings-3-line",
    "menu-table": "ri:table-line",
    "menu-test": "ri:test-tube-line",
    "icon-msg": "ri:message-3-line",
    "icon-num": "ri:numbers-line",
    "icon-user": "ri:user-line",
    "icon-wait": "ri:timer-line",
    "item-angular": "ri:angularjs-line",
    "item-github": "ri:github-fill",
    "item-html5": "ri:html5-fill",
    "item-js": "ri:javascript-line",
    "item-react": "ri:reactjs-line",
    "item-vue": "ri:vuejs-line",
    "ai copy": "ri:robot-2-line",
    "backtop copy": "ri:arrow-up-circle-line",
    "file copy": "ri:file-text-line",
    "vue copy": "ri:vuejs-line",
    "wechat copy": "ri:wechat-fill",
  };
function s(e) {
  const i = e.trim();
  if (!i) return "ri:apps-line";
  if (o[i]) return o[i];
  const r = i.toLowerCase();
  return o[r]
    ? o[r]
    : r.startsWith("file-") || r.startsWith("file_")
      ? (function (e) {
          const i = e.toLowerCase(),
            r = i.startsWith("file-") ? i.slice(5) : i;
          return t[r] ?? "ri:file-text-line";
        })(r.replace(/_/g, "-"))
      : r.startsWith("menu-")
        ? (o[r] ?? "ri:menu-add-line")
        : "ri:apps-line";
}
function a(e) {
  const t = e?.trim() ?? "";
  return t ? (l(t) ? t : r(t) ? n((i(t), t)) : i(t) ? n(t) : s(t)) : "ri:file-3-line";
}
export { l as a, a as b, n as e, i, r };
