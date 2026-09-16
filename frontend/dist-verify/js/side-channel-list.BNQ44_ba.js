import { a as n } from "./object-inspect.Ju1NJVd1.js";
import { d as t } from "./es-errors.DK26Ybqf.js";
var e, r;
function o() {
  if (r) return e;
  r = 1;
  var o = n(),
    u = t(),
    i = function (n, t, e) {
      for (var r, o = n; null != (r = o.next); o = r)
        if (r.key === t)
          return (
            (o.next = r.next),
            e || ((r.next = /** @type {NonNullable<typeof list.next>} */ n.next), (n.next = r)),
            r
          );
    };
  return (e = function () {
    var n,
      t = {
        assert: function (n) {
          if (!t.has(n)) throw new u("Side channel does not contain " + o(n));
        },
        delete: function (t) {
          var e = (function (n, t) {
            if (n) return i(n, t, !0);
          })(n, t);
          return (e && n && !n.next && (n = void 0), !!e);
        },
        get: function (t) {
          return (function (n, t) {
            if (n) {
              var e = i(n, t);
              return e && e.value;
            }
          })(n, t);
        },
        has: function (t) {
          return (function (n, t) {
            return !!n && !!i(n, t);
          })(n, t);
        },
        set: function (t, e) {
          (n || (n = { next: void 0 }),
            (function (n, t, e) {
              var r = i(n, t);
              r
                ? (r.value = e)
                : (n.next =
                    /** @type {import('./list.d.ts').ListNode<typeof value, typeof key>} */
                    {
                      // eslint-disable-line no-param-reassign, no-extra-parens
                      key: t,
                      next: n.next,
                      value: e,
                    });
            })(
              /** @type {NonNullable<typeof $o>} */
              n,
              t,
              e
            ));
        },
      };
    return t;
  });
}
export { o as r };
