var t, e, r, o;
function n() {
  if (o) return r;
  o = 1;
  var n = "undefined" != typeof Symbol && Symbol,
    y = e
      ? t
      : ((e = 1),
        (t = function () {
          if ("function" != typeof Symbol || "function" != typeof Object.getOwnPropertySymbols)
            return !1;
          if ("symbol" == typeof Symbol.iterator) return !0;
          var t = {},
            e = Symbol("test"),
            r = Object(e);
          if ("string" == typeof e) return !1;
          if ("[object Symbol]" !== Object.prototype.toString.call(e)) return !1;
          if ("[object Symbol]" !== Object.prototype.toString.call(r)) return !1;
          for (var o in ((t[e] = 42), t)) return !1;
          if ("function" == typeof Object.keys && 0 !== Object.keys(t).length) return !1;
          if (
            "function" == typeof Object.getOwnPropertyNames &&
            0 !== Object.getOwnPropertyNames(t).length
          )
            return !1;
          var n = Object.getOwnPropertySymbols(t);
          if (1 !== n.length || n[0] !== e) return !1;
          if (!Object.prototype.propertyIsEnumerable.call(t, e)) return !1;
          if ("function" == typeof Object.getOwnPropertyDescriptor) {
            var y = /** @type {PropertyDescriptor} */ Object.getOwnPropertyDescriptor(t, e);
            if (42 !== y.value || !0 !== y.enumerable) return !1;
          }
          return !0;
        }));
  return (r = function () {
    return (
      "function" == typeof n &&
      "function" == typeof Symbol &&
      "symbol" == typeof n("foo") &&
      "symbol" == typeof Symbol("bar") &&
      y()
    );
  });
}
export { n as r };
