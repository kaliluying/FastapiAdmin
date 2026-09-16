import { r as t } from "./call-bind-apply-helpers.ubnPuw6U.js";
import { r } from "./gopd.BudZp56J.js";
var o, e;
function p() {
  if (e) return o;
  e = 1;
  var p,
    n = t(),
    c = r();
  try {
    p = /** @type {{ __proto__?: typeof Array.prototype }} */ [].__proto__ === Array.prototype;
  } catch (_) {
    if (!_ || "object" != typeof _ || !("code" in _) || "ERR_PROTO_ACCESS" !== _.code) throw _;
  }
  var f =
      !!p &&
      c &&
      c(
        Object.prototype,
        /** @type {keyof typeof Object.prototype} */
        "__proto__"
      ),
    a = Object,
    i = a.getPrototypeOf;
  return (o =
    f && "function" == typeof f.get
      ? n([f.get])
      : "function" == typeof i &&
        /** @type {import('./get')} */ function (t) {
          return i(null == t ? t : a(t));
        });
}
export { p as r };
