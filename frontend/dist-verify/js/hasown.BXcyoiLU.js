import { r } from "./function-bind.DrnB-baK.js";
var t, o;
function n() {
  if (o) return t;
  o = 1;
  var n = Function.prototype.call,
    a = Object.prototype.hasOwnProperty,
    e = r();
  return (t = e.call(n, a));
}
export { n as r };
