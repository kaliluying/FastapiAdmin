import { r as n } from "./function-bind.DrnB-baK.js";
import { d as r } from "./es-errors.DK26Ybqf.js";
var t, e, o, f, i, u, c, a, p, l;
function s() {
  return e ? t : ((e = 1), (t = Function.prototype.call));
}
function y() {
  return f ? o : ((f = 1), (o = Function.prototype.apply));
}
function d() {
  if (a) return c;
  a = 1;
  var r = n(),
    t = y(),
    e = s(),
    o = u ? i : ((u = 1), (i = "undefined" != typeof Reflect && Reflect && Reflect.apply));
  return (c = o || r.call(e, t));
}
function m() {
  if (l) return p;
  l = 1;
  var t = n(),
    e = r(),
    o = s(),
    f = d();
  return (p = function (n) {
    if (n.length < 1 || "function" != typeof n[0]) throw new e("a function is required");
    return f(t, o, n);
  });
}
export { y as a, s as b, m as r };
