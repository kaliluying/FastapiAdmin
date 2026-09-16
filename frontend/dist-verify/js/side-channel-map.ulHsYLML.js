import { r as t } from "./get-intrinsic.BMeuD2ey.js";
import { r } from "./call-bound.Dizy2Qs1.js";
import { a as e } from "./object-inspect.Ju1NJVd1.js";
import { d as o } from "./es-errors.DK26Ybqf.js";
var n, a;
function i() {
  if (a) return n;
  a = 1;
  var i = t(),
    p = r(),
    s = e(),
    u = o(),
    f = i("%Map%", !0),
    c = p("Map.prototype.get", !0),
    m = p("Map.prototype.set", !0),
    d = p("Map.prototype.has", !0),
    h = p("Map.prototype.delete", !0),
    M = p("Map.prototype.size", !0);
  return (n =
    !!f &&
    /** @type {Exclude<import('.'), false>} */
    function () {
      var t,
        r = {
          assert: function (t) {
            if (!r.has(t)) throw new u("Side channel does not contain " + s(t));
          },
          delete: function (r) {
            if (t) {
              var e = h(t, r);
              return (0 === M(t) && (t = void 0), e);
            }
            return !1;
          },
          get: function (r) {
            if (t) return c(t, r);
          },
          has: function (r) {
            return !!t && d(t, r);
          },
          set: function (r, e) {
            (t || (t = new f()), m(t, r, e));
          },
        };
      return r;
    });
}
export { i as r };
