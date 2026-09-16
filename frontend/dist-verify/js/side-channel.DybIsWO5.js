import { d as r } from "./es-errors.DK26Ybqf.js";
import { a as e } from "./object-inspect.Ju1NJVd1.js";
import { r as n } from "./side-channel-list.BNQ44_ba.js";
import { r as t } from "./side-channel-map.ulHsYLML.js";
import { r as s } from "./side-channel-weakmap.CxmbhinV.js";
var o, a;
function i() {
  if (a) return o;
  a = 1;
  var i = r(),
    c = e(),
    f = n(),
    u = t(),
    m = s() || u || f;
  return (o = function () {
    var r,
      e = {
        assert: function (r) {
          if (!e.has(r)) throw new i("Side channel does not contain " + c(r));
        },
        delete: function (e) {
          return !!r && r.delete(e);
        },
        get: function (e) {
          return r && r.get(e);
        },
        has: function (e) {
          return !!r && r.has(e);
        },
        set: function (e, n) {
          (r || (r = m()), r.set(e, n));
        },
      };
    return e;
  });
}
export { i as r };
