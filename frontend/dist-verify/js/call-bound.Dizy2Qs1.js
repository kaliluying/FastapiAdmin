import { r } from "./get-intrinsic.BMeuD2ey.js";
import { r as t } from "./call-bind-apply-helpers.ubnPuw6U.js";
var n, o;
function i() {
  if (o) return n;
  o = 1;
  var i = r(),
    e = t(),
    p = e([i("%String.prototype.indexOf%")]);
  return (n = function (r, t) {
    var n = /** @type {(this: unknown, ...args: unknown[]) => unknown} */ i(r, !!t);
    return "function" == typeof n && p(r, ".prototype.") > -1
      ? e(
          /** @type {const} */
          [n]
        )
      : n;
  });
}
export { i as r };
