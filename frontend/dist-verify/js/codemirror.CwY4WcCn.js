import { f as e } from "./dayjs.BHSg66Ch.js";
import { s as t } from "./diff-match-patch.B0ZLOaK6.js";
import {
  z as n,
  al as r,
  br as i,
  a7 as o,
  ag as l,
  p as a,
  n as s,
  a0 as u,
  aI as c,
  as as f,
  a4 as d,
  a2 as h,
  au as p,
  D as g,
  a1 as v,
  j as m,
  ac as y,
  _ as b,
} from "./vue-vendor.Dwx3gfQr.js";
var w,
  x,
  C = {},
  S = { exports: {} };
function k() {
  return (
    w ||
      ((w = 1),
      (S.exports = (function () {
        var e = navigator.userAgent,
          t = navigator.platform,
          n = /gecko\/\d/i.test(e),
          r = /MSIE \d/.test(e),
          i = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(e),
          o = /Edge\/(\d+)/.exec(e),
          l = r || i || o,
          a = l && (r ? document.documentMode || 6 : +(o || i)[1]),
          s = !o && /WebKit\//.test(e),
          u = s && /Qt\/\d+\.\d+/.test(e),
          c = !o && /Chrome\/(\d+)/.exec(e),
          f = c && +c[1],
          d = /Opera\//.test(e),
          h = /Apple Computer/.test(navigator.vendor),
          p = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(e),
          g = /PhantomJS/.test(e),
          v = h && (/Mobile\/\w+/.test(e) || navigator.maxTouchPoints > 2),
          m = /Android/.test(e),
          y = v || m || /webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(e),
          b = v || /Mac/.test(t),
          w = /\bCrOS\b/.test(e),
          x = /win/i.test(t),
          C = d && e.match(/Version\/(\d*\.\d*)/);
        (C && (C = Number(C[1])), C && C >= 15 && ((d = !1), (s = !0)));
        var S = b && (u || (d && (null == C || C < 12.11))),
          k = n || (l && a >= 9);
        function L(e) {
          return new RegExp("(^|\\s)" + e + "(?:$|\\s)\\s*");
        }
        var T,
          M = function (e, t) {
            var n = e.className,
              r = L(t).exec(n);
            if (r) {
              var i = n.slice(r.index + r[0].length);
              e.className = n.slice(0, r.index) + (i ? r[1] + i : "");
            }
          };
        function O(e) {
          for (var t = e.childNodes.length; t > 0; --t) e.removeChild(e.firstChild);
          return e;
        }
        function N(e, t) {
          return O(e).appendChild(t);
        }
        function A(e, t, n, r) {
          var i = document.createElement(e);
          if ((n && (i.className = n), r && (i.style.cssText = r), "string" == typeof t))
            i.appendChild(document.createTextNode(t));
          else if (t) for (var o = 0; o < t.length; ++o) i.appendChild(t[o]);
          return i;
        }
        function D(e, t, n, r) {
          var i = A(e, t, n, r);
          return (i.setAttribute("role", "presentation"), i);
        }
        function F(e, t) {
          if ((3 == t.nodeType && (t = t.parentNode), e.contains)) return e.contains(t);
          do {
            if ((11 == t.nodeType && (t = t.host), t == e)) return !0;
          } while ((t = t.parentNode));
        }
        function W(e) {
          var t,
            n = e.ownerDocument || e;
          try {
            t = e.activeElement;
          } catch (Re) {
            t = n.body || null;
          }
          for (; t && t.shadowRoot && t.shadowRoot.activeElement; ) t = t.shadowRoot.activeElement;
          return t;
        }
        function E(e, t) {
          var n = e.className;
          L(t).test(n) || (e.className += (n ? " " : "") + t);
        }
        function H(e, t) {
          for (var n = e.split(" "), r = 0; r < n.length; r++)
            n[r] && !L(n[r]).test(t) && (t += " " + n[r]);
          return t;
        }
        T = document.createRange
          ? function (e, t, n, r) {
              var i = document.createRange();
              return (i.setEnd(r || e, n), i.setStart(e, t), i);
            }
          : function (e, t, n) {
              var r = document.body.createTextRange();
              try {
                r.moveToElementText(e.parentNode);
              } catch (Re) {
                return r;
              }
              return (r.collapse(!0), r.moveEnd("character", n), r.moveStart("character", t), r);
            };
        var P = function (e) {
          e.select();
        };
        function I(e) {
          return e.display.wrapper.ownerDocument;
        }
        function R(e) {
          return z(e.display.wrapper);
        }
        function z(e) {
          return e.getRootNode ? e.getRootNode() : e.ownerDocument;
        }
        function B(e) {
          return I(e).defaultView;
        }
        function V(e) {
          var t = Array.prototype.slice.call(arguments, 1);
          return function () {
            return e.apply(null, t);
          };
        }
        function G(e, t, n) {
          for (var r in (t || (t = {}), e))
            !Object.prototype.hasOwnProperty.call(e, r) ||
              (!1 === n && Object.prototype.hasOwnProperty.call(t, r)) ||
              (t[r] = e[r]);
          return t;
        }
        function U(e, t, n, r, i) {
          null == t && -1 == (t = e.search(/[^\s\u00a0]/)) && (t = e.length);
          for (var o = r || 0, l = i || 0; ; ) {
            var a = e.indexOf("\t", o);
            if (a < 0 || a >= t) return l + (t - o);
            ((l += a - o), (l += n - (l % n)), (o = a + 1));
          }
        }
        v
          ? (P = function (e) {
              ((e.selectionStart = 0), (e.selectionEnd = e.value.length));
            })
          : l &&
            (P = function (e) {
              try {
                e.select();
              } catch (t) {}
            });
        var _ = function () {
          ((this.id = null),
            (this.f = null),
            (this.time = 0),
            (this.handler = V(this.onTimeout, this)));
        };
        function j(e, t) {
          for (var n = 0; n < e.length; ++n) if (e[n] == t) return n;
          return -1;
        }
        ((_.prototype.onTimeout = function (e) {
          ((e.id = 0), e.time <= +new Date() ? e.f() : setTimeout(e.handler, e.time - +new Date()));
        }),
          (_.prototype.set = function (e, t) {
            this.f = t;
            var n = +new Date() + e;
            (!this.id || n < this.time) &&
              (clearTimeout(this.id), (this.id = setTimeout(this.handler, e)), (this.time = n));
          }));
        var K = 50,
          $ = {
            toString: function () {
              return "CodeMirror.Pass";
            },
          },
          X = { scroll: !1 },
          Y = { origin: "*mouse" },
          q = { origin: "+move" };
        function Z(e, t, n) {
          for (var r = 0, i = 0; ; ) {
            var o = e.indexOf("\t", r);
            -1 == o && (o = e.length);
            var l = o - r;
            if (o == e.length || i + l >= t) return r + Math.min(l, t - i);
            if (((i += o - r), (r = o + 1), (i += n - (i % n)) >= t)) return r;
          }
        }
        var Q = [""];
        function J(e) {
          for (; Q.length <= e; ) Q.push(ee(Q) + " ");
          return Q[e];
        }
        function ee(e) {
          return e[e.length - 1];
        }
        function te(e, t) {
          for (var n = [], r = 0; r < e.length; r++) n[r] = t(e[r], r);
          return n;
        }
        function ne(e, t, n) {
          for (var r = 0, i = n(t); r < e.length && n(e[r]) <= i; ) r++;
          e.splice(r, 0, t);
        }
        function re() {}
        function ie(e, t) {
          var n;
          return (
            Object.create ? (n = Object.create(e)) : ((re.prototype = e), (n = new re())),
            t && G(t, n),
            n
          );
        }
        var oe =
          /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
        function le(e) {
          return /\w/.test(e) || (e > "" && (e.toUpperCase() != e.toLowerCase() || oe.test(e)));
        }
        function ae(e, t) {
          return t ? !!(t.source.indexOf("\\w") > -1 && le(e)) || t.test(e) : le(e);
        }
        function se(e) {
          for (var t in e) if (e.hasOwnProperty(t) && e[t]) return !1;
          return !0;
        }
        var ue =
          /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;
        function ce(e) {
          return e.charCodeAt(0) >= 768 && ue.test(e);
        }
        function fe(e, t, n) {
          for (; (n < 0 ? t > 0 : t < e.length) && ce(e.charAt(t)); ) t += n;
          return t;
        }
        function de(e, t, n) {
          for (var r = t > n ? -1 : 1; ; ) {
            if (t == n) return t;
            var i = (t + n) / 2,
              o = r < 0 ? Math.ceil(i) : Math.floor(i);
            if (o == t) return e(o) ? t : n;
            e(o) ? (n = o) : (t = o + r);
          }
        }
        function he(e, t, n, r) {
          if (!e) return r(t, n, "ltr", 0);
          for (var i = !1, o = 0; o < e.length; ++o) {
            var l = e[o];
            ((l.from < n && l.to > t) || (t == n && l.to == t)) &&
              (r(Math.max(l.from, t), Math.min(l.to, n), 1 == l.level ? "rtl" : "ltr", o),
              (i = !0));
          }
          i || r(t, n, "ltr");
        }
        var pe = null;
        function ge(e, t, n) {
          var r;
          pe = null;
          for (var i = 0; i < e.length; ++i) {
            var o = e[i];
            if (o.from < t && o.to > t) return i;
            (o.to == t && (o.from != o.to && "before" == n ? (r = i) : (pe = i)),
              o.from == t && (o.from != o.to && "before" != n ? (r = i) : (pe = i)));
          }
          return null != r ? r : pe;
        }
        var ve = (function () {
          var e =
              "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN",
            t =
              "nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111";
          function n(n) {
            return n <= 247
              ? e.charAt(n)
              : 1424 <= n && n <= 1524
                ? "R"
                : 1536 <= n && n <= 1785
                  ? t.charAt(n - 1536)
                  : 1774 <= n && n <= 2220
                    ? "r"
                    : 8192 <= n && n <= 8203
                      ? "w"
                      : 8204 == n
                        ? "b"
                        : "L";
          }
          var r = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/,
            i = /[stwN]/,
            o = /[LRr]/,
            l = /[Lb1n]/,
            a = /[1n]/;
          function s(e, t, n) {
            ((this.level = e), (this.from = t), (this.to = n));
          }
          return function (e, t) {
            var u = "ltr" == t ? "L" : "R";
            if (0 == e.length || ("ltr" == t && !r.test(e))) return !1;
            for (var c = e.length, f = [], d = 0; d < c; ++d) f.push(n(e.charCodeAt(d)));
            for (var h = 0, p = u; h < c; ++h) {
              var g = f[h];
              "m" == g ? (f[h] = p) : (p = g);
            }
            for (var v = 0, m = u; v < c; ++v) {
              var y = f[v];
              "1" == y && "r" == m
                ? (f[v] = "n")
                : o.test(y) && ((m = y), "r" == y && (f[v] = "R"));
            }
            for (var b = 1, w = f[0]; b < c - 1; ++b) {
              var x = f[b];
              ("+" == x && "1" == w && "1" == f[b + 1]
                ? (f[b] = "1")
                : "," != x || w != f[b + 1] || ("1" != w && "n" != w) || (f[b] = w),
                (w = x));
            }
            for (var C = 0; C < c; ++C) {
              var S = f[C];
              if ("," == S) f[C] = "N";
              else if ("%" == S) {
                var k = void 0;
                for (k = C + 1; k < c && "%" == f[k]; ++k);
                for (
                  var L = (C && "!" == f[C - 1]) || (k < c && "1" == f[k]) ? "1" : "N", T = C;
                  T < k;
                  ++T
                )
                  f[T] = L;
                C = k - 1;
              }
            }
            for (var M = 0, O = u; M < c; ++M) {
              var N = f[M];
              "L" == O && "1" == N ? (f[M] = "L") : o.test(N) && (O = N);
            }
            for (var A = 0; A < c; ++A)
              if (i.test(f[A])) {
                var D = void 0;
                for (D = A + 1; D < c && i.test(f[D]); ++D);
                for (
                  var F = "L" == (A ? f[A - 1] : u),
                    W = F == ("L" == (D < c ? f[D] : u)) ? (F ? "L" : "R") : u,
                    E = A;
                  E < D;
                  ++E
                )
                  f[E] = W;
                A = D - 1;
              }
            for (var H, P = [], I = 0; I < c; )
              if (l.test(f[I])) {
                var R = I;
                for (++I; I < c && l.test(f[I]); ++I);
                P.push(new s(0, R, I));
              } else {
                var z = I,
                  B = P.length,
                  V = "rtl" == t ? 1 : 0;
                for (++I; I < c && "L" != f[I]; ++I);
                for (var G = z; G < I; )
                  if (a.test(f[G])) {
                    z < G && (P.splice(B, 0, new s(1, z, G)), (B += V));
                    var U = G;
                    for (++G; G < I && a.test(f[G]); ++G);
                    (P.splice(B, 0, new s(2, U, G)), (B += V), (z = G));
                  } else ++G;
                z < I && P.splice(B, 0, new s(1, z, I));
              }
            return (
              "ltr" == t &&
                (1 == P[0].level &&
                  (H = e.match(/^\s+/)) &&
                  ((P[0].from = H[0].length), P.unshift(new s(0, 0, H[0].length))),
                1 == ee(P).level &&
                  (H = e.match(/\s+$/)) &&
                  ((ee(P).to -= H[0].length), P.push(new s(0, c - H[0].length, c)))),
              "rtl" == t ? P.reverse() : P
            );
          };
        })();
        function me(e, t) {
          var n = e.order;
          return (null == n && (n = e.order = ve(e.text, t)), n);
        }
        var ye = [],
          be = function (e, t, n) {
            if (e.addEventListener) e.addEventListener(t, n, !1);
            else if (e.attachEvent) e.attachEvent("on" + t, n);
            else {
              var r = e._handlers || (e._handlers = {});
              r[t] = (r[t] || ye).concat(n);
            }
          };
        function we(e, t) {
          return (e._handlers && e._handlers[t]) || ye;
        }
        function xe(e, t, n) {
          if (e.removeEventListener) e.removeEventListener(t, n, !1);
          else if (e.detachEvent) e.detachEvent("on" + t, n);
          else {
            var r = e._handlers,
              i = r && r[t];
            if (i) {
              var o = j(i, n);
              o > -1 && (r[t] = i.slice(0, o).concat(i.slice(o + 1)));
            }
          }
        }
        function Ce(e, t) {
          var n = we(e, t);
          if (n.length)
            for (var r = Array.prototype.slice.call(arguments, 2), i = 0; i < n.length; ++i)
              n[i].apply(null, r);
        }
        function Se(e, t, n) {
          return (
            "string" == typeof t &&
              (t = {
                type: t,
                preventDefault: function () {
                  this.defaultPrevented = !0;
                },
              }),
            Ce(e, n || t.type, e, t),
            Ne(t) || t.codemirrorIgnore
          );
        }
        function ke(e) {
          var t = e._handlers && e._handlers.cursorActivity;
          if (t)
            for (
              var n = e.curOp.cursorActivityHandlers || (e.curOp.cursorActivityHandlers = []),
                r = 0;
              r < t.length;
              ++r
            )
              -1 == j(n, t[r]) && n.push(t[r]);
        }
        function Le(e, t) {
          return we(e, t).length > 0;
        }
        function Te(e) {
          ((e.prototype.on = function (e, t) {
            be(this, e, t);
          }),
            (e.prototype.off = function (e, t) {
              xe(this, e, t);
            }));
        }
        function Me(e) {
          e.preventDefault ? e.preventDefault() : (e.returnValue = !1);
        }
        function Oe(e) {
          e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = !0);
        }
        function Ne(e) {
          return null != e.defaultPrevented ? e.defaultPrevented : 0 == e.returnValue;
        }
        function Ae(e) {
          (Me(e), Oe(e));
        }
        function De(e) {
          return e.target || e.srcElement;
        }
        function Fe(e) {
          var t = e.which;
          return (
            null == t &&
              (1 & e.button ? (t = 1) : 2 & e.button ? (t = 3) : 4 & e.button && (t = 2)),
            b && e.ctrlKey && 1 == t && (t = 3),
            t
          );
        }
        var We,
          Ee,
          He = (function () {
            if (l && a < 9) return !1;
            var e = A("div");
            return "draggable" in e || "dragDrop" in e;
          })();
        function Pe(e) {
          if (null == We) {
            var t = A("span", "​");
            (N(e, A("span", [t, document.createTextNode("x")])),
              0 != e.firstChild.offsetHeight &&
                (We = t.offsetWidth <= 1 && t.offsetHeight > 2 && !(l && a < 8)));
          }
          var n = We
            ? A("span", "​")
            : A("span", " ", null, "display: inline-block; width: 1px; margin-right: -1px");
          return (n.setAttribute("cm-text", ""), n);
        }
        function Ie(e) {
          if (null != Ee) return Ee;
          var t = N(e, document.createTextNode("AخA")),
            n = T(t, 0, 1).getBoundingClientRect(),
            r = T(t, 1, 2).getBoundingClientRect();
          return (O(e), !(!n || n.left == n.right) && (Ee = r.right - n.right < 3));
        }
        var Re,
          ze =
            3 != "\n\nb".split(/\n/).length
              ? function (e) {
                  for (var t = 0, n = [], r = e.length; t <= r; ) {
                    var i = e.indexOf("\n", t);
                    -1 == i && (i = e.length);
                    var o = e.slice(t, "\r" == e.charAt(i - 1) ? i - 1 : i),
                      l = o.indexOf("\r");
                    -1 != l ? (n.push(o.slice(0, l)), (t += l + 1)) : (n.push(o), (t = i + 1));
                  }
                  return n;
                }
              : function (e) {
                  return e.split(/\r\n?|\n/);
                },
          Be = window.getSelection
            ? function (e) {
                try {
                  return e.selectionStart != e.selectionEnd;
                } catch (Re) {
                  return !1;
                }
              }
            : function (e) {
                var t;
                try {
                  t = e.ownerDocument.selection.createRange();
                } catch (Re) {}
                return !(!t || t.parentElement() != e) && 0 != t.compareEndPoints("StartToEnd", t);
              },
          Ve =
            "oncopy" in (Re = A("div")) ||
            (Re.setAttribute("oncopy", "return;"), "function" == typeof Re.oncopy),
          Ge = null;
        function Ue(e) {
          if (null != Ge) return Ge;
          var t = N(e, A("span", "x")),
            n = t.getBoundingClientRect(),
            r = T(t, 0, 1).getBoundingClientRect();
          return (Ge = Math.abs(n.left - r.left) > 1);
        }
        var _e = {},
          je = {};
        function Ke(e, t) {
          (arguments.length > 2 && (t.dependencies = Array.prototype.slice.call(arguments, 2)),
            (_e[e] = t));
        }
        function $e(e, t) {
          je[e] = t;
        }
        function Xe(e) {
          if ("string" == typeof e && je.hasOwnProperty(e)) e = je[e];
          else if (e && "string" == typeof e.name && je.hasOwnProperty(e.name)) {
            var t = je[e.name];
            ("string" == typeof t && (t = { name: t }), ((e = ie(t, e)).name = t.name));
          } else {
            if ("string" == typeof e && /^[\w\-]+\/[\w\-]+\+xml$/.test(e))
              return Xe("application/xml");
            if ("string" == typeof e && /^[\w\-]+\/[\w\-]+\+json$/.test(e))
              return Xe("application/json");
          }
          return "string" == typeof e ? { name: e } : e || { name: "null" };
        }
        function Ye(e, t) {
          t = Xe(t);
          var n = _e[t.name];
          if (!n) return Ye(e, "text/plain");
          var r = n(e, t);
          if (qe.hasOwnProperty(t.name)) {
            var i = qe[t.name];
            for (var o in i)
              i.hasOwnProperty(o) && (r.hasOwnProperty(o) && (r["_" + o] = r[o]), (r[o] = i[o]));
          }
          if (((r.name = t.name), t.helperType && (r.helperType = t.helperType), t.modeProps))
            for (var l in t.modeProps) r[l] = t.modeProps[l];
          return r;
        }
        var qe = {};
        function Ze(e, t) {
          G(t, qe.hasOwnProperty(e) ? qe[e] : (qe[e] = {}));
        }
        function Qe(e, t) {
          if (!0 === t) return t;
          if (e.copyState) return e.copyState(t);
          var n = {};
          for (var r in t) {
            var i = t[r];
            (i instanceof Array && (i = i.concat([])), (n[r] = i));
          }
          return n;
        }
        function Je(e, t) {
          for (var n; e.innerMode && (n = e.innerMode(t)) && n.mode != e; )
            ((t = n.state), (e = n.mode));
          return n || { mode: e, state: t };
        }
        function et(e, t, n) {
          return !e.startState || e.startState(t, n);
        }
        var tt = function (e, t, n) {
          ((this.pos = this.start = 0),
            (this.string = e),
            (this.tabSize = t || 8),
            (this.lastColumnPos = this.lastColumnValue = 0),
            (this.lineStart = 0),
            (this.lineOracle = n));
        };
        function nt(e, t) {
          if ((t -= e.first) < 0 || t >= e.size)
            throw new Error("There is no line " + (t + e.first) + " in the document.");
          for (var n = e; !n.lines; )
            for (var r = 0; ; ++r) {
              var i = n.children[r],
                o = i.chunkSize();
              if (t < o) {
                n = i;
                break;
              }
              t -= o;
            }
          return n.lines[t];
        }
        function rt(e, t, n) {
          var r = [],
            i = t.line;
          return (
            e.iter(t.line, n.line + 1, function (e) {
              var o = e.text;
              (i == n.line && (o = o.slice(0, n.ch)),
                i == t.line && (o = o.slice(t.ch)),
                r.push(o),
                ++i);
            }),
            r
          );
        }
        function it(e, t, n) {
          var r = [];
          return (
            e.iter(t, n, function (e) {
              r.push(e.text);
            }),
            r
          );
        }
        function ot(e, t) {
          var n = t - e.height;
          if (n) for (var r = e; r; r = r.parent) r.height += n;
        }
        function lt(e) {
          if (null == e.parent) return null;
          for (var t = e.parent, n = j(t.lines, e), r = t.parent; r; t = r, r = r.parent)
            for (var i = 0; r.children[i] != t; ++i) n += r.children[i].chunkSize();
          return n + t.first;
        }
        function at(e, t) {
          var n = e.first;
          e: do {
            for (var r = 0; r < e.children.length; ++r) {
              var i = e.children[r],
                o = i.height;
              if (t < o) {
                e = i;
                continue e;
              }
              ((t -= o), (n += i.chunkSize()));
            }
            return n;
          } while (!e.lines);
          for (var l = 0; l < e.lines.length; ++l) {
            var a = e.lines[l].height;
            if (t < a) break;
            t -= a;
          }
          return n + l;
        }
        function st(e, t) {
          return t >= e.first && t < e.first + e.size;
        }
        function ut(e, t) {
          return String(e.lineNumberFormatter(t + e.firstLineNumber));
        }
        function ct(e, t, n) {
          if ((void 0 === n && (n = null), !(this instanceof ct))) return new ct(e, t, n);
          ((this.line = e), (this.ch = t), (this.sticky = n));
        }
        function ft(e, t) {
          return e.line - t.line || e.ch - t.ch;
        }
        function dt(e, t) {
          return e.sticky == t.sticky && 0 == ft(e, t);
        }
        function ht(e) {
          return ct(e.line, e.ch);
        }
        function pt(e, t) {
          return ft(e, t) < 0 ? t : e;
        }
        function gt(e, t) {
          return ft(e, t) < 0 ? e : t;
        }
        function vt(e, t) {
          return Math.max(e.first, Math.min(t, e.first + e.size - 1));
        }
        function mt(e, t) {
          if (t.line < e.first) return ct(e.first, 0);
          var n = e.first + e.size - 1;
          return t.line > n ? ct(n, nt(e, n).text.length) : yt(t, nt(e, t.line).text.length);
        }
        function yt(e, t) {
          var n = e.ch;
          return null == n || n > t ? ct(e.line, t) : n < 0 ? ct(e.line, 0) : e;
        }
        function bt(e, t) {
          for (var n = [], r = 0; r < t.length; r++) n[r] = mt(e, t[r]);
          return n;
        }
        ((tt.prototype.eol = function () {
          return this.pos >= this.string.length;
        }),
          (tt.prototype.sol = function () {
            return this.pos == this.lineStart;
          }),
          (tt.prototype.peek = function () {
            return this.string.charAt(this.pos) || void 0;
          }),
          (tt.prototype.next = function () {
            if (this.pos < this.string.length) return this.string.charAt(this.pos++);
          }),
          (tt.prototype.eat = function (e) {
            var t = this.string.charAt(this.pos);
            if ("string" == typeof e ? t == e : t && (e.test ? e.test(t) : e(t)))
              return (++this.pos, t);
          }),
          (tt.prototype.eatWhile = function (e) {
            for (var t = this.pos; this.eat(e); );
            return this.pos > t;
          }),
          (tt.prototype.eatSpace = function () {
            for (var e = this.pos; /[\s\u00a0]/.test(this.string.charAt(this.pos)); ) ++this.pos;
            return this.pos > e;
          }),
          (tt.prototype.skipToEnd = function () {
            this.pos = this.string.length;
          }),
          (tt.prototype.skipTo = function (e) {
            var t = this.string.indexOf(e, this.pos);
            if (t > -1) return ((this.pos = t), !0);
          }),
          (tt.prototype.backUp = function (e) {
            this.pos -= e;
          }),
          (tt.prototype.column = function () {
            return (
              this.lastColumnPos < this.start &&
                ((this.lastColumnValue = U(
                  this.string,
                  this.start,
                  this.tabSize,
                  this.lastColumnPos,
                  this.lastColumnValue
                )),
                (this.lastColumnPos = this.start)),
              this.lastColumnValue -
                (this.lineStart ? U(this.string, this.lineStart, this.tabSize) : 0)
            );
          }),
          (tt.prototype.indentation = function () {
            return (
              U(this.string, null, this.tabSize) -
              (this.lineStart ? U(this.string, this.lineStart, this.tabSize) : 0)
            );
          }),
          (tt.prototype.match = function (e, t, n) {
            if ("string" != typeof e) {
              var r = this.string.slice(this.pos).match(e);
              return r && r.index > 0 ? null : (r && !1 !== t && (this.pos += r[0].length), r);
            }
            var i = function (e) {
              return n ? e.toLowerCase() : e;
            };
            if (i(this.string.substr(this.pos, e.length)) == i(e))
              return (!1 !== t && (this.pos += e.length), !0);
          }),
          (tt.prototype.current = function () {
            return this.string.slice(this.start, this.pos);
          }),
          (tt.prototype.hideFirstChars = function (e, t) {
            this.lineStart += e;
            try {
              return t();
            } finally {
              this.lineStart -= e;
            }
          }),
          (tt.prototype.lookAhead = function (e) {
            var t = this.lineOracle;
            return t && t.lookAhead(e);
          }),
          (tt.prototype.baseToken = function () {
            var e = this.lineOracle;
            return e && e.baseToken(this.pos);
          }));
        var wt = function (e, t) {
            ((this.state = e), (this.lookAhead = t));
          },
          xt = function (e, t, n, r) {
            ((this.state = t),
              (this.doc = e),
              (this.line = n),
              (this.maxLookAhead = r || 0),
              (this.baseTokens = null),
              (this.baseTokenPos = 1));
          };
        function Ct(e, t, n, r) {
          var i = [e.state.modeGen],
            o = {};
          Dt(
            e,
            t.text,
            e.doc.mode,
            n,
            function (e, t) {
              return i.push(e, t);
            },
            o,
            r
          );
          for (
            var l = n.state,
              a = function (r) {
                n.baseTokens = i;
                var a = e.state.overlays[r],
                  s = 1,
                  u = 0;
                ((n.state = !0),
                  Dt(
                    e,
                    t.text,
                    a.mode,
                    n,
                    function (e, t) {
                      for (var n = s; u < e; ) {
                        var r = i[s];
                        (r > e && i.splice(s, 1, e, i[s + 1], r), (s += 2), (u = Math.min(e, r)));
                      }
                      if (t)
                        if (a.opaque) (i.splice(n, s - n, e, "overlay " + t), (s = n + 2));
                        else
                          for (; n < s; n += 2) {
                            var o = i[n + 1];
                            i[n + 1] = (o ? o + " " : "") + "overlay " + t;
                          }
                    },
                    o
                  ),
                  (n.state = l),
                  (n.baseTokens = null),
                  (n.baseTokenPos = 1));
              },
              s = 0;
            s < e.state.overlays.length;
            ++s
          )
            a(s);
          return { styles: i, classes: o.bgClass || o.textClass ? o : null };
        }
        function St(e, t, n) {
          if (!t.styles || t.styles[0] != e.state.modeGen) {
            var r = kt(e, lt(t)),
              i = t.text.length > e.options.maxHighlightLength && Qe(e.doc.mode, r.state),
              o = Ct(e, t, r);
            (i && (r.state = i),
              (t.stateAfter = r.save(!i)),
              (t.styles = o.styles),
              o.classes ? (t.styleClasses = o.classes) : t.styleClasses && (t.styleClasses = null),
              n === e.doc.highlightFrontier &&
                (e.doc.modeFrontier = Math.max(e.doc.modeFrontier, ++e.doc.highlightFrontier)));
          }
          return t.styles;
        }
        function kt(e, t, n) {
          var r = e.doc,
            i = e.display;
          if (!r.mode.startState) return new xt(r, !0, t);
          var o = Ft(e, t, n),
            l = o > r.first && nt(r, o - 1).stateAfter,
            a = l ? xt.fromSaved(r, l, o) : new xt(r, et(r.mode), o);
          return (
            r.iter(o, t, function (n) {
              Lt(e, n.text, a);
              var r = a.line;
              ((n.stateAfter =
                r == t - 1 || r % 5 == 0 || (r >= i.viewFrom && r < i.viewTo) ? a.save() : null),
                a.nextLine());
            }),
            n && (r.modeFrontier = a.line),
            a
          );
        }
        function Lt(e, t, n, r) {
          var i = e.doc.mode,
            o = new tt(t, e.options.tabSize, n);
          for (o.start = o.pos = r || 0, "" == t && Tt(i, n.state); !o.eol(); )
            (Mt(i, o, n.state), (o.start = o.pos));
        }
        function Tt(e, t) {
          if (e.blankLine) return e.blankLine(t);
          if (e.innerMode) {
            var n = Je(e, t);
            return n.mode.blankLine ? n.mode.blankLine(n.state) : void 0;
          }
        }
        function Mt(e, t, n, r) {
          for (var i = 0; i < 10; i++) {
            r && (r[0] = Je(e, n).mode);
            var o = e.token(t, n);
            if (t.pos > t.start) return o;
          }
          throw new Error("Mode " + e.name + " failed to advance stream.");
        }
        ((xt.prototype.lookAhead = function (e) {
          var t = this.doc.getLine(this.line + e);
          return (null != t && e > this.maxLookAhead && (this.maxLookAhead = e), t);
        }),
          (xt.prototype.baseToken = function (e) {
            if (!this.baseTokens) return null;
            for (; this.baseTokens[this.baseTokenPos] <= e; ) this.baseTokenPos += 2;
            var t = this.baseTokens[this.baseTokenPos + 1];
            return {
              type: t && t.replace(/( |^)overlay .*/, ""),
              size: this.baseTokens[this.baseTokenPos] - e,
            };
          }),
          (xt.prototype.nextLine = function () {
            (this.line++, this.maxLookAhead > 0 && this.maxLookAhead--);
          }),
          (xt.fromSaved = function (e, t, n) {
            return t instanceof wt
              ? new xt(e, Qe(e.mode, t.state), n, t.lookAhead)
              : new xt(e, Qe(e.mode, t), n);
          }),
          (xt.prototype.save = function (e) {
            var t = !1 !== e ? Qe(this.doc.mode, this.state) : this.state;
            return this.maxLookAhead > 0 ? new wt(t, this.maxLookAhead) : t;
          }));
        var Ot = function (e, t, n) {
          ((this.start = e.start),
            (this.end = e.pos),
            (this.string = e.current()),
            (this.type = t || null),
            (this.state = n));
        };
        function Nt(e, t, n, r) {
          var i,
            o,
            l = e.doc,
            a = l.mode,
            s = nt(l, (t = mt(l, t)).line),
            u = kt(e, t.line, n),
            c = new tt(s.text, e.options.tabSize, u);
          for (r && (o = []); (r || c.pos < t.ch) && !c.eol(); )
            ((c.start = c.pos),
              (i = Mt(a, c, u.state)),
              r && o.push(new Ot(c, i, Qe(l.mode, u.state))));
          return r ? o : new Ot(c, i, u.state);
        }
        function At(e, t) {
          if (e)
            for (;;) {
              var n = e.match(/(?:^|\s+)line-(background-)?(\S+)/);
              if (!n) break;
              e = e.slice(0, n.index) + e.slice(n.index + n[0].length);
              var r = n[1] ? "bgClass" : "textClass";
              null == t[r]
                ? (t[r] = n[2])
                : new RegExp("(?:^|\\s)" + n[2] + "(?:$|\\s)").test(t[r]) || (t[r] += " " + n[2]);
            }
          return e;
        }
        function Dt(e, t, n, r, i, o, l) {
          var a = n.flattenSpans;
          null == a && (a = e.options.flattenSpans);
          var s,
            u = 0,
            c = null,
            f = new tt(t, e.options.tabSize, r),
            d = e.options.addModeClass && [null];
          for ("" == t && At(Tt(n, r.state), o); !f.eol(); ) {
            if (
              (f.pos > e.options.maxHighlightLength
                ? ((a = !1), l && Lt(e, t, r, f.pos), (f.pos = t.length), (s = null))
                : (s = At(Mt(n, f, r.state, d), o)),
              d)
            ) {
              var h = d[0].name;
              h && (s = "m-" + (s ? h + " " + s : h));
            }
            if (!a || c != s) {
              for (; u < f.start; ) i((u = Math.min(f.start, u + 5e3)), c);
              c = s;
            }
            f.start = f.pos;
          }
          for (; u < f.pos; ) {
            var p = Math.min(f.pos, u + 5e3);
            (i(p, c), (u = p));
          }
        }
        function Ft(e, t, n) {
          for (
            var r, i, o = e.doc, l = n ? -1 : t - (e.doc.mode.innerMode ? 1e3 : 100), a = t;
            a > l;
            --a
          ) {
            if (a <= o.first) return o.first;
            var s = nt(o, a - 1),
              u = s.stateAfter;
            if (u && (!n || a + (u instanceof wt ? u.lookAhead : 0) <= o.modeFrontier)) return a;
            var c = U(s.text, null, e.options.tabSize);
            (null == i || r > c) && ((i = a - 1), (r = c));
          }
          return i;
        }
        function Wt(e, t) {
          if (((e.modeFrontier = Math.min(e.modeFrontier, t)), !(e.highlightFrontier < t - 10))) {
            for (var n = e.first, r = t - 1; r > n; r--) {
              var i = nt(e, r).stateAfter;
              if (i && (!(i instanceof wt) || r + i.lookAhead < t)) {
                n = r + 1;
                break;
              }
            }
            e.highlightFrontier = Math.min(e.highlightFrontier, n);
          }
        }
        var Et = !1,
          Ht = !1;
        function Pt() {
          Et = !0;
        }
        function It() {
          Ht = !0;
        }
        function Rt(e, t, n) {
          ((this.marker = e), (this.from = t), (this.to = n));
        }
        function zt(e, t) {
          if (e)
            for (var n = 0; n < e.length; ++n) {
              var r = e[n];
              if (r.marker == t) return r;
            }
        }
        function Bt(e, t) {
          for (var n, r = 0; r < e.length; ++r) e[r] != t && (n || (n = [])).push(e[r]);
          return n;
        }
        function Vt(e, t, n) {
          var r = n && window.WeakSet && (n.markedSpans || (n.markedSpans = new WeakSet()));
          (r && e.markedSpans && r.has(e.markedSpans)
            ? e.markedSpans.push(t)
            : ((e.markedSpans = e.markedSpans ? e.markedSpans.concat([t]) : [t]),
              r && r.add(e.markedSpans)),
            t.marker.attachLine(e));
        }
        function Gt(e, t, n) {
          var r;
          if (e)
            for (var i = 0; i < e.length; ++i) {
              var o = e[i],
                l = o.marker;
              if (
                null == o.from ||
                (l.inclusiveLeft ? o.from <= t : o.from < t) ||
                (o.from == t && "bookmark" == l.type && (!n || !o.marker.insertLeft))
              ) {
                var a = null == o.to || (l.inclusiveRight ? o.to >= t : o.to > t);
                (r || (r = [])).push(new Rt(l, o.from, a ? null : o.to));
              }
            }
          return r;
        }
        function Ut(e, t, n) {
          var r;
          if (e)
            for (var i = 0; i < e.length; ++i) {
              var o = e[i],
                l = o.marker;
              if (
                null == o.to ||
                (l.inclusiveRight ? o.to >= t : o.to > t) ||
                (o.from == t && "bookmark" == l.type && (!n || o.marker.insertLeft))
              ) {
                var a = null == o.from || (l.inclusiveLeft ? o.from <= t : o.from < t);
                (r || (r = [])).push(
                  new Rt(l, a ? null : o.from - t, null == o.to ? null : o.to - t)
                );
              }
            }
          return r;
        }
        function _t(e, t) {
          if (t.full) return null;
          var n = st(e, t.from.line) && nt(e, t.from.line).markedSpans,
            r = st(e, t.to.line) && nt(e, t.to.line).markedSpans;
          if (!n && !r) return null;
          var i = t.from.ch,
            o = t.to.ch,
            l = 0 == ft(t.from, t.to),
            a = Gt(n, i, l),
            s = Ut(r, o, l),
            u = 1 == t.text.length,
            c = ee(t.text).length + (u ? i : 0);
          if (a)
            for (var f = 0; f < a.length; ++f) {
              var d = a[f];
              if (null == d.to) {
                var h = zt(s, d.marker);
                h ? u && (d.to = null == h.to ? null : h.to + c) : (d.to = i);
              }
            }
          if (s)
            for (var p = 0; p < s.length; ++p) {
              var g = s[p];
              (null != g.to && (g.to += c),
                null == g.from
                  ? zt(a, g.marker) || ((g.from = c), u && (a || (a = [])).push(g))
                  : ((g.from += c), u && (a || (a = [])).push(g)));
            }
          (a && (a = jt(a)), s && s != a && (s = jt(s)));
          var v = [a];
          if (!u) {
            var m,
              y = t.text.length - 2;
            if (y > 0 && a)
              for (var b = 0; b < a.length; ++b)
                null == a[b].to && (m || (m = [])).push(new Rt(a[b].marker, null, null));
            for (var w = 0; w < y; ++w) v.push(m);
            v.push(s);
          }
          return v;
        }
        function jt(e) {
          for (var t = 0; t < e.length; ++t) {
            var n = e[t];
            null != n.from && n.from == n.to && !1 !== n.marker.clearWhenEmpty && e.splice(t--, 1);
          }
          return e.length ? e : null;
        }
        function Kt(e, t, n) {
          var r = null;
          if (
            (e.iter(t.line, n.line + 1, function (e) {
              if (e.markedSpans)
                for (var t = 0; t < e.markedSpans.length; ++t) {
                  var n = e.markedSpans[t].marker;
                  !n.readOnly || (r && -1 != j(r, n)) || (r || (r = [])).push(n);
                }
            }),
            !r)
          )
            return null;
          for (var i = [{ from: t, to: n }], o = 0; o < r.length; ++o)
            for (var l = r[o], a = l.find(0), s = 0; s < i.length; ++s) {
              var u = i[s];
              if (!(ft(u.to, a.from) < 0 || ft(u.from, a.to) > 0)) {
                var c = [s, 1],
                  f = ft(u.from, a.from),
                  d = ft(u.to, a.to);
                ((f < 0 || (!l.inclusiveLeft && !f)) && c.push({ from: u.from, to: a.from }),
                  (d > 0 || (!l.inclusiveRight && !d)) && c.push({ from: a.to, to: u.to }),
                  i.splice.apply(i, c),
                  (s += c.length - 3));
              }
            }
          return i;
        }
        function $t(e) {
          var t = e.markedSpans;
          if (t) {
            for (var n = 0; n < t.length; ++n) t[n].marker.detachLine(e);
            e.markedSpans = null;
          }
        }
        function Xt(e, t) {
          if (t) {
            for (var n = 0; n < t.length; ++n) t[n].marker.attachLine(e);
            e.markedSpans = t;
          }
        }
        function Yt(e) {
          return e.inclusiveLeft ? -1 : 0;
        }
        function qt(e) {
          return e.inclusiveRight ? 1 : 0;
        }
        function Zt(e, t) {
          var n = e.lines.length - t.lines.length;
          if (0 != n) return n;
          var r = e.find(),
            i = t.find(),
            o = ft(r.from, i.from) || Yt(e) - Yt(t);
          if (o) return -o;
          var l = ft(r.to, i.to) || qt(e) - qt(t);
          return l || t.id - e.id;
        }
        function Qt(e, t) {
          var n,
            r = Ht && e.markedSpans;
          if (r)
            for (var i = void 0, o = 0; o < r.length; ++o)
              (i = r[o]).marker.collapsed &&
                null == (t ? i.from : i.to) &&
                (!n || Zt(n, i.marker) < 0) &&
                (n = i.marker);
          return n;
        }
        function Jt(e) {
          return Qt(e, !0);
        }
        function en(e) {
          return Qt(e, !1);
        }
        function tn(e, t) {
          var n,
            r = Ht && e.markedSpans;
          if (r)
            for (var i = 0; i < r.length; ++i) {
              var o = r[i];
              o.marker.collapsed &&
                (null == o.from || o.from < t) &&
                (null == o.to || o.to > t) &&
                (!n || Zt(n, o.marker) < 0) &&
                (n = o.marker);
            }
          return n;
        }
        function nn(e, t, n, r, i) {
          var o = nt(e, t),
            l = Ht && o.markedSpans;
          if (l)
            for (var a = 0; a < l.length; ++a) {
              var s = l[a];
              if (s.marker.collapsed) {
                var u = s.marker.find(0),
                  c = ft(u.from, n) || Yt(s.marker) - Yt(i),
                  f = ft(u.to, r) || qt(s.marker) - qt(i);
                if (
                  !((c >= 0 && f <= 0) || (c <= 0 && f >= 0)) &&
                  ((c <= 0 &&
                    (s.marker.inclusiveRight && i.inclusiveLeft
                      ? ft(u.to, n) >= 0
                      : ft(u.to, n) > 0)) ||
                    (c >= 0 &&
                      (s.marker.inclusiveRight && i.inclusiveLeft
                        ? ft(u.from, r) <= 0
                        : ft(u.from, r) < 0)))
                )
                  return !0;
              }
            }
        }
        function rn(e) {
          for (var t; (t = Jt(e)); ) e = t.find(-1, !0).line;
          return e;
        }
        function on(e) {
          for (var t; (t = en(e)); ) e = t.find(1, !0).line;
          return e;
        }
        function ln(e) {
          for (var t, n; (t = en(e)); ) ((e = t.find(1, !0).line), (n || (n = [])).push(e));
          return n;
        }
        function an(e, t) {
          var n = nt(e, t),
            r = rn(n);
          return n == r ? t : lt(r);
        }
        function sn(e, t) {
          if (t > e.lastLine()) return t;
          var n,
            r = nt(e, t);
          if (!un(e, r)) return t;
          for (; (n = en(r)); ) r = n.find(1, !0).line;
          return lt(r) + 1;
        }
        function un(e, t) {
          var n = Ht && t.markedSpans;
          if (n)
            for (var r = void 0, i = 0; i < n.length; ++i)
              if ((r = n[i]).marker.collapsed) {
                if (null == r.from) return !0;
                if (!r.marker.widgetNode && 0 == r.from && r.marker.inclusiveLeft && cn(e, t, r))
                  return !0;
              }
        }
        function cn(e, t, n) {
          if (null == n.to) {
            var r = n.marker.find(1, !0);
            return cn(e, r.line, zt(r.line.markedSpans, n.marker));
          }
          if (n.marker.inclusiveRight && n.to == t.text.length) return !0;
          for (var i = void 0, o = 0; o < t.markedSpans.length; ++o)
            if (
              (i = t.markedSpans[o]).marker.collapsed &&
              !i.marker.widgetNode &&
              i.from == n.to &&
              (null == i.to || i.to != n.from) &&
              (i.marker.inclusiveLeft || n.marker.inclusiveRight) &&
              cn(e, t, i)
            )
              return !0;
        }
        function fn(e) {
          for (var t = 0, n = (e = rn(e)).parent, r = 0; r < n.lines.length; ++r) {
            var i = n.lines[r];
            if (i == e) break;
            t += i.height;
          }
          for (var o = n.parent; o; o = (n = o).parent)
            for (var l = 0; l < o.children.length; ++l) {
              var a = o.children[l];
              if (a == n) break;
              t += a.height;
            }
          return t;
        }
        function dn(e) {
          if (0 == e.height) return 0;
          for (var t, n = e.text.length, r = e; (t = Jt(r)); ) {
            var i = t.find(0, !0);
            ((r = i.from.line), (n += i.from.ch - i.to.ch));
          }
          for (r = e; (t = en(r)); ) {
            var o = t.find(0, !0);
            ((n -= r.text.length - o.from.ch), (n += (r = o.to.line).text.length - o.to.ch));
          }
          return n;
        }
        function hn(e) {
          var t = e.display,
            n = e.doc;
          ((t.maxLine = nt(n, n.first)),
            (t.maxLineLength = dn(t.maxLine)),
            (t.maxLineChanged = !0),
            n.iter(function (e) {
              var n = dn(e);
              n > t.maxLineLength && ((t.maxLineLength = n), (t.maxLine = e));
            }));
        }
        var pn = function (e, t, n) {
          ((this.text = e), Xt(this, t), (this.height = n ? n(this) : 1));
        };
        function gn(e, t, n, r) {
          ((e.text = t),
            e.stateAfter && (e.stateAfter = null),
            e.styles && (e.styles = null),
            null != e.order && (e.order = null),
            $t(e),
            Xt(e, n));
          var i = r ? r(e) : 1;
          i != e.height && ot(e, i);
        }
        function vn(e) {
          ((e.parent = null), $t(e));
        }
        ((pn.prototype.lineNo = function () {
          return lt(this);
        }),
          Te(pn));
        var mn = {},
          yn = {};
        function bn(e, t) {
          if (!e || /^\s*$/.test(e)) return null;
          var n = t.addModeClass ? yn : mn;
          return n[e] || (n[e] = e.replace(/\S+/g, "cm-$&"));
        }
        function wn(e, t) {
          var n = D("span", null, null, s ? "padding-right: .1px" : null),
            r = {
              pre: D("pre", [n], "CodeMirror-line"),
              content: n,
              col: 0,
              pos: 0,
              cm: e,
              trailingSpace: !1,
              splitSpaces: e.getOption("lineWrapping"),
            };
          t.measure = {};
          for (var i = 0; i <= (t.rest ? t.rest.length : 0); i++) {
            var o = i ? t.rest[i - 1] : t.line,
              l = void 0;
            ((r.pos = 0),
              (r.addToken = Cn),
              Ie(e.display.measure) &&
                (l = me(o, e.doc.direction)) &&
                (r.addToken = kn(r.addToken, l)),
              (r.map = []),
              Tn(o, r, St(e, o, t != e.display.externalMeasured && lt(o))),
              o.styleClasses &&
                (o.styleClasses.bgClass && (r.bgClass = H(o.styleClasses.bgClass, r.bgClass || "")),
                o.styleClasses.textClass &&
                  (r.textClass = H(o.styleClasses.textClass, r.textClass || ""))),
              0 == r.map.length && r.map.push(0, 0, r.content.appendChild(Pe(e.display.measure))),
              0 == i
                ? ((t.measure.map = r.map), (t.measure.cache = {}))
                : ((t.measure.maps || (t.measure.maps = [])).push(r.map),
                  (t.measure.caches || (t.measure.caches = [])).push({})));
          }
          if (s) {
            var a = r.content.lastChild;
            (/\bcm-tab\b/.test(a.className) || (a.querySelector && a.querySelector(".cm-tab"))) &&
              (r.content.className = "cm-tab-wrap-hack");
          }
          return (
            Ce(e, "renderLine", e, t.line, r.pre),
            r.pre.className && (r.textClass = H(r.pre.className, r.textClass || "")),
            r
          );
        }
        function xn(e) {
          var t = A("span", "•", "cm-invalidchar");
          return (
            (t.title = "\\u" + e.charCodeAt(0).toString(16)),
            t.setAttribute("aria-label", t.title),
            t
          );
        }
        function Cn(e, t, n, r, i, o, s) {
          if (t) {
            var u,
              c = e.splitSpaces ? Sn(t, e.trailingSpace) : t,
              f = e.cm.state.specialChars,
              d = !1;
            if (f.test(t)) {
              u = document.createDocumentFragment();
              for (var h = 0; ; ) {
                f.lastIndex = h;
                var p = f.exec(t),
                  g = p ? p.index - h : t.length - h;
                if (g) {
                  var v = document.createTextNode(c.slice(h, h + g));
                  (l && a < 9 ? u.appendChild(A("span", [v])) : u.appendChild(v),
                    e.map.push(e.pos, e.pos + g, v),
                    (e.col += g),
                    (e.pos += g));
                }
                if (!p) break;
                h += g + 1;
                var m = void 0;
                if ("\t" == p[0]) {
                  var y = e.cm.options.tabSize,
                    b = y - (e.col % y);
                  ((m = u.appendChild(A("span", J(b), "cm-tab"))).setAttribute(
                    "role",
                    "presentation"
                  ),
                    m.setAttribute("cm-text", "\t"),
                    (e.col += b));
                } else
                  "\r" == p[0] || "\n" == p[0]
                    ? ((m = u.appendChild(
                        A("span", "\r" == p[0] ? "␍" : "␤", "cm-invalidchar")
                      )).setAttribute("cm-text", p[0]),
                      (e.col += 1))
                    : ((m = e.cm.options.specialCharPlaceholder(p[0])).setAttribute(
                        "cm-text",
                        p[0]
                      ),
                      l && a < 9 ? u.appendChild(A("span", [m])) : u.appendChild(m),
                      (e.col += 1));
                (e.map.push(e.pos, e.pos + 1, m), e.pos++);
              }
            } else
              ((e.col += t.length),
                (u = document.createTextNode(c)),
                e.map.push(e.pos, e.pos + t.length, u),
                l && a < 9 && (d = !0),
                (e.pos += t.length));
            if (
              ((e.trailingSpace = 32 == c.charCodeAt(t.length - 1)), n || r || i || d || o || s)
            ) {
              var w = n || "";
              (r && (w += r), i && (w += i));
              var x = A("span", [u], w, o);
              if (s)
                for (var C in s)
                  s.hasOwnProperty(C) && "style" != C && "class" != C && x.setAttribute(C, s[C]);
              return e.content.appendChild(x);
            }
            e.content.appendChild(u);
          }
        }
        function Sn(e, t) {
          if (e.length > 1 && !/  /.test(e)) return e;
          for (var n = t, r = "", i = 0; i < e.length; i++) {
            var o = e.charAt(i);
            (" " != o || !n || (i != e.length - 1 && 32 != e.charCodeAt(i + 1)) || (o = " "),
              (r += o),
              (n = " " == o));
          }
          return r;
        }
        function kn(e, t) {
          return function (n, r, i, o, l, a, s) {
            i = i ? i + " cm-force-border" : "cm-force-border";
            for (var u = n.pos, c = u + r.length; ; ) {
              for (var f = void 0, d = 0; d < t.length && !((f = t[d]).to > u && f.from <= u); d++);
              if (f.to >= c) return e(n, r, i, o, l, a, s);
              (e(n, r.slice(0, f.to - u), i, o, null, a, s),
                (o = null),
                (r = r.slice(f.to - u)),
                (u = f.to));
            }
          };
        }
        function Ln(e, t, n, r) {
          var i = !r && n.widgetNode;
          (i && e.map.push(e.pos, e.pos + t, i),
            !r &&
              e.cm.display.input.needsContentAttribute &&
              (i || (i = e.content.appendChild(document.createElement("span"))),
              i.setAttribute("cm-marker", n.id)),
            i && (e.cm.display.input.setUneditable(i), e.content.appendChild(i)),
            (e.pos += t),
            (e.trailingSpace = !1));
        }
        function Tn(e, t, n) {
          var r = e.markedSpans,
            i = e.text,
            o = 0;
          if (r)
            for (var l, a, s, u, c, f, d, h = i.length, p = 0, g = 1, v = "", m = 0; ; ) {
              if (m == p) {
                ((s = u = c = a = ""), (d = null), (f = null), (m = Infinity));
                for (var y = [], b = void 0, w = 0; w < r.length; ++w) {
                  var x = r[w],
                    C = x.marker;
                  if ("bookmark" == C.type && x.from == p && C.widgetNode) y.push(C);
                  else if (
                    x.from <= p &&
                    (null == x.to || x.to > p || (C.collapsed && x.to == p && x.from == p))
                  ) {
                    if (
                      (null != x.to && x.to != p && m > x.to && ((m = x.to), (u = "")),
                      C.className && (s += " " + C.className),
                      C.css && (a = (a ? a + ";" : "") + C.css),
                      C.startStyle && x.from == p && (c += " " + C.startStyle),
                      C.endStyle && x.to == m && (b || (b = [])).push(C.endStyle, x.to),
                      C.title && ((d || (d = {})).title = C.title),
                      C.attributes)
                    )
                      for (var S in C.attributes) (d || (d = {}))[S] = C.attributes[S];
                    C.collapsed && (!f || Zt(f.marker, C) < 0) && (f = x);
                  } else x.from > p && m > x.from && (m = x.from);
                }
                if (b) for (var k = 0; k < b.length; k += 2) b[k + 1] == m && (u += " " + b[k]);
                if (!f || f.from == p) for (var L = 0; L < y.length; ++L) Ln(t, 0, y[L]);
                if (f && (f.from || 0) == p) {
                  if (
                    (Ln(t, (null == f.to ? h + 1 : f.to) - p, f.marker, null == f.from),
                    null == f.to)
                  )
                    return;
                  f.to == p && (f = !1);
                }
              }
              if (p >= h) break;
              for (var T = Math.min(h, m); ; ) {
                if (v) {
                  var M = p + v.length;
                  if (!f) {
                    var O = M > T ? v.slice(0, T - p) : v;
                    t.addToken(t, O, l ? l + s : s, c, p + O.length == m ? u : "", a, d);
                  }
                  if (M >= T) {
                    ((v = v.slice(T - p)), (p = T));
                    break;
                  }
                  ((p = M), (c = ""));
                }
                ((v = i.slice(o, (o = n[g++]))), (l = bn(n[g++], t.cm.options)));
              }
            }
          else
            for (var N = 1; N < n.length; N += 2)
              t.addToken(t, i.slice(o, (o = n[N])), bn(n[N + 1], t.cm.options));
        }
        function Mn(e, t, n) {
          ((this.line = t),
            (this.rest = ln(t)),
            (this.size = this.rest ? lt(ee(this.rest)) - n + 1 : 1),
            (this.node = this.text = null),
            (this.hidden = un(e, t)));
        }
        function On(e, t, n) {
          for (var r, i = [], o = t; o < n; o = r) {
            var l = new Mn(e.doc, nt(e.doc, o), o);
            ((r = o + l.size), i.push(l));
          }
          return i;
        }
        var Nn = null;
        function An(e) {
          Nn ? Nn.ops.push(e) : (e.ownsGroup = Nn = { ops: [e], delayedCallbacks: [] });
        }
        function Dn(e) {
          var t = e.delayedCallbacks,
            n = 0;
          do {
            for (; n < t.length; n++) t[n].call(null);
            for (var r = 0; r < e.ops.length; r++) {
              var i = e.ops[r];
              if (i.cursorActivityHandlers)
                for (; i.cursorActivityCalled < i.cursorActivityHandlers.length; )
                  i.cursorActivityHandlers[i.cursorActivityCalled++].call(null, i.cm);
            }
          } while (n < t.length);
        }
        function Fn(e, t) {
          var n = e.ownsGroup;
          if (n)
            try {
              Dn(n);
            } finally {
              ((Nn = null), t(n));
            }
        }
        var Wn = null;
        function En(e, t) {
          var n = we(e, t);
          if (n.length) {
            var r,
              i = Array.prototype.slice.call(arguments, 2);
            Nn ? (r = Nn.delayedCallbacks) : Wn ? (r = Wn) : ((r = Wn = []), setTimeout(Hn, 0));
            for (
              var o = function (e) {
                  r.push(function () {
                    return n[e].apply(null, i);
                  });
                },
                l = 0;
              l < n.length;
              ++l
            )
              o(l);
          }
        }
        function Hn() {
          var e = Wn;
          Wn = null;
          for (var t = 0; t < e.length; ++t) e[t]();
        }
        function Pn(e, t, n, r) {
          for (var i = 0; i < t.changes.length; i++) {
            var o = t.changes[i];
            "text" == o
              ? Bn(e, t)
              : "gutter" == o
                ? Gn(e, t, n, r)
                : "class" == o
                  ? Vn(e, t)
                  : "widget" == o && Un(e, t, r);
          }
          t.changes = null;
        }
        function In(e) {
          return (
            e.node == e.text &&
              ((e.node = A("div", null, null, "position: relative")),
              e.text.parentNode && e.text.parentNode.replaceChild(e.node, e.text),
              e.node.appendChild(e.text),
              l && a < 8 && (e.node.style.zIndex = 2)),
            e.node
          );
        }
        function Rn(e, t) {
          var n = t.bgClass ? t.bgClass + " " + (t.line.bgClass || "") : t.line.bgClass;
          if ((n && (n += " CodeMirror-linebackground"), t.background))
            n
              ? (t.background.className = n)
              : (t.background.parentNode.removeChild(t.background), (t.background = null));
          else if (n) {
            var r = In(t);
            ((t.background = r.insertBefore(A("div", null, n), r.firstChild)),
              e.display.input.setUneditable(t.background));
          }
        }
        function zn(e, t) {
          var n = e.display.externalMeasured;
          return n && n.line == t.line
            ? ((e.display.externalMeasured = null), (t.measure = n.measure), n.built)
            : wn(e, t);
        }
        function Bn(e, t) {
          var n = t.text.className,
            r = zn(e, t);
          (t.text == t.node && (t.node = r.pre),
            t.text.parentNode.replaceChild(r.pre, t.text),
            (t.text = r.pre),
            r.bgClass != t.bgClass || r.textClass != t.textClass
              ? ((t.bgClass = r.bgClass), (t.textClass = r.textClass), Vn(e, t))
              : n && (t.text.className = n));
        }
        function Vn(e, t) {
          (Rn(e, t),
            t.line.wrapClass
              ? (In(t).className = t.line.wrapClass)
              : t.node != t.text && (t.node.className = ""));
          var n = t.textClass ? t.textClass + " " + (t.line.textClass || "") : t.line.textClass;
          t.text.className = n || "";
        }
        function Gn(e, t, n, r) {
          if (
            (t.gutter && (t.node.removeChild(t.gutter), (t.gutter = null)),
            t.gutterBackground &&
              (t.node.removeChild(t.gutterBackground), (t.gutterBackground = null)),
            t.line.gutterClass)
          ) {
            var i = In(t);
            ((t.gutterBackground = A(
              "div",
              null,
              "CodeMirror-gutter-background " + t.line.gutterClass,
              "left: " +
                (e.options.fixedGutter ? r.fixedPos : -r.gutterTotalWidth) +
                "px; width: " +
                r.gutterTotalWidth +
                "px"
            )),
              e.display.input.setUneditable(t.gutterBackground),
              i.insertBefore(t.gutterBackground, t.text));
          }
          var o = t.line.gutterMarkers;
          if (e.options.lineNumbers || o) {
            var l = In(t),
              a = (t.gutter = A(
                "div",
                null,
                "CodeMirror-gutter-wrapper",
                "left: " + (e.options.fixedGutter ? r.fixedPos : -r.gutterTotalWidth) + "px"
              ));
            if (
              (a.setAttribute("aria-hidden", "true"),
              e.display.input.setUneditable(a),
              l.insertBefore(a, t.text),
              t.line.gutterClass && (a.className += " " + t.line.gutterClass),
              !e.options.lineNumbers ||
                (o && o["CodeMirror-linenumbers"]) ||
                (t.lineNumber = a.appendChild(
                  A(
                    "div",
                    ut(e.options, n),
                    "CodeMirror-linenumber CodeMirror-gutter-elt",
                    "left: " +
                      r.gutterLeft["CodeMirror-linenumbers"] +
                      "px; width: " +
                      e.display.lineNumInnerWidth +
                      "px"
                  )
                )),
              o)
            )
              for (var s = 0; s < e.display.gutterSpecs.length; ++s) {
                var u = e.display.gutterSpecs[s].className,
                  c = o.hasOwnProperty(u) && o[u];
                c &&
                  a.appendChild(
                    A(
                      "div",
                      [c],
                      "CodeMirror-gutter-elt",
                      "left: " + r.gutterLeft[u] + "px; width: " + r.gutterWidth[u] + "px"
                    )
                  );
              }
          }
        }
        function Un(e, t, n) {
          t.alignable && (t.alignable = null);
          for (var r = L("CodeMirror-linewidget"), i = t.node.firstChild, o = void 0; i; i = o)
            ((o = i.nextSibling), r.test(i.className) && t.node.removeChild(i));
          jn(e, t, n);
        }
        function _n(e, t, n, r) {
          var i = zn(e, t);
          return (
            (t.text = t.node = i.pre),
            i.bgClass && (t.bgClass = i.bgClass),
            i.textClass && (t.textClass = i.textClass),
            Vn(e, t),
            Gn(e, t, n, r),
            jn(e, t, r),
            t.node
          );
        }
        function jn(e, t, n) {
          if ((Kn(e, t.line, t, n, !0), t.rest))
            for (var r = 0; r < t.rest.length; r++) Kn(e, t.rest[r], t, n, !1);
        }
        function Kn(e, t, n, r, i) {
          if (t.widgets)
            for (var o = In(n), l = 0, a = t.widgets; l < a.length; ++l) {
              var s = a[l],
                u = A(
                  "div",
                  [s.node],
                  "CodeMirror-linewidget" + (s.className ? " " + s.className : "")
                );
              (s.handleMouseEvents || u.setAttribute("cm-ignore-events", "true"),
                $n(s, u, n, r),
                e.display.input.setUneditable(u),
                i && s.above ? o.insertBefore(u, n.gutter || n.text) : o.appendChild(u),
                En(s, "redraw"));
            }
        }
        function $n(e, t, n, r) {
          if (e.noHScroll) {
            (n.alignable || (n.alignable = [])).push(t);
            var i = r.wrapperWidth;
            ((t.style.left = r.fixedPos + "px"),
              e.coverGutter ||
                ((i -= r.gutterTotalWidth), (t.style.paddingLeft = r.gutterTotalWidth + "px")),
              (t.style.width = i + "px"));
          }
          e.coverGutter &&
            ((t.style.zIndex = 5),
            (t.style.position = "relative"),
            e.noHScroll || (t.style.marginLeft = -r.gutterTotalWidth + "px"));
        }
        function Xn(e) {
          if (null != e.height) return e.height;
          var t = e.doc.cm;
          if (!t) return 0;
          if (!F(document.body, e.node)) {
            var n = "position: relative;";
            (e.coverGutter && (n += "margin-left: -" + t.display.gutters.offsetWidth + "px;"),
              e.noHScroll && (n += "width: " + t.display.wrapper.clientWidth + "px;"),
              N(t.display.measure, A("div", [e.node], null, n)));
          }
          return (e.height = e.node.parentNode.offsetHeight);
        }
        function Yn(e, t) {
          for (var n = De(t); n != e.wrapper; n = n.parentNode)
            if (
              !n ||
              (1 == n.nodeType && "true" == n.getAttribute("cm-ignore-events")) ||
              (n.parentNode == e.sizer && n != e.mover)
            )
              return !0;
        }
        function qn(e) {
          return e.lineSpace.offsetTop;
        }
        function Zn(e) {
          return e.mover.offsetHeight - e.lineSpace.offsetHeight;
        }
        function Qn(e) {
          if (e.cachedPaddingH) return e.cachedPaddingH;
          var t = N(e.measure, A("pre", "x", "CodeMirror-line-like")),
            n = window.getComputedStyle ? window.getComputedStyle(t) : t.currentStyle,
            r = { left: parseInt(n.paddingLeft), right: parseInt(n.paddingRight) };
          return (isNaN(r.left) || isNaN(r.right) || (e.cachedPaddingH = r), r);
        }
        function Jn(e) {
          return K - e.display.nativeBarWidth;
        }
        function er(e) {
          return e.display.scroller.clientWidth - Jn(e) - e.display.barWidth;
        }
        function tr(e) {
          return e.display.scroller.clientHeight - Jn(e) - e.display.barHeight;
        }
        function nr(e, t, n) {
          var r = e.options.lineWrapping,
            i = r && er(e);
          if (!t.measure.heights || (r && t.measure.width != i)) {
            var o = (t.measure.heights = []);
            if (r) {
              t.measure.width = i;
              for (var l = t.text.firstChild.getClientRects(), a = 0; a < l.length - 1; a++) {
                var s = l[a],
                  u = l[a + 1];
                Math.abs(s.bottom - u.bottom) > 2 && o.push((s.bottom + u.top) / 2 - n.top);
              }
            }
            o.push(n.bottom - n.top);
          }
        }
        function rr(e, t, n) {
          if (e.line == t) return { map: e.measure.map, cache: e.measure.cache };
          if (e.rest) {
            for (var r = 0; r < e.rest.length; r++)
              if (e.rest[r] == t) return { map: e.measure.maps[r], cache: e.measure.caches[r] };
            for (var i = 0; i < e.rest.length; i++)
              if (lt(e.rest[i]) > n)
                return { map: e.measure.maps[i], cache: e.measure.caches[i], before: !0 };
          }
        }
        function ir(e, t) {
          var n = lt((t = rn(t))),
            r = (e.display.externalMeasured = new Mn(e.doc, t, n));
          r.lineN = n;
          var i = (r.built = wn(e, r));
          return ((r.text = i.pre), N(e.display.lineMeasure, i.pre), r);
        }
        function or(e, t, n, r) {
          return sr(e, ar(e, t), n, r);
        }
        function lr(e, t) {
          if (t >= e.display.viewFrom && t < e.display.viewTo) return e.display.view[Vr(e, t)];
          var n = e.display.externalMeasured;
          return n && t >= n.lineN && t < n.lineN + n.size ? n : void 0;
        }
        function ar(e, t) {
          var n = lt(t),
            r = lr(e, n);
          (r && !r.text
            ? (r = null)
            : r && r.changes && (Pn(e, r, n, Pr(e)), (e.curOp.forceUpdate = !0)),
            r || (r = ir(e, t)));
          var i = rr(r, t, n);
          return {
            line: t,
            view: r,
            rect: null,
            map: i.map,
            cache: i.cache,
            before: i.before,
            hasHeights: !1,
          };
        }
        function sr(e, t, n, r, i) {
          t.before && (n = -1);
          var o,
            l = n + (r || "");
          return (
            t.cache.hasOwnProperty(l)
              ? (o = t.cache[l])
              : (t.rect || (t.rect = t.view.text.getBoundingClientRect()),
                t.hasHeights || (nr(e, t.view, t.rect), (t.hasHeights = !0)),
                (o = hr(e, t, n, r)).bogus || (t.cache[l] = o)),
            {
              left: o.left,
              right: o.right,
              top: i ? o.rtop : o.top,
              bottom: i ? o.rbottom : o.bottom,
            }
          );
        }
        var ur,
          cr = { left: 0, right: 0, top: 0, bottom: 0 };
        function fr(e, t, n) {
          for (var r, i, o, l, a, s, u = 0; u < e.length; u += 3)
            if (
              ((a = e[u]),
              (s = e[u + 1]),
              t < a
                ? ((i = 0), (o = 1), (l = "left"))
                : t < s
                  ? (o = 1 + (i = t - a))
                  : (u == e.length - 3 || (t == s && e[u + 3] > t)) &&
                    ((i = (o = s - a) - 1), t >= s && (l = "right")),
              null != i)
            ) {
              if (
                ((r = e[u + 2]),
                a == s && n == (r.insertLeft ? "left" : "right") && (l = n),
                "left" == n && 0 == i)
              )
                for (; u && e[u - 2] == e[u - 3] && e[u - 1].insertLeft; )
                  ((r = e[2 + (u -= 3)]), (l = "left"));
              if ("right" == n && i == s - a)
                for (; u < e.length - 3 && e[u + 3] == e[u + 4] && !e[u + 5].insertLeft; )
                  ((r = e[(u += 3) + 2]), (l = "right"));
              break;
            }
          return { node: r, start: i, end: o, collapse: l, coverStart: a, coverEnd: s };
        }
        function dr(e, t) {
          var n = cr;
          if ("left" == t) for (var r = 0; r < e.length && (n = e[r]).left == n.right; r++);
          else for (var i = e.length - 1; i >= 0 && (n = e[i]).left == n.right; i--);
          return n;
        }
        function hr(e, t, n, r) {
          var i,
            o = fr(t.map, n, r),
            s = o.node,
            u = o.start,
            c = o.end,
            f = o.collapse;
          if (3 == s.nodeType) {
            for (var d = 0; d < 4; d++) {
              for (; u && ce(t.line.text.charAt(o.coverStart + u)); ) --u;
              for (; o.coverStart + c < o.coverEnd && ce(t.line.text.charAt(o.coverStart + c)); )
                ++c;
              if (
                (i =
                  l && a < 9 && 0 == u && c == o.coverEnd - o.coverStart
                    ? s.parentNode.getBoundingClientRect()
                    : dr(T(s, u, c).getClientRects(), r)).left ||
                i.right ||
                0 == u
              )
                break;
              ((c = u), (u -= 1), (f = "right"));
            }
            l && a < 11 && (i = pr(e.display.measure, i));
          } else {
            var h;
            (u > 0 && (f = r = "right"),
              (i =
                e.options.lineWrapping && (h = s.getClientRects()).length > 1
                  ? h["right" == r ? h.length - 1 : 0]
                  : s.getBoundingClientRect()));
          }
          if (l && a < 9 && !u && (!i || (!i.left && !i.right))) {
            var p = s.parentNode.getClientRects()[0];
            i = p
              ? { left: p.left, right: p.left + Hr(e.display), top: p.top, bottom: p.bottom }
              : cr;
          }
          for (
            var g = i.top - t.rect.top,
              v = i.bottom - t.rect.top,
              m = (g + v) / 2,
              y = t.view.measure.heights,
              b = 0;
            b < y.length - 1 && !(m < y[b]);
            b++
          );
          var w = b ? y[b - 1] : 0,
            x = y[b],
            C = {
              left: ("right" == f ? i.right : i.left) - t.rect.left,
              right: ("left" == f ? i.left : i.right) - t.rect.left,
              top: w,
              bottom: x,
            };
          return (
            i.left || i.right || (C.bogus = !0),
            e.options.singleCursorHeightPerLine || ((C.rtop = g), (C.rbottom = v)),
            C
          );
        }
        function pr(e, t) {
          if (
            !window.screen ||
            null == screen.logicalXDPI ||
            screen.logicalXDPI == screen.deviceXDPI ||
            !Ue(e)
          )
            return t;
          var n = screen.logicalXDPI / screen.deviceXDPI,
            r = screen.logicalYDPI / screen.deviceYDPI;
          return { left: t.left * n, right: t.right * n, top: t.top * r, bottom: t.bottom * r };
        }
        function gr(e) {
          if (e.measure && ((e.measure.cache = {}), (e.measure.heights = null), e.rest))
            for (var t = 0; t < e.rest.length; t++) e.measure.caches[t] = {};
        }
        function vr(e) {
          ((e.display.externalMeasure = null), O(e.display.lineMeasure));
          for (var t = 0; t < e.display.view.length; t++) gr(e.display.view[t]);
        }
        function mr(e) {
          (vr(e),
            (e.display.cachedCharWidth =
              e.display.cachedTextHeight =
              e.display.cachedPaddingH =
                null),
            e.options.lineWrapping || (e.display.maxLineChanged = !0),
            (e.display.lineNumChars = null));
        }
        function yr(e) {
          return c && m
            ? -(e.body.getBoundingClientRect().left - parseInt(getComputedStyle(e.body).marginLeft))
            : e.defaultView.pageXOffset || (e.documentElement || e.body).scrollLeft;
        }
        function br(e) {
          return c && m
            ? -(e.body.getBoundingClientRect().top - parseInt(getComputedStyle(e.body).marginTop))
            : e.defaultView.pageYOffset || (e.documentElement || e.body).scrollTop;
        }
        function wr(e) {
          var t = rn(e).widgets,
            n = 0;
          if (t) for (var r = 0; r < t.length; ++r) t[r].above && (n += Xn(t[r]));
          return n;
        }
        function xr(e, t, n, r, i) {
          if (!i) {
            var o = wr(t);
            ((n.top += o), (n.bottom += o));
          }
          if ("line" == r) return n;
          r || (r = "local");
          var l = fn(t);
          if (
            ("local" == r ? (l += qn(e.display)) : (l -= e.display.viewOffset),
            "page" == r || "window" == r)
          ) {
            var a = e.display.lineSpace.getBoundingClientRect();
            l += a.top + ("window" == r ? 0 : br(I(e)));
            var s = a.left + ("window" == r ? 0 : yr(I(e)));
            ((n.left += s), (n.right += s));
          }
          return ((n.top += l), (n.bottom += l), n);
        }
        function Cr(e, t, n) {
          if ("div" == n) return t;
          var r = t.left,
            i = t.top;
          if ("page" == n) ((r -= yr(I(e))), (i -= br(I(e))));
          else if ("local" == n || !n) {
            var o = e.display.sizer.getBoundingClientRect();
            ((r += o.left), (i += o.top));
          }
          var l = e.display.lineSpace.getBoundingClientRect();
          return { left: r - l.left, top: i - l.top };
        }
        function Sr(e, t, n, r, i) {
          return (r || (r = nt(e.doc, t.line)), xr(e, r, or(e, r, t.ch, i), n));
        }
        function kr(e, t, n, r, i, o) {
          function l(t, l) {
            var a = sr(e, i, t, l ? "right" : "left", o);
            return (l ? (a.left = a.right) : (a.right = a.left), xr(e, r, a, n));
          }
          ((r = r || nt(e.doc, t.line)), i || (i = ar(e, r)));
          var a = me(r, e.doc.direction),
            s = t.ch,
            u = t.sticky;
          if (
            (s >= r.text.length
              ? ((s = r.text.length), (u = "before"))
              : s <= 0 && ((s = 0), (u = "after")),
            !a)
          )
            return l("before" == u ? s - 1 : s, "before" == u);
          function c(e, t, n) {
            return l(n ? e - 1 : e, (1 == a[t].level) != n);
          }
          var f = ge(a, s, u),
            d = pe,
            h = c(s, f, "before" == u);
          return (null != d && (h.other = c(s, d, "before" != u)), h);
        }
        function Lr(e, t) {
          var n = 0;
          ((t = mt(e.doc, t)), e.options.lineWrapping || (n = Hr(e.display) * t.ch));
          var r = nt(e.doc, t.line),
            i = fn(r) + qn(e.display);
          return { left: n, right: n, top: i, bottom: i + r.height };
        }
        function Tr(e, t, n, r, i) {
          var o = ct(e, t, n);
          return ((o.xRel = i), r && (o.outside = r), o);
        }
        function Mr(e, t, n) {
          var r = e.doc;
          if ((n += e.display.viewOffset) < 0) return Tr(r.first, 0, null, -1, -1);
          var i = at(r, n),
            o = r.first + r.size - 1;
          if (i > o) return Tr(r.first + r.size - 1, nt(r, o).text.length, null, 1, 1);
          t < 0 && (t = 0);
          for (var l = nt(r, i); ; ) {
            var a = Dr(e, l, i, t, n),
              s = tn(l, a.ch + (a.xRel > 0 || a.outside > 0 ? 1 : 0));
            if (!s) return a;
            var u = s.find(1);
            if (u.line == i) return u;
            l = nt(r, (i = u.line));
          }
        }
        function Or(e, t, n, r) {
          r -= wr(t);
          var i = t.text.length,
            o = de(
              function (t) {
                return sr(e, n, t - 1).bottom <= r;
              },
              i,
              0
            );
          return {
            begin: o,
            end: (i = de(
              function (t) {
                return sr(e, n, t).top > r;
              },
              o,
              i
            )),
          };
        }
        function Nr(e, t, n, r) {
          return (n || (n = ar(e, t)), Or(e, t, n, xr(e, t, sr(e, n, r), "line").top));
        }
        function Ar(e, t, n, r) {
          return !(e.bottom <= n) && (e.top > n || (r ? e.left : e.right) > t);
        }
        function Dr(e, t, n, r, i) {
          i -= fn(t);
          var o = ar(e, t),
            l = wr(t),
            a = 0,
            s = t.text.length,
            u = !0,
            c = me(t, e.doc.direction);
          if (c) {
            var f = (e.options.lineWrapping ? Wr : Fr)(e, t, n, o, c, r, i);
            ((a = (u = 1 != f.level) ? f.from : f.to - 1), (s = u ? f.to : f.from - 1));
          }
          var d,
            h,
            p = null,
            g = null,
            v = de(
              function (t) {
                var n = sr(e, o, t);
                return (
                  (n.top += l),
                  (n.bottom += l),
                  !!Ar(n, r, i, !1) && (n.top <= i && n.left <= r && ((p = t), (g = n)), !0)
                );
              },
              a,
              s
            ),
            m = !1;
          if (g) {
            var y = r - g.left < g.right - r,
              b = y == u;
            ((v = p + (b ? 0 : 1)), (h = b ? "after" : "before"), (d = y ? g.left : g.right));
          } else {
            (u || (v != s && v != a) || v++,
              (h =
                0 == v
                  ? "after"
                  : v == t.text.length
                    ? "before"
                    : sr(e, o, v - (u ? 1 : 0)).bottom + l <= i == u
                      ? "after"
                      : "before"));
            var w = kr(e, ct(n, v, h), "line", t, o);
            ((d = w.left), (m = i < w.top ? -1 : i >= w.bottom ? 1 : 0));
          }
          return Tr(n, (v = fe(t.text, v, 1)), h, m, r - d);
        }
        function Fr(e, t, n, r, i, o, l) {
          var a = de(
              function (a) {
                var s = i[a],
                  u = 1 != s.level;
                return Ar(
                  kr(e, ct(n, u ? s.to : s.from, u ? "before" : "after"), "line", t, r),
                  o,
                  l,
                  !0
                );
              },
              0,
              i.length - 1
            ),
            s = i[a];
          if (a > 0) {
            var u = 1 != s.level,
              c = kr(e, ct(n, u ? s.from : s.to, u ? "after" : "before"), "line", t, r);
            Ar(c, o, l, !0) && c.top > l && (s = i[a - 1]);
          }
          return s;
        }
        function Wr(e, t, n, r, i, o, l) {
          var a = Or(e, t, r, l),
            s = a.begin,
            u = a.end;
          /\s/.test(t.text.charAt(u - 1)) && u--;
          for (var c = null, f = null, d = 0; d < i.length; d++) {
            var h = i[d];
            if (!(h.from >= u || h.to <= s)) {
              var p = sr(e, r, 1 != h.level ? Math.min(u, h.to) - 1 : Math.max(s, h.from)).right,
                g = p < o ? o - p + 1e9 : p - o;
              (!c || f > g) && ((c = h), (f = g));
            }
          }
          return (
            c || (c = i[i.length - 1]),
            c.from < s && (c = { from: s, to: c.to, level: c.level }),
            c.to > u && (c = { from: c.from, to: u, level: c.level }),
            c
          );
        }
        function Er(e) {
          if (null != e.cachedTextHeight) return e.cachedTextHeight;
          if (null == ur) {
            ur = A("pre", null, "CodeMirror-line-like");
            for (var t = 0; t < 49; ++t)
              (ur.appendChild(document.createTextNode("x")), ur.appendChild(A("br")));
            ur.appendChild(document.createTextNode("x"));
          }
          N(e.measure, ur);
          var n = ur.offsetHeight / 50;
          return (n > 3 && (e.cachedTextHeight = n), O(e.measure), n || 1);
        }
        function Hr(e) {
          if (null != e.cachedCharWidth) return e.cachedCharWidth;
          var t = A("span", "xxxxxxxxxx"),
            n = A("pre", [t], "CodeMirror-line-like");
          N(e.measure, n);
          var r = t.getBoundingClientRect(),
            i = (r.right - r.left) / 10;
          return (i > 2 && (e.cachedCharWidth = i), i || 10);
        }
        function Pr(e) {
          for (
            var t = e.display,
              n = {},
              r = {},
              i = t.gutters.clientLeft,
              o = t.gutters.firstChild,
              l = 0;
            o;
            o = o.nextSibling, ++l
          ) {
            var a = e.display.gutterSpecs[l].className;
            ((n[a] = o.offsetLeft + o.clientLeft + i), (r[a] = o.clientWidth));
          }
          return {
            fixedPos: Ir(t),
            gutterTotalWidth: t.gutters.offsetWidth,
            gutterLeft: n,
            gutterWidth: r,
            wrapperWidth: t.wrapper.clientWidth,
          };
        }
        function Ir(e) {
          return e.scroller.getBoundingClientRect().left - e.sizer.getBoundingClientRect().left;
        }
        function Rr(e) {
          var t = Er(e.display),
            n = e.options.lineWrapping,
            r = n && Math.max(5, e.display.scroller.clientWidth / Hr(e.display) - 3);
          return function (i) {
            if (un(e.doc, i)) return 0;
            var o = 0;
            if (i.widgets)
              for (var l = 0; l < i.widgets.length; l++)
                i.widgets[l].height && (o += i.widgets[l].height);
            return n ? o + (Math.ceil(i.text.length / r) || 1) * t : o + t;
          };
        }
        function zr(e) {
          var t = e.doc,
            n = Rr(e);
          t.iter(function (e) {
            var t = n(e);
            t != e.height && ot(e, t);
          });
        }
        function Br(e, t, n, r) {
          var i = e.display;
          if (!n && "true" == De(t).getAttribute("cm-not-content")) return null;
          var o,
            l,
            a = i.lineSpace.getBoundingClientRect();
          try {
            ((o = t.clientX - a.left), (l = t.clientY - a.top));
          } catch (f) {
            return null;
          }
          var s,
            u = Mr(e, o, l);
          if (r && u.xRel > 0 && (s = nt(e.doc, u.line).text).length == u.ch) {
            var c = U(s, s.length, e.options.tabSize) - s.length;
            u = ct(u.line, Math.max(0, Math.round((o - Qn(e.display).left) / Hr(e.display)) - c));
          }
          return u;
        }
        function Vr(e, t) {
          if (t >= e.display.viewTo) return null;
          if ((t -= e.display.viewFrom) < 0) return null;
          for (var n = e.display.view, r = 0; r < n.length; r++) if ((t -= n[r].size) < 0) return r;
        }
        function Gr(e, t, n, r) {
          (null == t && (t = e.doc.first),
            null == n && (n = e.doc.first + e.doc.size),
            r || (r = 0));
          var i = e.display;
          if (
            (r &&
              n < i.viewTo &&
              (null == i.updateLineNumbers || i.updateLineNumbers > t) &&
              (i.updateLineNumbers = t),
            (e.curOp.viewChanged = !0),
            t >= i.viewTo)
          )
            Ht && an(e.doc, t) < i.viewTo && _r(e);
          else if (n <= i.viewFrom)
            Ht && sn(e.doc, n + r) > i.viewFrom ? _r(e) : ((i.viewFrom += r), (i.viewTo += r));
          else if (t <= i.viewFrom && n >= i.viewTo) _r(e);
          else if (t <= i.viewFrom) {
            var o = jr(e, n, n + r, 1);
            o ? ((i.view = i.view.slice(o.index)), (i.viewFrom = o.lineN), (i.viewTo += r)) : _r(e);
          } else if (n >= i.viewTo) {
            var l = jr(e, t, t, -1);
            l ? ((i.view = i.view.slice(0, l.index)), (i.viewTo = l.lineN)) : _r(e);
          } else {
            var a = jr(e, t, t, -1),
              s = jr(e, n, n + r, 1);
            a && s
              ? ((i.view = i.view
                  .slice(0, a.index)
                  .concat(On(e, a.lineN, s.lineN))
                  .concat(i.view.slice(s.index))),
                (i.viewTo += r))
              : _r(e);
          }
          var u = i.externalMeasured;
          u && (n < u.lineN ? (u.lineN += r) : t < u.lineN + u.size && (i.externalMeasured = null));
        }
        function Ur(e, t, n) {
          e.curOp.viewChanged = !0;
          var r = e.display,
            i = e.display.externalMeasured;
          if (
            (i && t >= i.lineN && t < i.lineN + i.size && (r.externalMeasured = null),
            !(t < r.viewFrom || t >= r.viewTo))
          ) {
            var o = r.view[Vr(e, t)];
            if (null != o.node) {
              var l = o.changes || (o.changes = []);
              -1 == j(l, n) && l.push(n);
            }
          }
        }
        function _r(e) {
          ((e.display.viewFrom = e.display.viewTo = e.doc.first),
            (e.display.view = []),
            (e.display.viewOffset = 0));
        }
        function jr(e, t, n, r) {
          var i,
            o = Vr(e, t),
            l = e.display.view;
          if (!Ht || n == e.doc.first + e.doc.size) return { index: o, lineN: n };
          for (var a = e.display.viewFrom, s = 0; s < o; s++) a += l[s].size;
          if (a != t) {
            if (r > 0) {
              if (o == l.length - 1) return null;
              ((i = a + l[o].size - t), o++);
            } else i = a - t;
            ((t += i), (n += i));
          }
          for (; an(e.doc, n) != n; ) {
            if (o == (r < 0 ? 0 : l.length - 1)) return null;
            ((n += r * l[o - (r < 0 ? 1 : 0)].size), (o += r));
          }
          return { index: o, lineN: n };
        }
        function Kr(e, t, n) {
          var r = e.display;
          (0 == r.view.length || t >= r.viewTo || n <= r.viewFrom
            ? ((r.view = On(e, t, n)), (r.viewFrom = t))
            : (r.viewFrom > t
                ? (r.view = On(e, t, r.viewFrom).concat(r.view))
                : r.viewFrom < t && (r.view = r.view.slice(Vr(e, t))),
              (r.viewFrom = t),
              r.viewTo < n
                ? (r.view = r.view.concat(On(e, r.viewTo, n)))
                : r.viewTo > n && (r.view = r.view.slice(0, Vr(e, n)))),
            (r.viewTo = n));
        }
        function $r(e) {
          for (var t = e.display.view, n = 0, r = 0; r < t.length; r++) {
            var i = t[r];
            i.hidden || (i.node && !i.changes) || ++n;
          }
          return n;
        }
        function Xr(e) {
          e.display.input.showSelection(e.display.input.prepareSelection());
        }
        function Yr(e, t) {
          void 0 === t && (t = !0);
          var n = e.doc,
            r = {},
            i = (r.cursors = document.createDocumentFragment()),
            o = (r.selection = document.createDocumentFragment()),
            l = e.options.$customCursor;
          l && (t = !0);
          for (var a = 0; a < n.sel.ranges.length; a++)
            if (t || a != n.sel.primIndex) {
              var s = n.sel.ranges[a];
              if (!(s.from().line >= e.display.viewTo || s.to().line < e.display.viewFrom)) {
                var u = s.empty();
                if (l) {
                  var c = l(e, s);
                  c && qr(e, c, i);
                } else (u || e.options.showCursorWhenSelecting) && qr(e, s.head, i);
                u || Qr(e, s, o);
              }
            }
          return r;
        }
        function qr(e, t, n) {
          var r = kr(e, t, "div", null, null, !e.options.singleCursorHeightPerLine),
            i = n.appendChild(A("div", " ", "CodeMirror-cursor"));
          if (
            ((i.style.left = r.left + "px"),
            (i.style.top = r.top + "px"),
            (i.style.height = Math.max(0, r.bottom - r.top) * e.options.cursorHeight + "px"),
            /\bcm-fat-cursor\b/.test(e.getWrapperElement().className))
          ) {
            var o = Sr(e, t, "div", null, null),
              l = o.right - o.left;
            i.style.width = (l > 0 ? l : e.defaultCharWidth()) + "px";
          }
          if (r.other) {
            var a = n.appendChild(A("div", " ", "CodeMirror-cursor CodeMirror-secondarycursor"));
            ((a.style.display = ""),
              (a.style.left = r.other.left + "px"),
              (a.style.top = r.other.top + "px"),
              (a.style.height = 0.85 * (r.other.bottom - r.other.top) + "px"));
          }
        }
        function Zr(e, t) {
          return e.top - t.top || e.left - t.left;
        }
        function Qr(e, t, n) {
          var r = e.display,
            i = e.doc,
            o = document.createDocumentFragment(),
            l = Qn(e.display),
            a = l.left,
            s = Math.max(r.sizerWidth, er(e) - r.sizer.offsetLeft) - l.right,
            u = "ltr" == i.direction;
          function c(e, t, n, r) {
            (t < 0 && (t = 0),
              (t = Math.round(t)),
              (r = Math.round(r)),
              o.appendChild(
                A(
                  "div",
                  null,
                  "CodeMirror-selected",
                  "position: absolute; left: " +
                    e +
                    "px;\n                             top: " +
                    t +
                    "px; width: " +
                    (null == n ? s - e : n) +
                    "px;\n                             height: " +
                    (r - t) +
                    "px"
                )
              ));
          }
          function f(t, n, r) {
            var o,
              l,
              f = nt(i, t),
              d = f.text.length;
            function h(n, r) {
              return Sr(e, ct(t, n), "div", f, r);
            }
            function p(t, n, r) {
              var i = Nr(e, f, null, t),
                o = ("ltr" == n) == ("after" == r) ? "left" : "right";
              return h(
                "after" == r ? i.begin : i.end - (/\s/.test(f.text.charAt(i.end - 1)) ? 2 : 1),
                o
              )[o];
            }
            var g = me(f, i.direction);
            return (
              he(g, n || 0, null == r ? d : r, function (e, t, i, f) {
                var v = "ltr" == i,
                  m = h(e, v ? "left" : "right"),
                  y = h(t - 1, v ? "right" : "left"),
                  b = null == n && 0 == e,
                  w = null == r && t == d,
                  x = 0 == f,
                  C = !g || f == g.length - 1;
                if (y.top - m.top <= 3) {
                  var S = (u ? w : b) && C,
                    k = (u ? b : w) && x ? a : (v ? m : y).left,
                    L = S ? s : (v ? y : m).right;
                  c(k, m.top, L - k, m.bottom);
                } else {
                  var T, M, O, N;
                  (v
                    ? ((T = u && b && x ? a : m.left),
                      (M = u ? s : p(e, i, "before")),
                      (O = u ? a : p(t, i, "after")),
                      (N = u && w && C ? s : y.right))
                    : ((T = u ? p(e, i, "before") : a),
                      (M = !u && b && x ? s : m.right),
                      (O = !u && w && C ? a : y.left),
                      (N = u ? p(t, i, "after") : s)),
                    c(T, m.top, M - T, m.bottom),
                    m.bottom < y.top && c(a, m.bottom, null, y.top),
                    c(O, y.top, N - O, y.bottom));
                }
                ((!o || Zr(m, o) < 0) && (o = m),
                  Zr(y, o) < 0 && (o = y),
                  (!l || Zr(m, l) < 0) && (l = m),
                  Zr(y, l) < 0 && (l = y));
              }),
              { start: o, end: l }
            );
          }
          var d = t.from(),
            h = t.to();
          if (d.line == h.line) f(d.line, d.ch, h.ch);
          else {
            var p = nt(i, d.line),
              g = nt(i, h.line),
              v = rn(p) == rn(g),
              m = f(d.line, d.ch, v ? p.text.length + 1 : null).end,
              y = f(h.line, v ? 0 : null, h.ch).start;
            (v &&
              (m.top < y.top - 2
                ? (c(m.right, m.top, null, m.bottom), c(a, y.top, y.left, y.bottom))
                : c(m.right, m.top, y.left - m.right, m.bottom)),
              m.bottom < y.top && c(a, m.bottom, null, y.top));
          }
          n.appendChild(o);
        }
        function Jr(e) {
          if (e.state.focused) {
            var t = e.display;
            clearInterval(t.blinker);
            var n = !0;
            ((t.cursorDiv.style.visibility = ""),
              e.options.cursorBlinkRate > 0
                ? (t.blinker = setInterval(function () {
                    (e.hasFocus() || ri(e),
                      (t.cursorDiv.style.visibility = (n = !n) ? "" : "hidden"));
                  }, e.options.cursorBlinkRate))
                : e.options.cursorBlinkRate < 0 && (t.cursorDiv.style.visibility = "hidden"));
          }
        }
        function ei(e) {
          e.hasFocus() || (e.display.input.focus(), e.state.focused || ni(e));
        }
        function ti(e) {
          ((e.state.delayingBlurEvent = !0),
            setTimeout(function () {
              e.state.delayingBlurEvent &&
                ((e.state.delayingBlurEvent = !1), e.state.focused && ri(e));
            }, 100));
        }
        function ni(e, t) {
          (e.state.delayingBlurEvent && !e.state.draggingText && (e.state.delayingBlurEvent = !1),
            "nocursor" != e.options.readOnly &&
              (e.state.focused ||
                (Ce(e, "focus", e, t),
                (e.state.focused = !0),
                E(e.display.wrapper, "CodeMirror-focused"),
                e.curOp ||
                  e.display.selForContextMenu == e.doc.sel ||
                  (e.display.input.reset(),
                  s &&
                    setTimeout(function () {
                      return e.display.input.reset(!0);
                    }, 20)),
                e.display.input.receivedFocus()),
              Jr(e)));
        }
        function ri(e, t) {
          e.state.delayingBlurEvent ||
            (e.state.focused &&
              (Ce(e, "blur", e, t),
              (e.state.focused = !1),
              M(e.display.wrapper, "CodeMirror-focused")),
            clearInterval(e.display.blinker),
            setTimeout(function () {
              e.state.focused || (e.display.shift = !1);
            }, 150));
        }
        function ii(e) {
          for (
            var t = e.display,
              n = t.lineDiv.offsetTop,
              r = Math.max(0, t.scroller.getBoundingClientRect().top),
              i = t.lineDiv.getBoundingClientRect().top,
              o = 0,
              s = 0;
            s < t.view.length;
            s++
          ) {
            var u = t.view[s],
              c = e.options.lineWrapping,
              f = void 0,
              d = 0;
            if (!u.hidden) {
              if (((i += u.line.height), l && a < 8)) {
                var h = u.node.offsetTop + u.node.offsetHeight;
                ((f = h - n), (n = h));
              } else {
                var p = u.node.getBoundingClientRect();
                ((f = p.bottom - p.top),
                  !c &&
                    u.text.firstChild &&
                    (d = u.text.firstChild.getBoundingClientRect().right - p.left - 1));
              }
              var g = u.line.height - f;
              if (
                (g > 0.005 || g < -0.005) &&
                (i < r && (o -= g), ot(u.line, f), oi(u.line), u.rest)
              )
                for (var v = 0; v < u.rest.length; v++) oi(u.rest[v]);
              if (d > e.display.sizerWidth) {
                var m = Math.ceil(d / Hr(e.display));
                m > e.display.maxLineLength &&
                  ((e.display.maxLineLength = m),
                  (e.display.maxLine = u.line),
                  (e.display.maxLineChanged = !0));
              }
            }
          }
          Math.abs(o) > 2 && (t.scroller.scrollTop += o);
        }
        function oi(e) {
          if (e.widgets)
            for (var t = 0; t < e.widgets.length; ++t) {
              var n = e.widgets[t],
                r = n.node.parentNode;
              r && (n.height = r.offsetHeight);
            }
        }
        function li(e, t, n) {
          var r = n && null != n.top ? Math.max(0, n.top) : e.scroller.scrollTop;
          r = Math.floor(r - qn(e));
          var i = n && null != n.bottom ? n.bottom : r + e.wrapper.clientHeight,
            o = at(t, r),
            l = at(t, i);
          if (n && n.ensure) {
            var a = n.ensure.from.line,
              s = n.ensure.to.line;
            a < o
              ? ((o = a), (l = at(t, fn(nt(t, a)) + e.wrapper.clientHeight)))
              : Math.min(s, t.lastLine()) >= l &&
                ((o = at(t, fn(nt(t, s)) - e.wrapper.clientHeight)), (l = s));
          }
          return { from: o, to: Math.max(l, o + 1) };
        }
        function ai(e, t) {
          if (!Se(e, "scrollCursorIntoView")) {
            var n = e.display,
              r = n.sizer.getBoundingClientRect(),
              i = null,
              o = n.wrapper.ownerDocument;
            if (
              (t.top + r.top < 0
                ? (i = !0)
                : t.bottom + r.top >
                    (o.defaultView.innerHeight || o.documentElement.clientHeight) && (i = !1),
              null != i && !g)
            ) {
              var l = A(
                "div",
                "​",
                null,
                "position: absolute;\n                         top: " +
                  (t.top - n.viewOffset - qn(e.display)) +
                  "px;\n                         height: " +
                  (t.bottom - t.top + Jn(e) + n.barHeight) +
                  "px;\n                         left: " +
                  t.left +
                  "px; width: " +
                  Math.max(2, t.right - t.left) +
                  "px;"
              );
              (e.display.lineSpace.appendChild(l),
                l.scrollIntoView(i),
                e.display.lineSpace.removeChild(l));
            }
          }
        }
        function si(e, t, n, r) {
          var i;
          (null == r && (r = 0),
            e.options.lineWrapping ||
              t != n ||
              ((n = "before" == t.sticky ? ct(t.line, t.ch + 1, "before") : t),
              (t = t.ch ? ct(t.line, "before" == t.sticky ? t.ch - 1 : t.ch, "after") : t)));
          for (var o = 0; o < 5; o++) {
            var l = !1,
              a = kr(e, t),
              s = n && n != t ? kr(e, n) : a,
              u = ci(
                e,
                (i = {
                  left: Math.min(a.left, s.left),
                  top: Math.min(a.top, s.top) - r,
                  right: Math.max(a.left, s.left),
                  bottom: Math.max(a.bottom, s.bottom) + r,
                })
              ),
              c = e.doc.scrollTop,
              f = e.doc.scrollLeft;
            if (
              (null != u.scrollTop &&
                (mi(e, u.scrollTop), Math.abs(e.doc.scrollTop - c) > 1 && (l = !0)),
              null != u.scrollLeft &&
                (bi(e, u.scrollLeft), Math.abs(e.doc.scrollLeft - f) > 1 && (l = !0)),
              !l)
            )
              break;
          }
          return i;
        }
        function ui(e, t) {
          var n = ci(e, t);
          (null != n.scrollTop && mi(e, n.scrollTop), null != n.scrollLeft && bi(e, n.scrollLeft));
        }
        function ci(e, t) {
          var n = e.display,
            r = Er(e.display);
          t.top < 0 && (t.top = 0);
          var i = e.curOp && null != e.curOp.scrollTop ? e.curOp.scrollTop : n.scroller.scrollTop,
            o = tr(e),
            l = {};
          t.bottom - t.top > o && (t.bottom = t.top + o);
          var a = e.doc.height + Zn(n),
            s = t.top < r,
            u = t.bottom > a - r;
          if (t.top < i) l.scrollTop = s ? 0 : t.top;
          else if (t.bottom > i + o) {
            var c = Math.min(t.top, (u ? a : t.bottom) - o);
            c != i && (l.scrollTop = c);
          }
          var f = e.options.fixedGutter ? 0 : n.gutters.offsetWidth,
            d =
              e.curOp && null != e.curOp.scrollLeft
                ? e.curOp.scrollLeft
                : n.scroller.scrollLeft - f,
            h = er(e) - n.gutters.offsetWidth,
            p = t.right - t.left > h;
          return (
            p && (t.right = t.left + h),
            t.left < 10
              ? (l.scrollLeft = 0)
              : t.left < d
                ? (l.scrollLeft = Math.max(0, t.left + f - (p ? 0 : 10)))
                : t.right > h + d - 3 && (l.scrollLeft = t.right + (p ? 0 : 10) - h),
            l
          );
        }
        function fi(e, t) {
          null != t &&
            (gi(e),
            (e.curOp.scrollTop =
              (null == e.curOp.scrollTop ? e.doc.scrollTop : e.curOp.scrollTop) + t));
        }
        function di(e) {
          gi(e);
          var t = e.getCursor();
          e.curOp.scrollToPos = { from: t, to: t, margin: e.options.cursorScrollMargin };
        }
        function hi(e, t, n) {
          ((null == t && null == n) || gi(e),
            null != t && (e.curOp.scrollLeft = t),
            null != n && (e.curOp.scrollTop = n));
        }
        function pi(e, t) {
          (gi(e), (e.curOp.scrollToPos = t));
        }
        function gi(e) {
          var t = e.curOp.scrollToPos;
          t && ((e.curOp.scrollToPos = null), vi(e, Lr(e, t.from), Lr(e, t.to), t.margin));
        }
        function vi(e, t, n, r) {
          var i = ci(e, {
            left: Math.min(t.left, n.left),
            top: Math.min(t.top, n.top) - r,
            right: Math.max(t.right, n.right),
            bottom: Math.max(t.bottom, n.bottom) + r,
          });
          hi(e, i.scrollLeft, i.scrollTop);
        }
        function mi(e, t) {
          Math.abs(e.doc.scrollTop - t) < 2 ||
            (n || Xi(e, { top: t }), yi(e, t, !0), n && Xi(e), Bi(e, 100));
        }
        function yi(e, t, n) {
          ((t = Math.max(
            0,
            Math.min(e.display.scroller.scrollHeight - e.display.scroller.clientHeight, t)
          )),
            (e.display.scroller.scrollTop != t || n) &&
              ((e.doc.scrollTop = t),
              e.display.scrollbars.setScrollTop(t),
              e.display.scroller.scrollTop != t && (e.display.scroller.scrollTop = t)));
        }
        function bi(e, t, n, r) {
          ((t = Math.max(
            0,
            Math.min(t, e.display.scroller.scrollWidth - e.display.scroller.clientWidth)
          )),
            ((n ? t == e.doc.scrollLeft : Math.abs(e.doc.scrollLeft - t) < 2) && !r) ||
              ((e.doc.scrollLeft = t),
              Qi(e),
              e.display.scroller.scrollLeft != t && (e.display.scroller.scrollLeft = t),
              e.display.scrollbars.setScrollLeft(t)));
        }
        function wi(e) {
          var t = e.display,
            n = t.gutters.offsetWidth,
            r = Math.round(e.doc.height + Zn(e.display));
          return {
            clientHeight: t.scroller.clientHeight,
            viewHeight: t.wrapper.clientHeight,
            scrollWidth: t.scroller.scrollWidth,
            clientWidth: t.scroller.clientWidth,
            viewWidth: t.wrapper.clientWidth,
            barLeft: e.options.fixedGutter ? n : 0,
            docHeight: r,
            scrollHeight: r + Jn(e) + t.barHeight,
            nativeBarWidth: t.nativeBarWidth,
            gutterWidth: n,
          };
        }
        var xi = function (e, t, n) {
          this.cm = n;
          var r = (this.vert = A(
              "div",
              [A("div", null, null, "min-width: 1px")],
              "CodeMirror-vscrollbar"
            )),
            i = (this.horiz = A(
              "div",
              [A("div", null, null, "height: 100%; min-height: 1px")],
              "CodeMirror-hscrollbar"
            ));
          ((r.tabIndex = i.tabIndex = -1),
            e(r),
            e(i),
            be(r, "scroll", function () {
              r.clientHeight && t(r.scrollTop, "vertical");
            }),
            be(i, "scroll", function () {
              i.clientWidth && t(i.scrollLeft, "horizontal");
            }),
            (this.checkedZeroWidth = !1),
            l && a < 8 && (this.horiz.style.minHeight = this.vert.style.minWidth = "18px"));
        };
        ((xi.prototype.update = function (e) {
          var t = e.scrollWidth > e.clientWidth + 1,
            n = e.scrollHeight > e.clientHeight + 1,
            r = e.nativeBarWidth;
          if (n) {
            ((this.vert.style.display = "block"), (this.vert.style.bottom = t ? r + "px" : "0"));
            var i = e.viewHeight - (t ? r : 0);
            this.vert.firstChild.style.height =
              Math.max(0, e.scrollHeight - e.clientHeight + i) + "px";
          } else
            ((this.vert.scrollTop = 0),
              (this.vert.style.display = ""),
              (this.vert.firstChild.style.height = "0"));
          if (t) {
            ((this.horiz.style.display = "block"),
              (this.horiz.style.right = n ? r + "px" : "0"),
              (this.horiz.style.left = e.barLeft + "px"));
            var o = e.viewWidth - e.barLeft - (n ? r : 0);
            this.horiz.firstChild.style.width =
              Math.max(0, e.scrollWidth - e.clientWidth + o) + "px";
          } else ((this.horiz.style.display = ""), (this.horiz.firstChild.style.width = "0"));
          return (
            !this.checkedZeroWidth &&
              e.clientHeight > 0 &&
              (0 == r && this.zeroWidthHack(), (this.checkedZeroWidth = !0)),
            { right: n ? r : 0, bottom: t ? r : 0 }
          );
        }),
          (xi.prototype.setScrollLeft = function (e) {
            (this.horiz.scrollLeft != e && (this.horiz.scrollLeft = e),
              this.disableHoriz && this.enableZeroWidthBar(this.horiz, this.disableHoriz, "horiz"));
          }),
          (xi.prototype.setScrollTop = function (e) {
            (this.vert.scrollTop != e && (this.vert.scrollTop = e),
              this.disableVert && this.enableZeroWidthBar(this.vert, this.disableVert, "vert"));
          }),
          (xi.prototype.zeroWidthHack = function () {
            var e = b && !p ? "12px" : "18px";
            ((this.horiz.style.height = this.vert.style.width = e),
              (this.horiz.style.visibility = this.vert.style.visibility = "hidden"),
              (this.disableHoriz = new _()),
              (this.disableVert = new _()));
          }),
          (xi.prototype.enableZeroWidthBar = function (e, t, n) {
            function r() {
              var i = e.getBoundingClientRect();
              ("vert" == n
                ? document.elementFromPoint(i.right - 1, (i.top + i.bottom) / 2)
                : document.elementFromPoint((i.right + i.left) / 2, i.bottom - 1)) != e
                ? (e.style.visibility = "hidden")
                : t.set(1e3, r);
            }
            ((e.style.visibility = ""), t.set(1e3, r));
          }),
          (xi.prototype.clear = function () {
            var e = this.horiz.parentNode;
            (e.removeChild(this.horiz), e.removeChild(this.vert));
          }));
        var Ci = function () {};
        function Si(e, t) {
          t || (t = wi(e));
          var n = e.display.barWidth,
            r = e.display.barHeight;
          ki(e, t);
          for (var i = 0; (i < 4 && n != e.display.barWidth) || r != e.display.barHeight; i++)
            (n != e.display.barWidth && e.options.lineWrapping && ii(e),
              ki(e, wi(e)),
              (n = e.display.barWidth),
              (r = e.display.barHeight));
        }
        function ki(e, t) {
          var n = e.display,
            r = n.scrollbars.update(t);
          ((n.sizer.style.paddingRight = (n.barWidth = r.right) + "px"),
            (n.sizer.style.paddingBottom = (n.barHeight = r.bottom) + "px"),
            (n.heightForcer.style.borderBottom = r.bottom + "px solid transparent"),
            r.right && r.bottom
              ? ((n.scrollbarFiller.style.display = "block"),
                (n.scrollbarFiller.style.height = r.bottom + "px"),
                (n.scrollbarFiller.style.width = r.right + "px"))
              : (n.scrollbarFiller.style.display = ""),
            r.bottom && e.options.coverGutterNextToScrollbar && e.options.fixedGutter
              ? ((n.gutterFiller.style.display = "block"),
                (n.gutterFiller.style.height = r.bottom + "px"),
                (n.gutterFiller.style.width = t.gutterWidth + "px"))
              : (n.gutterFiller.style.display = ""));
        }
        ((Ci.prototype.update = function () {
          return { bottom: 0, right: 0 };
        }),
          (Ci.prototype.setScrollLeft = function () {}),
          (Ci.prototype.setScrollTop = function () {}),
          (Ci.prototype.clear = function () {}));
        var Li = { native: xi, null: Ci };
        function Ti(e) {
          (e.display.scrollbars &&
            (e.display.scrollbars.clear(),
            e.display.scrollbars.addClass && M(e.display.wrapper, e.display.scrollbars.addClass)),
            (e.display.scrollbars = new Li[e.options.scrollbarStyle](
              function (t) {
                (e.display.wrapper.insertBefore(t, e.display.scrollbarFiller),
                  be(t, "mousedown", function () {
                    e.state.focused &&
                      setTimeout(function () {
                        return e.display.input.focus();
                      }, 0);
                  }),
                  t.setAttribute("cm-not-content", "true"));
              },
              function (t, n) {
                "horizontal" == n ? bi(e, t) : mi(e, t);
              },
              e
            )),
            e.display.scrollbars.addClass && E(e.display.wrapper, e.display.scrollbars.addClass));
        }
        var Mi = 0;
        function Oi(e) {
          ((e.curOp = {
            cm: e,
            viewChanged: !1,
            // Flag that indicates that lines might need to be redrawn
            startHeight: e.doc.height,
            // Used to detect need to update scrollbar
            forceUpdate: !1,
            // Used to force a redraw
            updateInput: 0,
            // Whether to reset the input textarea
            typing: !1,
            // Whether this reset should be careful to leave existing text (for compositing)
            changeObjs: null,
            // Accumulated changes, for firing change events
            cursorActivityHandlers: null,
            // Set of handlers to fire cursorActivity on
            cursorActivityCalled: 0,
            // Tracks which cursorActivity handlers have been called already
            selectionChanged: !1,
            // Whether the selection needs to be redrawn
            updateMaxLine: !1,
            // Set when the widest line needs to be determined anew
            scrollLeft: null,
            scrollTop: null,
            // Intermediate scroll position, not pushed to DOM yet
            scrollToPos: null,
            // Used to scroll to a specific position
            focus: !1,
            id: ++Mi,
            // Unique ID
            markArrays: null,
          }),
            An(e.curOp));
        }
        function Ni(e) {
          var t = e.curOp;
          t &&
            Fn(t, function (e) {
              for (var t = 0; t < e.ops.length; t++) e.ops[t].cm.curOp = null;
              Ai(e);
            });
        }
        function Ai(e) {
          for (var t = e.ops, n = 0; n < t.length; n++) Di(t[n]);
          for (var r = 0; r < t.length; r++) Fi(t[r]);
          for (var i = 0; i < t.length; i++) Wi(t[i]);
          for (var o = 0; o < t.length; o++) Ei(t[o]);
          for (var l = 0; l < t.length; l++) Hi(t[l]);
        }
        function Di(e) {
          var t = e.cm,
            n = t.display;
          (Ui(t),
            e.updateMaxLine && hn(t),
            (e.mustUpdate =
              e.viewChanged ||
              e.forceUpdate ||
              null != e.scrollTop ||
              (e.scrollToPos &&
                (e.scrollToPos.from.line < n.viewFrom || e.scrollToPos.to.line >= n.viewTo)) ||
              (n.maxLineChanged && t.options.lineWrapping)),
            (e.update =
              e.mustUpdate &&
              new Gi(
                t,
                e.mustUpdate && { top: e.scrollTop, ensure: e.scrollToPos },
                e.forceUpdate
              )));
        }
        function Fi(e) {
          e.updatedDisplay = e.mustUpdate && Ki(e.cm, e.update);
        }
        function Wi(e) {
          var t = e.cm,
            n = t.display;
          (e.updatedDisplay && ii(t),
            (e.barMeasure = wi(t)),
            n.maxLineChanged &&
              !t.options.lineWrapping &&
              ((e.adjustWidthTo = or(t, n.maxLine, n.maxLine.text.length).left + 3),
              (t.display.sizerWidth = e.adjustWidthTo),
              (e.barMeasure.scrollWidth = Math.max(
                n.scroller.clientWidth,
                n.sizer.offsetLeft + e.adjustWidthTo + Jn(t) + t.display.barWidth
              )),
              (e.maxScrollLeft = Math.max(0, n.sizer.offsetLeft + e.adjustWidthTo - er(t)))),
            (e.updatedDisplay || e.selectionChanged) &&
              (e.preparedSelection = n.input.prepareSelection()));
        }
        function Ei(e) {
          var t = e.cm;
          null != e.adjustWidthTo &&
            ((t.display.sizer.style.minWidth = e.adjustWidthTo + "px"),
            e.maxScrollLeft < t.doc.scrollLeft &&
              bi(t, Math.min(t.display.scroller.scrollLeft, e.maxScrollLeft), !0),
            (t.display.maxLineChanged = !1));
          var n = e.focus && e.focus == W(R(t));
          (e.preparedSelection && t.display.input.showSelection(e.preparedSelection, n),
            (e.updatedDisplay || e.startHeight != t.doc.height) && Si(t, e.barMeasure),
            e.updatedDisplay && Zi(t, e.barMeasure),
            e.selectionChanged && Jr(t),
            t.state.focused && e.updateInput && t.display.input.reset(e.typing),
            n && ei(e.cm));
        }
        function Hi(e) {
          var t = e.cm,
            n = t.display,
            r = t.doc;
          (e.updatedDisplay && $i(t, e.update),
            null == n.wheelStartX ||
              (null == e.scrollTop && null == e.scrollLeft && !e.scrollToPos) ||
              (n.wheelStartX = n.wheelStartY = null),
            null != e.scrollTop && yi(t, e.scrollTop, e.forceScroll),
            null != e.scrollLeft && bi(t, e.scrollLeft, !0, !0),
            e.scrollToPos &&
              ai(
                t,
                si(t, mt(r, e.scrollToPos.from), mt(r, e.scrollToPos.to), e.scrollToPos.margin)
              ));
          var i = e.maybeHiddenMarkers,
            o = e.maybeUnhiddenMarkers;
          if (i) for (var l = 0; l < i.length; ++l) i[l].lines.length || Ce(i[l], "hide");
          if (o) for (var a = 0; a < o.length; ++a) o[a].lines.length && Ce(o[a], "unhide");
          (n.wrapper.offsetHeight && (r.scrollTop = t.display.scroller.scrollTop),
            e.changeObjs && Ce(t, "changes", t, e.changeObjs),
            e.update && e.update.finish());
        }
        function Pi(e, t) {
          if (e.curOp) return t();
          Oi(e);
          try {
            return t();
          } finally {
            Ni(e);
          }
        }
        function Ii(e, t) {
          return function () {
            if (e.curOp) return t.apply(e, arguments);
            Oi(e);
            try {
              return t.apply(e, arguments);
            } finally {
              Ni(e);
            }
          };
        }
        function Ri(e) {
          return function () {
            if (this.curOp) return e.apply(this, arguments);
            Oi(this);
            try {
              return e.apply(this, arguments);
            } finally {
              Ni(this);
            }
          };
        }
        function zi(e) {
          return function () {
            var t = this.cm;
            if (!t || t.curOp) return e.apply(this, arguments);
            Oi(t);
            try {
              return e.apply(this, arguments);
            } finally {
              Ni(t);
            }
          };
        }
        function Bi(e, t) {
          e.doc.highlightFrontier < e.display.viewTo && e.state.highlight.set(t, V(Vi, e));
        }
        function Vi(e) {
          var t = e.doc;
          if (!(t.highlightFrontier >= e.display.viewTo)) {
            var n = +new Date() + e.options.workTime,
              r = kt(e, t.highlightFrontier),
              i = [];
            (t.iter(r.line, Math.min(t.first + t.size, e.display.viewTo + 500), function (o) {
              if (r.line >= e.display.viewFrom) {
                var l = o.styles,
                  a = o.text.length > e.options.maxHighlightLength ? Qe(t.mode, r.state) : null,
                  s = Ct(e, o, r, !0);
                (a && (r.state = a), (o.styles = s.styles));
                var u = o.styleClasses,
                  c = s.classes;
                c ? (o.styleClasses = c) : u && (o.styleClasses = null);
                for (
                  var f =
                      !l ||
                      l.length != o.styles.length ||
                      (u != c &&
                        (!u || !c || u.bgClass != c.bgClass || u.textClass != c.textClass)),
                    d = 0;
                  !f && d < l.length;
                  ++d
                )
                  f = l[d] != o.styles[d];
                (f && i.push(r.line), (o.stateAfter = r.save()), r.nextLine());
              } else
                (o.text.length <= e.options.maxHighlightLength && Lt(e, o.text, r),
                  (o.stateAfter = r.line % 5 == 0 ? r.save() : null),
                  r.nextLine());
              if (+new Date() > n) return (Bi(e, e.options.workDelay), !0);
            }),
              (t.highlightFrontier = r.line),
              (t.modeFrontier = Math.max(t.modeFrontier, r.line)),
              i.length &&
                Pi(e, function () {
                  for (var t = 0; t < i.length; t++) Ur(e, i[t], "text");
                }));
          }
        }
        var Gi = function (e, t, n) {
          var r = e.display;
          ((this.viewport = t),
            (this.visible = li(r, e.doc, t)),
            (this.editorIsHidden = !r.wrapper.offsetWidth),
            (this.wrapperHeight = r.wrapper.clientHeight),
            (this.wrapperWidth = r.wrapper.clientWidth),
            (this.oldDisplayWidth = er(e)),
            (this.force = n),
            (this.dims = Pr(e)),
            (this.events = []));
        };
        function Ui(e) {
          var t = e.display;
          !t.scrollbarsClipped &&
            t.scroller.offsetWidth &&
            ((t.nativeBarWidth = t.scroller.offsetWidth - t.scroller.clientWidth),
            (t.heightForcer.style.height = Jn(e) + "px"),
            (t.sizer.style.marginBottom = -t.nativeBarWidth + "px"),
            (t.sizer.style.borderRightWidth = Jn(e) + "px"),
            (t.scrollbarsClipped = !0));
        }
        function _i(e) {
          if (e.hasFocus()) return null;
          var t = W(R(e));
          if (!t || !F(e.display.lineDiv, t)) return null;
          var n = { activeElt: t };
          if (window.getSelection) {
            var r = B(e).getSelection();
            r.anchorNode &&
              r.extend &&
              F(e.display.lineDiv, r.anchorNode) &&
              ((n.anchorNode = r.anchorNode),
              (n.anchorOffset = r.anchorOffset),
              (n.focusNode = r.focusNode),
              (n.focusOffset = r.focusOffset));
          }
          return n;
        }
        function ji(e) {
          if (
            e &&
            e.activeElt &&
            e.activeElt != W(z(e.activeElt)) &&
            (e.activeElt.focus(),
            !/^(INPUT|TEXTAREA)$/.test(e.activeElt.nodeName) &&
              e.anchorNode &&
              F(document.body, e.anchorNode) &&
              F(document.body, e.focusNode))
          ) {
            var t = e.activeElt.ownerDocument,
              n = t.defaultView.getSelection(),
              r = t.createRange();
            (r.setEnd(e.anchorNode, e.anchorOffset),
              r.collapse(!1),
              n.removeAllRanges(),
              n.addRange(r),
              n.extend(e.focusNode, e.focusOffset));
          }
        }
        function Ki(e, t) {
          var n = e.display,
            r = e.doc;
          if (t.editorIsHidden) return (_r(e), !1);
          if (
            !t.force &&
            t.visible.from >= n.viewFrom &&
            t.visible.to <= n.viewTo &&
            (null == n.updateLineNumbers || n.updateLineNumbers >= n.viewTo) &&
            n.renderedView == n.view &&
            0 == $r(e)
          )
            return !1;
          Ji(e) && (_r(e), (t.dims = Pr(e)));
          var i = r.first + r.size,
            o = Math.max(t.visible.from - e.options.viewportMargin, r.first),
            l = Math.min(i, t.visible.to + e.options.viewportMargin);
          (n.viewFrom < o && o - n.viewFrom < 20 && (o = Math.max(r.first, n.viewFrom)),
            n.viewTo > l && n.viewTo - l < 20 && (l = Math.min(i, n.viewTo)),
            Ht && ((o = an(e.doc, o)), (l = sn(e.doc, l))));
          var a =
            o != n.viewFrom ||
            l != n.viewTo ||
            n.lastWrapHeight != t.wrapperHeight ||
            n.lastWrapWidth != t.wrapperWidth;
          (Kr(e, o, l),
            (n.viewOffset = fn(nt(e.doc, n.viewFrom))),
            (e.display.mover.style.top = n.viewOffset + "px"));
          var s = $r(e);
          if (
            !a &&
            0 == s &&
            !t.force &&
            n.renderedView == n.view &&
            (null == n.updateLineNumbers || n.updateLineNumbers >= n.viewTo)
          )
            return !1;
          var u = _i(e);
          return (
            s > 4 && (n.lineDiv.style.display = "none"),
            Yi(e, n.updateLineNumbers, t.dims),
            s > 4 && (n.lineDiv.style.display = ""),
            (n.renderedView = n.view),
            ji(u),
            O(n.cursorDiv),
            O(n.selectionDiv),
            (n.gutters.style.height = n.sizer.style.minHeight = 0),
            a &&
              ((n.lastWrapHeight = t.wrapperHeight),
              (n.lastWrapWidth = t.wrapperWidth),
              Bi(e, 400)),
            (n.updateLineNumbers = null),
            !0
          );
        }
        function $i(e, t) {
          for (var n = t.viewport, r = !0; ; r = !1) {
            if (r && e.options.lineWrapping && t.oldDisplayWidth != er(e))
              r && (t.visible = li(e.display, e.doc, n));
            else if (
              (n &&
                null != n.top &&
                (n = { top: Math.min(e.doc.height + Zn(e.display) - tr(e), n.top) }),
              (t.visible = li(e.display, e.doc, n)),
              t.visible.from >= e.display.viewFrom && t.visible.to <= e.display.viewTo)
            )
              break;
            if (!Ki(e, t)) break;
            ii(e);
            var i = wi(e);
            (Xr(e), Si(e, i), Zi(e, i), (t.force = !1));
          }
          (t.signal(e, "update", e),
            (e.display.viewFrom == e.display.reportedViewFrom &&
              e.display.viewTo == e.display.reportedViewTo) ||
              (t.signal(e, "viewportChange", e, e.display.viewFrom, e.display.viewTo),
              (e.display.reportedViewFrom = e.display.viewFrom),
              (e.display.reportedViewTo = e.display.viewTo)));
        }
        function Xi(e, t) {
          var n = new Gi(e, t);
          if (Ki(e, n)) {
            (ii(e), $i(e, n));
            var r = wi(e);
            (Xr(e), Si(e, r), Zi(e, r), n.finish());
          }
        }
        function Yi(e, t, n) {
          var r = e.display,
            i = e.options.lineNumbers,
            o = r.lineDiv,
            l = o.firstChild;
          function a(t) {
            var n = t.nextSibling;
            return (
              s && b && e.display.currentWheelTarget == t
                ? (t.style.display = "none")
                : t.parentNode.removeChild(t),
              n
            );
          }
          for (var u = r.view, c = r.viewFrom, f = 0; f < u.length; f++) {
            var d = u[f];
            if (d.hidden);
            else if (d.node && d.node.parentNode == o) {
              for (; l != d.node; ) l = a(l);
              var h = i && null != t && t <= c && d.lineNumber;
              (d.changes && (j(d.changes, "gutter") > -1 && (h = !1), Pn(e, d, c, n)),
                h &&
                  (O(d.lineNumber),
                  d.lineNumber.appendChild(document.createTextNode(ut(e.options, c)))),
                (l = d.node.nextSibling));
            } else {
              var p = _n(e, d, c, n);
              o.insertBefore(p, l);
            }
            c += d.size;
          }
          for (; l; ) l = a(l);
        }
        function qi(e) {
          var t = e.gutters.offsetWidth;
          ((e.sizer.style.marginLeft = t + "px"), En(e, "gutterChanged", e));
        }
        function Zi(e, t) {
          ((e.display.sizer.style.minHeight = t.docHeight + "px"),
            (e.display.heightForcer.style.top = t.docHeight + "px"),
            (e.display.gutters.style.height = t.docHeight + e.display.barHeight + Jn(e) + "px"));
        }
        function Qi(e) {
          var t = e.display,
            n = t.view;
          if (t.alignWidgets || (t.gutters.firstChild && e.options.fixedGutter)) {
            for (
              var r = Ir(t) - t.scroller.scrollLeft + e.doc.scrollLeft,
                i = t.gutters.offsetWidth,
                o = r + "px",
                l = 0;
              l < n.length;
              l++
            )
              if (!n[l].hidden) {
                e.options.fixedGutter &&
                  (n[l].gutter && (n[l].gutter.style.left = o),
                  n[l].gutterBackground && (n[l].gutterBackground.style.left = o));
                var a = n[l].alignable;
                if (a) for (var s = 0; s < a.length; s++) a[s].style.left = o;
              }
            e.options.fixedGutter && (t.gutters.style.left = r + i + "px");
          }
        }
        function Ji(e) {
          if (!e.options.lineNumbers) return !1;
          var t = e.doc,
            n = ut(e.options, t.first + t.size - 1),
            r = e.display;
          if (n.length != r.lineNumChars) {
            var i = r.measure.appendChild(
                A("div", [A("div", n)], "CodeMirror-linenumber CodeMirror-gutter-elt")
              ),
              o = i.firstChild.offsetWidth,
              l = i.offsetWidth - o;
            return (
              (r.lineGutter.style.width = ""),
              (r.lineNumInnerWidth = Math.max(o, r.lineGutter.offsetWidth - l) + 1),
              (r.lineNumWidth = r.lineNumInnerWidth + l),
              (r.lineNumChars = r.lineNumInnerWidth ? n.length : -1),
              (r.lineGutter.style.width = r.lineNumWidth + "px"),
              qi(e.display),
              !0
            );
          }
          return !1;
        }
        function eo(e, t) {
          for (var n = [], r = !1, i = 0; i < e.length; i++) {
            var o = e[i],
              l = null;
            if (
              ("string" != typeof o && ((l = o.style), (o = o.className)),
              "CodeMirror-linenumbers" == o)
            ) {
              if (!t) continue;
              r = !0;
            }
            n.push({ className: o, style: l });
          }
          return (t && !r && n.push({ className: "CodeMirror-linenumbers", style: null }), n);
        }
        function to(e) {
          var t = e.gutters,
            n = e.gutterSpecs;
          (O(t), (e.lineGutter = null));
          for (var r = 0; r < n.length; ++r) {
            var i = n[r],
              o = i.className,
              l = i.style,
              a = t.appendChild(A("div", null, "CodeMirror-gutter " + o));
            (l && (a.style.cssText = l),
              "CodeMirror-linenumbers" == o &&
                ((e.lineGutter = a), (a.style.width = (e.lineNumWidth || 1) + "px")));
          }
          ((t.style.display = n.length ? "" : "none"), qi(e));
        }
        function no(e) {
          (to(e.display), Gr(e), Qi(e));
        }
        function ro(e, t, r, i) {
          var o = this;
          ((this.input = r),
            (o.scrollbarFiller = A("div", null, "CodeMirror-scrollbar-filler")),
            o.scrollbarFiller.setAttribute("cm-not-content", "true"),
            (o.gutterFiller = A("div", null, "CodeMirror-gutter-filler")),
            o.gutterFiller.setAttribute("cm-not-content", "true"),
            (o.lineDiv = D("div", null, "CodeMirror-code")),
            (o.selectionDiv = A("div", null, null, "position: relative; z-index: 1")),
            (o.cursorDiv = A("div", null, "CodeMirror-cursors")),
            (o.measure = A("div", null, "CodeMirror-measure")),
            (o.lineMeasure = A("div", null, "CodeMirror-measure")),
            (o.lineSpace = D(
              "div",
              [o.measure, o.lineMeasure, o.selectionDiv, o.cursorDiv, o.lineDiv],
              null,
              "position: relative; outline: none"
            )));
          var u = D("div", [o.lineSpace], "CodeMirror-lines");
          ((o.mover = A("div", [u], null, "position: relative")),
            (o.sizer = A("div", [o.mover], "CodeMirror-sizer")),
            (o.sizerWidth = null),
            (o.heightForcer = A(
              "div",
              null,
              null,
              "position: absolute; height: " + K + "px; width: 1px;"
            )),
            (o.gutters = A("div", null, "CodeMirror-gutters")),
            (o.lineGutter = null),
            (o.scroller = A("div", [o.sizer, o.heightForcer, o.gutters], "CodeMirror-scroll")),
            o.scroller.setAttribute("tabIndex", "-1"),
            (o.wrapper = A("div", [o.scrollbarFiller, o.gutterFiller, o.scroller], "CodeMirror")),
            c && 105 === f && (o.wrapper.style.clipPath = "inset(0px)"),
            o.wrapper.setAttribute("translate", "no"),
            l && a < 8 && ((o.gutters.style.zIndex = -1), (o.scroller.style.paddingRight = 0)),
            s || (n && y) || (o.scroller.draggable = !0),
            e && (e.appendChild ? e.appendChild(o.wrapper) : e(o.wrapper)),
            (o.viewFrom = o.viewTo = t.first),
            (o.reportedViewFrom = o.reportedViewTo = t.first),
            (o.view = []),
            (o.renderedView = null),
            (o.externalMeasured = null),
            (o.viewOffset = 0),
            (o.lastWrapHeight = o.lastWrapWidth = 0),
            (o.updateLineNumbers = null),
            (o.nativeBarWidth = o.barHeight = o.barWidth = 0),
            (o.scrollbarsClipped = !1),
            (o.lineNumWidth = o.lineNumInnerWidth = o.lineNumChars = null),
            (o.alignWidgets = !1),
            (o.cachedCharWidth = o.cachedTextHeight = o.cachedPaddingH = null),
            (o.maxLine = null),
            (o.maxLineLength = 0),
            (o.maxLineChanged = !1),
            (o.wheelDX = o.wheelDY = o.wheelStartX = o.wheelStartY = null),
            (o.shift = !1),
            (o.selForContextMenu = null),
            (o.activeTouch = null),
            (o.gutterSpecs = eo(i.gutters, i.lineNumbers)),
            to(o),
            r.init(o));
        }
        ((Gi.prototype.signal = function (e, t) {
          Le(e, t) && this.events.push(arguments);
        }),
          (Gi.prototype.finish = function () {
            for (var e = 0; e < this.events.length; e++) Ce.apply(null, this.events[e]);
          }));
        var io = 0,
          oo = null;
        function lo(e) {
          var t = e.wheelDeltaX,
            n = e.wheelDeltaY;
          return (
            null == t && e.detail && e.axis == e.HORIZONTAL_AXIS && (t = e.detail),
            null == n && e.detail && e.axis == e.VERTICAL_AXIS
              ? (n = e.detail)
              : null == n && (n = e.wheelDelta),
            { x: t, y: n }
          );
        }
        function ao(e) {
          var t = lo(e);
          return ((t.x *= oo), (t.y *= oo), t);
        }
        function so(e, t) {
          c &&
            102 == f &&
            (null == e.display.chromeScrollHack
              ? (e.display.sizer.style.pointerEvents = "none")
              : clearTimeout(e.display.chromeScrollHack),
            (e.display.chromeScrollHack = setTimeout(function () {
              ((e.display.chromeScrollHack = null), (e.display.sizer.style.pointerEvents = ""));
            }, 100)));
          var r = lo(t),
            i = r.x,
            o = r.y,
            l = oo;
          0 === t.deltaMode && ((i = t.deltaX), (o = t.deltaY), (l = 1));
          var a = e.display,
            u = a.scroller,
            h = u.scrollWidth > u.clientWidth,
            p = u.scrollHeight > u.clientHeight;
          if ((i && h) || (o && p)) {
            if (o && b && s)
              e: for (var g = t.target, v = a.view; g != u; g = g.parentNode)
                for (var m = 0; m < v.length; m++)
                  if (v[m].node == g) {
                    e.display.currentWheelTarget = g;
                    break e;
                  }
            if (i && !n && !d && null != l)
              return (
                o && p && mi(e, Math.max(0, u.scrollTop + o * l)),
                bi(e, Math.max(0, u.scrollLeft + i * l)),
                (!o || (o && p)) && Me(t),
                void (a.wheelStartX = null)
              );
            if (o && null != l) {
              var y = o * l,
                w = e.doc.scrollTop,
                x = w + a.wrapper.clientHeight;
              (y < 0 ? (w = Math.max(0, w + y - 50)) : (x = Math.min(e.doc.height, x + y + 50)),
                Xi(e, { top: w, bottom: x }));
            }
            io < 20 &&
              0 !== t.deltaMode &&
              (null == a.wheelStartX
                ? ((a.wheelStartX = u.scrollLeft),
                  (a.wheelStartY = u.scrollTop),
                  (a.wheelDX = i),
                  (a.wheelDY = o),
                  setTimeout(function () {
                    if (null != a.wheelStartX) {
                      var e = u.scrollLeft - a.wheelStartX,
                        t = u.scrollTop - a.wheelStartY,
                        n = (t && a.wheelDY && t / a.wheelDY) || (e && a.wheelDX && e / a.wheelDX);
                      ((a.wheelStartX = a.wheelStartY = null),
                        n && ((oo = (oo * io + n) / (io + 1)), ++io));
                    }
                  }, 200))
                : ((a.wheelDX += i), (a.wheelDY += o)));
          }
        }
        l ? (oo = -0.53) : n ? (oo = 15) : c ? (oo = -0.7) : h && (oo = -1 / 3);
        var uo = function (e, t) {
          ((this.ranges = e), (this.primIndex = t));
        };
        ((uo.prototype.primary = function () {
          return this.ranges[this.primIndex];
        }),
          (uo.prototype.equals = function (e) {
            if (e == this) return !0;
            if (e.primIndex != this.primIndex || e.ranges.length != this.ranges.length) return !1;
            for (var t = 0; t < this.ranges.length; t++) {
              var n = this.ranges[t],
                r = e.ranges[t];
              if (!dt(n.anchor, r.anchor) || !dt(n.head, r.head)) return !1;
            }
            return !0;
          }),
          (uo.prototype.deepCopy = function () {
            for (var e = [], t = 0; t < this.ranges.length; t++)
              e[t] = new co(ht(this.ranges[t].anchor), ht(this.ranges[t].head));
            return new uo(e, this.primIndex);
          }),
          (uo.prototype.somethingSelected = function () {
            for (var e = 0; e < this.ranges.length; e++) if (!this.ranges[e].empty()) return !0;
            return !1;
          }),
          (uo.prototype.contains = function (e, t) {
            t || (t = e);
            for (var n = 0; n < this.ranges.length; n++) {
              var r = this.ranges[n];
              if (ft(t, r.from()) >= 0 && ft(e, r.to()) <= 0) return n;
            }
            return -1;
          }));
        var co = function (e, t) {
          ((this.anchor = e), (this.head = t));
        };
        function fo(e, t, n) {
          var r = e && e.options.selectionsMayTouch,
            i = t[n];
          (t.sort(function (e, t) {
            return ft(e.from(), t.from());
          }),
            (n = j(t, i)));
          for (var o = 1; o < t.length; o++) {
            var l = t[o],
              a = t[o - 1],
              s = ft(a.to(), l.from());
            if (r && !l.empty() ? s > 0 : s >= 0) {
              var u = gt(a.from(), l.from()),
                c = pt(a.to(), l.to()),
                f = a.empty() ? l.from() == l.head : a.from() == a.head;
              (o <= n && --n, t.splice(--o, 2, new co(f ? c : u, f ? u : c)));
            }
          }
          return new uo(t, n);
        }
        function ho(e, t) {
          return new uo([new co(e, t || e)], 0);
        }
        function po(e) {
          return e.text
            ? ct(
                e.from.line + e.text.length - 1,
                ee(e.text).length + (1 == e.text.length ? e.from.ch : 0)
              )
            : e.to;
        }
        function go(e, t) {
          if (ft(e, t.from) < 0) return e;
          if (ft(e, t.to) <= 0) return po(t);
          var n = e.line + t.text.length - (t.to.line - t.from.line) - 1,
            r = e.ch;
          return (e.line == t.to.line && (r += po(t).ch - t.to.ch), ct(n, r));
        }
        function vo(e, t) {
          for (var n = [], r = 0; r < e.sel.ranges.length; r++) {
            var i = e.sel.ranges[r];
            n.push(new co(go(i.anchor, t), go(i.head, t)));
          }
          return fo(e.cm, n, e.sel.primIndex);
        }
        function mo(e, t, n) {
          return e.line == t.line
            ? ct(n.line, e.ch - t.ch + n.ch)
            : ct(n.line + (e.line - t.line), e.ch);
        }
        function yo(e, t, n) {
          for (var r = [], i = ct(e.first, 0), o = i, l = 0; l < t.length; l++) {
            var a = t[l],
              s = mo(a.from, i, o),
              u = mo(po(a), i, o);
            if (((i = a.to), (o = u), "around" == n)) {
              var c = e.sel.ranges[l],
                f = ft(c.head, c.anchor) < 0;
              r[l] = new co(f ? u : s, f ? s : u);
            } else r[l] = new co(s, s);
          }
          return new uo(r, e.sel.primIndex);
        }
        function bo(e) {
          ((e.doc.mode = Ye(e.options, e.doc.modeOption)), wo(e));
        }
        function wo(e) {
          (e.doc.iter(function (e) {
            (e.stateAfter && (e.stateAfter = null), e.styles && (e.styles = null));
          }),
            (e.doc.modeFrontier = e.doc.highlightFrontier = e.doc.first),
            Bi(e, 100),
            e.state.modeGen++,
            e.curOp && Gr(e));
        }
        function xo(e, t) {
          return (
            0 == t.from.ch &&
            0 == t.to.ch &&
            "" == ee(t.text) &&
            (!e.cm || e.cm.options.wholeLineUpdateBefore)
          );
        }
        function Co(e, t, n, r) {
          function i(e) {
            return n ? n[e] : null;
          }
          function o(e, n, i) {
            (gn(e, n, i, r), En(e, "change", e, t));
          }
          function l(e, t) {
            for (var n = [], o = e; o < t; ++o) n.push(new pn(u[o], i(o), r));
            return n;
          }
          var a = t.from,
            s = t.to,
            u = t.text,
            c = nt(e, a.line),
            f = nt(e, s.line),
            d = ee(u),
            h = i(u.length - 1),
            p = s.line - a.line;
          if (t.full) (e.insert(0, l(0, u.length)), e.remove(u.length, e.size - u.length));
          else if (xo(e, t)) {
            var g = l(0, u.length - 1);
            (o(f, f.text, h), p && e.remove(a.line, p), g.length && e.insert(a.line, g));
          } else if (c == f)
            if (1 == u.length) o(c, c.text.slice(0, a.ch) + d + c.text.slice(s.ch), h);
            else {
              var v = l(1, u.length - 1);
              (v.push(new pn(d + c.text.slice(s.ch), h, r)),
                o(c, c.text.slice(0, a.ch) + u[0], i(0)),
                e.insert(a.line + 1, v));
            }
          else if (1 == u.length)
            (o(c, c.text.slice(0, a.ch) + u[0] + f.text.slice(s.ch), i(0)),
              e.remove(a.line + 1, p));
          else {
            (o(c, c.text.slice(0, a.ch) + u[0], i(0)), o(f, d + f.text.slice(s.ch), h));
            var m = l(1, u.length - 1);
            (p > 1 && e.remove(a.line + 1, p - 1), e.insert(a.line + 1, m));
          }
          En(e, "change", e, t);
        }
        function So(e, t, n) {
          function r(e, i, o) {
            if (e.linked)
              for (var l = 0; l < e.linked.length; ++l) {
                var a = e.linked[l];
                if (a.doc != i) {
                  var s = o && a.sharedHist;
                  (n && !s) || (t(a.doc, s), r(a.doc, e, s));
                }
              }
          }
          r(e, null, !0);
        }
        function ko(e, t) {
          if (t.cm) throw new Error("This document is already in use.");
          ((e.doc = t),
            (t.cm = e),
            zr(e),
            bo(e),
            Lo(e),
            (e.options.direction = t.direction),
            e.options.lineWrapping || hn(e),
            (e.options.mode = t.modeOption),
            Gr(e));
        }
        function Lo(e) {
          ("rtl" == e.doc.direction ? E : M)(e.display.lineDiv, "CodeMirror-rtl");
        }
        function To(e) {
          Pi(e, function () {
            (Lo(e), Gr(e));
          });
        }
        function Mo(e) {
          ((this.done = []),
            (this.undone = []),
            (this.undoDepth = e ? e.undoDepth : Infinity),
            (this.lastModTime = this.lastSelTime = 0),
            (this.lastOp = this.lastSelOp = null),
            (this.lastOrigin = this.lastSelOrigin = null),
            (this.generation = this.maxGeneration = e ? e.maxGeneration : 1));
        }
        function Oo(e, t) {
          var n = { from: ht(t.from), to: po(t), text: rt(e, t.from, t.to) };
          return (
            Ho(e, n, t.from.line, t.to.line + 1),
            So(
              e,
              function (e) {
                return Ho(e, n, t.from.line, t.to.line + 1);
              },
              !0
            ),
            n
          );
        }
        function No(e) {
          for (; e.length && ee(e).ranges; ) e.pop();
        }
        function Ao(e, t) {
          return t
            ? (No(e.done), ee(e.done))
            : e.done.length && !ee(e.done).ranges
              ? ee(e.done)
              : e.done.length > 1 && !e.done[e.done.length - 2].ranges
                ? (e.done.pop(), ee(e.done))
                : void 0;
        }
        function Do(e, t, n, r) {
          var i = e.history;
          i.undone.length = 0;
          var o,
            l,
            a = +new Date();
          if (
            (i.lastOp == r ||
              (i.lastOrigin == t.origin &&
                t.origin &&
                (("+" == t.origin.charAt(0) &&
                  i.lastModTime > a - (e.cm ? e.cm.options.historyEventDelay : 500)) ||
                  "*" == t.origin.charAt(0)))) &&
            (o = Ao(i, i.lastOp == r))
          )
            ((l = ee(o.changes)),
              0 == ft(t.from, t.to) && 0 == ft(t.from, l.to)
                ? (l.to = po(t))
                : o.changes.push(Oo(e, t)));
          else {
            var s = ee(i.done);
            for (
              (s && s.ranges) || Eo(e.sel, i.done),
                o = { changes: [Oo(e, t)], generation: i.generation },
                i.done.push(o);
              i.done.length > i.undoDepth;
            )
              (i.done.shift(), i.done[0].ranges || i.done.shift());
          }
          (i.done.push(n),
            (i.generation = ++i.maxGeneration),
            (i.lastModTime = i.lastSelTime = a),
            (i.lastOp = i.lastSelOp = r),
            (i.lastOrigin = i.lastSelOrigin = t.origin),
            l || Ce(e, "historyAdded"));
        }
        function Fo(e, t, n, r) {
          var i = t.charAt(0);
          return (
            "*" == i ||
            ("+" == i &&
              n.ranges.length == r.ranges.length &&
              n.somethingSelected() == r.somethingSelected() &&
              new Date() - e.history.lastSelTime <= (e.cm ? e.cm.options.historyEventDelay : 500))
          );
        }
        function Wo(e, t, n, r) {
          var i = e.history,
            o = r && r.origin;
          (n == i.lastSelOp ||
          (o &&
            i.lastSelOrigin == o &&
            ((i.lastModTime == i.lastSelTime && i.lastOrigin == o) || Fo(e, o, ee(i.done), t)))
            ? (i.done[i.done.length - 1] = t)
            : Eo(t, i.done),
            (i.lastSelTime = +new Date()),
            (i.lastSelOrigin = o),
            (i.lastSelOp = n),
            r && !1 !== r.clearRedo && No(i.undone));
        }
        function Eo(e, t) {
          var n = ee(t);
          (n && n.ranges && n.equals(e)) || t.push(e);
        }
        function Ho(e, t, n, r) {
          var i = t["spans_" + e.id],
            o = 0;
          e.iter(Math.max(e.first, n), Math.min(e.first + e.size, r), function (n) {
            (n.markedSpans && ((i || (i = t["spans_" + e.id] = {}))[o] = n.markedSpans), ++o);
          });
        }
        function Po(e) {
          if (!e) return null;
          for (var t, n = 0; n < e.length; ++n)
            e[n].marker.explicitlyCleared ? t || (t = e.slice(0, n)) : t && t.push(e[n]);
          return t ? (t.length ? t : null) : e;
        }
        function Io(e, t) {
          var n = t["spans_" + e.id];
          if (!n) return null;
          for (var r = [], i = 0; i < t.text.length; ++i) r.push(Po(n[i]));
          return r;
        }
        function Ro(e, t) {
          var n = Io(e, t),
            r = _t(e, t);
          if (!n) return r;
          if (!r) return n;
          for (var i = 0; i < n.length; ++i) {
            var o = n[i],
              l = r[i];
            if (o && l)
              e: for (var a = 0; a < l.length; ++a) {
                for (var s = l[a], u = 0; u < o.length; ++u)
                  if (o[u].marker == s.marker) continue e;
                o.push(s);
              }
            else l && (n[i] = l);
          }
          return n;
        }
        function zo(e, t, n) {
          for (var r = [], i = 0; i < e.length; ++i) {
            var o = e[i];
            if (o.ranges) r.push(n ? uo.prototype.deepCopy.call(o) : o);
            else {
              var l = o.changes,
                a = [];
              r.push({ changes: a });
              for (var s = 0; s < l.length; ++s) {
                var u = l[s],
                  c = void 0;
                if ((a.push({ from: u.from, to: u.to, text: u.text }), t))
                  for (var f in u)
                    (c = f.match(/^spans_(\d+)$/)) &&
                      j(t, Number(c[1])) > -1 &&
                      ((ee(a)[f] = u[f]), delete u[f]);
              }
            }
          }
          return r;
        }
        function Bo(e, t, n, r) {
          if (r) {
            var i = e.anchor;
            if (n) {
              var o = ft(t, i) < 0;
              o != ft(n, i) < 0 ? ((i = t), (t = n)) : o != ft(t, n) < 0 && (t = n);
            }
            return new co(i, t);
          }
          return new co(n || t, t);
        }
        function Vo(e, t, n, r, i) {
          (null == i && (i = e.cm && (e.cm.display.shift || e.extend)),
            $o(e, new uo([Bo(e.sel.primary(), t, n, i)], 0), r));
        }
        function Go(e, t, n) {
          for (
            var r = [], i = e.cm && (e.cm.display.shift || e.extend), o = 0;
            o < e.sel.ranges.length;
            o++
          )
            r[o] = Bo(e.sel.ranges[o], t[o], null, i);
          $o(e, fo(e.cm, r, e.sel.primIndex), n);
        }
        function Uo(e, t, n, r) {
          var i = e.sel.ranges.slice(0);
          ((i[t] = n), $o(e, fo(e.cm, i, e.sel.primIndex), r));
        }
        function _o(e, t, n, r) {
          $o(e, ho(t, n), r);
        }
        function jo(e, t, n) {
          var r = {
            ranges: t.ranges,
            update: function (t) {
              this.ranges = [];
              for (var n = 0; n < t.length; n++)
                this.ranges[n] = new co(mt(e, t[n].anchor), mt(e, t[n].head));
            },
            origin: n && n.origin,
          };
          return (
            Ce(e, "beforeSelectionChange", e, r),
            e.cm && Ce(e.cm, "beforeSelectionChange", e.cm, r),
            r.ranges != t.ranges ? fo(e.cm, r.ranges, r.ranges.length - 1) : t
          );
        }
        function Ko(e, t, n) {
          var r = e.history.done,
            i = ee(r);
          i && i.ranges ? ((r[r.length - 1] = t), Xo(e, t, n)) : $o(e, t, n);
        }
        function $o(e, t, n) {
          (Xo(e, t, n), Wo(e, e.sel, e.cm ? e.cm.curOp.id : NaN, n));
        }
        function Xo(e, t, n) {
          (Le(e, "beforeSelectionChange") || (e.cm && Le(e.cm, "beforeSelectionChange"))) &&
            (t = jo(e, t, n));
          var r = (n && n.bias) || (ft(t.primary().head, e.sel.primary().head) < 0 ? -1 : 1);
          (Yo(e, Zo(e, t, r, !0)),
            (n && !1 === n.scroll) ||
              !e.cm ||
              "nocursor" == e.cm.getOption("readOnly") ||
              di(e.cm));
        }
        function Yo(e, t) {
          t.equals(e.sel) ||
            ((e.sel = t),
            e.cm && ((e.cm.curOp.updateInput = 1), (e.cm.curOp.selectionChanged = !0), ke(e.cm)),
            En(e, "cursorActivity", e));
        }
        function qo(e) {
          Yo(e, Zo(e, e.sel, null, !1));
        }
        function Zo(e, t, n, r) {
          for (var i, o = 0; o < t.ranges.length; o++) {
            var l = t.ranges[o],
              a = t.ranges.length == e.sel.ranges.length && e.sel.ranges[o],
              s = Jo(e, l.anchor, a && a.anchor, n, r),
              u = l.head == l.anchor ? s : Jo(e, l.head, a && a.head, n, r);
            (i || s != l.anchor || u != l.head) &&
              (i || (i = t.ranges.slice(0, o)), (i[o] = new co(s, u)));
          }
          return i ? fo(e.cm, i, t.primIndex) : t;
        }
        function Qo(e, t, n, r, i) {
          var o = nt(e, t.line);
          if (o.markedSpans)
            for (var l = 0; l < o.markedSpans.length; ++l) {
              var a = o.markedSpans[l],
                s = a.marker,
                u = "selectLeft" in s ? !s.selectLeft : s.inclusiveLeft,
                c = "selectRight" in s ? !s.selectRight : s.inclusiveRight;
              if (
                (null == a.from || (u ? a.from <= t.ch : a.from < t.ch)) &&
                (null == a.to || (c ? a.to >= t.ch : a.to > t.ch))
              ) {
                if (i && (Ce(s, "beforeCursorEnter"), s.explicitlyCleared)) {
                  if (o.markedSpans) {
                    --l;
                    continue;
                  }
                  break;
                }
                if (!s.atomic) continue;
                if (n) {
                  var f = s.find(r < 0 ? 1 : -1),
                    d = void 0;
                  if (
                    ((r < 0 ? c : u) && (f = el(e, f, -r, f && f.line == t.line ? o : null)),
                    f && f.line == t.line && (d = ft(f, n)) && (r < 0 ? d < 0 : d > 0))
                  )
                    return Qo(e, f, t, r, i);
                }
                var h = s.find(r < 0 ? -1 : 1);
                return (
                  (r < 0 ? u : c) && (h = el(e, h, r, h.line == t.line ? o : null)),
                  h ? Qo(e, h, t, r, i) : null
                );
              }
            }
          return t;
        }
        function Jo(e, t, n, r, i) {
          var o = r || 1,
            l =
              Qo(e, t, n, o, i) ||
              (!i && Qo(e, t, n, o, !0)) ||
              Qo(e, t, n, -o, i) ||
              (!i && Qo(e, t, n, -o, !0));
          return l || ((e.cantEdit = !0), ct(e.first, 0));
        }
        function el(e, t, n, r) {
          return n < 0 && 0 == t.ch
            ? t.line > e.first
              ? mt(e, ct(t.line - 1))
              : null
            : n > 0 && t.ch == (r || nt(e, t.line)).text.length
              ? t.line < e.first + e.size - 1
                ? ct(t.line + 1, 0)
                : null
              : new ct(t.line, t.ch + n);
        }
        function tl(e) {
          e.setSelection(ct(e.firstLine(), 0), ct(e.lastLine()), X);
        }
        function nl(e, t, n) {
          var r = {
            canceled: !1,
            from: t.from,
            to: t.to,
            text: t.text,
            origin: t.origin,
            cancel: function () {
              return (r.canceled = !0);
            },
          };
          return (
            n &&
              (r.update = function (t, n, i, o) {
                (t && (r.from = mt(e, t)),
                  n && (r.to = mt(e, n)),
                  i && (r.text = i),
                  void 0 !== o && (r.origin = o));
              }),
            Ce(e, "beforeChange", e, r),
            e.cm && Ce(e.cm, "beforeChange", e.cm, r),
            r.canceled
              ? (e.cm && (e.cm.curOp.updateInput = 2), null)
              : { from: r.from, to: r.to, text: r.text, origin: r.origin }
          );
        }
        function rl(e, t, n) {
          if (e.cm) {
            if (!e.cm.curOp) return Ii(e.cm, rl)(e, t, n);
            if (e.cm.state.suppressEdits) return;
          }
          if (
            !(Le(e, "beforeChange") || (e.cm && Le(e.cm, "beforeChange"))) ||
            (t = nl(e, t, !0))
          ) {
            var r = Et && !n && Kt(e, t.from, t.to);
            if (r)
              for (var i = r.length - 1; i >= 0; --i)
                il(e, { from: r[i].from, to: r[i].to, text: i ? [""] : t.text, origin: t.origin });
            else il(e, t);
          }
        }
        function il(e, t) {
          if (1 != t.text.length || "" != t.text[0] || 0 != ft(t.from, t.to)) {
            var n = vo(e, t);
            (Do(e, t, n, e.cm ? e.cm.curOp.id : NaN), al(e, t, n, _t(e, t)));
            var r = [];
            So(e, function (e, n) {
              (n || -1 != j(r, e.history) || (dl(e.history, t), r.push(e.history)),
                al(e, t, null, _t(e, t)));
            });
          }
        }
        function ol(e, t, n) {
          var r = e.cm && e.cm.state.suppressEdits;
          if (!r || n) {
            for (
              var i,
                o = e.history,
                l = e.sel,
                a = "undo" == t ? o.done : o.undone,
                s = "undo" == t ? o.undone : o.done,
                u = 0;
              u < a.length && ((i = a[u]), n ? !i.ranges || i.equals(e.sel) : i.ranges);
              u++
            );
            if (u != a.length) {
              for (o.lastOrigin = o.lastSelOrigin = null; ; ) {
                if (!(i = a.pop()).ranges) {
                  if (r) return void a.push(i);
                  break;
                }
                if ((Eo(i, s), n && !i.equals(e.sel))) return void $o(e, i, { clearRedo: !1 });
                l = i;
              }
              var c = [];
              (Eo(l, s),
                s.push({ changes: c, generation: o.generation }),
                (o.generation = i.generation || ++o.maxGeneration));
              for (
                var f = Le(e, "beforeChange") || (e.cm && Le(e.cm, "beforeChange")),
                  d = function (n) {
                    var r = i.changes[n];
                    if (((r.origin = t), f && !nl(e, r, !1))) return ((a.length = 0), {});
                    c.push(Oo(e, r));
                    var o = n ? vo(e, r) : ee(a);
                    (al(e, r, o, Ro(e, r)),
                      !n && e.cm && e.cm.scrollIntoView({ from: r.from, to: po(r) }));
                    var l = [];
                    So(e, function (e, t) {
                      (t || -1 != j(l, e.history) || (dl(e.history, r), l.push(e.history)),
                        al(e, r, null, Ro(e, r)));
                    });
                  },
                  h = i.changes.length - 1;
                h >= 0;
                --h
              ) {
                var p = d(h);
                if (p) return p.v;
              }
            }
          }
        }
        function ll(e, t) {
          if (
            0 != t &&
            ((e.first += t),
            (e.sel = new uo(
              te(e.sel.ranges, function (e) {
                return new co(ct(e.anchor.line + t, e.anchor.ch), ct(e.head.line + t, e.head.ch));
              }),
              e.sel.primIndex
            )),
            e.cm)
          ) {
            Gr(e.cm, e.first, e.first - t, t);
            for (var n = e.cm.display, r = n.viewFrom; r < n.viewTo; r++) Ur(e.cm, r, "gutter");
          }
        }
        function al(e, t, n, r) {
          if (e.cm && !e.cm.curOp) return Ii(e.cm, al)(e, t, n, r);
          if (t.to.line < e.first) ll(e, t.text.length - 1 - (t.to.line - t.from.line));
          else if (!(t.from.line > e.lastLine())) {
            if (t.from.line < e.first) {
              var i = t.text.length - 1 - (e.first - t.from.line);
              (ll(e, i),
                (t = {
                  from: ct(e.first, 0),
                  to: ct(t.to.line + i, t.to.ch),
                  text: [ee(t.text)],
                  origin: t.origin,
                }));
            }
            var o = e.lastLine();
            (t.to.line > o &&
              (t = {
                from: t.from,
                to: ct(o, nt(e, o).text.length),
                text: [t.text[0]],
                origin: t.origin,
              }),
              (t.removed = rt(e, t.from, t.to)),
              n || (n = vo(e, t)),
              e.cm ? sl(e.cm, t, r) : Co(e, t, r),
              Xo(e, n, X),
              e.cantEdit && Jo(e, ct(e.firstLine(), 0)) && (e.cantEdit = !1));
          }
        }
        function sl(e, t, n) {
          var r = e.doc,
            i = e.display,
            o = t.from,
            l = t.to,
            a = !1,
            s = o.line;
          (e.options.lineWrapping ||
            ((s = lt(rn(nt(r, o.line)))),
            r.iter(s, l.line + 1, function (e) {
              if (e == i.maxLine) return ((a = !0), !0);
            })),
            r.sel.contains(t.from, t.to) > -1 && ke(e),
            Co(r, t, n, Rr(e)),
            e.options.lineWrapping ||
              (r.iter(s, o.line + t.text.length, function (e) {
                var t = dn(e);
                t > i.maxLineLength &&
                  ((i.maxLine = e), (i.maxLineLength = t), (i.maxLineChanged = !0), (a = !1));
              }),
              a && (e.curOp.updateMaxLine = !0)),
            Wt(r, o.line),
            Bi(e, 400));
          var u = t.text.length - (l.line - o.line) - 1;
          t.full
            ? Gr(e)
            : o.line != l.line || 1 != t.text.length || xo(e.doc, t)
              ? Gr(e, o.line, l.line + 1, u)
              : Ur(e, o.line, "text");
          var c = Le(e, "changes"),
            f = Le(e, "change");
          if (f || c) {
            var d = { from: o, to: l, text: t.text, removed: t.removed, origin: t.origin };
            (f && En(e, "change", e, d),
              c && (e.curOp.changeObjs || (e.curOp.changeObjs = [])).push(d));
          }
          e.display.selForContextMenu = null;
        }
        function ul(e, t, n, r, i) {
          var o;
          (r || (r = n),
            ft(r, n) < 0 && ((n = (o = [r, n])[0]), (r = o[1])),
            "string" == typeof t && (t = e.splitLines(t)),
            rl(e, { from: n, to: r, text: t, origin: i }));
        }
        function cl(e, t, n, r) {
          n < e.line ? (e.line += r) : t < e.line && ((e.line = t), (e.ch = 0));
        }
        function fl(e, t, n, r) {
          for (var i = 0; i < e.length; ++i) {
            var o = e[i],
              l = !0;
            if (o.ranges) {
              o.copied || ((o = e[i] = o.deepCopy()).copied = !0);
              for (var a = 0; a < o.ranges.length; a++)
                (cl(o.ranges[a].anchor, t, n, r), cl(o.ranges[a].head, t, n, r));
            } else {
              for (var s = 0; s < o.changes.length; ++s) {
                var u = o.changes[s];
                if (n < u.from.line)
                  ((u.from = ct(u.from.line + r, u.from.ch)), (u.to = ct(u.to.line + r, u.to.ch)));
                else if (t <= u.to.line) {
                  l = !1;
                  break;
                }
              }
              l || (e.splice(0, i + 1), (i = 0));
            }
          }
        }
        function dl(e, t) {
          var n = t.from.line,
            r = t.to.line,
            i = t.text.length - (r - n) - 1;
          (fl(e.done, n, r, i), fl(e.undone, n, r, i));
        }
        function hl(e, t, n, r) {
          var i = t,
            o = t;
          return (
            "number" == typeof t ? (o = nt(e, vt(e, t))) : (i = lt(t)),
            null == i ? null : (r(o, i) && e.cm && Ur(e.cm, i, n), o)
          );
        }
        function pl(e) {
          ((this.lines = e), (this.parent = null));
          for (var t = 0, n = 0; n < e.length; ++n) ((e[n].parent = this), (t += e[n].height));
          this.height = t;
        }
        function gl(e) {
          this.children = e;
          for (var t = 0, n = 0, r = 0; r < e.length; ++r) {
            var i = e[r];
            ((t += i.chunkSize()), (n += i.height), (i.parent = this));
          }
          ((this.size = t), (this.height = n), (this.parent = null));
        }
        ((co.prototype.from = function () {
          return gt(this.anchor, this.head);
        }),
          (co.prototype.to = function () {
            return pt(this.anchor, this.head);
          }),
          (co.prototype.empty = function () {
            return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch;
          }),
          (pl.prototype = {
            chunkSize: function () {
              return this.lines.length;
            },
            // Remove the n lines at offset 'at'.
            removeInner: function (e, t) {
              for (var n = e, r = e + t; n < r; ++n) {
                var i = this.lines[n];
                ((this.height -= i.height), vn(i), En(i, "delete"));
              }
              this.lines.splice(e, t);
            },
            // Helper used to collapse a small branch into a single leaf.
            collapse: function (e) {
              e.push.apply(e, this.lines);
            },
            // Insert the given array of lines at offset 'at', count them as
            // having the given height.
            insertInner: function (e, t, n) {
              ((this.height += n),
                (this.lines = this.lines.slice(0, e).concat(t).concat(this.lines.slice(e))));
              for (var r = 0; r < t.length; ++r) t[r].parent = this;
            },
            // Used to iterate over a part of the tree.
            iterN: function (e, t, n) {
              for (var r = e + t; e < r; ++e) if (n(this.lines[e])) return !0;
            },
          }),
          (gl.prototype = {
            chunkSize: function () {
              return this.size;
            },
            removeInner: function (e, t) {
              this.size -= t;
              for (var n = 0; n < this.children.length; ++n) {
                var r = this.children[n],
                  i = r.chunkSize();
                if (e < i) {
                  var o = Math.min(t, i - e),
                    l = r.height;
                  if (
                    (r.removeInner(e, o),
                    (this.height -= l - r.height),
                    i == o && (this.children.splice(n--, 1), (r.parent = null)),
                    0 == (t -= o))
                  )
                    break;
                  e = 0;
                } else e -= i;
              }
              if (
                this.size - t < 25 &&
                (this.children.length > 1 || !(this.children[0] instanceof pl))
              ) {
                var a = [];
                (this.collapse(a), (this.children = [new pl(a)]), (this.children[0].parent = this));
              }
            },
            collapse: function (e) {
              for (var t = 0; t < this.children.length; ++t) this.children[t].collapse(e);
            },
            insertInner: function (e, t, n) {
              ((this.size += t.length), (this.height += n));
              for (var r = 0; r < this.children.length; ++r) {
                var i = this.children[r],
                  o = i.chunkSize();
                if (e <= o) {
                  if ((i.insertInner(e, t, n), i.lines && i.lines.length > 50)) {
                    for (var l = (i.lines.length % 25) + 25, a = l; a < i.lines.length; ) {
                      var s = new pl(i.lines.slice(a, (a += 25)));
                      ((i.height -= s.height), this.children.splice(++r, 0, s), (s.parent = this));
                    }
                    ((i.lines = i.lines.slice(0, l)), this.maybeSpill());
                  }
                  break;
                }
                e -= o;
              }
            },
            // When a node has grown, check whether it should be split.
            maybeSpill: function () {
              if (!(this.children.length <= 10)) {
                var e = this;
                do {
                  var t = new gl(e.children.splice(e.children.length - 5, 5));
                  if (e.parent) {
                    ((e.size -= t.size), (e.height -= t.height));
                    var n = j(e.parent.children, e);
                    e.parent.children.splice(n + 1, 0, t);
                  } else {
                    var r = new gl(e.children);
                    ((r.parent = e), (e.children = [r, t]), (e = r));
                  }
                  t.parent = e.parent;
                } while (e.children.length > 10);
                e.parent.maybeSpill();
              }
            },
            iterN: function (e, t, n) {
              for (var r = 0; r < this.children.length; ++r) {
                var i = this.children[r],
                  o = i.chunkSize();
                if (e < o) {
                  var l = Math.min(t, o - e);
                  if (i.iterN(e, l, n)) return !0;
                  if (0 == (t -= l)) break;
                  e = 0;
                } else e -= o;
              }
            },
          }));
        var vl = function (e, t, n) {
          if (n) for (var r in n) n.hasOwnProperty(r) && (this[r] = n[r]);
          ((this.doc = e), (this.node = t));
        };
        function ml(e, t, n) {
          fn(t) < ((e.curOp && e.curOp.scrollTop) || e.doc.scrollTop) && fi(e, n);
        }
        function yl(e, t, n, r) {
          var i = new vl(e, n, r),
            o = e.cm;
          return (
            o && i.noHScroll && (o.display.alignWidgets = !0),
            hl(e, t, "widget", function (t) {
              var n = t.widgets || (t.widgets = []);
              if (
                (null == i.insertAt
                  ? n.push(i)
                  : n.splice(Math.min(n.length, Math.max(0, i.insertAt)), 0, i),
                (i.line = t),
                o && !un(e, t))
              ) {
                var r = fn(t) < e.scrollTop;
                (ot(t, t.height + Xn(i)), r && fi(o, i.height), (o.curOp.forceUpdate = !0));
              }
              return !0;
            }),
            o && En(o, "lineWidgetAdded", o, i, "number" == typeof t ? t : lt(t)),
            i
          );
        }
        ((vl.prototype.clear = function () {
          var e = this.doc.cm,
            t = this.line.widgets,
            n = this.line,
            r = lt(n);
          if (null != r && t) {
            for (var i = 0; i < t.length; ++i) t[i] == this && t.splice(i--, 1);
            t.length || (n.widgets = null);
            var o = Xn(this);
            (ot(n, Math.max(0, n.height - o)),
              e &&
                (Pi(e, function () {
                  (ml(e, n, -o), Ur(e, r, "widget"));
                }),
                En(e, "lineWidgetCleared", e, this, r)));
          }
        }),
          (vl.prototype.changed = function () {
            var e = this,
              t = this.height,
              n = this.doc.cm,
              r = this.line;
            this.height = null;
            var i = Xn(this) - t;
            i &&
              (un(this.doc, r) || ot(r, r.height + i),
              n &&
                Pi(n, function () {
                  ((n.curOp.forceUpdate = !0),
                    ml(n, r, i),
                    En(n, "lineWidgetChanged", n, e, lt(r)));
                }));
          }),
          Te(vl));
        var bl = 0,
          wl = function (e, t) {
            ((this.lines = []), (this.type = t), (this.doc = e), (this.id = ++bl));
          };
        function xl(e, t, n, r, i) {
          if (r && r.shared) return Sl(e, t, n, r, i);
          if (e.cm && !e.cm.curOp) return Ii(e.cm, xl)(e, t, n, r, i);
          var o = new wl(e, i),
            l = ft(t, n);
          if ((r && G(r, o, !1), l > 0 || (0 == l && !1 !== o.clearWhenEmpty))) return o;
          if (
            (o.replacedWith &&
              ((o.collapsed = !0),
              (o.widgetNode = D("span", [o.replacedWith], "CodeMirror-widget")),
              r.handleMouseEvents || o.widgetNode.setAttribute("cm-ignore-events", "true"),
              r.insertLeft && (o.widgetNode.insertLeft = !0)),
            o.collapsed)
          ) {
            if (nn(e, t.line, t, n, o) || (t.line != n.line && nn(e, n.line, t, n, o)))
              throw new Error("Inserting collapsed marker partially overlapping an existing one");
            It();
          }
          o.addToHistory && Do(e, { from: t, to: n, origin: "markText" }, e.sel, NaN);
          var a,
            s = t.line,
            u = e.cm;
          if (
            (e.iter(s, n.line + 1, function (r) {
              (u &&
                o.collapsed &&
                !u.options.lineWrapping &&
                rn(r) == u.display.maxLine &&
                (a = !0),
                o.collapsed && s != t.line && ot(r, 0),
                Vt(
                  r,
                  new Rt(o, s == t.line ? t.ch : null, s == n.line ? n.ch : null),
                  e.cm && e.cm.curOp
                ),
                ++s);
            }),
            o.collapsed &&
              e.iter(t.line, n.line + 1, function (t) {
                un(e, t) && ot(t, 0);
              }),
            o.clearOnEnter &&
              be(o, "beforeCursorEnter", function () {
                return o.clear();
              }),
            o.readOnly &&
              (Pt(), (e.history.done.length || e.history.undone.length) && e.clearHistory()),
            o.collapsed && ((o.id = ++bl), (o.atomic = !0)),
            u)
          ) {
            if ((a && (u.curOp.updateMaxLine = !0), o.collapsed)) Gr(u, t.line, n.line + 1);
            else if (o.className || o.startStyle || o.endStyle || o.css || o.attributes || o.title)
              for (var c = t.line; c <= n.line; c++) Ur(u, c, "text");
            (o.atomic && qo(u.doc), En(u, "markerAdded", u, o));
          }
          return o;
        }
        ((wl.prototype.clear = function () {
          if (!this.explicitlyCleared) {
            var e = this.doc.cm,
              t = e && !e.curOp;
            if ((t && Oi(e), Le(this, "clear"))) {
              var n = this.find();
              n && En(this, "clear", n.from, n.to);
            }
            for (var r = null, i = null, o = 0; o < this.lines.length; ++o) {
              var l = this.lines[o],
                a = zt(l.markedSpans, this);
              (e && !this.collapsed
                ? Ur(e, lt(l), "text")
                : e && (null != a.to && (i = lt(l)), null != a.from && (r = lt(l))),
                (l.markedSpans = Bt(l.markedSpans, a)),
                null == a.from && this.collapsed && !un(this.doc, l) && e && ot(l, Er(e.display)));
            }
            if (e && this.collapsed && !e.options.lineWrapping)
              for (var s = 0; s < this.lines.length; ++s) {
                var u = rn(this.lines[s]),
                  c = dn(u);
                c > e.display.maxLineLength &&
                  ((e.display.maxLine = u),
                  (e.display.maxLineLength = c),
                  (e.display.maxLineChanged = !0));
              }
            (null != r && e && this.collapsed && Gr(e, r, i + 1),
              (this.lines.length = 0),
              (this.explicitlyCleared = !0),
              this.atomic && this.doc.cantEdit && ((this.doc.cantEdit = !1), e && qo(e.doc)),
              e && En(e, "markerCleared", e, this, r, i),
              t && Ni(e),
              this.parent && this.parent.clear());
          }
        }),
          (wl.prototype.find = function (e, t) {
            var n, r;
            null == e && "bookmark" == this.type && (e = 1);
            for (var i = 0; i < this.lines.length; ++i) {
              var o = this.lines[i],
                l = zt(o.markedSpans, this);
              if (null != l.from && ((n = ct(t ? o : lt(o), l.from)), -1 == e)) return n;
              if (null != l.to && ((r = ct(t ? o : lt(o), l.to)), 1 == e)) return r;
            }
            return n && { from: n, to: r };
          }),
          (wl.prototype.changed = function () {
            var e = this,
              t = this.find(-1, !0),
              n = this,
              r = this.doc.cm;
            t &&
              r &&
              Pi(r, function () {
                var i = t.line,
                  o = lt(t.line),
                  l = lr(r, o);
                if (
                  (l && (gr(l), (r.curOp.selectionChanged = r.curOp.forceUpdate = !0)),
                  (r.curOp.updateMaxLine = !0),
                  !un(n.doc, i) && null != n.height)
                ) {
                  var a = n.height;
                  n.height = null;
                  var s = Xn(n) - a;
                  s && ot(i, i.height + s);
                }
                En(r, "markerChanged", r, e);
              });
          }),
          (wl.prototype.attachLine = function (e) {
            if (!this.lines.length && this.doc.cm) {
              var t = this.doc.cm.curOp;
              (t.maybeHiddenMarkers && -1 != j(t.maybeHiddenMarkers, this)) ||
                (t.maybeUnhiddenMarkers || (t.maybeUnhiddenMarkers = [])).push(this);
            }
            this.lines.push(e);
          }),
          (wl.prototype.detachLine = function (e) {
            if ((this.lines.splice(j(this.lines, e), 1), !this.lines.length && this.doc.cm)) {
              var t = this.doc.cm.curOp;
              (t.maybeHiddenMarkers || (t.maybeHiddenMarkers = [])).push(this);
            }
          }),
          Te(wl));
        var Cl = function (e, t) {
          ((this.markers = e), (this.primary = t));
          for (var n = 0; n < e.length; ++n) e[n].parent = this;
        };
        function Sl(e, t, n, r, i) {
          (r = G(r)).shared = !1;
          var o = [xl(e, t, n, r, i)],
            l = o[0],
            a = r.widgetNode;
          return (
            So(e, function (e) {
              (a && (r.widgetNode = a.cloneNode(!0)), o.push(xl(e, mt(e, t), mt(e, n), r, i)));
              for (var s = 0; s < e.linked.length; ++s) if (e.linked[s].isParent) return;
              l = ee(o);
            }),
            new Cl(o, l)
          );
        }
        function kl(e) {
          return e.findMarks(ct(e.first, 0), e.clipPos(ct(e.lastLine())), function (e) {
            return e.parent;
          });
        }
        function Ll(e, t) {
          for (var n = 0; n < t.length; n++) {
            var r = t[n],
              i = r.find(),
              o = e.clipPos(i.from),
              l = e.clipPos(i.to);
            if (ft(o, l)) {
              var a = xl(e, o, l, r.primary, r.primary.type);
              (r.markers.push(a), (a.parent = r));
            }
          }
        }
        function Tl(e) {
          for (
            var t = function (t) {
                var n = e[t],
                  r = [n.primary.doc];
                So(n.primary.doc, function (e) {
                  return r.push(e);
                });
                for (var i = 0; i < n.markers.length; i++) {
                  var o = n.markers[i];
                  -1 == j(r, o.doc) && ((o.parent = null), n.markers.splice(i--, 1));
                }
              },
              n = 0;
            n < e.length;
            n++
          )
            t(n);
        }
        ((Cl.prototype.clear = function () {
          if (!this.explicitlyCleared) {
            this.explicitlyCleared = !0;
            for (var e = 0; e < this.markers.length; ++e) this.markers[e].clear();
            En(this, "clear");
          }
        }),
          (Cl.prototype.find = function (e, t) {
            return this.primary.find(e, t);
          }),
          Te(Cl));
        var Ml = 0,
          Ol = function (e, t, n, r, i) {
            if (!(this instanceof Ol)) return new Ol(e, t, n, r, i);
            (null == n && (n = 0),
              gl.call(this, [new pl([new pn("", null)])]),
              (this.first = n),
              (this.scrollTop = this.scrollLeft = 0),
              (this.cantEdit = !1),
              (this.cleanGeneration = 1),
              (this.modeFrontier = this.highlightFrontier = n));
            var o = ct(n, 0);
            ((this.sel = ho(o)),
              (this.history = new Mo(null)),
              (this.id = ++Ml),
              (this.modeOption = t),
              (this.lineSep = r),
              (this.direction = "rtl" == i ? "rtl" : "ltr"),
              (this.extend = !1),
              "string" == typeof e && (e = this.splitLines(e)),
              Co(this, { from: o, to: o, text: e }),
              $o(this, ho(o), X));
          };
        ((Ol.prototype = ie(gl.prototype, {
          constructor: Ol,
          // Iterate over the document. Supports two forms -- with only one
          // argument, it calls that for each line in the document. With
          // three, it iterates over the range given by the first two (with
          // the second being non-inclusive).
          iter: function (e, t, n) {
            n
              ? this.iterN(e - this.first, t - e, n)
              : this.iterN(this.first, this.first + this.size, e);
          },
          // Non-public interface for adding and removing lines.
          insert: function (e, t) {
            for (var n = 0, r = 0; r < t.length; ++r) n += t[r].height;
            this.insertInner(e - this.first, t, n);
          },
          remove: function (e, t) {
            this.removeInner(e - this.first, t);
          },
          // From here, the methods are part of the public interface. Most
          // are also available from CodeMirror (editor) instances.
          getValue: function (e) {
            var t = it(this, this.first, this.first + this.size);
            return !1 === e ? t : t.join(e || this.lineSeparator());
          },
          setValue: zi(function (e) {
            var t = ct(this.first, 0),
              n = this.first + this.size - 1;
            (rl(
              this,
              {
                from: t,
                to: ct(n, nt(this, n).text.length),
                text: this.splitLines(e),
                origin: "setValue",
                full: !0,
              },
              !0
            ),
              this.cm && hi(this.cm, 0, 0),
              $o(this, ho(t), X));
          }),
          replaceRange: function (e, t, n, r) {
            ul(this, e, (t = mt(this, t)), (n = n ? mt(this, n) : t), r);
          },
          getRange: function (e, t, n) {
            var r = rt(this, mt(this, e), mt(this, t));
            return !1 === n ? r : "" === n ? r.join("") : r.join(n || this.lineSeparator());
          },
          getLine: function (e) {
            var t = this.getLineHandle(e);
            return t && t.text;
          },
          getLineHandle: function (e) {
            if (st(this, e)) return nt(this, e);
          },
          getLineNumber: function (e) {
            return lt(e);
          },
          getLineHandleVisualStart: function (e) {
            return ("number" == typeof e && (e = nt(this, e)), rn(e));
          },
          lineCount: function () {
            return this.size;
          },
          firstLine: function () {
            return this.first;
          },
          lastLine: function () {
            return this.first + this.size - 1;
          },
          clipPos: function (e) {
            return mt(this, e);
          },
          getCursor: function (e) {
            var t = this.sel.primary();
            return null == e || "head" == e
              ? t.head
              : "anchor" == e
                ? t.anchor
                : "end" == e || "to" == e || !1 === e
                  ? t.to()
                  : t.from();
          },
          listSelections: function () {
            return this.sel.ranges;
          },
          somethingSelected: function () {
            return this.sel.somethingSelected();
          },
          setCursor: zi(function (e, t, n) {
            _o(this, mt(this, "number" == typeof e ? ct(e, t || 0) : e), null, n);
          }),
          setSelection: zi(function (e, t, n) {
            _o(this, mt(this, e), mt(this, t || e), n);
          }),
          extendSelection: zi(function (e, t, n) {
            Vo(this, mt(this, e), t && mt(this, t), n);
          }),
          extendSelections: zi(function (e, t) {
            Go(this, bt(this, e), t);
          }),
          extendSelectionsBy: zi(function (e, t) {
            Go(this, bt(this, te(this.sel.ranges, e)), t);
          }),
          setSelections: zi(function (e, t, n) {
            if (e.length) {
              for (var r = [], i = 0; i < e.length; i++)
                r[i] = new co(mt(this, e[i].anchor), mt(this, e[i].head || e[i].anchor));
              (null == t && (t = Math.min(e.length - 1, this.sel.primIndex)),
                $o(this, fo(this.cm, r, t), n));
            }
          }),
          addSelection: zi(function (e, t, n) {
            var r = this.sel.ranges.slice(0);
            (r.push(new co(mt(this, e), mt(this, t || e))),
              $o(this, fo(this.cm, r, r.length - 1), n));
          }),
          getSelection: function (e) {
            for (var t, n = this.sel.ranges, r = 0; r < n.length; r++) {
              var i = rt(this, n[r].from(), n[r].to());
              t = t ? t.concat(i) : i;
            }
            return !1 === e ? t : t.join(e || this.lineSeparator());
          },
          getSelections: function (e) {
            for (var t = [], n = this.sel.ranges, r = 0; r < n.length; r++) {
              var i = rt(this, n[r].from(), n[r].to());
              (!1 !== e && (i = i.join(e || this.lineSeparator())), (t[r] = i));
            }
            return t;
          },
          replaceSelection: function (e, t, n) {
            for (var r = [], i = 0; i < this.sel.ranges.length; i++) r[i] = e;
            this.replaceSelections(r, t, n || "+input");
          },
          replaceSelections: zi(function (e, t, n) {
            for (var r = [], i = this.sel, o = 0; o < i.ranges.length; o++) {
              var l = i.ranges[o];
              r[o] = { from: l.from(), to: l.to(), text: this.splitLines(e[o]), origin: n };
            }
            for (var a = t && "end" != t && yo(this, r, t), s = r.length - 1; s >= 0; s--)
              rl(this, r[s]);
            a ? Ko(this, a) : this.cm && di(this.cm);
          }),
          undo: zi(function () {
            ol(this, "undo");
          }),
          redo: zi(function () {
            ol(this, "redo");
          }),
          undoSelection: zi(function () {
            ol(this, "undo", !0);
          }),
          redoSelection: zi(function () {
            ol(this, "redo", !0);
          }),
          setExtending: function (e) {
            this.extend = e;
          },
          getExtending: function () {
            return this.extend;
          },
          historySize: function () {
            for (var e = this.history, t = 0, n = 0, r = 0; r < e.done.length; r++)
              e.done[r].ranges || ++t;
            for (var i = 0; i < e.undone.length; i++) e.undone[i].ranges || ++n;
            return { undo: t, redo: n };
          },
          clearHistory: function () {
            var e = this;
            ((this.history = new Mo(this.history)),
              So(
                this,
                function (t) {
                  return (t.history = e.history);
                },
                !0
              ));
          },
          markClean: function () {
            this.cleanGeneration = this.changeGeneration(!0);
          },
          changeGeneration: function (e) {
            return (
              e && (this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null),
              this.history.generation
            );
          },
          isClean: function (e) {
            return this.history.generation == (e || this.cleanGeneration);
          },
          getHistory: function () {
            return { done: zo(this.history.done), undone: zo(this.history.undone) };
          },
          setHistory: function (e) {
            var t = (this.history = new Mo(this.history));
            ((t.done = zo(e.done.slice(0), null, !0)),
              (t.undone = zo(e.undone.slice(0), null, !0)));
          },
          setGutterMarker: zi(function (e, t, n) {
            return hl(this, e, "gutter", function (e) {
              var r = e.gutterMarkers || (e.gutterMarkers = {});
              return ((r[t] = n), !n && se(r) && (e.gutterMarkers = null), !0);
            });
          }),
          clearGutter: zi(function (e) {
            var t = this;
            this.iter(function (n) {
              n.gutterMarkers &&
                n.gutterMarkers[e] &&
                hl(t, n, "gutter", function () {
                  return (
                    (n.gutterMarkers[e] = null),
                    se(n.gutterMarkers) && (n.gutterMarkers = null),
                    !0
                  );
                });
            });
          }),
          lineInfo: function (e) {
            var t;
            if ("number" == typeof e) {
              if (!st(this, e)) return null;
              if (((t = e), !(e = nt(this, e)))) return null;
            } else if (null == (t = lt(e))) return null;
            return {
              line: t,
              handle: e,
              text: e.text,
              gutterMarkers: e.gutterMarkers,
              textClass: e.textClass,
              bgClass: e.bgClass,
              wrapClass: e.wrapClass,
              widgets: e.widgets,
            };
          },
          addLineClass: zi(function (e, t, n) {
            return hl(this, e, "gutter" == t ? "gutter" : "class", function (e) {
              var r =
                "text" == t
                  ? "textClass"
                  : "background" == t
                    ? "bgClass"
                    : "gutter" == t
                      ? "gutterClass"
                      : "wrapClass";
              if (e[r]) {
                if (L(n).test(e[r])) return !1;
                e[r] += " " + n;
              } else e[r] = n;
              return !0;
            });
          }),
          removeLineClass: zi(function (e, t, n) {
            return hl(this, e, "gutter" == t ? "gutter" : "class", function (e) {
              var r =
                  "text" == t
                    ? "textClass"
                    : "background" == t
                      ? "bgClass"
                      : "gutter" == t
                        ? "gutterClass"
                        : "wrapClass",
                i = e[r];
              if (!i) return !1;
              if (null == n) e[r] = null;
              else {
                var o = i.match(L(n));
                if (!o) return !1;
                var l = o.index + o[0].length;
                e[r] =
                  i.slice(0, o.index) + (o.index && l != i.length ? " " : "") + i.slice(l) || null;
              }
              return !0;
            });
          }),
          addLineWidget: zi(function (e, t, n) {
            return yl(this, e, t, n);
          }),
          removeLineWidget: function (e) {
            e.clear();
          },
          markText: function (e, t, n) {
            return xl(this, mt(this, e), mt(this, t), n, (n && n.type) || "range");
          },
          setBookmark: function (e, t) {
            var n = {
              replacedWith: t && (null == t.nodeType ? t.widget : t),
              insertLeft: t && t.insertLeft,
              clearWhenEmpty: !1,
              shared: t && t.shared,
              handleMouseEvents: t && t.handleMouseEvents,
            };
            return xl(this, (e = mt(this, e)), e, n, "bookmark");
          },
          findMarksAt: function (e) {
            var t = [],
              n = nt(this, (e = mt(this, e)).line).markedSpans;
            if (n)
              for (var r = 0; r < n.length; ++r) {
                var i = n[r];
                (null == i.from || i.from <= e.ch) &&
                  (null == i.to || i.to >= e.ch) &&
                  t.push(i.marker.parent || i.marker);
              }
            return t;
          },
          findMarks: function (e, t, n) {
            ((e = mt(this, e)), (t = mt(this, t)));
            var r = [],
              i = e.line;
            return (
              this.iter(e.line, t.line + 1, function (o) {
                var l = o.markedSpans;
                if (l)
                  for (var a = 0; a < l.length; a++) {
                    var s = l[a];
                    (null != s.to && i == e.line && e.ch >= s.to) ||
                      (null == s.from && i != e.line) ||
                      (null != s.from && i == t.line && s.from >= t.ch) ||
                      (n && !n(s.marker)) ||
                      r.push(s.marker.parent || s.marker);
                  }
                ++i;
              }),
              r
            );
          },
          getAllMarks: function () {
            var e = [];
            return (
              this.iter(function (t) {
                var n = t.markedSpans;
                if (n) for (var r = 0; r < n.length; ++r) null != n[r].from && e.push(n[r].marker);
              }),
              e
            );
          },
          posFromIndex: function (e) {
            var t,
              n = this.first,
              r = this.lineSeparator().length;
            return (
              this.iter(function (i) {
                var o = i.text.length + r;
                if (o > e) return ((t = e), !0);
                ((e -= o), ++n);
              }),
              mt(this, ct(n, t))
            );
          },
          indexFromPos: function (e) {
            var t = (e = mt(this, e)).ch;
            if (e.line < this.first || e.ch < 0) return 0;
            var n = this.lineSeparator().length;
            return (
              this.iter(this.first, e.line, function (e) {
                t += e.text.length + n;
              }),
              t
            );
          },
          copy: function (e) {
            var t = new Ol(
              it(this, this.first, this.first + this.size),
              this.modeOption,
              this.first,
              this.lineSep,
              this.direction
            );
            return (
              (t.scrollTop = this.scrollTop),
              (t.scrollLeft = this.scrollLeft),
              (t.sel = this.sel),
              (t.extend = !1),
              e &&
                ((t.history.undoDepth = this.history.undoDepth), t.setHistory(this.getHistory())),
              t
            );
          },
          linkedDoc: function (e) {
            e || (e = {});
            var t = this.first,
              n = this.first + this.size;
            (null != e.from && e.from > t && (t = e.from), null != e.to && e.to < n && (n = e.to));
            var r = new Ol(
              it(this, t, n),
              e.mode || this.modeOption,
              t,
              this.lineSep,
              this.direction
            );
            return (
              e.sharedHist && (r.history = this.history),
              (this.linked || (this.linked = [])).push({ doc: r, sharedHist: e.sharedHist }),
              (r.linked = [{ doc: this, isParent: !0, sharedHist: e.sharedHist }]),
              Ll(r, kl(this)),
              r
            );
          },
          unlinkDoc: function (e) {
            if ((e instanceof Ga && (e = e.doc), this.linked))
              for (var t = 0; t < this.linked.length; ++t)
                if (this.linked[t].doc == e) {
                  (this.linked.splice(t, 1), e.unlinkDoc(this), Tl(kl(this)));
                  break;
                }
            if (e.history == this.history) {
              var n = [e.id];
              (So(
                e,
                function (e) {
                  return n.push(e.id);
                },
                !0
              ),
                (e.history = new Mo(null)),
                (e.history.done = zo(this.history.done, n)),
                (e.history.undone = zo(this.history.undone, n)));
            }
          },
          iterLinkedDocs: function (e) {
            So(this, e);
          },
          getMode: function () {
            return this.mode;
          },
          getEditor: function () {
            return this.cm;
          },
          splitLines: function (e) {
            return this.lineSep ? e.split(this.lineSep) : ze(e);
          },
          lineSeparator: function () {
            return this.lineSep || "\n";
          },
          setDirection: zi(function (e) {
            ("rtl" != e && (e = "ltr"),
              e != this.direction &&
                ((this.direction = e),
                this.iter(function (e) {
                  return (e.order = null);
                }),
                this.cm && To(this.cm)));
          }),
        })),
          (Ol.prototype.eachLine = Ol.prototype.iter));
        var Nl = 0;
        function Al(e) {
          var t = this;
          if ((Wl(t), !Se(t, e) && !Yn(t.display, e))) {
            (Me(e), l && (Nl = +new Date()));
            var n = Br(t, e, !0),
              r = e.dataTransfer.files;
            if (n && !t.isReadOnly())
              if (r && r.length && window.FileReader && window.File)
                for (
                  var i = r.length,
                    o = Array(i),
                    a = 0,
                    s = function () {
                      ++a == i &&
                        Ii(t, function () {
                          var e = {
                            from: (n = mt(t.doc, n)),
                            to: n,
                            text: t.doc.splitLines(
                              o
                                .filter(function (e) {
                                  return null != e;
                                })
                                .join(t.doc.lineSeparator())
                            ),
                            origin: "paste",
                          };
                          (rl(t.doc, e), Ko(t.doc, ho(mt(t.doc, n), mt(t.doc, po(e)))));
                        })();
                    },
                    u = function (e, n) {
                      if (
                        t.options.allowDropFileTypes &&
                        -1 == j(t.options.allowDropFileTypes, e.type)
                      )
                        s();
                      else {
                        var r = new FileReader();
                        ((r.onerror = function () {
                          return s();
                        }),
                          (r.onload = function () {
                            var e = r.result;
                            (/[\x00-\x08\x0e-\x1f]{2}/.test(e) || (o[n] = e), s());
                          }),
                          r.readAsText(e));
                      }
                    },
                    c = 0;
                  c < r.length;
                  c++
                )
                  u(r[c], c);
              else {
                if (t.state.draggingText && t.doc.sel.contains(n) > -1)
                  return (
                    t.state.draggingText(e),
                    void setTimeout(function () {
                      return t.display.input.focus();
                    }, 20)
                  );
                try {
                  var f = e.dataTransfer.getData("Text");
                  if (f) {
                    var d;
                    if (
                      (t.state.draggingText &&
                        !t.state.draggingText.copy &&
                        (d = t.listSelections()),
                      Xo(t.doc, ho(n, n)),
                      d)
                    )
                      for (var h = 0; h < d.length; ++h)
                        ul(t.doc, "", d[h].anchor, d[h].head, "drag");
                    (t.replaceSelection(f, "around", "paste"), t.display.input.focus());
                  }
                } catch (p) {}
              }
          }
        }
        function Dl(e, t) {
          if (l && (!e.state.draggingText || +new Date() - Nl < 100)) Ae(t);
          else if (
            !Se(e, t) &&
            !Yn(e.display, t) &&
            (t.dataTransfer.setData("Text", e.getSelection()),
            (t.dataTransfer.effectAllowed = "copyMove"),
            t.dataTransfer.setDragImage && !h)
          ) {
            var n = A("img", null, null, "position: fixed; left: 0; top: 0;");
            ((n.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="),
              d &&
                ((n.width = n.height = 1),
                e.display.wrapper.appendChild(n),
                (n._top = n.offsetTop)),
              t.dataTransfer.setDragImage(n, 0, 0),
              d && n.parentNode.removeChild(n));
          }
        }
        function Fl(e, t) {
          var n = Br(e, t);
          if (n) {
            var r = document.createDocumentFragment();
            (qr(e, n, r),
              e.display.dragCursor ||
                ((e.display.dragCursor = A(
                  "div",
                  null,
                  "CodeMirror-cursors CodeMirror-dragcursors"
                )),
                e.display.lineSpace.insertBefore(e.display.dragCursor, e.display.cursorDiv)),
              N(e.display.dragCursor, r));
          }
        }
        function Wl(e) {
          e.display.dragCursor &&
            (e.display.lineSpace.removeChild(e.display.dragCursor), (e.display.dragCursor = null));
        }
        function El(e) {
          if (document.getElementsByClassName) {
            for (
              var t = document.getElementsByClassName("CodeMirror"), n = [], r = 0;
              r < t.length;
              r++
            ) {
              var i = t[r].CodeMirror;
              i && n.push(i);
            }
            n.length &&
              n[0].operation(function () {
                for (var t = 0; t < n.length; t++) e(n[t]);
              });
          }
        }
        var Hl = !1;
        function Pl() {
          Hl || (Il(), (Hl = !0));
        }
        function Il() {
          var e;
          (be(window, "resize", function () {
            null == e &&
              (e = setTimeout(function () {
                ((e = null), El(Rl));
              }, 100));
          }),
            be(window, "blur", function () {
              return El(ri);
            }));
        }
        function Rl(e) {
          var t = e.display;
          ((t.cachedCharWidth = t.cachedTextHeight = t.cachedPaddingH = null),
            (t.scrollbarsClipped = !1),
            e.setSize());
        }
        for (
          var zl = {
              3: "Pause",
              8: "Backspace",
              9: "Tab",
              13: "Enter",
              16: "Shift",
              17: "Ctrl",
              18: "Alt",
              19: "Pause",
              20: "CapsLock",
              27: "Esc",
              32: "Space",
              33: "PageUp",
              34: "PageDown",
              35: "End",
              36: "Home",
              37: "Left",
              38: "Up",
              39: "Right",
              40: "Down",
              44: "PrintScrn",
              45: "Insert",
              46: "Delete",
              59: ";",
              61: "=",
              91: "Mod",
              92: "Mod",
              93: "Mod",
              106: "*",
              107: "=",
              109: "-",
              110: ".",
              111: "/",
              145: "ScrollLock",
              173: "-",
              186: ";",
              187: "=",
              188: ",",
              189: "-",
              190: ".",
              191: "/",
              192: "`",
              219: "[",
              220: "\\",
              221: "]",
              222: "'",
              224: "Mod",
              63232: "Up",
              63233: "Down",
              63234: "Left",
              63235: "Right",
              63272: "Delete",
              63273: "Home",
              63275: "End",
              63276: "PageUp",
              63277: "PageDown",
              63302: "Insert",
            },
            Bl = 0;
          Bl < 10;
          Bl++
        )
          zl[Bl + 48] = zl[Bl + 96] = String(Bl);
        for (var Vl = 65; Vl <= 90; Vl++) zl[Vl] = String.fromCharCode(Vl);
        for (var Gl = 1; Gl <= 12; Gl++) zl[Gl + 111] = zl[Gl + 63235] = "F" + Gl;
        var Ul = {};
        function _l(e) {
          var t,
            n,
            r,
            i,
            o = e.split(/-(?!$)/);
          e = o[o.length - 1];
          for (var l = 0; l < o.length - 1; l++) {
            var a = o[l];
            if (/^(cmd|meta|m)$/i.test(a)) i = !0;
            else if (/^a(lt)?$/i.test(a)) t = !0;
            else if (/^(c|ctrl|control)$/i.test(a)) n = !0;
            else {
              if (!/^s(hift)?$/i.test(a)) throw new Error("Unrecognized modifier name: " + a);
              r = !0;
            }
          }
          return (
            t && (e = "Alt-" + e),
            n && (e = "Ctrl-" + e),
            i && (e = "Cmd-" + e),
            r && (e = "Shift-" + e),
            e
          );
        }
        function jl(e) {
          var t = {};
          for (var n in e)
            if (e.hasOwnProperty(n)) {
              var r = e[n];
              if (/^(name|fallthrough|(de|at)tach)$/.test(n)) continue;
              if ("..." == r) {
                delete e[n];
                continue;
              }
              for (var i = te(n.split(" "), _l), o = 0; o < i.length; o++) {
                var l = void 0,
                  a = void 0;
                o == i.length - 1
                  ? ((a = i.join(" ")), (l = r))
                  : ((a = i.slice(0, o + 1).join(" ")), (l = "..."));
                var s = t[a];
                if (s) {
                  if (s != l) throw new Error("Inconsistent bindings for " + a);
                } else t[a] = l;
              }
              delete e[n];
            }
          for (var u in t) e[u] = t[u];
          return e;
        }
        function Kl(e, t, n, r) {
          var i = (t = ql(t)).call ? t.call(e, r) : t[e];
          if (!1 === i) return "nothing";
          if ("..." === i) return "multi";
          if (null != i && n(i)) return "handled";
          if (t.fallthrough) {
            if ("[object Array]" != Object.prototype.toString.call(t.fallthrough))
              return Kl(e, t.fallthrough, n, r);
            for (var o = 0; o < t.fallthrough.length; o++) {
              var l = Kl(e, t.fallthrough[o], n, r);
              if (l) return l;
            }
          }
        }
        function $l(e) {
          var t = "string" == typeof e ? e : zl[e.keyCode];
          return "Ctrl" == t || "Alt" == t || "Shift" == t || "Mod" == t;
        }
        function Xl(e, t, n) {
          var r = e;
          return (
            t.altKey && "Alt" != r && (e = "Alt-" + e),
            (S ? t.metaKey : t.ctrlKey) && "Ctrl" != r && (e = "Ctrl-" + e),
            (S ? t.ctrlKey : t.metaKey) && "Mod" != r && (e = "Cmd-" + e),
            !n && t.shiftKey && "Shift" != r && (e = "Shift-" + e),
            e
          );
        }
        function Yl(e, t) {
          if (d && 34 == e.keyCode && e.char) return !1;
          var n = zl[e.keyCode];
          return (
            null != n && !e.altGraphKey && (3 == e.keyCode && e.code && (n = e.code), Xl(n, e, t))
          );
        }
        function ql(e) {
          return "string" == typeof e ? Ul[e] : e;
        }
        function Zl(e, t) {
          for (var n = e.doc.sel.ranges, r = [], i = 0; i < n.length; i++) {
            for (var o = t(n[i]); r.length && ft(o.from, ee(r).to) <= 0; ) {
              var l = r.pop();
              if (ft(l.from, o.from) < 0) {
                o.from = l.from;
                break;
              }
            }
            r.push(o);
          }
          Pi(e, function () {
            for (var t = r.length - 1; t >= 0; t--) ul(e.doc, "", r[t].from, r[t].to, "+delete");
            di(e);
          });
        }
        function Ql(e, t, n) {
          var r = fe(e.text, t + n, n);
          return r < 0 || r > e.text.length ? null : r;
        }
        function Jl(e, t, n) {
          var r = Ql(e, t.ch, n);
          return null == r ? null : new ct(t.line, r, n < 0 ? "after" : "before");
        }
        function ea(e, t, n, r, i) {
          if (e) {
            "rtl" == t.doc.direction && (i = -i);
            var o = me(n, t.doc.direction);
            if (o) {
              var l,
                a = i < 0 ? ee(o) : o[0],
                s = i < 0 == (1 == a.level) ? "after" : "before";
              if (a.level > 0 || "rtl" == t.doc.direction) {
                var u = ar(t, n);
                l = i < 0 ? n.text.length - 1 : 0;
                var c = sr(t, u, l).top;
                ((l = de(
                  function (e) {
                    return sr(t, u, e).top == c;
                  },
                  i < 0 == (1 == a.level) ? a.from : a.to - 1,
                  l
                )),
                  "before" == s && (l = Ql(n, l, 1)));
              } else l = i < 0 ? a.to : a.from;
              return new ct(r, l, s);
            }
          }
          return new ct(r, i < 0 ? n.text.length : 0, i < 0 ? "before" : "after");
        }
        function ta(e, t, n, r) {
          var i = me(t, e.doc.direction);
          if (!i) return Jl(t, n, r);
          n.ch >= t.text.length
            ? ((n.ch = t.text.length), (n.sticky = "before"))
            : n.ch <= 0 && ((n.ch = 0), (n.sticky = "after"));
          var o = ge(i, n.ch, n.sticky),
            l = i[o];
          if ("ltr" == e.doc.direction && l.level % 2 == 0 && (r > 0 ? l.to > n.ch : l.from < n.ch))
            return Jl(t, n, r);
          var a,
            s = function (e, n) {
              return Ql(t, e instanceof ct ? e.ch : e, n);
            },
            u = function (n) {
              return e.options.lineWrapping
                ? ((a = a || ar(e, t)), Nr(e, t, a, n))
                : { begin: 0, end: t.text.length };
            },
            c = u("before" == n.sticky ? s(n, -1) : n.ch);
          if ("rtl" == e.doc.direction || 1 == l.level) {
            var f = (1 == l.level) == r < 0,
              d = s(n, f ? 1 : -1);
            if (null != d && (f ? d <= l.to && d <= c.end : d >= l.from && d >= c.begin)) {
              var h = f ? "before" : "after";
              return new ct(n.line, d, h);
            }
          }
          var p = function (e, t, r) {
              for (
                var o = function (e, t) {
                  return t ? new ct(n.line, s(e, 1), "before") : new ct(n.line, e, "after");
                };
                e >= 0 && e < i.length;
                e += t
              ) {
                var l = i[e],
                  a = t > 0 == (1 != l.level),
                  u = a ? r.begin : s(r.end, -1);
                if (l.from <= u && u < l.to) return o(u, a);
                if (((u = a ? l.from : s(l.to, -1)), r.begin <= u && u < r.end)) return o(u, a);
              }
            },
            g = p(o + r, r, c);
          if (g) return g;
          var v = r > 0 ? c.end : s(c.begin, -1);
          return null == v ||
            (r > 0 && v == t.text.length) ||
            !(g = p(r > 0 ? 0 : i.length - 1, r, u(v)))
            ? null
            : g;
        }
        ((Ul.basic = {
          Left: "goCharLeft",
          Right: "goCharRight",
          Up: "goLineUp",
          Down: "goLineDown",
          End: "goLineEnd",
          Home: "goLineStartSmart",
          PageUp: "goPageUp",
          PageDown: "goPageDown",
          Delete: "delCharAfter",
          Backspace: "delCharBefore",
          "Shift-Backspace": "delCharBefore",
          Tab: "defaultTab",
          "Shift-Tab": "indentAuto",
          Enter: "newlineAndIndent",
          Insert: "toggleOverwrite",
          Esc: "singleSelection",
        }),
          (Ul.pcDefault = {
            "Ctrl-A": "selectAll",
            "Ctrl-D": "deleteLine",
            "Ctrl-Z": "undo",
            "Shift-Ctrl-Z": "redo",
            "Ctrl-Y": "redo",
            "Ctrl-Home": "goDocStart",
            "Ctrl-End": "goDocEnd",
            "Ctrl-Up": "goLineUp",
            "Ctrl-Down": "goLineDown",
            "Ctrl-Left": "goGroupLeft",
            "Ctrl-Right": "goGroupRight",
            "Alt-Left": "goLineStart",
            "Alt-Right": "goLineEnd",
            "Ctrl-Backspace": "delGroupBefore",
            "Ctrl-Delete": "delGroupAfter",
            "Ctrl-S": "save",
            "Ctrl-F": "find",
            "Ctrl-G": "findNext",
            "Shift-Ctrl-G": "findPrev",
            "Shift-Ctrl-F": "replace",
            "Shift-Ctrl-R": "replaceAll",
            "Ctrl-[": "indentLess",
            "Ctrl-]": "indentMore",
            "Ctrl-U": "undoSelection",
            "Shift-Ctrl-U": "redoSelection",
            "Alt-U": "redoSelection",
            fallthrough: "basic",
          }),
          (Ul.emacsy = {
            "Ctrl-F": "goCharRight",
            "Ctrl-B": "goCharLeft",
            "Ctrl-P": "goLineUp",
            "Ctrl-N": "goLineDown",
            "Ctrl-A": "goLineStart",
            "Ctrl-E": "goLineEnd",
            "Ctrl-V": "goPageDown",
            "Shift-Ctrl-V": "goPageUp",
            "Ctrl-D": "delCharAfter",
            "Ctrl-H": "delCharBefore",
            "Alt-Backspace": "delWordBefore",
            "Ctrl-K": "killLine",
            "Ctrl-T": "transposeChars",
            "Ctrl-O": "openLine",
          }),
          (Ul.macDefault = {
            "Cmd-A": "selectAll",
            "Cmd-D": "deleteLine",
            "Cmd-Z": "undo",
            "Shift-Cmd-Z": "redo",
            "Cmd-Y": "redo",
            "Cmd-Home": "goDocStart",
            "Cmd-Up": "goDocStart",
            "Cmd-End": "goDocEnd",
            "Cmd-Down": "goDocEnd",
            "Alt-Left": "goGroupLeft",
            "Alt-Right": "goGroupRight",
            "Cmd-Left": "goLineLeft",
            "Cmd-Right": "goLineRight",
            "Alt-Backspace": "delGroupBefore",
            "Ctrl-Alt-Backspace": "delGroupAfter",
            "Alt-Delete": "delGroupAfter",
            "Cmd-S": "save",
            "Cmd-F": "find",
            "Cmd-G": "findNext",
            "Shift-Cmd-G": "findPrev",
            "Cmd-Alt-F": "replace",
            "Shift-Cmd-Alt-F": "replaceAll",
            "Cmd-[": "indentLess",
            "Cmd-]": "indentMore",
            "Cmd-Backspace": "delWrappedLineLeft",
            "Cmd-Delete": "delWrappedLineRight",
            "Cmd-U": "undoSelection",
            "Shift-Cmd-U": "redoSelection",
            "Ctrl-Up": "goDocStart",
            "Ctrl-Down": "goDocEnd",
            fallthrough: ["basic", "emacsy"],
          }),
          (Ul.default = b ? Ul.macDefault : Ul.pcDefault));
        var na = {
          selectAll: tl,
          singleSelection: function (e) {
            return e.setSelection(e.getCursor("anchor"), e.getCursor("head"), X);
          },
          killLine: function (e) {
            return Zl(e, function (t) {
              if (t.empty()) {
                var n = nt(e.doc, t.head.line).text.length;
                return t.head.ch == n && t.head.line < e.lastLine()
                  ? { from: t.head, to: ct(t.head.line + 1, 0) }
                  : { from: t.head, to: ct(t.head.line, n) };
              }
              return { from: t.from(), to: t.to() };
            });
          },
          deleteLine: function (e) {
            return Zl(e, function (t) {
              return { from: ct(t.from().line, 0), to: mt(e.doc, ct(t.to().line + 1, 0)) };
            });
          },
          delLineLeft: function (e) {
            return Zl(e, function (e) {
              return { from: ct(e.from().line, 0), to: e.from() };
            });
          },
          delWrappedLineLeft: function (e) {
            return Zl(e, function (t) {
              var n = e.charCoords(t.head, "div").top + 5;
              return { from: e.coordsChar({ left: 0, top: n }, "div"), to: t.from() };
            });
          },
          delWrappedLineRight: function (e) {
            return Zl(e, function (t) {
              var n = e.charCoords(t.head, "div").top + 5,
                r = e.coordsChar({ left: e.display.lineDiv.offsetWidth + 100, top: n }, "div");
              return { from: t.from(), to: r };
            });
          },
          undo: function (e) {
            return e.undo();
          },
          redo: function (e) {
            return e.redo();
          },
          undoSelection: function (e) {
            return e.undoSelection();
          },
          redoSelection: function (e) {
            return e.redoSelection();
          },
          goDocStart: function (e) {
            return e.extendSelection(ct(e.firstLine(), 0));
          },
          goDocEnd: function (e) {
            return e.extendSelection(ct(e.lastLine()));
          },
          goLineStart: function (e) {
            return e.extendSelectionsBy(
              function (t) {
                return ra(e, t.head.line);
              },
              { origin: "+move", bias: 1 }
            );
          },
          goLineStartSmart: function (e) {
            return e.extendSelectionsBy(
              function (t) {
                return oa(e, t.head);
              },
              { origin: "+move", bias: 1 }
            );
          },
          goLineEnd: function (e) {
            return e.extendSelectionsBy(
              function (t) {
                return ia(e, t.head.line);
              },
              { origin: "+move", bias: -1 }
            );
          },
          goLineRight: function (e) {
            return e.extendSelectionsBy(function (t) {
              var n = e.cursorCoords(t.head, "div").top + 5;
              return e.coordsChar({ left: e.display.lineDiv.offsetWidth + 100, top: n }, "div");
            }, q);
          },
          goLineLeft: function (e) {
            return e.extendSelectionsBy(function (t) {
              var n = e.cursorCoords(t.head, "div").top + 5;
              return e.coordsChar({ left: 0, top: n }, "div");
            }, q);
          },
          goLineLeftSmart: function (e) {
            return e.extendSelectionsBy(function (t) {
              var n = e.cursorCoords(t.head, "div").top + 5,
                r = e.coordsChar({ left: 0, top: n }, "div");
              return r.ch < e.getLine(r.line).search(/\S/) ? oa(e, t.head) : r;
            }, q);
          },
          goLineUp: function (e) {
            return e.moveV(-1, "line");
          },
          goLineDown: function (e) {
            return e.moveV(1, "line");
          },
          goPageUp: function (e) {
            return e.moveV(-1, "page");
          },
          goPageDown: function (e) {
            return e.moveV(1, "page");
          },
          goCharLeft: function (e) {
            return e.moveH(-1, "char");
          },
          goCharRight: function (e) {
            return e.moveH(1, "char");
          },
          goColumnLeft: function (e) {
            return e.moveH(-1, "column");
          },
          goColumnRight: function (e) {
            return e.moveH(1, "column");
          },
          goWordLeft: function (e) {
            return e.moveH(-1, "word");
          },
          goGroupRight: function (e) {
            return e.moveH(1, "group");
          },
          goGroupLeft: function (e) {
            return e.moveH(-1, "group");
          },
          goWordRight: function (e) {
            return e.moveH(1, "word");
          },
          delCharBefore: function (e) {
            return e.deleteH(-1, "codepoint");
          },
          delCharAfter: function (e) {
            return e.deleteH(1, "char");
          },
          delWordBefore: function (e) {
            return e.deleteH(-1, "word");
          },
          delWordAfter: function (e) {
            return e.deleteH(1, "word");
          },
          delGroupBefore: function (e) {
            return e.deleteH(-1, "group");
          },
          delGroupAfter: function (e) {
            return e.deleteH(1, "group");
          },
          indentAuto: function (e) {
            return e.indentSelection("smart");
          },
          indentMore: function (e) {
            return e.indentSelection("add");
          },
          indentLess: function (e) {
            return e.indentSelection("subtract");
          },
          insertTab: function (e) {
            return e.replaceSelection("\t");
          },
          insertSoftTab: function (e) {
            for (
              var t = [], n = e.listSelections(), r = e.options.tabSize, i = 0;
              i < n.length;
              i++
            ) {
              var o = n[i].from(),
                l = U(e.getLine(o.line), o.ch, r);
              t.push(J(r - (l % r)));
            }
            e.replaceSelections(t);
          },
          defaultTab: function (e) {
            e.somethingSelected() ? e.indentSelection("add") : e.execCommand("insertTab");
          },
          // Swap the two chars left and right of each selection's head.
          // Move cursor behind the two swapped characters afterwards.
          // Doesn't consider line feeds a character.
          // Doesn't scan more than one line above to find a character.
          // Doesn't do anything on an empty line.
          // Doesn't do anything with non-empty selections.
          transposeChars: function (e) {
            return Pi(e, function () {
              for (var t = e.listSelections(), n = [], r = 0; r < t.length; r++)
                if (t[r].empty()) {
                  var i = t[r].head,
                    o = nt(e.doc, i.line).text;
                  if (o)
                    if ((i.ch == o.length && (i = new ct(i.line, i.ch - 1)), i.ch > 0))
                      ((i = new ct(i.line, i.ch + 1)),
                        e.replaceRange(
                          o.charAt(i.ch - 1) + o.charAt(i.ch - 2),
                          ct(i.line, i.ch - 2),
                          i,
                          "+transpose"
                        ));
                    else if (i.line > e.doc.first) {
                      var l = nt(e.doc, i.line - 1).text;
                      l &&
                        ((i = new ct(i.line, 1)),
                        e.replaceRange(
                          o.charAt(0) + e.doc.lineSeparator() + l.charAt(l.length - 1),
                          ct(i.line - 1, l.length - 1),
                          i,
                          "+transpose"
                        ));
                    }
                  n.push(new co(i, i));
                }
              e.setSelections(n);
            });
          },
          newlineAndIndent: function (e) {
            return Pi(e, function () {
              for (var t = e.listSelections(), n = t.length - 1; n >= 0; n--)
                e.replaceRange(e.doc.lineSeparator(), t[n].anchor, t[n].head, "+input");
              t = e.listSelections();
              for (var r = 0; r < t.length; r++) e.indentLine(t[r].from().line, null, !0);
              di(e);
            });
          },
          openLine: function (e) {
            return e.replaceSelection("\n", "start");
          },
          toggleOverwrite: function (e) {
            return e.toggleOverwrite();
          },
        };
        function ra(e, t) {
          var n = nt(e.doc, t),
            r = rn(n);
          return (r != n && (t = lt(r)), ea(!0, e, r, t, 1));
        }
        function ia(e, t) {
          var n = nt(e.doc, t),
            r = on(n);
          return (r != n && (t = lt(r)), ea(!0, e, n, t, -1));
        }
        function oa(e, t) {
          var n = ra(e, t.line),
            r = nt(e.doc, n.line),
            i = me(r, e.doc.direction);
          if (!i || 0 == i[0].level) {
            var o = Math.max(n.ch, r.text.search(/\S/)),
              l = t.line == n.line && t.ch <= o && t.ch;
            return ct(n.line, l ? 0 : o, n.sticky);
          }
          return n;
        }
        function la(e, t, n) {
          if ("string" == typeof t && !(t = na[t])) return !1;
          e.display.input.ensurePolled();
          var r = e.display.shift,
            i = !1;
          try {
            (e.isReadOnly() && (e.state.suppressEdits = !0),
              n && (e.display.shift = !1),
              (i = t(e) != $));
          } finally {
            ((e.display.shift = r), (e.state.suppressEdits = !1));
          }
          return i;
        }
        function aa(e, t, n) {
          for (var r = 0; r < e.state.keyMaps.length; r++) {
            var i = Kl(t, e.state.keyMaps[r], n, e);
            if (i) return i;
          }
          return (
            (e.options.extraKeys && Kl(t, e.options.extraKeys, n, e)) ||
            Kl(t, e.options.keyMap, n, e)
          );
        }
        var sa = new _();
        function ua(e, t, n, r) {
          var i = e.state.keySeq;
          if (i) {
            if ($l(t)) return "handled";
            if (
              (/\'$/.test(t)
                ? (e.state.keySeq = null)
                : sa.set(50, function () {
                    e.state.keySeq == i && ((e.state.keySeq = null), e.display.input.reset());
                  }),
              ca(e, i + " " + t, n, r))
            )
              return !0;
          }
          return ca(e, t, n, r);
        }
        function ca(e, t, n, r) {
          var i = aa(e, t, r);
          return (
            "multi" == i && (e.state.keySeq = t),
            "handled" == i && En(e, "keyHandled", e, t, n),
            ("handled" != i && "multi" != i) || (Me(n), Jr(e)),
            !!i
          );
        }
        function fa(e, t) {
          var n = Yl(t, !0);
          return (
            !!n &&
            (t.shiftKey && !e.state.keySeq
              ? ua(e, "Shift-" + n, t, function (t) {
                  return la(e, t, !0);
                }) ||
                ua(e, n, t, function (t) {
                  if ("string" == typeof t ? /^go[A-Z]/.test(t) : t.motion) return la(e, t);
                })
              : ua(e, n, t, function (t) {
                  return la(e, t);
                }))
          );
        }
        function da(e, t, n) {
          return ua(e, "'" + n + "'", t, function (t) {
            return la(e, t, !0);
          });
        }
        var ha = null;
        function pa(e) {
          var t = this;
          if (
            !(
              (e.target && e.target != t.display.input.getField()) ||
              ((t.curOp.focus = W(R(t))), Se(t, e))
            )
          ) {
            l && a < 11 && 27 == e.keyCode && (e.returnValue = !1);
            var r = e.keyCode;
            t.display.shift = 16 == r || e.shiftKey;
            var i = fa(t, e);
            (d &&
              ((ha = i ? r : null),
              i ||
                88 != r ||
                Ve ||
                !(b ? e.metaKey : e.ctrlKey) ||
                t.replaceSelection("", null, "cut")),
              n &&
                !b &&
                !i &&
                46 == r &&
                e.shiftKey &&
                !e.ctrlKey &&
                document.execCommand &&
                document.execCommand("cut"),
              18 != r || /\bCodeMirror-crosshair\b/.test(t.display.lineDiv.className) || ga(t));
          }
        }
        function ga(e) {
          var t = e.display.lineDiv;
          function n(e) {
            (18 != e.keyCode && e.altKey) ||
              (M(t, "CodeMirror-crosshair"),
              xe(document, "keyup", n),
              xe(document, "mouseover", n));
          }
          (E(t, "CodeMirror-crosshair"), be(document, "keyup", n), be(document, "mouseover", n));
        }
        function va(e) {
          (16 == e.keyCode && (this.doc.sel.shift = !1), Se(this, e));
        }
        function ma(e) {
          var t = this;
          if (
            !(
              (e.target && e.target != t.display.input.getField()) ||
              Yn(t.display, e) ||
              Se(t, e) ||
              (e.ctrlKey && !e.altKey) ||
              (b && e.metaKey)
            )
          ) {
            var n = e.keyCode,
              r = e.charCode;
            if (d && n == ha) return ((ha = null), void Me(e));
            if (!d || (e.which && !(e.which < 10)) || !fa(t, e)) {
              var i = String.fromCharCode(null == r ? n : r);
              "\b" != i && (da(t, e, i) || t.display.input.onKeyPress(e));
            }
          }
        }
        var ya,
          ba,
          wa = 400,
          xa = function (e, t, n) {
            ((this.time = e), (this.pos = t), (this.button = n));
          };
        function Ca(e, t) {
          var n = +new Date();
          return ba && ba.compare(n, e, t)
            ? ((ya = ba = null), "triple")
            : ya && ya.compare(n, e, t)
              ? ((ba = new xa(n, e, t)), (ya = null), "double")
              : ((ya = new xa(n, e, t)), (ba = null), "single");
        }
        function Sa(e) {
          var t = this,
            n = t.display;
          if (!(Se(t, e) || (n.activeTouch && n.input.supportsTouch())))
            if ((n.input.ensurePolled(), (n.shift = e.shiftKey), Yn(n, e)))
              s ||
                ((n.scroller.draggable = !1),
                setTimeout(function () {
                  return (n.scroller.draggable = !0);
                }, 100));
            else if (!Fa(t, e)) {
              var r = Br(t, e),
                i = Fe(e),
                o = r ? Ca(r, i) : "single";
              (B(t).focus(),
                1 == i && t.state.selectingText && t.state.selectingText(e),
                (r && ka(t, i, r, o, e)) ||
                  (1 == i
                    ? r
                      ? Ta(t, r, o, e)
                      : De(e) == n.scroller && Me(e)
                    : 2 == i
                      ? (r && Vo(t.doc, r),
                        setTimeout(function () {
                          return n.input.focus();
                        }, 20))
                      : 3 == i && (k ? t.display.input.onContextMenu(e) : ti(t))));
            }
        }
        function ka(e, t, n, r, i) {
          var o = "Click";
          return (
            "double" == r ? (o = "Double" + o) : "triple" == r && (o = "Triple" + o),
            ua(
              e,
              Xl((o = (1 == t ? "Left" : 2 == t ? "Middle" : "Right") + o), i),
              i,
              function (t) {
                if (("string" == typeof t && (t = na[t]), !t)) return !1;
                var r = !1;
                try {
                  (e.isReadOnly() && (e.state.suppressEdits = !0), (r = t(e, n) != $));
                } finally {
                  e.state.suppressEdits = !1;
                }
                return r;
              }
            )
          );
        }
        function La(e, t, n) {
          var r = e.getOption("configureMouse"),
            i = r ? r(e, t, n) : {};
          if (null == i.unit) {
            var o = w ? n.shiftKey && n.metaKey : n.altKey;
            i.unit = o ? "rectangle" : "single" == t ? "char" : "double" == t ? "word" : "line";
          }
          return (
            (null == i.extend || e.doc.extend) && (i.extend = e.doc.extend || n.shiftKey),
            null == i.addNew && (i.addNew = b ? n.metaKey : n.ctrlKey),
            null == i.moveOnDrag && (i.moveOnDrag = !(b ? n.altKey : n.ctrlKey)),
            i
          );
        }
        function Ta(e, t, n, r) {
          l ? setTimeout(V(ei, e), 0) : (e.curOp.focus = W(R(e)));
          var i,
            o = La(e, n, r),
            a = e.doc.sel;
          e.options.dragDrop &&
          He &&
          !e.isReadOnly() &&
          "single" == n &&
          (i = a.contains(t)) > -1 &&
          (ft((i = a.ranges[i]).from(), t) < 0 || t.xRel > 0) &&
          (ft(i.to(), t) > 0 || t.xRel < 0)
            ? Ma(e, r, t, o)
            : Na(e, r, t, o);
        }
        function Ma(e, t, n, r) {
          var i = e.display,
            o = !1,
            u = Ii(e, function (t) {
              (s && (i.scroller.draggable = !1),
                (e.state.draggingText = !1),
                e.state.delayingBlurEvent &&
                  (e.hasFocus() ? (e.state.delayingBlurEvent = !1) : ti(e)),
                xe(i.wrapper.ownerDocument, "mouseup", u),
                xe(i.wrapper.ownerDocument, "mousemove", c),
                xe(i.scroller, "dragstart", f),
                xe(i.scroller, "drop", u),
                o ||
                  (Me(t),
                  r.addNew || Vo(e.doc, n, null, null, r.extend),
                  (s && !h) || (l && 9 == a)
                    ? setTimeout(function () {
                        (i.wrapper.ownerDocument.body.focus({ preventScroll: !0 }),
                          i.input.focus());
                      }, 20)
                    : i.input.focus()));
            }),
            c = function (e) {
              o = o || Math.abs(t.clientX - e.clientX) + Math.abs(t.clientY - e.clientY) >= 10;
            },
            f = function () {
              return (o = !0);
            };
          (s && (i.scroller.draggable = !0),
            (e.state.draggingText = u),
            (u.copy = !r.moveOnDrag),
            be(i.wrapper.ownerDocument, "mouseup", u),
            be(i.wrapper.ownerDocument, "mousemove", c),
            be(i.scroller, "dragstart", f),
            be(i.scroller, "drop", u),
            (e.state.delayingBlurEvent = !0),
            setTimeout(function () {
              return i.input.focus();
            }, 20),
            i.scroller.dragDrop && i.scroller.dragDrop());
        }
        function Oa(e, t, n) {
          if ("char" == n) return new co(t, t);
          if ("word" == n) return e.findWordAt(t);
          if ("line" == n) return new co(ct(t.line, 0), mt(e.doc, ct(t.line + 1, 0)));
          var r = n(e, t);
          return new co(r.from, r.to);
        }
        function Na(e, t, n, r) {
          l && ti(e);
          var i = e.display,
            o = e.doc;
          Me(t);
          var a,
            s,
            u = o.sel,
            c = u.ranges;
          if (
            (r.addNew && !r.extend
              ? ((s = o.sel.contains(n)), (a = s > -1 ? c[s] : new co(n, n)))
              : ((a = o.sel.primary()), (s = o.sel.primIndex)),
            "rectangle" == r.unit)
          )
            (r.addNew || (a = new co(n, n)), (n = Br(e, t, !0, !0)), (s = -1));
          else {
            var f = Oa(e, n, r.unit);
            a = r.extend ? Bo(a, f.anchor, f.head, r.extend) : f;
          }
          r.addNew
            ? -1 == s
              ? ((s = c.length), $o(o, fo(e, c.concat([a]), s), { scroll: !1, origin: "*mouse" }))
              : c.length > 1 && c[s].empty() && "char" == r.unit && !r.extend
                ? ($o(o, fo(e, c.slice(0, s).concat(c.slice(s + 1)), 0), {
                    scroll: !1,
                    origin: "*mouse",
                  }),
                  (u = o.sel))
                : Uo(o, s, a, Y)
            : ((s = 0), $o(o, new uo([a], 0), Y), (u = o.sel));
          var d = n;
          function h(t) {
            if (0 != ft(d, t))
              if (((d = t), "rectangle" == r.unit)) {
                for (
                  var i = [],
                    l = e.options.tabSize,
                    c = U(nt(o, n.line).text, n.ch, l),
                    f = U(nt(o, t.line).text, t.ch, l),
                    h = Math.min(c, f),
                    p = Math.max(c, f),
                    g = Math.min(n.line, t.line),
                    v = Math.min(e.lastLine(), Math.max(n.line, t.line));
                  g <= v;
                  g++
                ) {
                  var m = nt(o, g).text,
                    y = Z(m, h, l);
                  h == p
                    ? i.push(new co(ct(g, y), ct(g, y)))
                    : m.length > y && i.push(new co(ct(g, y), ct(g, Z(m, p, l))));
                }
                (i.length || i.push(new co(n, n)),
                  $o(o, fo(e, u.ranges.slice(0, s).concat(i), s), { origin: "*mouse", scroll: !1 }),
                  e.scrollIntoView(t));
              } else {
                var b,
                  w = a,
                  x = Oa(e, t, r.unit),
                  C = w.anchor;
                ft(x.anchor, C) > 0
                  ? ((b = x.head), (C = gt(w.from(), x.anchor)))
                  : ((b = x.anchor), (C = pt(w.to(), x.head)));
                var S = u.ranges.slice(0);
                ((S[s] = Aa(e, new co(mt(o, C), b))), $o(o, fo(e, S, s), Y));
              }
          }
          var p = i.wrapper.getBoundingClientRect(),
            g = 0;
          function v(t) {
            var n = ++g,
              l = Br(e, t, !0, "rectangle" == r.unit);
            if (l)
              if (0 != ft(l, d)) {
                ((e.curOp.focus = W(R(e))), h(l));
                var a = li(i, o);
                (l.line >= a.to || l.line < a.from) &&
                  setTimeout(
                    Ii(e, function () {
                      g == n && v(t);
                    }),
                    150
                  );
              } else {
                var s = t.clientY < p.top ? -20 : t.clientY > p.bottom ? 20 : 0;
                s &&
                  setTimeout(
                    Ii(e, function () {
                      g == n && ((i.scroller.scrollTop += s), v(t));
                    }),
                    50
                  );
              }
          }
          function m(t) {
            ((e.state.selectingText = !1),
              (g = Infinity),
              t && (Me(t), i.input.focus()),
              xe(i.wrapper.ownerDocument, "mousemove", y),
              xe(i.wrapper.ownerDocument, "mouseup", b),
              (o.history.lastSelOrigin = null));
          }
          var y = Ii(e, function (e) {
              0 !== e.buttons && Fe(e) ? v(e) : m(e);
            }),
            b = Ii(e, m);
          ((e.state.selectingText = b),
            be(i.wrapper.ownerDocument, "mousemove", y),
            be(i.wrapper.ownerDocument, "mouseup", b));
        }
        function Aa(e, t) {
          var n = t.anchor,
            r = t.head,
            i = nt(e.doc, n.line);
          if (0 == ft(n, r) && n.sticky == r.sticky) return t;
          var o = me(i);
          if (!o) return t;
          var l = ge(o, n.ch, n.sticky),
            a = o[l];
          if (a.from != n.ch && a.to != n.ch) return t;
          var s,
            u = l + ((a.from == n.ch) == (1 != a.level) ? 0 : 1);
          if (0 == u || u == o.length) return t;
          if (r.line != n.line) s = (r.line - n.line) * ("ltr" == e.doc.direction ? 1 : -1) > 0;
          else {
            var c = ge(o, r.ch, r.sticky),
              f = c - l || (r.ch - n.ch) * (1 == a.level ? -1 : 1);
            s = c == u - 1 || c == u ? f < 0 : f > 0;
          }
          var d = o[u + (s ? -1 : 0)],
            h = s == (1 == d.level),
            p = h ? d.from : d.to,
            g = h ? "after" : "before";
          return n.ch == p && n.sticky == g ? t : new co(new ct(n.line, p, g), r);
        }
        function Da(e, t, n, r) {
          var i, o;
          if (t.touches) ((i = t.touches[0].clientX), (o = t.touches[0].clientY));
          else
            try {
              ((i = t.clientX), (o = t.clientY));
            } catch (c) {
              return !1;
            }
          if (i >= Math.floor(e.display.gutters.getBoundingClientRect().right)) return !1;
          r && Me(t);
          var l = e.display,
            a = l.lineDiv.getBoundingClientRect();
          if (o > a.bottom || !Le(e, n)) return Ne(t);
          o -= a.top - l.viewOffset;
          for (var s = 0; s < e.display.gutterSpecs.length; ++s) {
            var u = l.gutters.childNodes[s];
            if (u && u.getBoundingClientRect().right >= i)
              return (Ce(e, n, e, at(e.doc, o), e.display.gutterSpecs[s].className, t), Ne(t));
          }
        }
        function Fa(e, t) {
          return Da(e, t, "gutterClick", !0);
        }
        function Wa(e, t) {
          Yn(e.display, t) ||
            Ea(e, t) ||
            Se(e, t, "contextmenu") ||
            k ||
            e.display.input.onContextMenu(t);
        }
        function Ea(e, t) {
          return !!Le(e, "gutterContextMenu") && Da(e, t, "gutterContextMenu", !1);
        }
        function Ha(e) {
          ((e.display.wrapper.className =
            e.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") +
            e.options.theme.replace(/(^|\s)\s*/g, " cm-s-")),
            mr(e));
        }
        xa.prototype.compare = function (e, t, n) {
          return this.time + wa > e && 0 == ft(t, this.pos) && n == this.button;
        };
        var Pa = {
            toString: function () {
              return "CodeMirror.Init";
            },
          },
          Ia = {},
          Ra = {};
        function za(e) {
          var t = e.optionHandlers;
          function n(n, r, i, o) {
            ((e.defaults[n] = r),
              i &&
                (t[n] = o
                  ? function (e, t, n) {
                      n != Pa && i(e, t, n);
                    }
                  : i));
          }
          ((e.defineOption = n),
            (e.Init = Pa),
            n(
              "value",
              "",
              function (e, t) {
                return e.setValue(t);
              },
              !0
            ),
            n(
              "mode",
              null,
              function (e, t) {
                ((e.doc.modeOption = t), bo(e));
              },
              !0
            ),
            n("indentUnit", 2, bo, !0),
            n("indentWithTabs", !1),
            n("smartIndent", !0),
            n(
              "tabSize",
              4,
              function (e) {
                (wo(e), mr(e), Gr(e));
              },
              !0
            ),
            n("lineSeparator", null, function (e, t) {
              if (((e.doc.lineSep = t), t)) {
                var n = [],
                  r = e.doc.first;
                e.doc.iter(function (e) {
                  for (var i = 0; ; ) {
                    var o = e.text.indexOf(t, i);
                    if (-1 == o) break;
                    ((i = o + t.length), n.push(ct(r, o)));
                  }
                  r++;
                });
                for (var i = n.length - 1; i >= 0; i--)
                  ul(e.doc, t, n[i], ct(n[i].line, n[i].ch + t.length));
              }
            }),
            n(
              "specialChars",
              /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u200b\u200e\u200f\u2028\u2029\u202d\u202e\u2066\u2067\u2069\ufeff\ufff9-\ufffc]/g,
              function (e, t, n) {
                ((e.state.specialChars = new RegExp(t.source + (t.test("\t") ? "" : "|\t"), "g")),
                  n != Pa && e.refresh());
              }
            ),
            n(
              "specialCharPlaceholder",
              xn,
              function (e) {
                return e.refresh();
              },
              !0
            ),
            n("electricChars", !0),
            n(
              "inputStyle",
              y ? "contenteditable" : "textarea",
              function () {
                throw new Error("inputStyle can not (yet) be changed in a running editor");
              },
              !0
            ),
            n(
              "spellcheck",
              !1,
              function (e, t) {
                return (e.getInputField().spellcheck = t);
              },
              !0
            ),
            n(
              "autocorrect",
              !1,
              function (e, t) {
                return (e.getInputField().autocorrect = t);
              },
              !0
            ),
            n(
              "autocapitalize",
              !1,
              function (e, t) {
                return (e.getInputField().autocapitalize = t);
              },
              !0
            ),
            n("rtlMoveVisually", !x),
            n("wholeLineUpdateBefore", !0),
            n(
              "theme",
              "default",
              function (e) {
                (Ha(e), no(e));
              },
              !0
            ),
            n("keyMap", "default", function (e, t, n) {
              var r = ql(t),
                i = n != Pa && ql(n);
              (i && i.detach && i.detach(e, r), r.attach && r.attach(e, i || null));
            }),
            n("extraKeys", null),
            n("configureMouse", null),
            n("lineWrapping", !1, Va, !0),
            n(
              "gutters",
              [],
              function (e, t) {
                ((e.display.gutterSpecs = eo(t, e.options.lineNumbers)), no(e));
              },
              !0
            ),
            n(
              "fixedGutter",
              !0,
              function (e, t) {
                ((e.display.gutters.style.left = t ? Ir(e.display) + "px" : "0"), e.refresh());
              },
              !0
            ),
            n(
              "coverGutterNextToScrollbar",
              !1,
              function (e) {
                return Si(e);
              },
              !0
            ),
            n(
              "scrollbarStyle",
              "native",
              function (e) {
                (Ti(e),
                  Si(e),
                  e.display.scrollbars.setScrollTop(e.doc.scrollTop),
                  e.display.scrollbars.setScrollLeft(e.doc.scrollLeft));
              },
              !0
            ),
            n(
              "lineNumbers",
              !1,
              function (e, t) {
                ((e.display.gutterSpecs = eo(e.options.gutters, t)), no(e));
              },
              !0
            ),
            n("firstLineNumber", 1, no, !0),
            n(
              "lineNumberFormatter",
              function (e) {
                return e;
              },
              no,
              !0
            ),
            n("showCursorWhenSelecting", !1, Xr, !0),
            n("resetSelectionOnContextMenu", !0),
            n("lineWiseCopyCut", !0),
            n("pasteLinesPerSelection", !0),
            n("selectionsMayTouch", !1),
            n("readOnly", !1, function (e, t) {
              ("nocursor" == t && (ri(e), e.display.input.blur()),
                e.display.input.readOnlyChanged(t));
            }),
            n("screenReaderLabel", null, function (e, t) {
              ((t = "" === t ? null : t), e.display.input.screenReaderLabelChanged(t));
            }),
            n(
              "disableInput",
              !1,
              function (e, t) {
                t || e.display.input.reset();
              },
              !0
            ),
            n("dragDrop", !0, Ba),
            n("allowDropFileTypes", null),
            n("cursorBlinkRate", 530),
            n("cursorScrollMargin", 0),
            n("cursorHeight", 1, Xr, !0),
            n("singleCursorHeightPerLine", !0, Xr, !0),
            n("workTime", 100),
            n("workDelay", 100),
            n("flattenSpans", !0, wo, !0),
            n("addModeClass", !1, wo, !0),
            n("pollInterval", 100),
            n("undoDepth", 200, function (e, t) {
              return (e.doc.history.undoDepth = t);
            }),
            n("historyEventDelay", 1250),
            n(
              "viewportMargin",
              10,
              function (e) {
                return e.refresh();
              },
              !0
            ),
            n("maxHighlightLength", 1e4, wo, !0),
            n("moveInputWithCursor", !0, function (e, t) {
              t || e.display.input.resetPosition();
            }),
            n("tabindex", null, function (e, t) {
              return (e.display.input.getField().tabIndex = t || "");
            }),
            n("autofocus", null),
            n(
              "direction",
              "ltr",
              function (e, t) {
                return e.doc.setDirection(t);
              },
              !0
            ),
            n("phrases", null));
        }
        function Ba(e, t, n) {
          if (!t != !(n && n != Pa)) {
            var r = e.display.dragFunctions,
              i = t ? be : xe;
            (i(e.display.scroller, "dragstart", r.start),
              i(e.display.scroller, "dragenter", r.enter),
              i(e.display.scroller, "dragover", r.over),
              i(e.display.scroller, "dragleave", r.leave),
              i(e.display.scroller, "drop", r.drop));
          }
        }
        function Va(e) {
          (e.options.lineWrapping
            ? (E(e.display.wrapper, "CodeMirror-wrap"),
              (e.display.sizer.style.minWidth = ""),
              (e.display.sizerWidth = null))
            : (M(e.display.wrapper, "CodeMirror-wrap"), hn(e)),
            zr(e),
            Gr(e),
            mr(e),
            setTimeout(function () {
              return Si(e);
            }, 100));
        }
        function Ga(e, t) {
          var n = this;
          if (!(this instanceof Ga)) return new Ga(e, t);
          ((this.options = t = t ? G(t) : {}), G(Ia, t, !1));
          var r = t.value;
          ("string" == typeof r
            ? (r = new Ol(r, t.mode, null, t.lineSeparator, t.direction))
            : t.mode && (r.modeOption = t.mode),
            (this.doc = r));
          var i = new Ga.inputStyles[t.inputStyle](this),
            o = (this.display = new ro(e, r, i, t));
          for (var u in ((o.wrapper.CodeMirror = this),
          Ha(this),
          t.lineWrapping && (this.display.wrapper.className += " CodeMirror-wrap"),
          Ti(this),
          (this.state = {
            keyMaps: [],
            // stores maps added by addKeyMap
            overlays: [],
            // highlighting overlays, as added by addOverlay
            modeGen: 0,
            // bumped when mode/overlay changes, used to invalidate highlighting info
            overwrite: !1,
            delayingBlurEvent: !1,
            focused: !1,
            suppressEdits: !1,
            // used to disable editing during key handlers when in readOnly mode
            pasteIncoming: -1,
            cutIncoming: -1,
            // help recognize paste/cut edits in input.poll
            selectingText: !1,
            draggingText: !1,
            highlight: new _(),
            // stores highlight worker timeout
            keySeq: null,
            // Unfinished key sequence
            specialChars: null,
          }),
          t.autofocus && !y && o.input.focus(),
          l &&
            a < 11 &&
            setTimeout(function () {
              return n.display.input.reset(!0);
            }, 20),
          Ua(this),
          Pl(),
          Oi(this),
          (this.curOp.forceUpdate = !0),
          ko(this, r),
          (t.autofocus && !y) || this.hasFocus()
            ? setTimeout(function () {
                n.hasFocus() && !n.state.focused && ni(n);
              }, 20)
            : ri(this),
          Ra))
            Ra.hasOwnProperty(u) && Ra[u](this, t[u], Pa);
          (Ji(this), t.finishInit && t.finishInit(this));
          for (var c = 0; c < _a.length; ++c) _a[c](this);
          (Ni(this),
            s &&
              t.lineWrapping &&
              "optimizelegibility" == getComputedStyle(o.lineDiv).textRendering &&
              (o.lineDiv.style.textRendering = "auto"));
        }
        function Ua(e) {
          var t = e.display;
          (be(t.scroller, "mousedown", Ii(e, Sa)),
            be(
              t.scroller,
              "dblclick",
              l && a < 11
                ? Ii(e, function (t) {
                    if (!Se(e, t)) {
                      var n = Br(e, t);
                      if (n && !Fa(e, t) && !Yn(e.display, t)) {
                        Me(t);
                        var r = e.findWordAt(n);
                        Vo(e.doc, r.anchor, r.head);
                      }
                    }
                  })
                : function (t) {
                    return Se(e, t) || Me(t);
                  }
            ),
            be(t.scroller, "contextmenu", function (t) {
              return Wa(e, t);
            }),
            be(t.input.getField(), "contextmenu", function (n) {
              t.scroller.contains(n.target) || Wa(e, n);
            }));
          var n,
            r = { end: 0 };
          function i() {
            t.activeTouch &&
              ((n = setTimeout(function () {
                return (t.activeTouch = null);
              }, 1e3)),
              ((r = t.activeTouch).end = +new Date()));
          }
          function o(e) {
            if (1 != e.touches.length) return !1;
            var t = e.touches[0];
            return t.radiusX <= 1 && t.radiusY <= 1;
          }
          function s(e, t) {
            if (null == t.left) return !0;
            var n = t.left - e.left,
              r = t.top - e.top;
            return n * n + r * r > 400;
          }
          (be(t.scroller, "touchstart", function (i) {
            if (!Se(e, i) && !o(i) && !Fa(e, i)) {
              (t.input.ensurePolled(), clearTimeout(n));
              var l = +new Date();
              ((t.activeTouch = { start: l, moved: !1, prev: l - r.end <= 300 ? r : null }),
                1 == i.touches.length &&
                  ((t.activeTouch.left = i.touches[0].pageX),
                  (t.activeTouch.top = i.touches[0].pageY)));
            }
          }),
            be(t.scroller, "touchmove", function () {
              t.activeTouch && (t.activeTouch.moved = !0);
            }),
            be(t.scroller, "touchend", function (n) {
              var r = t.activeTouch;
              if (r && !Yn(t, n) && null != r.left && !r.moved && new Date() - r.start < 300) {
                var o,
                  l = e.coordsChar(t.activeTouch, "page");
                ((o =
                  !r.prev || s(r, r.prev)
                    ? new co(l, l)
                    : !r.prev.prev || s(r, r.prev.prev)
                      ? e.findWordAt(l)
                      : new co(ct(l.line, 0), mt(e.doc, ct(l.line + 1, 0)))),
                  e.setSelection(o.anchor, o.head),
                  e.focus(),
                  Me(n));
              }
              i();
            }),
            be(t.scroller, "touchcancel", i),
            be(t.scroller, "scroll", function () {
              t.scroller.clientHeight &&
                (mi(e, t.scroller.scrollTop), bi(e, t.scroller.scrollLeft, !0), Ce(e, "scroll", e));
            }),
            be(t.scroller, "mousewheel", function (t) {
              return so(e, t);
            }),
            be(t.scroller, "DOMMouseScroll", function (t) {
              return so(e, t);
            }),
            be(t.wrapper, "scroll", function () {
              return (t.wrapper.scrollTop = t.wrapper.scrollLeft = 0);
            }),
            (t.dragFunctions = {
              enter: function (t) {
                Se(e, t) || Ae(t);
              },
              over: function (t) {
                Se(e, t) || (Fl(e, t), Ae(t));
              },
              start: function (t) {
                return Dl(e, t);
              },
              drop: Ii(e, Al),
              leave: function (t) {
                Se(e, t) || Wl(e);
              },
            }));
          var u = t.input.getField();
          (be(u, "keyup", function (t) {
            return va.call(e, t);
          }),
            be(u, "keydown", Ii(e, pa)),
            be(u, "keypress", Ii(e, ma)),
            be(u, "focus", function (t) {
              return ni(e, t);
            }),
            be(u, "blur", function (t) {
              return ri(e, t);
            }));
        }
        ((Ga.defaults = Ia), (Ga.optionHandlers = Ra));
        var _a = [];
        function ja(e, t, n, r) {
          var i,
            o = e.doc;
          (null == n && (n = "add"),
            "smart" == n && (o.mode.indent ? (i = kt(e, t).state) : (n = "prev")));
          var l = e.options.tabSize,
            a = nt(o, t),
            s = U(a.text, null, l);
          a.stateAfter && (a.stateAfter = null);
          var u,
            c = a.text.match(/^\s*/)[0];
          if (r || /\S/.test(a.text)) {
            if (
              "smart" == n &&
              ((u = o.mode.indent(i, a.text.slice(c.length), a.text)) == $ || u > 150)
            ) {
              if (!r) return;
              n = "prev";
            }
          } else ((u = 0), (n = "not"));
          ("prev" == n
            ? (u = t > o.first ? U(nt(o, t - 1).text, null, l) : 0)
            : "add" == n
              ? (u = s + e.options.indentUnit)
              : "subtract" == n
                ? (u = s - e.options.indentUnit)
                : "number" == typeof n && (u = s + n),
            (u = Math.max(0, u)));
          var f = "",
            d = 0;
          if (e.options.indentWithTabs)
            for (var h = Math.floor(u / l); h; --h) ((d += l), (f += "\t"));
          if ((d < u && (f += J(u - d)), f != c))
            return (ul(o, f, ct(t, 0), ct(t, c.length), "+input"), (a.stateAfter = null), !0);
          for (var p = 0; p < o.sel.ranges.length; p++) {
            var g = o.sel.ranges[p];
            if (g.head.line == t && g.head.ch < c.length) {
              var v = ct(t, c.length);
              Uo(o, p, new co(v, v));
              break;
            }
          }
        }
        Ga.defineInitHook = function (e) {
          return _a.push(e);
        };
        var Ka = null;
        function $a(e) {
          Ka = e;
        }
        function Xa(e, t, n, r, i) {
          var o = e.doc;
          ((e.display.shift = !1), r || (r = o.sel));
          var l = +new Date() - 200,
            a = "paste" == i || e.state.pasteIncoming > l,
            s = ze(t),
            u = null;
          if (a && r.ranges.length > 1)
            if (Ka && Ka.text.join("\n") == t) {
              if (r.ranges.length % Ka.text.length == 0) {
                u = [];
                for (var c = 0; c < Ka.text.length; c++) u.push(o.splitLines(Ka.text[c]));
              }
            } else
              s.length == r.ranges.length &&
                e.options.pasteLinesPerSelection &&
                (u = te(s, function (e) {
                  return [e];
                }));
          for (var f = e.curOp.updateInput, d = r.ranges.length - 1; d >= 0; d--) {
            var h = r.ranges[d],
              p = h.from(),
              g = h.to();
            h.empty() &&
              (n && n > 0
                ? (p = ct(p.line, p.ch - n))
                : e.state.overwrite && !a
                  ? (g = ct(g.line, Math.min(nt(o, g.line).text.length, g.ch + ee(s).length)))
                  : a &&
                    Ka &&
                    Ka.lineWise &&
                    Ka.text.join("\n") == s.join("\n") &&
                    (p = g = ct(p.line, 0)));
            var v = {
              from: p,
              to: g,
              text: u ? u[d % u.length] : s,
              origin: i || (a ? "paste" : e.state.cutIncoming > l ? "cut" : "+input"),
            };
            (rl(e.doc, v), En(e, "inputRead", e, v));
          }
          (t && !a && qa(e, t),
            di(e),
            e.curOp.updateInput < 2 && (e.curOp.updateInput = f),
            (e.curOp.typing = !0),
            (e.state.pasteIncoming = e.state.cutIncoming = -1));
        }
        function Ya(e, t) {
          var n = e.clipboardData && e.clipboardData.getData("Text");
          if (n)
            return (
              e.preventDefault(),
              t.isReadOnly() ||
                t.options.disableInput ||
                !t.hasFocus() ||
                Pi(t, function () {
                  return Xa(t, n, 0, null, "paste");
                }),
              !0
            );
        }
        function qa(e, t) {
          if (e.options.electricChars && e.options.smartIndent)
            for (var n = e.doc.sel, r = n.ranges.length - 1; r >= 0; r--) {
              var i = n.ranges[r];
              if (!(i.head.ch > 100 || (r && n.ranges[r - 1].head.line == i.head.line))) {
                var o = e.getModeAt(i.head),
                  l = !1;
                if (o.electricChars) {
                  for (var a = 0; a < o.electricChars.length; a++)
                    if (t.indexOf(o.electricChars.charAt(a)) > -1) {
                      l = ja(e, i.head.line, "smart");
                      break;
                    }
                } else
                  o.electricInput &&
                    o.electricInput.test(nt(e.doc, i.head.line).text.slice(0, i.head.ch)) &&
                    (l = ja(e, i.head.line, "smart"));
                l && En(e, "electricInput", e, i.head.line);
              }
            }
        }
        function Za(e) {
          for (var t = [], n = [], r = 0; r < e.doc.sel.ranges.length; r++) {
            var i = e.doc.sel.ranges[r].head.line,
              o = { anchor: ct(i, 0), head: ct(i + 1, 0) };
            (n.push(o), t.push(e.getRange(o.anchor, o.head)));
          }
          return { text: t, ranges: n };
        }
        function Qa(e, t, n, r) {
          (e.setAttribute("autocorrect", n ? "on" : "off"),
            e.setAttribute("autocapitalize", r ? "on" : "off"),
            e.setAttribute("spellcheck", !!t));
        }
        function Ja() {
          var e = A(
              "textarea",
              null,
              null,
              "position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; min-height: 1em; outline: none"
            ),
            t = A(
              "div",
              [e],
              null,
              "overflow: hidden; position: relative; width: 3px; height: 0px;"
            );
          return (
            s ? (e.style.width = "1000px") : e.setAttribute("wrap", "off"),
            v && (e.style.border = "1px solid black"),
            t
          );
        }
        function es(e) {
          var t = e.optionHandlers,
            n = (e.helpers = {});
          ((e.prototype = {
            constructor: e,
            focus: function () {
              (B(this).focus(), this.display.input.focus());
            },
            setOption: function (e, n) {
              var r = this.options,
                i = r[e];
              (r[e] == n && "mode" != e) ||
                ((r[e] = n),
                t.hasOwnProperty(e) && Ii(this, t[e])(this, n, i),
                Ce(this, "optionChange", this, e));
            },
            getOption: function (e) {
              return this.options[e];
            },
            getDoc: function () {
              return this.doc;
            },
            addKeyMap: function (e, t) {
              this.state.keyMaps[t ? "push" : "unshift"](ql(e));
            },
            removeKeyMap: function (e) {
              for (var t = this.state.keyMaps, n = 0; n < t.length; ++n)
                if (t[n] == e || t[n].name == e) return (t.splice(n, 1), !0);
            },
            addOverlay: Ri(function (t, n) {
              var r = t.token ? t : e.getMode(this.options, t);
              if (r.startState) throw new Error("Overlays may not be stateful.");
              (ne(
                this.state.overlays,
                { mode: r, modeSpec: t, opaque: n && n.opaque, priority: (n && n.priority) || 0 },
                function (e) {
                  return e.priority;
                }
              ),
                this.state.modeGen++,
                Gr(this));
            }),
            removeOverlay: Ri(function (e) {
              for (var t = this.state.overlays, n = 0; n < t.length; ++n) {
                var r = t[n].modeSpec;
                if (r == e || ("string" == typeof e && r.name == e))
                  return (t.splice(n, 1), this.state.modeGen++, void Gr(this));
              }
            }),
            indentLine: Ri(function (e, t, n) {
              ("string" != typeof t &&
                "number" != typeof t &&
                (t =
                  null == t
                    ? this.options.smartIndent
                      ? "smart"
                      : "prev"
                    : t
                      ? "add"
                      : "subtract"),
                st(this.doc, e) && ja(this, e, t, n));
            }),
            indentSelection: Ri(function (e) {
              for (var t = this.doc.sel.ranges, n = -1, r = 0; r < t.length; r++) {
                var i = t[r];
                if (i.empty())
                  i.head.line > n &&
                    (ja(this, i.head.line, e, !0),
                    (n = i.head.line),
                    r == this.doc.sel.primIndex && di(this));
                else {
                  var o = i.from(),
                    l = i.to(),
                    a = Math.max(n, o.line);
                  n = Math.min(this.lastLine(), l.line - (l.ch ? 0 : 1)) + 1;
                  for (var s = a; s < n; ++s) ja(this, s, e);
                  var u = this.doc.sel.ranges;
                  0 == o.ch &&
                    t.length == u.length &&
                    u[r].from().ch > 0 &&
                    Uo(this.doc, r, new co(o, u[r].to()), X);
                }
              }
            }),
            // Fetch the parser token for a given character. Useful for hacks
            // that want to inspect the mode state (say, for completion).
            getTokenAt: function (e, t) {
              return Nt(this, e, t);
            },
            getLineTokens: function (e, t) {
              return Nt(this, ct(e), t, !0);
            },
            getTokenTypeAt: function (e) {
              e = mt(this.doc, e);
              var t,
                n = St(this, nt(this.doc, e.line)),
                r = 0,
                i = (n.length - 1) / 2,
                o = e.ch;
              if (0 == o) t = n[2];
              else
                for (;;) {
                  var l = (r + i) >> 1;
                  if ((l ? n[2 * l - 1] : 0) >= o) i = l;
                  else {
                    if (!(n[2 * l + 1] < o)) {
                      t = n[2 * l + 2];
                      break;
                    }
                    r = l + 1;
                  }
                }
              var a = t ? t.indexOf("overlay ") : -1;
              return a < 0 ? t : 0 == a ? null : t.slice(0, a - 1);
            },
            getModeAt: function (t) {
              var n = this.doc.mode;
              return n.innerMode ? e.innerMode(n, this.getTokenAt(t).state).mode : n;
            },
            getHelper: function (e, t) {
              return this.getHelpers(e, t)[0];
            },
            getHelpers: function (e, t) {
              var r = [];
              if (!n.hasOwnProperty(t)) return r;
              var i = n[t],
                o = this.getModeAt(e);
              if ("string" == typeof o[t]) i[o[t]] && r.push(i[o[t]]);
              else if (o[t])
                for (var l = 0; l < o[t].length; l++) {
                  var a = i[o[t][l]];
                  a && r.push(a);
                }
              else
                o.helperType && i[o.helperType]
                  ? r.push(i[o.helperType])
                  : i[o.name] && r.push(i[o.name]);
              for (var s = 0; s < i._global.length; s++) {
                var u = i._global[s];
                u.pred(o, this) && -1 == j(r, u.val) && r.push(u.val);
              }
              return r;
            },
            getStateAfter: function (e, t) {
              var n = this.doc;
              return kt(this, (e = vt(n, null == e ? n.first + n.size - 1 : e)) + 1, t).state;
            },
            cursorCoords: function (e, t) {
              var n = this.doc.sel.primary();
              return kr(
                this,
                null == e ? n.head : "object" == typeof e ? mt(this.doc, e) : e ? n.from() : n.to(),
                t || "page"
              );
            },
            charCoords: function (e, t) {
              return Sr(this, mt(this.doc, e), t || "page");
            },
            coordsChar: function (e, t) {
              return Mr(this, (e = Cr(this, e, t || "page")).left, e.top);
            },
            lineAtHeight: function (e, t) {
              return (
                (e = Cr(this, { top: e, left: 0 }, t || "page").top),
                at(this.doc, e + this.display.viewOffset)
              );
            },
            heightAtLine: function (e, t, n) {
              var r,
                i = !1;
              if ("number" == typeof e) {
                var o = this.doc.first + this.doc.size - 1;
                (e < this.doc.first ? (e = this.doc.first) : e > o && ((e = o), (i = !0)),
                  (r = nt(this.doc, e)));
              } else r = e;
              return (
                xr(this, r, { top: 0, left: 0 }, t || "page", n || i).top +
                (i ? this.doc.height - fn(r) : 0)
              );
            },
            defaultTextHeight: function () {
              return Er(this.display);
            },
            defaultCharWidth: function () {
              return Hr(this.display);
            },
            getViewport: function () {
              return { from: this.display.viewFrom, to: this.display.viewTo };
            },
            addWidget: function (e, t, n, r, i) {
              var o = this.display,
                l = (e = kr(this, mt(this.doc, e))).bottom,
                a = e.left;
              if (
                ((t.style.position = "absolute"),
                t.setAttribute("cm-ignore-events", "true"),
                this.display.input.setUneditable(t),
                o.sizer.appendChild(t),
                "over" == r)
              )
                l = e.top;
              else if ("above" == r || "near" == r) {
                var s = Math.max(o.wrapper.clientHeight, this.doc.height),
                  u = Math.max(o.sizer.clientWidth, o.lineSpace.clientWidth);
                (("above" == r || e.bottom + t.offsetHeight > s) && e.top > t.offsetHeight
                  ? (l = e.top - t.offsetHeight)
                  : e.bottom + t.offsetHeight <= s && (l = e.bottom),
                  a + t.offsetWidth > u && (a = u - t.offsetWidth));
              }
              ((t.style.top = l + "px"),
                (t.style.left = t.style.right = ""),
                "right" == i
                  ? ((a = o.sizer.clientWidth - t.offsetWidth), (t.style.right = "0px"))
                  : ("left" == i
                      ? (a = 0)
                      : "middle" == i && (a = (o.sizer.clientWidth - t.offsetWidth) / 2),
                    (t.style.left = a + "px")),
                n &&
                  ui(this, {
                    left: a,
                    top: l,
                    right: a + t.offsetWidth,
                    bottom: l + t.offsetHeight,
                  }));
            },
            triggerOnKeyDown: Ri(pa),
            triggerOnKeyPress: Ri(ma),
            triggerOnKeyUp: va,
            triggerOnMouseDown: Ri(Sa),
            execCommand: function (e) {
              if (na.hasOwnProperty(e)) return na[e].call(null, this);
            },
            triggerElectric: Ri(function (e) {
              qa(this, e);
            }),
            findPosH: function (e, t, n, r) {
              var i = 1;
              t < 0 && ((i = -1), (t = -t));
              for (
                var o = mt(this.doc, e), l = 0;
                l < t && !(o = ts(this.doc, o, i, n, r)).hitSide;
                ++l
              );
              return o;
            },
            moveH: Ri(function (e, t) {
              var n = this;
              this.extendSelectionsBy(function (r) {
                return n.display.shift || n.doc.extend || r.empty()
                  ? ts(n.doc, r.head, e, t, n.options.rtlMoveVisually)
                  : e < 0
                    ? r.from()
                    : r.to();
              }, q);
            }),
            deleteH: Ri(function (e, t) {
              var n = this.doc.sel,
                r = this.doc;
              n.somethingSelected()
                ? r.replaceSelection("", null, "+delete")
                : Zl(this, function (n) {
                    var i = ts(r, n.head, e, t, !1);
                    return e < 0 ? { from: i, to: n.head } : { from: n.head, to: i };
                  });
            }),
            findPosV: function (e, t, n, r) {
              var i = 1,
                o = r;
              t < 0 && ((i = -1), (t = -t));
              for (var l = mt(this.doc, e), a = 0; a < t; ++a) {
                var s = kr(this, l, "div");
                if ((null == o ? (o = s.left) : (s.left = o), (l = ns(this, s, i, n)).hitSide))
                  break;
              }
              return l;
            },
            moveV: Ri(function (e, t) {
              var n = this,
                r = this.doc,
                i = [],
                o = !this.display.shift && !r.extend && r.sel.somethingSelected();
              if (
                (r.extendSelectionsBy(function (l) {
                  if (o) return e < 0 ? l.from() : l.to();
                  var a = kr(n, l.head, "div");
                  (null != l.goalColumn && (a.left = l.goalColumn), i.push(a.left));
                  var s = ns(n, a, e, t);
                  return (
                    "page" == t && l == r.sel.primary() && fi(n, Sr(n, s, "div").top - a.top),
                    s
                  );
                }, q),
                i.length)
              )
                for (var l = 0; l < r.sel.ranges.length; l++) r.sel.ranges[l].goalColumn = i[l];
            }),
            // Find the word at the given position (as returned by coordsChar).
            findWordAt: function (e) {
              var t = nt(this.doc, e.line).text,
                n = e.ch,
                r = e.ch;
              if (t) {
                var i = this.getHelper(e, "wordChars");
                ("before" != e.sticky && r != t.length) || !n ? ++r : --n;
                for (
                  var o = t.charAt(n),
                    l = ae(o, i)
                      ? function (e) {
                          return ae(e, i);
                        }
                      : /\s/.test(o)
                        ? function (e) {
                            return /\s/.test(e);
                          }
                        : function (e) {
                            return !/\s/.test(e) && !ae(e);
                          };
                  n > 0 && l(t.charAt(n - 1));
                )
                  --n;
                for (; r < t.length && l(t.charAt(r)); ) ++r;
              }
              return new co(ct(e.line, n), ct(e.line, r));
            },
            toggleOverwrite: function (e) {
              (null != e && e == this.state.overwrite) ||
                ((this.state.overwrite = !this.state.overwrite)
                  ? E(this.display.cursorDiv, "CodeMirror-overwrite")
                  : M(this.display.cursorDiv, "CodeMirror-overwrite"),
                Ce(this, "overwriteToggle", this, this.state.overwrite));
            },
            hasFocus: function () {
              return this.display.input.getField() == W(R(this));
            },
            isReadOnly: function () {
              return !(!this.options.readOnly && !this.doc.cantEdit);
            },
            scrollTo: Ri(function (e, t) {
              hi(this, e, t);
            }),
            getScrollInfo: function () {
              var e = this.display.scroller;
              return {
                left: e.scrollLeft,
                top: e.scrollTop,
                height: e.scrollHeight - Jn(this) - this.display.barHeight,
                width: e.scrollWidth - Jn(this) - this.display.barWidth,
                clientHeight: tr(this),
                clientWidth: er(this),
              };
            },
            scrollIntoView: Ri(function (e, t) {
              (null == e
                ? ((e = { from: this.doc.sel.primary().head, to: null }),
                  null == t && (t = this.options.cursorScrollMargin))
                : "number" == typeof e
                  ? (e = { from: ct(e, 0), to: null })
                  : null == e.from && (e = { from: e, to: null }),
                e.to || (e.to = e.from),
                (e.margin = t || 0),
                null != e.from.line ? pi(this, e) : vi(this, e.from, e.to, e.margin));
            }),
            setSize: Ri(function (e, t) {
              var n = this,
                r = function (e) {
                  return "number" == typeof e || /^\d+$/.test(String(e)) ? e + "px" : e;
                };
              (null != e && (this.display.wrapper.style.width = r(e)),
                null != t && (this.display.wrapper.style.height = r(t)),
                this.options.lineWrapping && vr(this));
              var i = this.display.viewFrom;
              (this.doc.iter(i, this.display.viewTo, function (e) {
                if (e.widgets)
                  for (var t = 0; t < e.widgets.length; t++)
                    if (e.widgets[t].noHScroll) {
                      Ur(n, i, "widget");
                      break;
                    }
                ++i;
              }),
                (this.curOp.forceUpdate = !0),
                Ce(this, "refresh", this));
            }),
            operation: function (e) {
              return Pi(this, e);
            },
            startOperation: function () {
              return Oi(this);
            },
            endOperation: function () {
              return Ni(this);
            },
            refresh: Ri(function () {
              var e = this.display.cachedTextHeight;
              (Gr(this),
                (this.curOp.forceUpdate = !0),
                mr(this),
                hi(this, this.doc.scrollLeft, this.doc.scrollTop),
                qi(this.display),
                (null == e || Math.abs(e - Er(this.display)) > 0.5 || this.options.lineWrapping) &&
                  zr(this),
                Ce(this, "refresh", this));
            }),
            swapDoc: Ri(function (e) {
              var t = this.doc;
              return (
                (t.cm = null),
                this.state.selectingText && this.state.selectingText(),
                ko(this, e),
                mr(this),
                this.display.input.reset(),
                hi(this, e.scrollLeft, e.scrollTop),
                (this.curOp.forceScroll = !0),
                En(this, "swapDoc", this, t),
                t
              );
            }),
            phrase: function (e) {
              var t = this.options.phrases;
              return t && Object.prototype.hasOwnProperty.call(t, e) ? t[e] : e;
            },
            getInputField: function () {
              return this.display.input.getField();
            },
            getWrapperElement: function () {
              return this.display.wrapper;
            },
            getScrollerElement: function () {
              return this.display.scroller;
            },
            getGutterElement: function () {
              return this.display.gutters;
            },
          }),
            Te(e),
            (e.registerHelper = function (t, r, i) {
              (n.hasOwnProperty(t) || (n[t] = e[t] = { _global: [] }), (n[t][r] = i));
            }),
            (e.registerGlobalHelper = function (t, r, i, o) {
              (e.registerHelper(t, r, o), n[t]._global.push({ pred: i, val: o }));
            }));
        }
        function ts(e, t, n, r, i) {
          var o = t,
            l = n,
            a = nt(e, t.line),
            s = i && "rtl" == e.direction ? -n : n;
          function u() {
            var n = t.line + s;
            return (
              !(n < e.first || n >= e.first + e.size) &&
              ((t = new ct(n, t.ch, t.sticky)), (a = nt(e, n)))
            );
          }
          function c(o) {
            var l;
            if ("codepoint" == r) {
              var c = a.text.charCodeAt(t.ch + (n > 0 ? 0 : -1));
              if (isNaN(c)) l = null;
              else {
                var f = n > 0 ? c >= 55296 && c < 56320 : c >= 56320 && c < 57343;
                l = new ct(
                  t.line,
                  Math.max(0, Math.min(a.text.length, t.ch + n * (f ? 2 : 1))),
                  -n
                );
              }
            } else l = i ? ta(e.cm, a, t, n) : Jl(a, t, n);
            if (null == l) {
              if (o || !u()) return !1;
              t = ea(i, e.cm, a, t.line, s);
            } else t = l;
            return !0;
          }
          if ("char" == r || "codepoint" == r) c();
          else if ("column" == r) c(!0);
          else if ("word" == r || "group" == r)
            for (
              var f = null, d = "group" == r, h = e.cm && e.cm.getHelper(t, "wordChars"), p = !0;
              !(n < 0) || c(!p);
              p = !1
            ) {
              var g = a.text.charAt(t.ch) || "\n",
                v = ae(g, h) ? "w" : d && "\n" == g ? "n" : !d || /\s/.test(g) ? null : "p";
              if ((!d || p || v || (v = "s"), f && f != v)) {
                n < 0 && ((n = 1), c(), (t.sticky = "after"));
                break;
              }
              if ((v && (f = v), n > 0 && !c(!p))) break;
            }
          var m = Jo(e, t, o, l, !0);
          return (dt(o, m) && (m.hitSide = !0), m);
        }
        function ns(e, t, n, r) {
          var i,
            o,
            l = e.doc,
            a = t.left;
          if ("page" == r) {
            var s = Math.min(
                e.display.wrapper.clientHeight,
                B(e).innerHeight || l(e).documentElement.clientHeight
              ),
              u = Math.max(s - 0.5 * Er(e.display), 3);
            i = (n > 0 ? t.bottom : t.top) + n * u;
          } else "line" == r && (i = n > 0 ? t.bottom + 3 : t.top - 3);
          for (; (o = Mr(e, a, i)).outside; ) {
            if (n < 0 ? i <= 0 : i >= l.height) {
              o.hitSide = !0;
              break;
            }
            i += 5 * n;
          }
          return o;
        }
        var rs = function (e) {
          ((this.cm = e),
            (this.lastAnchorNode =
              this.lastAnchorOffset =
              this.lastFocusNode =
              this.lastFocusOffset =
                null),
            (this.polling = new _()),
            (this.composing = null),
            (this.gracePeriod = !1),
            (this.readDOMTimeout = null));
        };
        function is(e, t) {
          var n = lr(e, t.line);
          if (!n || n.hidden) return null;
          var r = nt(e.doc, t.line),
            i = rr(n, r, t.line),
            o = me(r, e.doc.direction),
            l = "left";
          o && (l = ge(o, t.ch) % 2 ? "right" : "left");
          var a = fr(i.map, t.ch, l);
          return ((a.offset = "right" == a.collapse ? a.end : a.start), a);
        }
        function os(e) {
          for (var t = e; t; t = t.parentNode)
            if (/CodeMirror-gutter-wrapper/.test(t.className)) return !0;
          return !1;
        }
        function ls(e, t) {
          return (t && (e.bad = !0), e);
        }
        function as(e, t, n, r, i) {
          var o = "",
            l = !1,
            a = e.doc.lineSeparator(),
            s = !1;
          function u(e) {
            return function (t) {
              return t.id == e;
            };
          }
          function c() {
            l && ((o += a), s && (o += a), (l = s = !1));
          }
          function f(e) {
            e && (c(), (o += e));
          }
          function d(t) {
            if (1 == t.nodeType) {
              var n = t.getAttribute("cm-text");
              if (n) return void f(n);
              var o,
                h = t.getAttribute("cm-marker");
              if (h) {
                var p = e.findMarks(ct(r, 0), ct(i + 1, 0), u(+h));
                return void (p.length && (o = p[0].find(0)) && f(rt(e.doc, o.from, o.to).join(a)));
              }
              if ("false" == t.getAttribute("contenteditable")) return;
              var g = /^(pre|div|p|li|table|br)$/i.test(t.nodeName);
              if (!/^br$/i.test(t.nodeName) && 0 == t.textContent.length) return;
              g && c();
              for (var v = 0; v < t.childNodes.length; v++) d(t.childNodes[v]);
              (/^(pre|p)$/i.test(t.nodeName) && (s = !0), g && (l = !0));
            } else 3 == t.nodeType && f(t.nodeValue.replace(/\u200b/g, "").replace(/\u00a0/g, " "));
          }
          for (; d(t), t != n; ) ((t = t.nextSibling), (s = !1));
          return o;
        }
        function ss(e, t, n) {
          var r;
          if (t == e.display.lineDiv) {
            if (!(r = e.display.lineDiv.childNodes[n]))
              return ls(e.clipPos(ct(e.display.viewTo - 1)), !0);
            ((t = null), (n = 0));
          } else
            for (r = t; ; r = r.parentNode) {
              if (!r || r == e.display.lineDiv) return null;
              if (r.parentNode && r.parentNode == e.display.lineDiv) break;
            }
          for (var i = 0; i < e.display.view.length; i++) {
            var o = e.display.view[i];
            if (o.node == r) return us(o, t, n);
          }
        }
        function us(e, t, n) {
          var r = e.text.firstChild,
            i = !1;
          if (!t || !F(r, t)) return ls(ct(lt(e.line), 0), !0);
          if (t == r && ((i = !0), (t = r.childNodes[n]), (n = 0), !t)) {
            var o = e.rest ? ee(e.rest) : e.line;
            return ls(ct(lt(o), o.text.length), i);
          }
          var l = 3 == t.nodeType ? t : null,
            a = t;
          for (
            l ||
            1 != t.childNodes.length ||
            3 != t.firstChild.nodeType ||
            ((l = t.firstChild), n && (n = l.nodeValue.length));
            a.parentNode != r;
          )
            a = a.parentNode;
          var s = e.measure,
            u = s.maps;
          function c(t, n, r) {
            for (var i = -1; i < (u ? u.length : 0); i++)
              for (var o = i < 0 ? s.map : u[i], l = 0; l < o.length; l += 3) {
                var a = o[l + 2];
                if (a == t || a == n) {
                  var c = lt(i < 0 ? e.line : e.rest[i]),
                    f = o[l] + r;
                  return ((r < 0 || a != t) && (f = o[l + (r ? 1 : 0)]), ct(c, f));
                }
              }
          }
          var f = c(l, a, n);
          if (f) return ls(f, i);
          for (var d = a.nextSibling, h = l ? l.nodeValue.length - n : 0; d; d = d.nextSibling) {
            if ((f = c(d, d.firstChild, 0))) return ls(ct(f.line, f.ch - h), i);
            h += d.textContent.length;
          }
          for (var p = a.previousSibling, g = n; p; p = p.previousSibling) {
            if ((f = c(p, p.firstChild, -1))) return ls(ct(f.line, f.ch + g), i);
            g += p.textContent.length;
          }
        }
        ((rs.prototype.init = function (e) {
          var t = this,
            n = this,
            r = n.cm,
            i = (n.div = e.lineDiv);
          function o(e) {
            for (var t = e.target; t; t = t.parentNode) {
              if (t == i) return !0;
              if (/\bCodeMirror-(?:line)?widget\b/.test(t.className)) break;
            }
            return !1;
          }
          function l(e) {
            if (o(e) && !Se(r, e)) {
              if (r.somethingSelected())
                ($a({ lineWise: !1, text: r.getSelections() }),
                  "cut" == e.type && r.replaceSelection("", null, "cut"));
              else {
                if (!r.options.lineWiseCopyCut) return;
                var t = Za(r);
                ($a({ lineWise: !0, text: t.text }),
                  "cut" == e.type &&
                    r.operation(function () {
                      (r.setSelections(t.ranges, 0, X), r.replaceSelection("", null, "cut"));
                    }));
              }
              if (e.clipboardData) {
                e.clipboardData.clearData();
                var l = Ka.text.join("\n");
                if ((e.clipboardData.setData("Text", l), e.clipboardData.getData("Text") == l))
                  return void e.preventDefault();
              }
              var a = Ja(),
                s = a.firstChild;
              (Qa(s),
                r.display.lineSpace.insertBefore(a, r.display.lineSpace.firstChild),
                (s.value = Ka.text.join("\n")));
              var u = W(z(i));
              (P(s),
                setTimeout(function () {
                  (r.display.lineSpace.removeChild(a),
                    u.focus(),
                    u == i && n.showPrimarySelection());
                }, 50));
            }
          }
          ((i.contentEditable = !0),
            Qa(i, r.options.spellcheck, r.options.autocorrect, r.options.autocapitalize),
            be(i, "paste", function (e) {
              !o(e) ||
                Se(r, e) ||
                Ya(e, r) ||
                (a <= 11 &&
                  setTimeout(
                    Ii(r, function () {
                      return t.updateFromDOM();
                    }),
                    20
                  ));
            }),
            be(i, "compositionstart", function (e) {
              t.composing = { data: e.data, done: !1 };
            }),
            be(i, "compositionupdate", function (e) {
              t.composing || (t.composing = { data: e.data, done: !1 });
            }),
            be(i, "compositionend", function (e) {
              t.composing &&
                (e.data != t.composing.data && t.readFromDOMSoon(), (t.composing.done = !0));
            }),
            be(i, "touchstart", function () {
              return n.forceCompositionEnd();
            }),
            be(i, "input", function () {
              t.composing || t.readFromDOMSoon();
            }),
            be(i, "copy", l),
            be(i, "cut", l));
        }),
          (rs.prototype.screenReaderLabelChanged = function (e) {
            e ? this.div.setAttribute("aria-label", e) : this.div.removeAttribute("aria-label");
          }),
          (rs.prototype.prepareSelection = function () {
            var e = Yr(this.cm, !1);
            return ((e.focus = W(z(this.div)) == this.div), e);
          }),
          (rs.prototype.showSelection = function (e, t) {
            e &&
              this.cm.display.view.length &&
              ((e.focus || t) && this.showPrimarySelection(), this.showMultipleSelections(e));
          }),
          (rs.prototype.getSelection = function () {
            return this.cm.display.wrapper.ownerDocument.getSelection();
          }),
          (rs.prototype.showPrimarySelection = function () {
            var e = this.getSelection(),
              t = this.cm,
              r = t.doc.sel.primary(),
              i = r.from(),
              o = r.to();
            if (
              t.display.viewTo == t.display.viewFrom ||
              i.line >= t.display.viewTo ||
              o.line < t.display.viewFrom
            )
              e.removeAllRanges();
            else {
              var l = ss(t, e.anchorNode, e.anchorOffset),
                a = ss(t, e.focusNode, e.focusOffset);
              if (!l || l.bad || !a || a.bad || 0 != ft(gt(l, a), i) || 0 != ft(pt(l, a), o)) {
                var s = t.display.view,
                  u = (i.line >= t.display.viewFrom && is(t, i)) || {
                    node: s[0].measure.map[2],
                    offset: 0,
                  },
                  c = o.line < t.display.viewTo && is(t, o);
                if (!c) {
                  var f = s[s.length - 1].measure,
                    d = f.maps ? f.maps[f.maps.length - 1] : f.map;
                  c = { node: d[d.length - 1], offset: d[d.length - 2] - d[d.length - 3] };
                }
                if (u && c) {
                  var h,
                    p = e.rangeCount && e.getRangeAt(0);
                  try {
                    h = T(u.node, u.offset, c.offset, c.node);
                  } catch (Re) {}
                  (h &&
                    (!n && t.state.focused
                      ? (e.collapse(u.node, u.offset),
                        h.collapsed || (e.removeAllRanges(), e.addRange(h)))
                      : (e.removeAllRanges(), e.addRange(h)),
                    p && null == e.anchorNode ? e.addRange(p) : n && this.startGracePeriod()),
                    this.rememberSelection());
                } else e.removeAllRanges();
              }
            }
          }),
          (rs.prototype.startGracePeriod = function () {
            var e = this;
            (clearTimeout(this.gracePeriod),
              (this.gracePeriod = setTimeout(function () {
                ((e.gracePeriod = !1),
                  e.selectionChanged() &&
                    e.cm.operation(function () {
                      return (e.cm.curOp.selectionChanged = !0);
                    }));
              }, 20)));
          }),
          (rs.prototype.showMultipleSelections = function (e) {
            (N(this.cm.display.cursorDiv, e.cursors), N(this.cm.display.selectionDiv, e.selection));
          }),
          (rs.prototype.rememberSelection = function () {
            var e = this.getSelection();
            ((this.lastAnchorNode = e.anchorNode),
              (this.lastAnchorOffset = e.anchorOffset),
              (this.lastFocusNode = e.focusNode),
              (this.lastFocusOffset = e.focusOffset));
          }),
          (rs.prototype.selectionInEditor = function () {
            var e = this.getSelection();
            if (!e.rangeCount) return !1;
            var t = e.getRangeAt(0).commonAncestorContainer;
            return F(this.div, t);
          }),
          (rs.prototype.focus = function () {
            "nocursor" != this.cm.options.readOnly &&
              ((this.selectionInEditor() && W(z(this.div)) == this.div) ||
                this.showSelection(this.prepareSelection(), !0),
              this.div.focus());
          }),
          (rs.prototype.blur = function () {
            this.div.blur();
          }),
          (rs.prototype.getField = function () {
            return this.div;
          }),
          (rs.prototype.supportsTouch = function () {
            return !0;
          }),
          (rs.prototype.receivedFocus = function () {
            var e = this,
              t = this;
            function n() {
              t.cm.state.focused &&
                (t.pollSelection(), t.polling.set(t.cm.options.pollInterval, n));
            }
            (this.selectionInEditor()
              ? setTimeout(function () {
                  return e.pollSelection();
                }, 20)
              : Pi(this.cm, function () {
                  return (t.cm.curOp.selectionChanged = !0);
                }),
              this.polling.set(this.cm.options.pollInterval, n));
          }),
          (rs.prototype.selectionChanged = function () {
            var e = this.getSelection();
            return (
              e.anchorNode != this.lastAnchorNode ||
              e.anchorOffset != this.lastAnchorOffset ||
              e.focusNode != this.lastFocusNode ||
              e.focusOffset != this.lastFocusOffset
            );
          }),
          (rs.prototype.pollSelection = function () {
            if (null == this.readDOMTimeout && !this.gracePeriod && this.selectionChanged()) {
              var e = this.getSelection(),
                t = this.cm;
              if (m && c && this.cm.display.gutterSpecs.length && os(e.anchorNode))
                return (
                  this.cm.triggerOnKeyDown({
                    type: "keydown",
                    keyCode: 8,
                    preventDefault: Math.abs,
                  }),
                  this.blur(),
                  void this.focus()
                );
              if (!this.composing) {
                this.rememberSelection();
                var n = ss(t, e.anchorNode, e.anchorOffset),
                  r = ss(t, e.focusNode, e.focusOffset);
                n &&
                  r &&
                  Pi(t, function () {
                    ($o(t.doc, ho(n, r), X), (n.bad || r.bad) && (t.curOp.selectionChanged = !0));
                  });
              }
            }
          }),
          (rs.prototype.pollContent = function () {
            null != this.readDOMTimeout &&
              (clearTimeout(this.readDOMTimeout), (this.readDOMTimeout = null));
            var e,
              t,
              n,
              r = this.cm,
              i = r.display,
              o = r.doc.sel.primary(),
              l = o.from(),
              a = o.to();
            if (
              (0 == l.ch &&
                l.line > r.firstLine() &&
                (l = ct(l.line - 1, nt(r.doc, l.line - 1).length)),
              a.ch == nt(r.doc, a.line).text.length &&
                a.line < r.lastLine() &&
                (a = ct(a.line + 1, 0)),
              l.line < i.viewFrom || a.line > i.viewTo - 1)
            )
              return !1;
            l.line == i.viewFrom || 0 == (e = Vr(r, l.line))
              ? ((t = lt(i.view[0].line)), (n = i.view[0].node))
              : ((t = lt(i.view[e].line)), (n = i.view[e - 1].node.nextSibling));
            var s,
              u,
              c = Vr(r, a.line);
            if (
              (c == i.view.length - 1
                ? ((s = i.viewTo - 1), (u = i.lineDiv.lastChild))
                : ((s = lt(i.view[c + 1].line) - 1), (u = i.view[c + 1].node.previousSibling)),
              !n)
            )
              return !1;
            for (
              var f = r.doc.splitLines(as(r, n, u, t, s)),
                d = rt(r.doc, ct(t, 0), ct(s, nt(r.doc, s).text.length));
              f.length > 1 && d.length > 1;
            )
              if (ee(f) == ee(d)) (f.pop(), d.pop(), s--);
              else {
                if (f[0] != d[0]) break;
                (f.shift(), d.shift(), t++);
              }
            for (
              var h = 0, p = 0, g = f[0], v = d[0], m = Math.min(g.length, v.length);
              h < m && g.charCodeAt(h) == v.charCodeAt(h);
            )
              ++h;
            for (
              var y = ee(f),
                b = ee(d),
                w = Math.min(
                  y.length - (1 == f.length ? h : 0),
                  b.length - (1 == d.length ? h : 0)
                );
              p < w && y.charCodeAt(y.length - p - 1) == b.charCodeAt(b.length - p - 1);
            )
              ++p;
            if (1 == f.length && 1 == d.length && t == l.line)
              for (
                ;
                h && h > l.ch && y.charCodeAt(y.length - p - 1) == b.charCodeAt(b.length - p - 1);
              )
                (h--, p++);
            ((f[f.length - 1] = y.slice(0, y.length - p).replace(/^\u200b+/, "")),
              (f[0] = f[0].slice(h).replace(/\u200b+$/, "")));
            var x = ct(t, h),
              C = ct(s, d.length ? ee(d).length - p : 0);
            return f.length > 1 || f[0] || ft(x, C) ? (ul(r.doc, f, x, C, "+input"), !0) : void 0;
          }),
          (rs.prototype.ensurePolled = function () {
            this.forceCompositionEnd();
          }),
          (rs.prototype.reset = function () {
            this.forceCompositionEnd();
          }),
          (rs.prototype.forceCompositionEnd = function () {
            this.composing &&
              (clearTimeout(this.readDOMTimeout),
              (this.composing = null),
              this.updateFromDOM(),
              this.div.blur(),
              this.div.focus());
          }),
          (rs.prototype.readFromDOMSoon = function () {
            var e = this;
            null == this.readDOMTimeout &&
              (this.readDOMTimeout = setTimeout(function () {
                if (((e.readDOMTimeout = null), e.composing)) {
                  if (!e.composing.done) return;
                  e.composing = null;
                }
                e.updateFromDOM();
              }, 80));
          }),
          (rs.prototype.updateFromDOM = function () {
            var e = this;
            (!this.cm.isReadOnly() && this.pollContent()) ||
              Pi(this.cm, function () {
                return Gr(e.cm);
              });
          }),
          (rs.prototype.setUneditable = function (e) {
            e.contentEditable = "false";
          }),
          (rs.prototype.onKeyPress = function (e) {
            0 == e.charCode ||
              this.composing ||
              (e.preventDefault(),
              this.cm.isReadOnly() ||
                Ii(this.cm, Xa)(
                  this.cm,
                  String.fromCharCode(null == e.charCode ? e.keyCode : e.charCode),
                  0
                ));
          }),
          (rs.prototype.readOnlyChanged = function (e) {
            this.div.contentEditable = String("nocursor" != e);
          }),
          (rs.prototype.onContextMenu = function () {}),
          (rs.prototype.resetPosition = function () {}),
          (rs.prototype.needsContentAttribute = !0));
        var cs = function (e) {
          ((this.cm = e),
            (this.prevInput = ""),
            (this.pollingFast = !1),
            (this.polling = new _()),
            (this.hasSelection = !1),
            (this.composing = null),
            (this.resetting = !1));
        };
        function fs(e, t) {
          if (
            (((t = t ? G(t) : {}).value = e.value),
            !t.tabindex && e.tabIndex && (t.tabindex = e.tabIndex),
            !t.placeholder && e.placeholder && (t.placeholder = e.placeholder),
            null == t.autofocus)
          ) {
            var n = W(z(e));
            t.autofocus = n == e || (null != e.getAttribute("autofocus") && n == document.body);
          }
          function r() {
            e.value = a.getValue();
          }
          var i;
          if (e.form && (be(e.form, "submit", r), !t.leaveSubmitMethodAlone)) {
            var o = e.form;
            i = o.submit;
            try {
              var l = (o.submit = function () {
                (r(), (o.submit = i), o.submit(), (o.submit = l));
              });
            } catch (Re) {}
          }
          ((t.finishInit = function (n) {
            ((n.save = r),
              (n.getTextArea = function () {
                return e;
              }),
              (n.toTextArea = function () {
                ((n.toTextArea = isNaN),
                  r(),
                  e.parentNode.removeChild(n.getWrapperElement()),
                  (e.style.display = ""),
                  e.form &&
                    (xe(e.form, "submit", r),
                    t.leaveSubmitMethodAlone ||
                      "function" != typeof e.form.submit ||
                      (e.form.submit = i)));
              }));
          }),
            (e.style.display = "none"));
          var a = Ga(function (t) {
            return e.parentNode.insertBefore(t, e.nextSibling);
          }, t);
          return a;
        }
        function ds(e) {
          ((e.off = xe),
            (e.on = be),
            (e.wheelEventPixels = ao),
            (e.Doc = Ol),
            (e.splitLines = ze),
            (e.countColumn = U),
            (e.findColumn = Z),
            (e.isWordChar = le),
            (e.Pass = $),
            (e.signal = Ce),
            (e.Line = pn),
            (e.changeEnd = po),
            (e.scrollbarModel = Li),
            (e.Pos = ct),
            (e.cmpPos = ft),
            (e.modes = _e),
            (e.mimeModes = je),
            (e.resolveMode = Xe),
            (e.getMode = Ye),
            (e.modeExtensions = qe),
            (e.extendMode = Ze),
            (e.copyState = Qe),
            (e.startState = et),
            (e.innerMode = Je),
            (e.commands = na),
            (e.keyMap = Ul),
            (e.keyName = Yl),
            (e.isModifierKey = $l),
            (e.lookupKey = Kl),
            (e.normalizeKeyMap = jl),
            (e.StringStream = tt),
            (e.SharedTextMarker = Cl),
            (e.TextMarker = wl),
            (e.LineWidget = vl),
            (e.e_preventDefault = Me),
            (e.e_stopPropagation = Oe),
            (e.e_stop = Ae),
            (e.addClass = E),
            (e.contains = F),
            (e.rmClass = M),
            (e.keyNames = zl));
        }
        ((cs.prototype.init = function (e) {
          var t = this,
            n = this,
            r = this.cm;
          this.createField(e);
          var i = this.textarea;
          function o(e) {
            if (!Se(r, e)) {
              if (r.somethingSelected()) $a({ lineWise: !1, text: r.getSelections() });
              else {
                if (!r.options.lineWiseCopyCut) return;
                var t = Za(r);
                ($a({ lineWise: !0, text: t.text }),
                  "cut" == e.type
                    ? r.setSelections(t.ranges, null, X)
                    : ((n.prevInput = ""), (i.value = t.text.join("\n")), P(i)));
              }
              "cut" == e.type && (r.state.cutIncoming = +new Date());
            }
          }
          (e.wrapper.insertBefore(this.wrapper, e.wrapper.firstChild),
            v && (i.style.width = "0px"),
            be(i, "input", function () {
              (l && a >= 9 && t.hasSelection && (t.hasSelection = null), n.poll());
            }),
            be(i, "paste", function (e) {
              Se(r, e) || Ya(e, r) || ((r.state.pasteIncoming = +new Date()), n.fastPoll());
            }),
            be(i, "cut", o),
            be(i, "copy", o),
            be(e.scroller, "paste", function (t) {
              if (!Yn(e, t) && !Se(r, t)) {
                if (!i.dispatchEvent)
                  return ((r.state.pasteIncoming = +new Date()), void n.focus());
                var o = new Event("paste");
                ((o.clipboardData = t.clipboardData), i.dispatchEvent(o));
              }
            }),
            be(e.lineSpace, "selectstart", function (t) {
              Yn(e, t) || Me(t);
            }),
            be(i, "compositionstart", function () {
              var e = r.getCursor("from");
              (n.composing && n.composing.range.clear(),
                (n.composing = {
                  start: e,
                  range: r.markText(e, r.getCursor("to"), { className: "CodeMirror-composing" }),
                }));
            }),
            be(i, "compositionend", function () {
              n.composing && (n.poll(), n.composing.range.clear(), (n.composing = null));
            }));
        }),
          (cs.prototype.createField = function (e) {
            ((this.wrapper = Ja()), (this.textarea = this.wrapper.firstChild));
            var t = this.cm.options;
            Qa(this.textarea, t.spellcheck, t.autocorrect, t.autocapitalize);
          }),
          (cs.prototype.screenReaderLabelChanged = function (e) {
            e
              ? this.textarea.setAttribute("aria-label", e)
              : this.textarea.removeAttribute("aria-label");
          }),
          (cs.prototype.prepareSelection = function () {
            var e = this.cm,
              t = e.display,
              n = e.doc,
              r = Yr(e);
            if (e.options.moveInputWithCursor) {
              var i = kr(e, n.sel.primary().head, "div"),
                o = t.wrapper.getBoundingClientRect(),
                l = t.lineDiv.getBoundingClientRect();
              ((r.teTop = Math.max(
                0,
                Math.min(t.wrapper.clientHeight - 10, i.top + l.top - o.top)
              )),
                (r.teLeft = Math.max(
                  0,
                  Math.min(t.wrapper.clientWidth - 10, i.left + l.left - o.left)
                )));
            }
            return r;
          }),
          (cs.prototype.showSelection = function (e) {
            var t = this.cm.display;
            (N(t.cursorDiv, e.cursors),
              N(t.selectionDiv, e.selection),
              null != e.teTop &&
                ((this.wrapper.style.top = e.teTop + "px"),
                (this.wrapper.style.left = e.teLeft + "px")));
          }),
          (cs.prototype.reset = function (e) {
            if (!(this.contextMenuPending || (this.composing && e))) {
              var t = this.cm;
              if (((this.resetting = !0), t.somethingSelected())) {
                this.prevInput = "";
                var n = t.getSelection();
                ((this.textarea.value = n),
                  t.state.focused && P(this.textarea),
                  l && a >= 9 && (this.hasSelection = n));
              } else
                e ||
                  ((this.prevInput = this.textarea.value = ""),
                  l && a >= 9 && (this.hasSelection = null));
              this.resetting = !1;
            }
          }),
          (cs.prototype.getField = function () {
            return this.textarea;
          }),
          (cs.prototype.supportsTouch = function () {
            return !1;
          }),
          (cs.prototype.focus = function () {
            if (
              "nocursor" != this.cm.options.readOnly &&
              (!y || W(z(this.textarea)) != this.textarea)
            )
              try {
                this.textarea.focus();
              } catch (Re) {}
          }),
          (cs.prototype.blur = function () {
            this.textarea.blur();
          }),
          (cs.prototype.resetPosition = function () {
            this.wrapper.style.top = this.wrapper.style.left = 0;
          }),
          (cs.prototype.receivedFocus = function () {
            this.slowPoll();
          }),
          (cs.prototype.slowPoll = function () {
            var e = this;
            this.pollingFast ||
              this.polling.set(this.cm.options.pollInterval, function () {
                (e.poll(), e.cm.state.focused && e.slowPoll());
              });
          }),
          (cs.prototype.fastPoll = function () {
            var e = !1,
              t = this;
            function n() {
              t.poll() || e
                ? ((t.pollingFast = !1), t.slowPoll())
                : ((e = !0), t.polling.set(60, n));
            }
            ((t.pollingFast = !0), t.polling.set(20, n));
          }),
          (cs.prototype.poll = function () {
            var e = this,
              t = this.cm,
              n = this.textarea,
              r = this.prevInput;
            if (
              this.contextMenuPending ||
              this.resetting ||
              !t.state.focused ||
              (Be(n) && !r && !this.composing) ||
              t.isReadOnly() ||
              t.options.disableInput ||
              t.state.keySeq
            )
              return !1;
            var i = n.value;
            if (i == r && !t.somethingSelected()) return !1;
            if ((l && a >= 9 && this.hasSelection === i) || (b && /[\uf700-\uf7ff]/.test(i)))
              return (t.display.input.reset(), !1);
            if (t.doc.sel == t.display.selForContextMenu) {
              var o = i.charCodeAt(0);
              if ((8203 != o || r || (r = "​"), 8666 == o))
                return (this.reset(), this.cm.execCommand("undo"));
            }
            for (
              var s = 0, u = Math.min(r.length, i.length);
              s < u && r.charCodeAt(s) == i.charCodeAt(s);
            )
              ++s;
            return (
              Pi(t, function () {
                (Xa(t, i.slice(s), r.length - s, null, e.composing ? "*compose" : null),
                  i.length > 1e3 || i.indexOf("\n") > -1
                    ? (n.value = e.prevInput = "")
                    : (e.prevInput = i),
                  e.composing &&
                    (e.composing.range.clear(),
                    (e.composing.range = t.markText(e.composing.start, t.getCursor("to"), {
                      className: "CodeMirror-composing",
                    }))));
              }),
              !0
            );
          }),
          (cs.prototype.ensurePolled = function () {
            this.pollingFast && this.poll() && (this.pollingFast = !1);
          }),
          (cs.prototype.onKeyPress = function () {
            (l && a >= 9 && (this.hasSelection = null), this.fastPoll());
          }),
          (cs.prototype.onContextMenu = function (e) {
            var t = this,
              n = t.cm,
              r = n.display,
              i = t.textarea;
            t.contextMenuPending && t.contextMenuPending();
            var o = Br(n, e),
              u = r.scroller.scrollTop;
            if (o && !d) {
              n.options.resetSelectionOnContextMenu &&
                -1 == n.doc.sel.contains(o) &&
                Ii(n, $o)(n.doc, ho(o), X);
              var c,
                f = i.style.cssText,
                h = t.wrapper.style.cssText,
                p = t.wrapper.offsetParent.getBoundingClientRect();
              if (
                ((t.wrapper.style.cssText = "position: static"),
                (i.style.cssText =
                  "position: absolute; width: 30px; height: 30px;\n      top: " +
                  (e.clientY - p.top - 5) +
                  "px; left: " +
                  (e.clientX - p.left - 5) +
                  "px;\n      z-index: 1000; background: " +
                  (l ? "rgba(255, 255, 255, .05)" : "transparent") +
                  ";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);"),
                s && (c = i.ownerDocument.defaultView.scrollY),
                r.input.focus(),
                s && i.ownerDocument.defaultView.scrollTo(null, c),
                r.input.reset(),
                n.somethingSelected() || (i.value = t.prevInput = " "),
                (t.contextMenuPending = m),
                (r.selForContextMenu = n.doc.sel),
                clearTimeout(r.detectingSelectAll),
                l && a >= 9 && v(),
                k)
              ) {
                Ae(e);
                var g = function () {
                  (xe(window, "mouseup", g), setTimeout(m, 20));
                };
                be(window, "mouseup", g);
              } else setTimeout(m, 50);
            }
            function v() {
              if (null != i.selectionStart) {
                var e = n.somethingSelected(),
                  o = "​" + (e ? i.value : "");
                ((i.value = "⇚"),
                  (i.value = o),
                  (t.prevInput = e ? "" : "​"),
                  (i.selectionStart = 1),
                  (i.selectionEnd = o.length),
                  (r.selForContextMenu = n.doc.sel));
              }
            }
            function m() {
              if (
                t.contextMenuPending == m &&
                ((t.contextMenuPending = !1),
                (t.wrapper.style.cssText = h),
                (i.style.cssText = f),
                l && a < 9 && r.scrollbars.setScrollTop((r.scroller.scrollTop = u)),
                null != i.selectionStart)
              ) {
                (!l || (l && a < 9)) && v();
                var e = 0,
                  o = function () {
                    r.selForContextMenu == n.doc.sel &&
                    0 == i.selectionStart &&
                    i.selectionEnd > 0 &&
                    "​" == t.prevInput
                      ? Ii(n, tl)(n)
                      : e++ < 10
                        ? (r.detectingSelectAll = setTimeout(o, 500))
                        : ((r.selForContextMenu = null), r.input.reset());
                  };
                r.detectingSelectAll = setTimeout(o, 200);
              }
            }
          }),
          (cs.prototype.readOnlyChanged = function (e) {
            (e || this.reset(),
              (this.textarea.disabled = "nocursor" == e),
              (this.textarea.readOnly = !!e));
          }),
          (cs.prototype.setUneditable = function () {}),
          (cs.prototype.needsContentAttribute = !1),
          za(Ga),
          es(Ga));
        var hs = "iter insert remove copy getEditor constructor".split(" ");
        for (var ps in Ol.prototype)
          Ol.prototype.hasOwnProperty(ps) &&
            j(hs, ps) < 0 &&
            (Ga.prototype[ps] = (function (e) {
              return function () {
                return e.apply(this.doc, arguments);
              };
            })(Ol.prototype[ps]));
        return (
          Te(Ol),
          (Ga.inputStyles = { textarea: cs, contenteditable: rs }),
          (Ga.defineMode = function (e) {
            (Ga.defaults.mode || "null" == e || (Ga.defaults.mode = e), Ke.apply(this, arguments));
          }),
          (Ga.defineMIME = $e),
          Ga.defineMode("null", function () {
            return {
              token: function (e) {
                return e.skipToEnd();
              },
            };
          }),
          Ga.defineMIME("text/plain", "null"),
          (Ga.defineExtension = function (e, t) {
            Ga.prototype[e] = t;
          }),
          (Ga.defineDocExtension = function (e, t) {
            Ol.prototype[e] = t;
          }),
          (Ga.fromTextArea = fs),
          ds(Ga),
          (Ga.version = "5.65.21"),
          Ga
        );
      })())),
    S.exports
  );
}
function L() {
  return (
    x ||
      ((x = 1),
      (function (e) {
        function t(t, r, o, l) {
          if (o && o.call) {
            var a = o;
            o = null;
          } else a = i(t, o, "rangeFinder");
          "number" == typeof r && (r = e.Pos(r, 0));
          var s = i(t, o, "minFoldSize");
          function u(e) {
            var n = a(t, r);
            if (!n || n.to.line - n.from.line < s) return null;
            if ("fold" === l) return n;
            for (var i = t.findMarksAt(n.from), o = 0; o < i.length; ++o)
              if (i[o].__isFold) {
                if (!e) return null;
                ((n.cleared = !0), i[o].clear());
              }
            return n;
          }
          var c = u(!0);
          if (i(t, o, "scanUp"))
            for (; !c && r.line > t.firstLine(); ) ((r = e.Pos(r.line - 1, 0)), (c = u(!1)));
          if (c && !c.cleared && "unfold" !== l) {
            var f = n(t, o, c);
            e.on(f, "mousedown", function (t) {
              (d.clear(), e.e_preventDefault(t));
            });
            var d = t.markText(c.from, c.to, {
              replacedWith: f,
              clearOnEnter: i(t, o, "clearOnEnter"),
              __isFold: !0,
            });
            (d.on("clear", function (n, r) {
              e.signal(t, "unfold", t, n, r);
            }),
              e.signal(t, "fold", t, c.from, c.to));
          }
        }
        function n(e, t, n) {
          var r = i(e, t, "widget");
          if (("function" == typeof r && (r = r(n.from, n.to)), "string" == typeof r)) {
            var o = document.createTextNode(r);
            ((r = document.createElement("span")).appendChild(o),
              (r.className = "CodeMirror-foldmarker"));
          } else r && (r = r.cloneNode(!0));
          return r;
        }
        ((e.newFoldFunction = function (e, n) {
          return function (r, i) {
            t(r, i, { rangeFinder: e, widget: n });
          };
        }),
          e.defineExtension("foldCode", function (e, n, r) {
            t(this, e, n, r);
          }),
          e.defineExtension("isFolded", function (e) {
            for (var t = this.findMarksAt(e), n = 0; n < t.length; ++n)
              if (t[n].__isFold) return !0;
          }),
          (e.commands.toggleFold = function (e) {
            e.foldCode(e.getCursor());
          }),
          (e.commands.fold = function (e) {
            e.foldCode(e.getCursor(), null, "fold");
          }),
          (e.commands.unfold = function (e) {
            e.foldCode(e.getCursor(), { scanUp: !1 }, "unfold");
          }),
          (e.commands.foldAll = function (t) {
            t.operation(function () {
              for (var n = t.firstLine(), r = t.lastLine(); n <= r; n++)
                t.foldCode(e.Pos(n, 0), { scanUp: !1 }, "fold");
            });
          }),
          (e.commands.unfoldAll = function (t) {
            t.operation(function () {
              for (var n = t.firstLine(), r = t.lastLine(); n <= r; n++)
                t.foldCode(e.Pos(n, 0), { scanUp: !1 }, "unfold");
            });
          }),
          e.registerHelper("fold", "combine", function () {
            var e = Array.prototype.slice.call(arguments, 0);
            return function (t, n) {
              for (var r = 0; r < e.length; ++r) {
                var i = e[r](t, n);
                if (i) return i;
              }
            };
          }),
          e.registerHelper("fold", "auto", function (e, t) {
            for (var n = e.getHelpers(t, "fold"), r = 0; r < n.length; r++) {
              var i = n[r](e, t);
              if (i) return i;
            }
          }));
        var r = {
          rangeFinder: e.fold.auto,
          widget: "↔",
          minFoldSize: 0,
          scanUp: !1,
          clearOnEnter: !0,
        };
        function i(e, t, n) {
          if (t && void 0 !== t[n]) return t[n];
          var i = e.options.foldOptions;
          return i && void 0 !== i[n] ? i[n] : r[n];
        }
        (e.defineOption("foldOptions", null),
          e.defineExtension("foldOption", function (e, t) {
            return i(this, e, t);
          }));
      })(k())),
    C
  );
}
L();
var T;
T ||
  ((T = 1),
  (function (e) {
    e.defineOption("foldGutter", !1, function (t, i, o) {
      (o &&
        o != e.Init &&
        (t.clearGutter(t.state.foldGutter.options.gutter),
        (t.state.foldGutter = null),
        t.off("gutterClick", u),
        t.off("changes", f),
        t.off("viewportChange", d),
        t.off("fold", h),
        t.off("unfold", h),
        t.off("swapDoc", f),
        t.off("optionChange", c)),
        i &&
          ((t.state.foldGutter = new n(r(i))),
          s(t),
          t.on("gutterClick", u),
          t.on("changes", f),
          t.on("viewportChange", d),
          t.on("fold", h),
          t.on("unfold", h),
          t.on("swapDoc", f),
          t.on("optionChange", c)));
    });
    var t = e.Pos;
    function n(e) {
      ((this.options = e), (this.from = this.to = 0));
    }
    function r(e) {
      return (
        !0 === e && (e = {}),
        null == e.gutter && (e.gutter = "CodeMirror-foldgutter"),
        null == e.indicatorOpen && (e.indicatorOpen = "CodeMirror-foldgutter-open"),
        null == e.indicatorFolded && (e.indicatorFolded = "CodeMirror-foldgutter-folded"),
        e
      );
    }
    function i(e, n) {
      for (var r = e.findMarks(t(n, 0), t(n + 1, 0)), i = 0; i < r.length; ++i)
        if (r[i].__isFold) {
          var o = r[i].find(-1);
          if (o && o.line === n) return r[i];
        }
    }
    function o(e) {
      if ("string" == typeof e) {
        var t = document.createElement("div");
        return ((t.className = e + " CodeMirror-guttermarker-subtle"), t);
      }
      return e.cloneNode(!0);
    }
    function l(e, n, r) {
      var l = e.state.foldGutter.options,
        s = n - 1,
        u = e.foldOption(l, "minFoldSize"),
        c = e.foldOption(l, "rangeFinder"),
        f = "string" == typeof l.indicatorFolded && a(l.indicatorFolded),
        d = "string" == typeof l.indicatorOpen && a(l.indicatorOpen);
      e.eachLine(n, r, function (n) {
        ++s;
        var r = null,
          a = n.gutterMarkers;
        if ((a && (a = a[l.gutter]), i(e, s))) {
          if (f && a && f.test(a.className)) return;
          r = o(l.indicatorFolded);
        } else {
          var h = t(s, 0),
            p = c && c(e, h);
          if (p && p.to.line - p.from.line >= u) {
            if (d && a && d.test(a.className)) return;
            r = o(l.indicatorOpen);
          }
        }
        (r || a) && e.setGutterMarker(n, l.gutter, r);
      });
    }
    function a(e) {
      return new RegExp("(^|\\s)" + e + "(?:$|\\s)\\s*");
    }
    function s(e) {
      var t = e.getViewport(),
        n = e.state.foldGutter;
      n &&
        (e.operation(function () {
          l(e, t.from, t.to);
        }),
        (n.from = t.from),
        (n.to = t.to));
    }
    function u(e, n, r) {
      var o = e.state.foldGutter;
      if (o) {
        var l = o.options;
        if (r == l.gutter) {
          var a = i(e, n);
          a ? a.clear() : e.foldCode(t(n, 0), l);
        }
      }
    }
    function c(e, t) {
      "mode" == t && f(e);
    }
    function f(e) {
      var t = e.state.foldGutter;
      if (t) {
        var n = t.options;
        ((t.from = t.to = 0),
          clearTimeout(t.changeUpdate),
          (t.changeUpdate = setTimeout(function () {
            s(e);
          }, n.foldOnChangeTimeSpan || 600)));
      }
    }
    function d(e) {
      var t = e.state.foldGutter;
      if (t) {
        var n = t.options;
        (clearTimeout(t.changeUpdate),
          (t.changeUpdate = setTimeout(function () {
            var n = e.getViewport();
            t.from == t.to || n.from - t.to > 20 || t.from - n.to > 20
              ? s(e)
              : e.operation(function () {
                  (n.from < t.from && (l(e, n.from, t.from), (t.from = n.from)),
                    n.to > t.to && (l(e, t.to, n.to), (t.to = n.to)));
                });
          }, n.updateViewportTimeSpan || 400)));
      }
    }
    function h(e, t) {
      var n = e.state.foldGutter;
      if (n) {
        var r = t.line;
        r >= n.from && r < n.to && l(e, r, r + 1);
      }
    }
  })(k(), L()));
var M;
M ||
  ((M = 1),
  (function (e) {
    function t(t) {
      return function (n, r) {
        var i = r.line,
          o = n.getLine(i);
        function l(t) {
          for (var l, a = r.ch, s = 0; ; ) {
            var u = a <= 0 ? -1 : o.lastIndexOf(t[0], a - 1);
            if (-1 != u) {
              if (1 == s && u < r.ch) break;
              if (((l = n.getTokenTypeAt(e.Pos(i, u + 1))), !/^(comment|string)/.test(l)))
                return { ch: u + 1, tokenType: l, pair: t };
              a = u - 1;
            } else {
              if (1 == s) break;
              ((s = 1), (a = o.length));
            }
          }
        }
        function a(t) {
          var r,
            o,
            l = 1,
            a = n.lastLine(),
            s = t.ch;
          e: for (var u = i; u <= a; ++u)
            for (var c = n.getLine(u), f = u == i ? s : 0; ; ) {
              var d = c.indexOf(t.pair[0], f),
                h = c.indexOf(t.pair[1], f);
              if (
                (d < 0 && (d = c.length), h < 0 && (h = c.length), (f = Math.min(d, h)) == c.length)
              )
                break;
              if (n.getTokenTypeAt(e.Pos(u, f + 1)) == t.tokenType)
                if (f == d) ++l;
                else if (!--l) {
                  ((r = u), (o = f));
                  break e;
                }
              ++f;
            }
          return null == r || i == r ? null : { from: e.Pos(i, s), to: e.Pos(r, o) };
        }
        for (var s = [], u = 0; u < t.length; u++) {
          var c = l(t[u]);
          c && s.push(c);
        }
        for (
          s.sort(function (e, t) {
            return e.ch - t.ch;
          }),
            u = 0;
          u < s.length;
          u++
        ) {
          var f = a(s[u]);
          if (f) return f;
        }
        return null;
      };
    }
    (e.registerHelper(
      "fold",
      "brace",
      t([
        ["{", "}"],
        ["[", "]"],
      ])
    ),
      e.registerHelper(
        "fold",
        "brace-paren",
        t([
          ["{", "}"],
          ["[", "]"],
          ["(", ")"],
        ])
      ),
      e.registerHelper("fold", "import", function (t, n) {
        function r(n) {
          if (n < t.firstLine() || n > t.lastLine()) return null;
          var r = t.getTokenAt(e.Pos(n, 1));
          if (
            (/\S/.test(r.string) || (r = t.getTokenAt(e.Pos(n, r.end + 1))),
            "keyword" != r.type || "import" != r.string)
          )
            return null;
          for (var i = n, o = Math.min(t.lastLine(), n + 10); i <= o; ++i) {
            var l = t.getLine(i).indexOf(";");
            if (-1 != l) return { startCh: r.end, end: e.Pos(i, l) };
          }
        }
        var i,
          o = n.line,
          l = r(o);
        if (!l || r(o - 1) || ((i = r(o - 2)) && i.end.line == o - 1)) return null;
        for (var a = l.end; ; ) {
          var s = r(a.line + 1);
          if (null == s) break;
          a = s.end;
        }
        return { from: t.clipPos(e.Pos(o, l.startCh + 1)), to: a };
      }),
      e.registerHelper("fold", "include", function (t, n) {
        function r(n) {
          if (n < t.firstLine() || n > t.lastLine()) return null;
          var r = t.getTokenAt(e.Pos(n, 1));
          return (
            /\S/.test(r.string) || (r = t.getTokenAt(e.Pos(n, r.end + 1))),
            "meta" == r.type && "#include" == r.string.slice(0, 8) ? r.start + 8 : void 0
          );
        }
        var i = n.line,
          o = r(i);
        if (null == o || null != r(i - 1)) return null;
        for (var l = i; null != r(l + 1); ) ++l;
        return { from: e.Pos(i, o + 1), to: t.clipPos(e.Pos(l)) };
      }));
  })(k()));
var O;
O ||
  ((O = 1),
  (function (e) {
    var t = "CodeMirror-activeline",
      n = "CodeMirror-activeline-background",
      r = "CodeMirror-activeline-gutter";
    function i(e) {
      for (var i = 0; i < e.state.activeLines.length; i++)
        (e.removeLineClass(e.state.activeLines[i], "wrap", t),
          e.removeLineClass(e.state.activeLines[i], "background", n),
          e.removeLineClass(e.state.activeLines[i], "gutter", r));
    }
    function o(e, t) {
      if (e.length != t.length) return !1;
      for (var n = 0; n < e.length; n++) if (e[n] != t[n]) return !1;
      return !0;
    }
    function l(e, l) {
      for (var a = [], s = 0; s < l.length; s++) {
        var u = l[s],
          c = e.getOption("styleActiveLine");
        if ("object" == typeof c && c.nonEmpty ? u.anchor.line == u.head.line : u.empty()) {
          var f = e.getLineHandleVisualStart(u.head.line);
          a[a.length - 1] != f && a.push(f);
        }
      }
      o(e.state.activeLines, a) ||
        e.operation(function () {
          i(e);
          for (var o = 0; o < a.length; o++)
            (e.addLineClass(a[o], "wrap", t),
              e.addLineClass(a[o], "background", n),
              e.addLineClass(a[o], "gutter", r));
          e.state.activeLines = a;
        });
    }
    function a(e, t) {
      l(e, t.ranges);
    }
    e.defineOption("styleActiveLine", !1, function (t, n, r) {
      var o = r != e.Init && r;
      n != o &&
        (o && (t.off("beforeSelectionChange", a), i(t), delete t.state.activeLines),
        n &&
          ((t.state.activeLines = []), l(t, t.listSelections()), t.on("beforeSelectionChange", a)));
    });
  })(k()));
const N = e(k());
var A;
A ||
  ((A = 1),
  (function (e) {
    var t = e.Pos,
      n = "http://www.w3.org/2000/svg";
    function r(e, t) {
      ((this.mv = e),
        (this.type = t),
        (this.classes =
          "left" == t
            ? {
                chunk: "CodeMirror-merge-l-chunk",
                start: "CodeMirror-merge-l-chunk-start",
                end: "CodeMirror-merge-l-chunk-end",
                insert: "CodeMirror-merge-l-inserted",
                del: "CodeMirror-merge-l-deleted",
                connect: "CodeMirror-merge-l-connect",
              }
            : {
                chunk: "CodeMirror-merge-r-chunk",
                start: "CodeMirror-merge-r-chunk-start",
                end: "CodeMirror-merge-r-chunk-end",
                insert: "CodeMirror-merge-r-inserted",
                del: "CodeMirror-merge-r-deleted",
                connect: "CodeMirror-merge-r-connect",
              }));
    }
    function i(t) {
      t.diffOutOfDate &&
        ((t.diff = A(t.orig.getValue(), t.edit.getValue(), t.mv.options.ignoreWhitespace)),
        (t.chunks = D(t.diff)),
        (t.diffOutOfDate = !1),
        e.signal(t.edit, "updateDiff", t.diff));
    }
    r.prototype = {
      constructor: r,
      init: function (t, n, r) {
        ((this.edit = this.mv.edit),
          (this.edit.state.diffViews || (this.edit.state.diffViews = [])).push(this),
          (this.orig = e(
            t,
            G({ value: n, readOnly: !this.mv.options.allowEditingOriginals }, G(r))
          )),
          "align" == this.mv.options.connect &&
            (this.edit.state.trackAlignable || (this.edit.state.trackAlignable = new $(this.edit)),
            (this.orig.state.trackAlignable = new $(this.orig))),
          (this.lockButton.title = this.edit.phrase("Toggle locked scrolling")),
          this.lockButton.setAttribute("aria-label", this.lockButton.title),
          (this.orig.state.diffViews = [this]));
        var i = r.chunkClassLocation || "background";
        ("[object Array]" != Object.prototype.toString.call(i) && (i = [i]),
          (this.classes.classLocation = i),
          (this.diff = A(N(n), N(r.value), this.mv.options.ignoreWhitespace)),
          (this.chunks = D(this.diff)),
          (this.diffOutOfDate = this.dealigned = !1),
          (this.needsScrollSync = null),
          (this.showDifferences = !1 !== r.showDifferences));
      },
      registerEvents: function (e) {
        ((this.forceUpdate = l(this)), c(this, !0, !1), a(this, e));
      },
      setShowDifferences: function (e) {
        (e = !1 !== e) != this.showDifferences &&
          ((this.showDifferences = e), this.forceUpdate("full"));
      },
    };
    var o = !1;
    function l(t) {
      var n,
        r = { from: 0, to: 0, marked: [] },
        l = { from: 0, to: 0, marked: [] },
        a = !1;
      function u(e) {
        ((o = !0),
          (a = !1),
          "full" == e &&
            (t.svg && B(t.svg),
            t.copyButtons && B(t.copyButtons),
            d(t.edit, r.marked, t.classes),
            d(t.orig, l.marked, t.classes),
            (r.from = r.to = l.from = l.to = 0)),
          i(t),
          t.showDifferences &&
            (h(t.edit, t.diff, r, DIFF_INSERT, t.classes),
            h(t.orig, t.diff, l, DIFF_DELETE, t.classes)),
          "align" == t.mv.options.connect && x(t),
          v(t),
          null != t.needsScrollSync && s(t, t.needsScrollSync),
          (o = !1));
      }
      function c(e) {
        o || ((t.dealigned = !0), f(e));
      }
      function f(e) {
        o || a || (clearTimeout(n), !0 === e && (a = !0), (n = setTimeout(u, !0 === e ? 20 : 250)));
      }
      function p(e, n) {
        (t.diffOutOfDate || ((t.diffOutOfDate = !0), (r.from = r.to = l.from = l.to = 0)),
          c(n.text.length - 1 != n.to.line - n.from.line));
      }
      function g() {
        ((t.diffOutOfDate = !0), (t.dealigned = !0), u("full"));
      }
      return (
        t.edit.on("change", p),
        t.orig.on("change", p),
        t.edit.on("swapDoc", g),
        t.orig.on("swapDoc", g),
        "align" == t.mv.options.connect &&
          (e.on(t.edit.state.trackAlignable, "realign", c),
          e.on(t.orig.state.trackAlignable, "realign", c)),
        t.edit.on("viewportChange", function () {
          f(!1);
        }),
        t.orig.on("viewportChange", function () {
          f(!1);
        }),
        u(),
        u
      );
    }
    function a(e, t) {
      (e.edit.on("scroll", function () {
        s(e, !0) && v(e);
      }),
        e.orig.on("scroll", function () {
          (s(e, !1) && v(e), t && s(t, !0) && v(t));
        }));
    }
    function s(e, t) {
      if (e.diffOutOfDate)
        return (e.lockScroll && null == e.needsScrollSync && (e.needsScrollSync = t), !1);
      if (((e.needsScrollSync = null), !e.lockScroll)) return !0;
      var n,
        r,
        i = +new Date();
      if (
        (t ? ((n = e.edit), (r = e.orig)) : ((n = e.orig), (r = e.edit)),
        n.state.scrollSetBy == e && (n.state.scrollSetAt || 0) + 250 > i)
      )
        return !1;
      var o = n.getScrollInfo();
      if ("align" == e.mv.options.connect) v = o.top;
      else {
        var l,
          a,
          s = 0.5 * o.clientHeight,
          c = o.top + s,
          f = n.lineAtHeight(c, "local"),
          d = E(e.chunks, f, t),
          h = u(n, t ? d.edit : d.orig),
          p = u(r, t ? d.orig : d.edit),
          g = (c - h.top) / (h.bot - h.top),
          v = p.top - s + g * (p.bot - p.top);
        if (v > o.top && (a = o.top / s) < 1) v = v * a + o.top * (1 - a);
        else if ((l = o.height - o.clientHeight - o.top) < s) {
          var m = r.getScrollInfo();
          m.height - m.clientHeight - v > l &&
            (a = l / s) < 1 &&
            (v = v * a + (m.height - m.clientHeight - l) * (1 - a));
        }
      }
      return (r.scrollTo(o.left, v), (r.state.scrollSetAt = i), (r.state.scrollSetBy = e), !0);
    }
    function u(e, t) {
      var n = t.after;
      return (
        null == n && (n = e.lastLine() + 1),
        { top: e.heightAtLine(t.before || 0, "local"), bot: e.heightAtLine(n, "local") }
      );
    }
    function c(t, n, r) {
      ((t.lockScroll = n),
        n && 0 != r && s(t, DIFF_INSERT) && v(t),
        (n ? e.addClass : e.rmClass)(t.lockButton, "CodeMirror-merge-scrolllock-enabled"));
    }
    function f(e, t, n) {
      for (var r = n.classLocation, i = 0; i < r.length; i++)
        (e.removeLineClass(t, r[i], n.chunk),
          e.removeLineClass(t, r[i], n.start),
          e.removeLineClass(t, r[i], n.end));
    }
    function d(t, n, r) {
      for (var i = 0; i < n.length; ++i) {
        var o = n[i];
        o instanceof e.TextMarker ? o.clear() : o.parent && f(t, o, r);
      }
      n.length = 0;
    }
    function h(e, t, n, r, i) {
      var o = e.getViewport();
      e.operation(function () {
        n.from == n.to || o.from - n.to > 20 || n.from - o.to > 20
          ? (d(e, n.marked, i),
            g(e, t, r, n.marked, o.from, o.to, i),
            (n.from = o.from),
            (n.to = o.to))
          : (o.from < n.from && (g(e, t, r, n.marked, o.from, n.from, i), (n.from = o.from)),
            o.to > n.to && (g(e, t, r, n.marked, n.to, o.to, i), (n.to = o.to)));
      });
    }
    function p(e, t, n, r, i, o) {
      for (var l = n.classLocation, a = e.getLineHandle(t), s = 0; s < l.length; s++)
        (r && e.addLineClass(a, l[s], n.chunk),
          i && e.addLineClass(a, l[s], n.start),
          o && e.addLineClass(a, l[s], n.end));
      return a;
    }
    function g(e, n, r, i, o, l, a) {
      var s = t(0, 0),
        u = t(o, 0),
        c = e.clipPos(t(l - 1)),
        f = r == DIFF_DELETE ? a.del : a.insert;
      function d(t, n) {
        for (var r = Math.max(o, t), s = Math.min(l, n), u = r; u < s; ++u)
          i.push(p(e, u, a, !0, u == t, u == n - 1));
        t == n &&
          r == n &&
          s == n &&
          (r ? i.push(p(e, r - 1, a, !1, !1, !0)) : i.push(p(e, r, a, !1, !0, !1)));
      }
      for (var h = 0, g = !1, v = 0; v < n.length; ++v) {
        var m = n[v],
          y = m[0],
          b = m[1];
        if (y == DIFF_EQUAL) {
          var w = s.line + (W(n, v) ? 0 : 1);
          U(s, b);
          var x = s.line + (F(n, v) ? 1 : 0);
          x > w && (g && (d(h, w), (g = !1)), (h = x));
        } else if (((g = !0), y == r)) {
          var C = U(s, b, !0),
            S = Y(u, s),
            k = X(c, C);
          (q(S, k) || i.push(e.markText(S, k, { className: f })), (s = C));
        }
      }
      g && d(h, s.line + 1);
    }
    function v(e) {
      if (e.showDifferences) {
        if (e.svg) {
          B(e.svg);
          var t = e.gap.offsetWidth;
          V(e.svg, "width", t, "height", e.gap.offsetHeight);
        }
        e.copyButtons && B(e.copyButtons);
        for (
          var n = e.edit.getViewport(),
            r = e.orig.getViewport(),
            i = e.mv.wrap.getBoundingClientRect().top,
            o =
              i -
              e.edit.getScrollerElement().getBoundingClientRect().top +
              e.edit.getScrollInfo().top,
            l =
              i -
              e.orig.getScrollerElement().getBoundingClientRect().top +
              e.orig.getScrollInfo().top,
            a = 0;
          a < e.chunks.length;
          a++
        ) {
          var s = e.chunks[a];
          s.editFrom <= n.to &&
            s.editTo >= n.from &&
            s.origFrom <= r.to &&
            s.origTo >= r.from &&
            k(e, s, l, o, t);
        }
      }
    }
    function m(e, t) {
      for (var n = 0, r = 0, i = 0; i < t.length; i++) {
        var o = t[i];
        if (o.editTo > e && o.editFrom <= e) return null;
        if (o.editFrom > e) break;
        ((n = o.editTo), (r = o.origTo));
      }
      return r + (e - n);
    }
    function y(e, t, n) {
      for (var r = e.state.trackAlignable, i = e.firstLine(), o = 0, l = [], a = 0; ; a++) {
        for (
          var s = t[a], u = s ? (n ? s.origFrom : s.editFrom) : 1e9;
          o < r.alignable.length;
          o += 2
        ) {
          var c = r.alignable[o] + 1;
          if (!(c <= i)) {
            if (!(c <= u)) break;
            l.push(c);
          }
        }
        if (!s) break;
        l.push((i = n ? s.origTo : s.editTo));
      }
      return l;
    }
    function b(e, t, n, r) {
      var i = 0,
        o = 0,
        l = 0,
        a = 0;
      e: for (; ; i++) {
        var s = e[i],
          u = t[o];
        if (!s && null == u) break;
        for (var c = s ? s[0] : 1e9, f = null == u ? 1e9 : u; l < n.length; ) {
          var d = n[l];
          if (d.origFrom <= f && d.origTo > f) {
            (o++, i--);
            continue e;
          }
          if (d.editTo > c) {
            if (d.editFrom <= c) continue e;
            break;
          }
          ((a += d.origTo - d.origFrom - (d.editTo - d.editFrom)), l++);
        }
        if (c == f - a) ((s[r] = f), o++);
        else if (c < f - a) s[r] = c + a;
        else {
          var h = [f - a, null, null];
          ((h[r] = f), e.splice(i, 0, h), o++);
        }
      }
    }
    function w(e, t) {
      var n = y(e.edit, e.chunks, !1),
        r = [];
      if (t)
        for (var i = 0, o = 0; i < t.chunks.length; i++) {
          for (var l = t.chunks[i].editTo; o < n.length && n[o] < l; ) o++;
          (o != n.length && n[o] == l) || n.splice(o++, 0, l);
        }
      for (i = 0; i < n.length; i++) r.push([n[i], null, null]);
      return (
        b(r, y(e.orig, e.chunks, !0), e.chunks, 1),
        t && b(r, y(t.orig, t.chunks, !0), t.chunks, 2),
        r
      );
    }
    function x(e, t) {
      if (e.dealigned || t) {
        if (!e.orig.curOp)
          return e.orig.operation(function () {
            x(e, t);
          });
        e.dealigned = !1;
        var n = e.mv.left == e ? e.mv.right : e.mv.left;
        n && (i(n), (n.dealigned = !1));
        for (var r = w(e, n), o = e.mv.aligners, l = 0; l < o.length; l++) o[l].clear();
        o.length = 0;
        var a = [e.edit, e.orig],
          s = [],
          u = [];
        for (n && a.push(n.orig), l = 0; l < a.length; l++)
          (s.push(a[l].getScrollInfo().top),
            u.push(-a[l].getScrollerElement().getBoundingClientRect().top));
        (u[0] != u[1] || (3 == a.length && u[1] != u[2])) && C(a, u, [0, 0, 0], o);
        for (var c = 0; c < r.length; c++) C(a, u, r[c], o);
        for (l = 0; l < a.length; l++) a[l].scrollTo(null, s[l]);
      }
    }
    function C(e, t, n, r) {
      for (var i = -1e8, o = [], l = 0; l < e.length; l++)
        if (null != n[l]) {
          var a = e[l].heightAtLine(n[l], "local") - t[l];
          ((o[l] = a), (i = Math.max(i, a)));
        }
      for (l = 0; l < e.length; l++)
        if (null != n[l]) {
          var s = i - o[l];
          s > 1 && r.push(S(e[l], n[l], s));
        }
    }
    function S(e, t, n) {
      var r = !0;
      t > e.lastLine() && (t--, (r = !1));
      var i = document.createElement("div");
      return (
        (i.className = "CodeMirror-merge-spacer"),
        (i.style.height = n + "px"),
        (i.style.minWidth = "1px"),
        e.addLineWidget(t, i, { height: n, above: r, mergeSpacer: !0, handleMouseEvents: !0 })
      );
    }
    function k(e, t, r, i, o) {
      var l = "left" == e.type,
        a = e.orig.heightAtLine(t.origFrom, "local", !0) - r;
      if (e.svg) {
        var s = a,
          u = e.edit.heightAtLine(t.editFrom, "local", !0) - i;
        if (l) {
          var c = s;
          ((s = u), (u = c));
        }
        var f = e.orig.heightAtLine(t.origTo, "local", !0) - r,
          d = e.edit.heightAtLine(t.editTo, "local", !0) - i;
        l && ((c = f), (f = d), (d = c));
        var h = " C " + o / 2 + " " + u + " " + o / 2 + " " + s + " " + (o + 2) + " " + s,
          p = " C " + o / 2 + " " + f + " " + o / 2 + " " + d + " -1 " + d;
        V(
          e.svg.appendChild(document.createElementNS(n, "path")),
          "d",
          "M -1 " + u + h + " L " + (o + 2) + " " + f + p + " z",
          "class",
          e.classes.connect
        );
      }
      if (e.copyButtons) {
        var g = e.copyButtons.appendChild(
            z("div", "left" == e.type ? "⇝" : "⇜", "CodeMirror-merge-copy")
          ),
          v = e.mv.options.allowEditingOriginals;
        if (
          ((g.title = e.edit.phrase(v ? "Push to left" : "Revert chunk")),
          (g.chunk = t),
          (g.style.top =
            (t.origTo > t.origFrom ? a : e.edit.heightAtLine(t.editFrom, "local") - i) + "px"),
          g.setAttribute("role", "button"),
          g.setAttribute("tabindex", "0"),
          g.setAttribute("aria-label", g.title),
          v)
        ) {
          var m = e.edit.heightAtLine(t.editFrom, "local") - i,
            y = e.copyButtons.appendChild(
              z("div", "right" == e.type ? "⇝" : "⇜", "CodeMirror-merge-copy-reverse")
            );
          ((y.title = "Push to right"),
            (y.chunk = {
              editFrom: t.origFrom,
              editTo: t.origTo,
              origFrom: t.editFrom,
              origTo: t.editTo,
            }),
            (y.style.top = m + "px"),
            "right" == e.type ? (y.style.left = "2px") : (y.style.right = "2px"),
            y.setAttribute("role", "button"),
            y.setAttribute("tabindex", "0"),
            y.setAttribute("aria-label", y.title));
        }
      }
    }
    function L(e, n, r, i) {
      if (!e.diffOutOfDate) {
        var o = i.origTo > r.lastLine() ? t(i.origFrom - 1) : t(i.origFrom, 0),
          l = t(i.origTo, 0),
          a = i.editTo > n.lastLine() ? t(i.editFrom - 1) : t(i.editFrom, 0),
          s = t(i.editTo, 0),
          u = e.mv.options.revertChunk;
        u ? u(e.mv, r, o, l, n, a, s) : n.replaceRange(r.getRange(o, l), a, s);
      }
    }
    var T,
      M = (e.MergeView = function (t, n) {
        if (!(this instanceof M)) return new M(t, n);
        this.options = n;
        var i = n.origLeft,
          o = null == n.origRight ? n.orig : n.origRight,
          l = null != i,
          a = null != o,
          s = 1 + (l ? 1 : 0) + (a ? 1 : 0),
          u = [],
          c = (this.left = null),
          f = (this.right = null),
          d = this;
        if (l) {
          c = this.left = new r(this, "left");
          var h = z("div", null, "CodeMirror-merge-pane CodeMirror-merge-left");
          (u.push(h), u.push(O(c)));
        }
        var p = z("div", null, "CodeMirror-merge-pane CodeMirror-merge-editor");
        if ((u.push(p), a)) {
          ((f = this.right = new r(this, "right")), u.push(O(f)));
          var g = z("div", null, "CodeMirror-merge-pane CodeMirror-merge-right");
          u.push(g);
        }
        (((a ? g : p).className += " CodeMirror-merge-pane-rightmost"),
          u.push(z("div", null, null, "height: 0; clear: both;")));
        var m = (this.wrap = t.appendChild(
          z("div", u, "CodeMirror-merge CodeMirror-merge-" + s + "pane")
        ));
        ((this.edit = e(p, G(n))),
          c && c.init(h, i, n),
          f && f.init(g, o, n),
          n.collapseIdentical &&
            this.editor().operation(function () {
              R(d, n.collapseIdentical);
            }),
          "align" == n.connect && ((this.aligners = []), x(this.left || this.right, !0)),
          c && c.registerEvents(f),
          f && f.registerEvents(c));
        var y = function () {
          (c && v(c), f && v(f));
        };
        e.on(window, "resize", y);
        var b = setInterval(function () {
          for (var t = m.parentNode; t && t != document.body; t = t.parentNode);
          t || (clearInterval(b), e.off(window, "resize", y));
        }, 5e3);
      });
    function O(t) {
      var r = (t.lockButton = z("div", null, "CodeMirror-merge-scrolllock"));
      (r.setAttribute("role", "button"), r.setAttribute("tabindex", "0"));
      var i = z("div", [r], "CodeMirror-merge-scrolllock-wrap");
      (e.on(r, "click", function () {
        c(t, !t.lockScroll);
      }),
        e.on(r, "keyup", function (e) {
          ("Enter" === e.key || "Space" === e.code) && c(t, !t.lockScroll);
        }));
      var o = [i];
      if (!1 !== t.mv.options.revertButtons) {
        t.copyButtons = z("div", null, "CodeMirror-merge-copybuttons-" + t.type);
        var l = function (e) {
          var n = e.target || e.srcElement;
          n.chunk &&
            ("CodeMirror-merge-copy-reverse" != n.className
              ? L(t, t.edit, t.orig, n.chunk)
              : L(t, t.orig, t.edit, n.chunk));
        };
        (e.on(t.copyButtons, "click", l),
          e.on(t.copyButtons, "keyup", function (e) {
            ("Enter" === e.key || "Space" === e.code) && l(e);
          }),
          o.unshift(t.copyButtons));
      }
      if ("align" != t.mv.options.connect) {
        var a = document.createElementNS && document.createElementNS(n, "svg");
        (a && !a.createSVGRect && (a = null), (t.svg = a), a && o.push(a));
      }
      return (t.gap = z("div", o, "CodeMirror-merge-gap"));
    }
    function N(e) {
      return "string" == typeof e ? e : e.getValue();
    }
    function A(e, t, n) {
      T || (T = new diff_match_patch());
      for (var r = T.diff_main(e, t), i = 0; i < r.length; ++i) {
        var o = r[i];
        (n ? /[^ \t]/.test(o[1]) : o[1])
          ? i && r[i - 1][0] == o[0] && (r.splice(i--, 1), (r[i][1] += o[1]))
          : r.splice(i--, 1);
      }
      return r;
    }
    function D(e) {
      var n = [];
      if (!e.length) return n;
      for (var r = 0, i = 0, o = t(0, 0), l = t(0, 0), a = 0; a < e.length; ++a) {
        var s = e[a],
          u = s[0];
        if (u == DIFF_EQUAL) {
          var c = !W(e, a) || o.line < r || l.line < i ? 1 : 0,
            f = o.line + c,
            d = l.line + c;
          U(o, s[1], null, l);
          var h = F(e, a) ? 1 : 0,
            p = o.line + h,
            g = l.line + h;
          p > f &&
            (a && n.push({ origFrom: i, origTo: d, editFrom: r, editTo: f }), (r = p), (i = g));
        } else U(u == DIFF_INSERT ? o : l, s[1]);
      }
      return (
        (r <= o.line || i <= l.line) &&
          n.push({ origFrom: i, origTo: l.line + 1, editFrom: r, editTo: o.line + 1 }),
        n
      );
    }
    function F(e, t) {
      if (t == e.length - 1) return !0;
      var n = e[t + 1][1];
      return (
        !((1 == n.length && t < e.length - 2) || 10 != n.charCodeAt(0)) &&
        (t == e.length - 2 ||
          (((n = e[t + 2][1]).length > 1 || t == e.length - 3) && 10 == n.charCodeAt(0)))
      );
    }
    function W(e, t) {
      if (0 == t) return !0;
      var n = e[t - 1][1];
      return (
        10 == n.charCodeAt(n.length - 1) &&
        (1 == t || 10 == (n = e[t - 2][1]).charCodeAt(n.length - 1))
      );
    }
    function E(e, t, n) {
      for (var r, i, o, l, a = 0; a < e.length; a++) {
        var s = e[a],
          u = n ? s.editFrom : s.origFrom,
          c = n ? s.editTo : s.origTo;
        (null == i &&
          (u > t
            ? ((i = s.editFrom), (l = s.origFrom))
            : c > t && ((i = s.editTo), (l = s.origTo))),
          c <= t
            ? ((r = s.editTo), (o = s.origTo))
            : u <= t && ((r = s.editFrom), (o = s.origFrom)));
      }
      return { edit: { before: r, after: i }, orig: { before: o, after: l } };
    }
    function H(n, r, i) {
      n.addLineClass(r, "wrap", "CodeMirror-merge-collapsed-line");
      var o = document.createElement("span");
      ((o.className = "CodeMirror-merge-collapsed-widget"),
        (o.title = n.phrase("Identical text collapsed. Click to expand.")));
      var l = n.markText(t(r, 0), t(i - 1), {
        inclusiveLeft: !0,
        inclusiveRight: !0,
        replacedWith: o,
        clearOnEnter: !0,
      });
      function a() {
        (l.clear(), n.removeLineClass(r, "wrap", "CodeMirror-merge-collapsed-line"));
      }
      return (
        l.explicitlyCleared && a(),
        e.on(o, "click", a),
        l.on("clear", a),
        e.on(o, "click", a),
        { mark: l, clear: a }
      );
    }
    function P(e, t) {
      var n = [];
      function r() {
        for (var e = 0; e < n.length; e++) n[e].clear();
      }
      for (var i = 0; i < t.length; i++) {
        var o = t[i],
          l = H(o.cm, o.line, o.line + e);
        (n.push(l), l.mark.on("clear", r));
      }
      return n[0].mark;
    }
    function I(e, t, n, r) {
      for (var i = 0; i < e.chunks.length; i++)
        for (var o = e.chunks[i], l = o.editFrom - t; l < o.editTo + t; l++) {
          var a = l + n;
          a >= 0 && a < r.length && (r[a] = !1);
        }
    }
    function R(e, t) {
      "number" != typeof t && (t = 2);
      for (var n = [], r = e.editor(), i = r.firstLine(), o = i, l = r.lastLine(); o <= l; o++)
        n.push(!0);
      (e.left && I(e.left, t, i, n), e.right && I(e.right, t, i, n));
      for (var a = 0; a < n.length; a++)
        if (n[a]) {
          for (var s = a + i, u = 1; a < n.length - 1 && n[a + 1]; a++, u++);
          if (u > t) {
            var c = [{ line: s, cm: r }];
            (e.left && c.push({ line: m(s, e.left.chunks), cm: e.left.orig }),
              e.right && c.push({ line: m(s, e.right.chunks), cm: e.right.orig }));
            var f = P(u, c);
            e.options.onCollapse && e.options.onCollapse(e, s, u, f);
          }
        }
    }
    function z(e, t, n, r) {
      var i = document.createElement(e);
      if ((n && (i.className = n), r && (i.style.cssText = r), "string" == typeof t))
        i.appendChild(document.createTextNode(t));
      else if (t) for (var o = 0; o < t.length; ++o) i.appendChild(t[o]);
      return i;
    }
    function B(e) {
      for (var t = e.childNodes.length; t > 0; --t) e.removeChild(e.firstChild);
    }
    function V(e) {
      for (var t = 1; t < arguments.length; t += 2) e.setAttribute(arguments[t], arguments[t + 1]);
    }
    function G(e, t) {
      for (var n in (t || (t = {}), e)) e.hasOwnProperty(n) && (t[n] = e[n]);
      return t;
    }
    function U(e, n, r, i) {
      for (var o = r ? t(e.line, e.ch) : e, l = 0; ; ) {
        var a = n.indexOf("\n", l);
        if (-1 == a) break;
        (++o.line, i && ++i.line, (l = a + 1));
      }
      return (
        (o.ch = (l ? 0 : o.ch) + (n.length - l)),
        i && (i.ch = (l ? 0 : i.ch) + (n.length - l)),
        o
      );
    }
    M.prototype = {
      constructor: M,
      editor: function () {
        return this.edit;
      },
      rightOriginal: function () {
        return this.right && this.right.orig;
      },
      leftOriginal: function () {
        return this.left && this.left.orig;
      },
      setShowDifferences: function (e) {
        (this.right && this.right.setShowDifferences(e),
          this.left && this.left.setShowDifferences(e));
      },
      rightChunks: function () {
        if (this.right) return (i(this.right), this.right.chunks);
      },
      leftChunks: function () {
        if (this.left) return (i(this.left), this.left.chunks);
      },
    };
    var _ = 1,
      j = 2,
      K = 4;
    function $(e) {
      ((this.cm = e), (this.alignable = []), (this.height = e.doc.height));
      var t = this;
      (e.on("markerAdded", function (e, n) {
        if (n.collapsed) {
          var r = n.find(1);
          null != r && t.set(r.line, K);
        }
      }),
        e.on("markerCleared", function (e, n, r, i) {
          null != i && n.collapsed && t.check(i, K, t.hasMarker);
        }),
        e.on("markerChanged", this.signal.bind(this)),
        e.on("lineWidgetAdded", function (e, n, r) {
          n.mergeSpacer || (n.above ? t.set(r - 1, j) : t.set(r, _));
        }),
        e.on("lineWidgetCleared", function (e, n, r) {
          n.mergeSpacer ||
            (n.above ? t.check(r - 1, j, t.hasWidgetBelow) : t.check(r, _, t.hasWidget));
        }),
        e.on("lineWidgetChanged", this.signal.bind(this)),
        e.on("change", function (e, n) {
          var r = n.from.line,
            i = n.to.line - n.from.line,
            o = n.text.length - 1,
            l = r + o;
          ((i || o) && t.map(r, i, o),
            t.check(l, K, t.hasMarker),
            (i || o) && t.check(n.from.line, K, t.hasMarker));
        }),
        e.on("viewportChange", function () {
          t.cm.doc.height != t.height && t.signal();
        }));
    }
    function X(e, t) {
      return (e.line - t.line || e.ch - t.ch) < 0 ? e : t;
    }
    function Y(e, t) {
      return (e.line - t.line || e.ch - t.ch) > 0 ? e : t;
    }
    function q(e, t) {
      return e.line == t.line && e.ch == t.ch;
    }
    function Z(e, t, n) {
      for (var r = e.length - 1; r >= 0; r--) {
        var i = e[r],
          o = (n ? i.origTo : i.editTo) - 1;
        if (o < t) return o;
      }
    }
    function Q(e, t, n) {
      for (var r = 0; r < e.length; r++) {
        var i = e[r],
          o = n ? i.origFrom : i.editFrom;
        if (o > t) return o;
      }
    }
    function J(t, n) {
      var r = null,
        o = t.state.diffViews,
        l = t.getCursor().line;
      if (o)
        for (var a = 0; a < o.length; a++) {
          var s = o[a],
            u = t == s.orig;
          i(s);
          var c = n < 0 ? Z(s.chunks, l, u) : Q(s.chunks, l, u);
          null == c || (null != r && !(n < 0 ? c > r : c < r)) || (r = c);
        }
      if (null == r) return e.Pass;
      t.setCursor(r, 0);
    }
    (($.prototype = {
      signal: function () {
        (e.signal(this, "realign"), (this.height = this.cm.doc.height));
      },
      set: function (e, t) {
        for (var n = -1; n < this.alignable.length; n += 2) {
          var r = this.alignable[n] - e;
          if (0 == r) {
            if ((this.alignable[n + 1] & t) == t) return;
            return ((this.alignable[n + 1] |= t), void this.signal());
          }
          if (r > 0) break;
        }
        (this.signal(), this.alignable.splice(n, 0, e, t));
      },
      find: function (e) {
        for (var t = 0; t < this.alignable.length; t += 2) if (this.alignable[t] == e) return t;
        return -1;
      },
      check: function (e, t, n) {
        var r = this.find(e);
        if (-1 != r && this.alignable[r + 1] & t && !n.call(this, e)) {
          this.signal();
          var i = this.alignable[r + 1] & ~t;
          i ? (this.alignable[r + 1] = i) : this.alignable.splice(r, 2);
        }
      },
      hasMarker: function (e) {
        var t = this.cm.getLineHandle(e);
        if (t.markedSpans)
          for (var n = 0; n < t.markedSpans.length; n++)
            if (t.markedSpans[n].marker.collapsed && null != t.markedSpans[n].to) return !0;
        return !1;
      },
      hasWidget: function (e) {
        var t = this.cm.getLineHandle(e);
        if (t.widgets)
          for (var n = 0; n < t.widgets.length; n++)
            if (!t.widgets[n].above && !t.widgets[n].mergeSpacer) return !0;
        return !1;
      },
      hasWidgetBelow: function (e) {
        if (e == this.cm.lastLine()) return !1;
        var t = this.cm.getLineHandle(e + 1);
        if (t.widgets)
          for (var n = 0; n < t.widgets.length; n++)
            if (t.widgets[n].above && !t.widgets[n].mergeSpacer) return !0;
        return !1;
      },
      map: function (e, t, n) {
        for (var r = n - t, i = e + t, o = -1, l = -1, a = 0; a < this.alignable.length; a += 2) {
          var s = this.alignable[a];
          (s == e && this.alignable[a + 1] & j && (o = a),
            s == i && this.alignable[a + 1] & j && (l = a),
            s <= e || (s < i ? this.alignable.splice(a--, 2) : (this.alignable[a] += r)));
        }
        if (o > -1) {
          var u = this.alignable[o + 1];
          u == j ? this.alignable.splice(o, 2) : (this.alignable[o + 1] = u & ~j);
        }
        l > -1 && n && this.set(e + n, j);
      },
    }),
      (e.commands.goNextDiff = function (e) {
        return J(e, 1);
      }),
      (e.commands.goPrevDiff = function (e) {
        return J(e, -1);
      }));
  })(k()));
var D;
(D ||
  ((D = 1),
  (function (e) {
    function t(e, t) {
      if (!e.hasOwnProperty(t)) throw new Error("Undefined state " + t + " in simple mode");
    }
    function n(e, t) {
      if (!e) return /(?:)/;
      var n = "";
      return (
        e instanceof RegExp
          ? (e.ignoreCase && (n = "i"), e.unicode && (n += "u"), (e = e.source))
          : (e = String(e)),
        new RegExp((!1 === t ? "" : "^") + "(?:" + e + ")", n)
      );
    }
    function r(e) {
      if (!e) return null;
      if (e.apply) return e;
      if ("string" == typeof e) return e.replace(/\./g, " ");
      for (var t = [], n = 0; n < e.length; n++) t.push(e[n] && e[n].replace(/\./g, " "));
      return t;
    }
    function i(e, i) {
      ((e.next || e.push) && t(i, e.next || e.push),
        (this.regex = n(e.regex)),
        (this.token = r(e.token)),
        (this.data = e));
    }
    function o(e, t) {
      return function (n, r) {
        if (r.pending) {
          var i = r.pending.shift();
          return (0 == r.pending.length && (r.pending = null), (n.pos += i.text.length), i.token);
        }
        if (r.local) {
          if (r.local.end && n.match(r.local.end)) {
            var o = r.local.endToken || null;
            return ((r.local = r.localState = null), o);
          }
          var l;
          return (
            (o = r.local.mode.token(n, r.localState)),
            r.local.endScan &&
              (l = r.local.endScan.exec(n.current())) &&
              (n.pos = n.start + l.index),
            o
          );
        }
        for (var s = e[r.state], u = 0; u < s.length; u++) {
          var c = s[u],
            f = (!c.data.sol || n.sol()) && n.match(c.regex);
          if (f) {
            (c.data.next
              ? (r.state = c.data.next)
              : c.data.push
                ? ((r.stack || (r.stack = [])).push(r.state), (r.state = c.data.push))
                : c.data.pop && r.stack && r.stack.length && (r.state = r.stack.pop()),
              c.data.mode && a(t, r, c.data.mode, c.token),
              c.data.indent && r.indent.push(n.indentation() + t.indentUnit),
              c.data.dedent && r.indent.pop());
            var d = c.token;
            if (
              (d && d.apply && (d = d(f)), f.length > 2 && c.token && "string" != typeof c.token)
            ) {
              for (var h = 2; h < f.length; h++)
                f[h] && (r.pending || (r.pending = [])).push({ text: f[h], token: c.token[h - 1] });
              return (n.backUp(f[0].length - (f[1] ? f[1].length : 0)), d[0]);
            }
            return d && d.join ? d[0] : d;
          }
        }
        return (n.next(), null);
      };
    }
    function l(e, t) {
      if (e === t) return !0;
      if (!e || "object" != typeof e || !t || "object" != typeof t) return !1;
      var n = 0;
      for (var r in e)
        if (e.hasOwnProperty(r)) {
          if (!t.hasOwnProperty(r) || !l(e[r], t[r])) return !1;
          n++;
        }
      for (var r in t) t.hasOwnProperty(r) && n--;
      return 0 == n;
    }
    function a(t, r, i, o) {
      var a;
      if (i.persistent)
        for (var s = r.persistentStates; s && !a; s = s.next)
          (i.spec ? l(i.spec, s.spec) : i.mode == s.mode) && (a = s);
      var u = a ? a.mode : i.mode || e.getMode(t, i.spec),
        c = a ? a.state : e.startState(u);
      (i.persistent &&
        !a &&
        (r.persistentStates = { mode: u, spec: i.spec, state: c, next: r.persistentStates }),
        (r.localState = c),
        (r.local = {
          mode: u,
          end: i.end && n(i.end),
          endScan: i.end && !1 !== i.forceEnd && n(i.end, !1),
          endToken: o && o.join ? o[o.length - 1] : o,
        }));
    }
    function s(e, t) {
      for (var n = 0; n < t.length; n++) if (t[n] === e) return !0;
    }
    function u(t, n) {
      return function (r, i, o) {
        if (r.local && r.local.mode.indent) return r.local.mode.indent(r.localState, i, o);
        if (
          null == r.indent ||
          r.local ||
          (n.dontIndentStates && s(r.state, n.dontIndentStates) > -1)
        )
          return e.Pass;
        var l = r.indent.length - 1,
          a = t[r.state];
        e: for (;;) {
          for (var u = 0; u < a.length; u++) {
            var c = a[u];
            if (c.data.dedent && !1 !== c.data.dedentIfLineStart) {
              var f = c.regex.exec(i);
              if (f && f[0]) {
                (l--, (c.next || c.push) && (a = t[c.next || c.push]), (i = i.slice(f[0].length)));
                continue e;
              }
            }
          }
          break;
        }
        return l < 0 ? 0 : r.indent[l];
      };
    }
    ((e.defineSimpleMode = function (t, n) {
      e.defineMode(t, function (t) {
        return e.simpleMode(t, n);
      });
    }),
      (e.simpleMode = function (n, r) {
        t(r, "start");
        var l = {},
          a = r.meta || {},
          s = !1;
        for (var c in r)
          if (c != a && r.hasOwnProperty(c))
            for (var f = (l[c] = []), d = r[c], h = 0; h < d.length; h++) {
              var p = d[h];
              (f.push(new i(p, r)), (p.indent || p.dedent) && (s = !0));
            }
        var g = {
          startState: function () {
            return {
              state: "start",
              pending: null,
              local: null,
              localState: null,
              indent: s ? [] : null,
            };
          },
          copyState: function (t) {
            var n = {
              state: t.state,
              pending: t.pending,
              local: t.local,
              localState: null,
              indent: t.indent && t.indent.slice(0),
            };
            (t.localState && (n.localState = e.copyState(t.local.mode, t.localState)),
              t.stack && (n.stack = t.stack.slice(0)));
            for (var r = t.persistentStates; r; r = r.next)
              n.persistentStates = {
                mode: r.mode,
                spec: r.spec,
                state: r.state == t.localState ? n.localState : e.copyState(r.mode, r.state),
                next: n.persistentStates,
              };
            return n;
          },
          token: o(l, n),
          innerMode: function (e) {
            return e.local && { mode: e.local.mode, state: e.localState };
          },
          indent: u(l, a),
        };
        if (a) for (var v in a) a.hasOwnProperty(v) && (g[v] = a[v]);
        return g;
      }));
  })(k())),
  !window.CodeMirror && (window.CodeMirror = N));
const F = window.CodeMirror || N,
  W = n({
    name: "DefaultMode",
    props: {
      name: { type: String, default: "cm-textarea-" + +new Date() },
      value: { type: String, default: "" },
      content: { type: String, default: "" },
      options: { type: Object, default: () => ({}) },
      cminstance: { type: Object, default: () => null },
      placeholder: { type: String, default: "" },
    },
    emits: { ready: (e) => e, "update:cminstance": (e) => e },
    setup(e, { emit: t }) {
      const n = r(),
        o = r(null),
        l = () => {
          ((o.value = b(F.fromTextArea(n.value, e.options))), t("update:cminstance", o.value));
          const r = i(
            () => e.cminstance,
            (n) => {
              var i;
              (n && (null == (i = e.cminstance) || i.setValue(e.value || e.content)),
                t("ready", c(o)),
                null == r || r());
            },
            { deep: !0 }
          );
        };
      return (
        y(() => {
          l();
        }),
        { textarea: n, initialize: l }
      );
    },
  }),
  E = (e, t) => {
    const n = e.__vccOpts || e;
    for (const [r, i] of t) n[r] = i;
    return n;
  },
  H = ["name", "placeholder"];
const P = E(W, [
  [
    "render",
    function (e, t, n, r, i, o) {
      return (
        l(),
        a(
          "textarea",
          { ref: "textarea", name: e.$props.name, placeholder: e.$props.placeholder },
          null,
          8,
          H
        )
      );
    },
  ],
]);
((window.diff_match_patch = t),
  (window.DIFF_DELETE = -1),
  (window.DIFF_INSERT = 1),
  (window.DIFF_EQUAL = 0));
const I = n({
    name: "MergeMode",
    props: {
      options: { type: Object, default: () => ({}) },
      cminstance: { type: Object, default: () => ({}) },
    },
    emits: ["update:cminstance", "ready"],
    setup(e, { emit: t }) {
      const n = r(),
        i = r(),
        o = () => {
          ((n.value = b(F.MergeView(i.value, e.options))),
            t("update:cminstance", n.value),
            t("ready", n));
        };
      return (
        y(() => {
          o();
        }),
        { mergeView: i, initialize: o }
      );
    },
  }),
  R = { ref: "mergeView" };
const z = E(I, [
  [
    "render",
    function (e, t, n, r, i, o) {
      return (l(), a("div", R, null, 512));
    },
  ],
]);
const B = [
  {
    regex: /(\[.*?\])([ \t]*)(<error>[ \t])(.+)/,
    token: ["tag", "", "error.strong", "error.strong"],
    sol: !0,
  },
  {
    regex: /(\[.*?\])([ \t]*)(<info>)(.+)(.?)/,
    token: ["tag", "", "bracket", "bracket", "hr"],
    sol: !0,
  },
  {
    regex: /(\[.*?\])([ \t]*)(<warning>)(.+)(.?)/,
    token: ["tag", "", "comment", "comment", "hr"],
    sol: !0,
  },
];
(F.defineSimpleMode("fclog", {
  start: [...B, { regex: /.*/, token: "hr" }],
  error: [...B, { regex: /.*/, token: "error.strong" }],
  info: [...B, { regex: /.*/, token: "bracket" }],
  warning: [...B, { regex: /.*\[/, token: "comment" }],
}),
  F.defineSimpleMode("log", {
    start: [
      { regex: /^[=]+[^=]*[=]+/, token: "strong" },
      { regex: /([^\w])([A-Z][\w]*)/, token: ["", "string"] },
      { regex: /(^[A-Z][\w]*)/, token: "string" },
    ],
  }));
const V = n({
    name: "CodemirrorFclog",
    props: {
      value: { type: String, default: "" },
      name: { type: String, default: "cm-textarea-" + +new Date() },
      options: { type: Object, default: () => ({}) },
      cminstance: { type: Object, default: () => ({}) },
      placeholder: { type: String, default: "" },
    },
    emits: ["update:cminstance", "ready"],
    setup(e, { emit: t }) {
      const n = r(),
        o = r(null),
        l = (t = e.cminstance) => {
          t.getAllMarks().forEach((e) => e.clear());
          const n = t.getValue(),
            r = []
              .concat(
                (function (e) {
                  const t = /#link#(.+)#link#/g,
                    n = [];
                  let r;
                  for (r = t.exec(e); r; ) {
                    const i = document.createElement("a"),
                      o = JSON.parse(r[1]),
                      l = Object.entries(o);
                    for (const [e, t] of l) i.setAttribute(e, t);
                    ((i.className = "editor_custom_link"),
                      (i.innerHTML = "logDownload"),
                      n.push({ start: r.index, end: r.index + r[0].length, node: i }),
                      (r = t.exec(e)));
                  }
                  return n;
                })(n)
              )
              .concat(
                (function (e) {
                  const t = [];
                  return (
                    (function () {
                      const n = /#log<(\w*)>log#((.|\r\n|\n)*?)#log<(\w*)>log#/g;
                      let r;
                      for (r = n.exec(e); r; ) {
                        const i = r[0].replace(/\r\n/g, "\n").split("\n"),
                          o = r[2].replace(/\r\n/g, "\n").split("\n"),
                          l = document.createElement("span"),
                          a = r[1];
                        l.className = `c-editor--log__${a}`;
                        let s = 0;
                        for (let e = 0; e < i.length; e++) {
                          const n = i[e],
                            a = o[e],
                            u = l.cloneNode(!1);
                          ((u.innerText = a),
                            t.push({ start: r.index + s, end: r.index + s + n.length, node: u }),
                            (s = s + n.length + 1));
                        }
                        r = n.exec(e);
                      }
                    })(),
                    t
                  );
                })(n)
              );
          for (let e = 0; e < r.length; e++) {
            const n = r[e];
            t.markText(t.posFromIndex(n.start), t.posFromIndex(n.end), { replacedWith: n.node });
          }
        },
        a = () => {
          var r;
          ((o.value = b(F.fromTextArea(n.value, e.options))),
            t("update:cminstance", c(o)),
            null == (r = o.value) || r.on("change", l));
        };
      return (
        i(
          () => e.cminstance,
          (n) => {
            var r;
            n &&
              (l(e.cminstance), null == (r = e.cminstance) || r.setValue(e.value), t("ready", o));
          },
          { deep: !0, immediate: !0 }
        ),
        y(() => {
          a();
        }),
        { initialize: a, textarea: n }
      );
    },
  }),
  G = ["name", "placeholder"];
const U = E(V, [
    [
      "render",
      function (e, t, n, r, i, o) {
        return (
          l(),
          a(
            "textarea",
            { ref: "textarea", name: e.$props.name, placeholder: e.$props.placeholder },
            null,
            8,
            G
          )
        );
      },
    ],
  ]),
  _ = {
    "update:value": () => !0,
    change: (e, t) => ({ value: e, cm: t }),
    input: () => !0,
    ready: (e) => e,
  },
  j = [
    "changes",
    "scroll",
    "beforeChange",
    "cursorActivity",
    "keyHandled",
    "inputRead",
    "electricInput",
    "beforeSelectionChange",
    "viewportChange",
    "swapDoc",
    "gutterClick",
    "gutterContextMenu",
    "focus",
    "blur",
    "refresh",
    "optionChange",
    "scrollCursorIntoView",
    "update",
  ],
  K = {
    ..._,
    ...(() => {
      const e = {};
      return (
        j.forEach((t) => {
          e[t] = (...e) => e;
        }),
        e
      );
    })(),
  },
  $ = {
    mode: "text",
    // Language mode
    theme: "default",
    // Theme
    lineNumbers: !0,
    // Display line number
    smartIndent: !0,
    // Intelligent indentation
    indentUnit: 2,
    // Indentation unit
    styleActiveLine: !0,
  };
const X = ({ props: e, cminstance: t, emit: n, internalInstance: r, content: i }) => {
  const o = m(() => {
    var n;
    return e.merge ? (null == (n = c(t)) ? void 0 : n.editor()) : c(t);
  });
  return {
    listenerEvents: () => {
      o.value.on("change", (t) => {
        const r = t.getValue();
        (r === i.value && "" !== r) ||
          ((i.value = r),
          n("update:value", i.value || ""),
          n("input", i.value || " "),
          Promise.resolve().then(() => {
            n("change", i.value, t);
          }),
          e.keepCursorInEnd &&
            (function (e) {
              Promise.resolve().then(() => {
                const t = e.getScrollInfo();
                e.scrollTo(t.left, t.height);
              });
            })(t));
      });
      const t = {};
      (() => {
        const e = [];
        return (
          Object.keys(null == r ? void 0 : r.vnode.props).forEach((t) => {
            if (t.startsWith("on")) {
              const n = t.replace(t[2], t[2].toLowerCase()).slice(2);
              !_[n] && e.push(n);
            }
          }),
          e
        );
      })()
        .filter((e) => !t[e] && (t[e] = !0))
        .forEach((e) => {
          o.value.on(e, (...t) => {
            n(e, ...t);
          });
        });
    },
  };
};
const Y = n({
    __name: "index",
    props: {
      value: { type: String, default: "" },
      options: { type: Object, default: () => $ },
      globalOptions: { type: Object, default: () => $ },
      placeholder: { type: String, default: "" },
      border: { type: Boolean, default: !1 },
      width: { type: [String, Number], default: null },
      height: { type: [String, Number], default: null },
      originalStyle: { type: Boolean, default: !1 },
      keepCursorInEnd: { type: Boolean, default: !1 },
      merge: { type: Boolean, default: !1 },
      name: { type: String, default: "" },
      marker: { type: Function, default: () => null },
      unseenLines: { type: Array, default: () => [] },
    },
    emits: K,
    setup(e, { expose: t, emit: n }) {
      var y, b, w;
      "function" != typeof Object.assign &&
        Object.defineProperty(Object, "assign", {
          value(e) {
            if (null == e) throw new TypeError("Cannot convert undefined or null to object");
            const t = Object(e);
            for (let n = 1; n < arguments.length; n++) {
              const e = arguments[n];
              if (null != e)
                for (const n in e) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
            }
            return t;
          },
          writable: !0,
          configurable: !0,
        });
      const x = e,
        C = n,
        S = r(null),
        k = r(""),
        L = p(P),
        T = r({
          foldGutter: !0,
          ...$,
          ...x.globalOptions,
          ...x.options,
          gutters: [
            ...new Set([
              "CodeMirror-linenumbers",
              "CodeMirror-foldgutter",
              ...((null == (y = x.options) ? void 0 : y.gutters) || []),
            ]),
          ],
        }),
        M = g(),
        O =
          x.name ||
          (null == (w = null == (b = null == M ? void 0 : M.parent) ? void 0 : b.type)
            ? void 0
            : w.name) ||
          void 0,
        N = r(null),
        A = m(() => {
          var e;
          return x.merge ? (null == (e = c(S)) ? void 0 : e.editor()) : c(S);
        }),
        {
          refresh: D,
          resize: F,
          destroy: W,
          containerHeight: E,
          containerWidth: H,
          reviseStyle: I,
        } = (function ({ props: e, cminstance: t, presetRef: n }) {
          const i = r("100%"),
            o = r("100%"),
            l = m(() => {
              var n;
              return e.merge ? (null == (n = c(t)) ? void 0 : n.editor()) : c(t);
            }),
            a = () => {
              v(() => {
                var e;
                null == (e = l.value) || e.refresh();
              });
            },
            s = (e) => !(!e || (e && isNaN(+e))),
            u = () => {
              var e;
              const t = null == (e = l.value) ? void 0 : e.getWrapperElement();
              null == t || t.remove();
            },
            f = () => {
              const e = document.querySelector(".CodeMirror-gutters");
              return "0" !== (null == e ? void 0 : e.style.left.replace("px", ""));
            };
          return {
            reload: () => {
              var e, t, r;
              const i = null == (e = l.value) ? void 0 : e.getDoc().getHistory();
              (null == (t = n.value) || t.initialize(),
                u(),
                null == (r = l.value) || r.getDoc().setHistory(i));
            },
            refresh: a,
            resize: (t = e.width, n = e.height) => {
              var r;
              let a = "100%",
                u = "100%";
              (s(t) ? (a = `${String(t)}px`) : t && (a = t),
                s(n) ? (u = `${String(n)}px`) : n && (u = n),
                (i.value = a),
                (o.value = u),
                null == (r = l.value) || r.setSize("100%", "100%"));
            },
            destroy: u,
            containerWidth: i,
            containerHeight: o,
            reviseStyle: () => {
              if ((a(), !f())) return;
              const e = setInterval(() => {
                  f() ? a() : clearInterval(e);
                }, 60),
                t = setTimeout(() => {
                  (clearInterval(e), clearTimeout(t));
                }, 400);
            },
          };
        })({ props: x, cminstance: S, presetRef: N }),
        { listenerEvents: R } = X({
          props: x,
          cminstance: S,
          emit: C,
          internalInstance: M,
          content: k,
        }),
        B = () => {
          void 0 !== x.unseenLines &&
            void 0 !== x.marker &&
            x.unseenLines.forEach((e) => {
              var t, n;
              const r = null == (t = S.value) ? void 0 : t.lineInfo(e);
              null == (n = S.value) ||
                n.setGutterMarker(
                  e,
                  "breakpoints",
                  null != r && r.gutterMarkers ? null : x.marker()
                );
            });
        },
        V = () => {
          (R(),
            B(),
            F(x.width, x.height),
            C("ready", S.value),
            i(
              [() => x.width, () => x.height],
              ([e, t]) => {
                F(e, t);
              },
              { deep: !0 }
            ));
        };
      return (
        i(
          () => x.options,
          (e) => {
            var t;
            for (const n in x.options) null == (t = A.value) || t.setOption(n, c(e[n]));
          },
          { deep: !0 }
        ),
        i(
          () => x.value,
          (e) => {
            ((e) => {
              var t, n;
              (e !== (null == (t = S.value) ? void 0 : t.getValue()) &&
                (null == (n = S.value) || n.setValue(e), (k.value = e), I()),
                B());
            })(e);
          }
        ),
        i(
          () => x.merge,
          () => {
            "fclog" !== x.options.mode && "log" !== x.options.mode
              ? x.merge
                ? (L.value = z)
                : (L.value = P)
              : (L.value = U);
          },
          { immediate: !0 }
        ),
        o(() => {
          W();
        }),
        t({ cminstance: S, resize: F, refresh: D, destroy: W }),
        (e, t) => (
          l(),
          a(
            "div",
            {
              class: h([
                "codemirror-container",
                {
                  merge: e.$props.merge,
                  bordered: e.$props.border || (e.$props.merge && !x.originalStyle),
                  "original-style": x.originalStyle,
                },
              ]),
              style: d({ height: c(E), width: c(H) }),
            },
            [
              (l(),
              s(
                f(L.value),
                u(
                  {
                    ref_key: "presetRef",
                    ref: N,
                    cminstance: S.value,
                    "onUpdate:cminstance": t[0] || (t[0] = (e) => (S.value = e)),
                    style: { height: "100%" },
                  },
                  { ...e.$props, ...e.$attrs, options: T.value, name: c(O), content: k.value },
                  { onReady: V }
                ),
                null,
                16,
                ["cminstance"]
              )),
            ],
            6
          )
        )
      );
    },
  }),
  q = (e, t) => (
    t && t.options && (Y.props.globalOptions.default = () => t.options),
    e.component((null == t ? void 0 : t.componentName) || "Codemirror", Y),
    e
  );
!(function (e, t) {
  void 0 === t && (t = {});
  var n = t.insertAt;
  if ("undefined" != typeof document) {
    var r = document.head || document.getElementsByTagName("head")[0],
      i = document.createElement("style");
    ((i.type = "text/css"),
      "top" === n && r.firstChild ? r.insertBefore(i, r.firstChild) : r.appendChild(i),
      i.styleSheet ? (i.styleSheet.cssText = e) : i.appendChild(document.createTextNode(e)));
  }
})(
  ".codemirror-container {\n  position: relative;\n  display: inline-block;\n  height: 100%;\n  width: fit-content;\n  font-size: 13px;\n  overflow: hidden;\n}\n.codemirror-container.bordered {\n  border: 1px solid #aaaaaa;\n}\n\n.codemirror-container .editor_custom_link {\n  cursor: pointer;\n  color: #1474f1;\n  text-decoration: underline;\n}\n.codemirror-container .editor_custom_link:hover {\n  color: #04b4fa;\n}\n.codemirror-container:not(.original-style) .CodeMirror-lines .CodeMirror-placeholder.CodeMirror-line-like {\n  color: #666;\n}\n.codemirror-container:not(.original-style) .CodeMirror,\n.codemirror-container:not(.original-style) .CodeMirror-merge-pane {\n  height: 100%;\n  font-family: consolas !important;\n}\n.codemirror-container:not(.original-style) .CodeMirror-merge,\n.codemirror-container:not(.original-style) .CodeMirror-merge-right .CodeMirror {\n  height: 100%;\n  border: none !important;\n}\n.codemirror-container:not(.original-style) .c-editor--log__error {\n  color: #bb0606;\n  font-weight: bold;\n}\n.codemirror-container:not(.original-style) .c-editor--log__info {\n  color: #333333;\n  font-weight: bold;\n}\n.codemirror-container:not(.original-style) .c-editor--log__warning {\n  color: #ee9900;\n}\n.codemirror-container:not(.original-style) .c-editor--log__success {\n  color: #669600;\n}\n.codemirror-container:not(.original-style) .cm-header,\n.codemirror-container:not(.original-style) .cm-strong {\n  font-weight: bold;\n}\n"
);
export { q as W };
