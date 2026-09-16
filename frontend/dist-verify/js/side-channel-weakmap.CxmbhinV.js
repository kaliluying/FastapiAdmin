import { r as t } from "./get-intrinsic.BMeuD2ey.js";
import { r as e } from "./call-bound.Dizy2Qs1.js";
import { a as o } from "./object-inspect.Ju1NJVd1.js";
import { r } from "./side-channel-map.ulHsYLML.js";
import { d as n } from "./es-errors.DK26Ybqf.js";
var a, f;
function p() {
  if (f) return a;
  f = 1;
  var p = t(),
    i = e(),
    s = o(),
    c = r(),
    u = n(),
    y = p("%WeakMap%", !0),
    m = i("WeakMap.prototype.get", !0),
    j = i("WeakMap.prototype.set", !0),
    d = i("WeakMap.prototype.has", !0),
    h = i("WeakMap.prototype.delete", !0);
  return (a = y
    ? /** @type {Exclude<import('.'), false>} */ function () {
        var t,
          e,
          o = {
            assert: function (t) {
              if (!o.has(t)) throw new u("Side channel does not contain " + s(t));
            },
            delete: function (o) {
              if (y && o && ("object" == typeof o || "function" == typeof o)) {
                if (t) return h(t, o);
              } else if (c && e) return e.delete(o);
              return !1;
            },
            get: function (o) {
              return y && o && ("object" == typeof o || "function" == typeof o) && t
                ? m(t, o)
                : e && e.get(o);
            },
            has: function (o) {
              return y && o && ("object" == typeof o || "function" == typeof o) && t
                ? d(t, o)
                : !!e && e.has(o);
            },
            set: function (o, r) {
              y && o && ("object" == typeof o || "function" == typeof o)
                ? (t || (t = new y()), j(t, o, r))
                : c && (e || (e = c()), e.set(o, r));
            },
          };
        return o;
      }
    : c);
}
export { p as r };
