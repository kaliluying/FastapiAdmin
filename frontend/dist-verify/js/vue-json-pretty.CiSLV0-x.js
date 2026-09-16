import {
  bs as e,
  br as t,
  al as n,
  ai as r,
  a1 as o,
  z as a,
  w as i,
  v as c,
  j as l,
  F as u,
} from "./vue-vendor.Dwx3gfQr.js";
var s = {
    207: (e, t, n) => {
      e.exports = n(452);
    },
    452: (e) => {
      var t = (function (e) {
        var t,
          n = Object.prototype,
          r = n.hasOwnProperty,
          o = "function" == typeof Symbol ? Symbol : {},
          a = o.iterator || "@@iterator",
          i = o.asyncIterator || "@@asyncIterator",
          c = o.toStringTag || "@@toStringTag";
        function l(e, t, n) {
          return (
            Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            }),
            e[t]
          );
        }
        try {
          l({}, "");
        } catch (E) {
          l = function (e, t, n) {
            return (e[t] = n);
          };
        }
        function u(e, t, n, r) {
          var o = t && t.prototype instanceof y ? t : y,
            a = Object.create(o.prototype),
            i = new V(r || []);
          return (
            (a._invoke = (function (e, t, n) {
              var r = d;
              return function (o, a) {
                if (r === f) throw new Error("Generator is already running");
                if (r === p) {
                  if ("throw" === o) throw a;
                  return P();
                }
                for (n.method = o, n.arg = a; ; ) {
                  var i = n.delegate;
                  if (i) {
                    var c = j(i, n);
                    if (c) {
                      if (c === v) continue;
                      return c;
                    }
                  }
                  if ("next" === n.method) n.sent = n._sent = n.arg;
                  else if ("throw" === n.method) {
                    if (r === d) throw ((r = p), n.arg);
                    n.dispatchException(n.arg);
                  } else "return" === n.method && n.abrupt("return", n.arg);
                  r = f;
                  var l = s(e, t, n);
                  if ("normal" === l.type) {
                    if (((r = n.done ? p : h), l.arg === v)) continue;
                    return { value: l.arg, done: n.done };
                  }
                  "throw" === l.type && ((r = p), (n.method = "throw"), (n.arg = l.arg));
                }
              };
            })(e, n, i)),
            a
          );
        }
        function s(e, t, n) {
          try {
            return { type: "normal", arg: e.call(t, n) };
          } catch (r) {
            return { type: "throw", arg: r };
          }
        }
        e.wrap = u;
        var d = "suspendedStart",
          h = "suspendedYield",
          f = "executing",
          p = "completed",
          v = {};
        function y() {}
        function g() {}
        function m() {}
        var b = {};
        l(b, a, function () {
          return this;
        });
        var w = Object.getPrototypeOf,
          N = w && w(w(L([])));
        N && N !== n && r.call(N, a) && (b = N);
        var k = (m.prototype = y.prototype = Object.create(b));
        function C(e) {
          ["next", "throw", "return"].forEach(function (t) {
            l(e, t, function (e) {
              return this._invoke(t, e);
            });
          });
        }
        function x(e, t) {
          function n(o, a, i, c) {
            var l = s(e[o], e, a);
            if ("throw" !== l.type) {
              var u = l.arg,
                d = u.value;
              return d && "object" == typeof d && r.call(d, "__await")
                ? t.resolve(d.__await).then(
                    function (e) {
                      n("next", e, i, c);
                    },
                    function (e) {
                      n("throw", e, i, c);
                    }
                  )
                : t.resolve(d).then(
                    function (e) {
                      ((u.value = e), i(u));
                    },
                    function (e) {
                      return n("throw", e, i, c);
                    }
                  );
            }
            c(l.arg);
          }
          var o;
          this._invoke = function (e, r) {
            function a() {
              return new t(function (t, o) {
                n(e, r, t, o);
              });
            }
            return (o = o ? o.then(a, a) : a());
          };
        }
        function j(e, n) {
          var r = e.iterator[n.method];
          if (r === t) {
            if (((n.delegate = null), "throw" === n.method)) {
              if (
                e.iterator.return &&
                ((n.method = "return"), (n.arg = t), j(e, n), "throw" === n.method)
              )
                return v;
              ((n.method = "throw"),
                (n.arg = new TypeError("The iterator does not provide a 'throw' method")));
            }
            return v;
          }
          var o = s(r, e.iterator, n.arg);
          if ("throw" === o.type)
            return ((n.method = "throw"), (n.arg = o.arg), (n.delegate = null), v);
          var a = o.arg;
          return a
            ? a.done
              ? ((n[e.resultName] = a.value),
                (n.next = e.nextLoc),
                "return" !== n.method && ((n.method = "next"), (n.arg = t)),
                (n.delegate = null),
                v)
              : a
            : ((n.method = "throw"),
              (n.arg = new TypeError("iterator result is not an object")),
              (n.delegate = null),
              v);
        }
        function S(e) {
          var t = { tryLoc: e[0] };
          (1 in e && (t.catchLoc = e[1]),
            2 in e && ((t.finallyLoc = e[2]), (t.afterLoc = e[3])),
            this.tryEntries.push(t));
        }
        function O(e) {
          var t = e.completion || {};
          ((t.type = "normal"), delete t.arg, (e.completion = t));
        }
        function V(e) {
          ((this.tryEntries = [{ tryLoc: "root" }]), e.forEach(S, this), this.reset(!0));
        }
        function L(e) {
          if (e) {
            var n = e[a];
            if (n) return n.call(e);
            if ("function" == typeof e.next) return e;
            if (!isNaN(e.length)) {
              var o = -1,
                i = function n() {
                  for (; ++o < e.length; )
                    if (r.call(e, o)) return ((n.value = e[o]), (n.done = !1), n);
                  return ((n.value = t), (n.done = !0), n);
                };
              return (i.next = i);
            }
          }
          return { next: P };
        }
        function P() {
          return { value: t, done: !0 };
        }
        return (
          (g.prototype = m),
          l(k, "constructor", m),
          l(m, "constructor", g),
          (g.displayName = l(m, c, "GeneratorFunction")),
          (e.isGeneratorFunction = function (e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === g || "GeneratorFunction" === (t.displayName || t.name));
          }),
          (e.mark = function (e) {
            return (
              Object.setPrototypeOf
                ? Object.setPrototypeOf(e, m)
                : ((e.__proto__ = m), l(e, c, "GeneratorFunction")),
              (e.prototype = Object.create(k)),
              e
            );
          }),
          (e.awrap = function (e) {
            return { __await: e };
          }),
          C(x.prototype),
          l(x.prototype, i, function () {
            return this;
          }),
          (e.AsyncIterator = x),
          (e.async = function (t, n, r, o, a) {
            void 0 === a && (a = Promise);
            var i = new x(u(t, n, r, o), a);
            return e.isGeneratorFunction(n)
              ? i
              : i.next().then(function (e) {
                  return e.done ? e.value : i.next();
                });
          }),
          C(k),
          l(k, c, "Generator"),
          l(k, a, function () {
            return this;
          }),
          l(k, "toString", function () {
            return "[object Generator]";
          }),
          (e.keys = function (e) {
            var t = [];
            for (var n in e) t.push(n);
            return (
              t.reverse(),
              function n() {
                for (; t.length; ) {
                  var r = t.pop();
                  if (r in e) return ((n.value = r), (n.done = !1), n);
                }
                return ((n.done = !0), n);
              }
            );
          }),
          (e.values = L),
          (V.prototype = {
            constructor: V,
            reset: function (e) {
              if (
                ((this.prev = 0),
                (this.next = 0),
                (this.sent = this._sent = t),
                (this.done = !1),
                (this.delegate = null),
                (this.method = "next"),
                (this.arg = t),
                this.tryEntries.forEach(O),
                !e)
              )
                for (var n in this)
                  "t" === n.charAt(0) && r.call(this, n) && !isNaN(+n.slice(1)) && (this[n] = t);
            },
            stop: function () {
              this.done = !0;
              var e = this.tryEntries[0].completion;
              if ("throw" === e.type) throw e.arg;
              return this.rval;
            },
            dispatchException: function (e) {
              if (this.done) throw e;
              var n = this;
              function o(r, o) {
                return (
                  (c.type = "throw"),
                  (c.arg = e),
                  (n.next = r),
                  o && ((n.method = "next"), (n.arg = t)),
                  !!o
                );
              }
              for (var a = this.tryEntries.length - 1; a >= 0; --a) {
                var i = this.tryEntries[a],
                  c = i.completion;
                if ("root" === i.tryLoc) return o("end");
                if (i.tryLoc <= this.prev) {
                  var l = r.call(i, "catchLoc"),
                    u = r.call(i, "finallyLoc");
                  if (l && u) {
                    if (this.prev < i.catchLoc) return o(i.catchLoc, !0);
                    if (this.prev < i.finallyLoc) return o(i.finallyLoc);
                  } else if (l) {
                    if (this.prev < i.catchLoc) return o(i.catchLoc, !0);
                  } else {
                    if (!u) throw new Error("try statement without catch or finally");
                    if (this.prev < i.finallyLoc) return o(i.finallyLoc);
                  }
                }
              }
            },
            abrupt: function (e, t) {
              for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                var o = this.tryEntries[n];
                if (o.tryLoc <= this.prev && r.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
                  var a = o;
                  break;
                }
              }
              a &&
                ("break" === e || "continue" === e) &&
                a.tryLoc <= t &&
                t <= a.finallyLoc &&
                (a = null);
              var i = a ? a.completion : {};
              return (
                (i.type = e),
                (i.arg = t),
                a ? ((this.method = "next"), (this.next = a.finallyLoc), v) : this.complete(i)
              );
            },
            complete: function (e, t) {
              if ("throw" === e.type) throw e.arg;
              return (
                "break" === e.type || "continue" === e.type
                  ? (this.next = e.arg)
                  : "return" === e.type
                    ? ((this.rval = this.arg = e.arg),
                      (this.method = "return"),
                      (this.next = "end"))
                    : "normal" === e.type && t && (this.next = t),
                v
              );
            },
            finish: function (e) {
              for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                var n = this.tryEntries[t];
                if (n.finallyLoc === e) return (this.complete(n.completion, n.afterLoc), O(n), v);
              }
            },
            catch: function (e) {
              for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                var n = this.tryEntries[t];
                if (n.tryLoc === e) {
                  var r = n.completion;
                  if ("throw" === r.type) {
                    var o = r.arg;
                    O(n);
                  }
                  return o;
                }
              }
              throw new Error("illegal catch attempt");
            },
            delegateYield: function (e, n, r) {
              return (
                (this.delegate = { iterator: L(e), resultName: n, nextLoc: r }),
                "next" === this.method && (this.arg = t),
                v
              );
            },
          }),
          e
        );
      })(e.exports);
      try {
        regeneratorRuntime = t;
      } catch (n) {
        "object" == typeof globalThis
          ? (globalThis.regeneratorRuntime = t)
          : Function("r", "regeneratorRuntime = r")(t);
      }
    },
  },
  d = {};
function h(e) {
  var t = d[e];
  if (void 0 !== t) return t.exports;
  var n = (d[e] = { exports: {} });
  return (s[e](n, n.exports, h), n.exports);
}
((h.n = (e) => {
  var t = e && e.__esModule ? () => e.default : () => e;
  return (h.d(t, { a: t }), t);
}),
  (h.d = (e, t) => {
    for (var n in t)
      h.o(t, n) && !h.o(e, n) && Object.defineProperty(e, n, { enumerable: !0, get: t[n] });
  }),
  (h.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)));
var f = {};
function p(e, t) {
  (null == t || t > e.length) && (t = e.length);
  for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function v(e, t) {
  if (e) {
    if ("string" == typeof e) return p(e, t);
    var n = Object.prototype.toString.call(e).slice(8, -1);
    return (
      "Object" === n && e.constructor && (n = e.constructor.name),
      "Map" === n || "Set" === n
        ? Array.from(e)
        : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
          ? p(e, t)
          : void 0
    );
  }
}
function y(e) {
  return (
    (function (e) {
      if (Array.isArray(e)) return p(e);
    })(e) ||
    (function (e) {
      if (("undefined" != typeof Symbol && null != e[Symbol.iterator]) || null != e["@@iterator"])
        return Array.from(e);
    })(e) ||
    v(e) ||
    (function () {
      throw new TypeError(
        "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
      );
    })()
  );
}
function g(e, t, n) {
  return (
    t in e
      ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = n),
    e
  );
}
h.d(f, { A: () => M });
const m =
    ((k = {
      Fragment: () => u,
      computed: () => l,
      createTextVNode: () => c,
      createVNode: () => i,
      defineComponent: () => a,
      nextTick: () => o,
      reactive: () => r,
      ref: () => n,
      watch: () => t,
      watchEffect: () => e,
    }),
    (C = {}),
    h.d(C, k),
    C),
  b = (0, m.defineComponent)({
    props: { data: { required: !0, type: String }, onClick: Function },
    render: function () {
      var e = this.data,
        t = this.onClick;
      return (0, m.createVNode)("span", { class: "vjs-tree-brackets", onClick: t }, [e]);
    },
  }),
  w = (0, m.defineComponent)({
    emits: ["change", "update:modelValue"],
    props: { checked: { type: Boolean, default: !1 }, isMultiple: Boolean, onChange: Function },
    setup: function (e, t) {
      var n = t.emit;
      return {
        uiType: (0, m.computed)(function () {
          return e.isMultiple ? "checkbox" : "radio";
        }),
        model: (0, m.computed)({
          get: function () {
            return e.checked;
          },
          set: function (e) {
            return n("update:modelValue", e);
          },
        }),
      };
    },
    render: function () {
      var e = this.uiType,
        t = this.model,
        n = this.$emit;
      return (0, m.createVNode)(
        "label",
        {
          class: ["vjs-check-controller", t ? "is-checked" : ""],
          onClick: function (e) {
            return e.stopPropagation();
          },
        },
        [
          (0, m.createVNode)("span", { class: "vjs-check-controller-inner is-".concat(e) }, null),
          (0, m.createVNode)(
            "input",
            {
              checked: t,
              class: "vjs-check-controller-original is-".concat(e),
              type: e,
              onChange: function () {
                return n("change", t);
              },
            },
            null
          ),
        ]
      );
    },
  }),
  N = (0, m.defineComponent)({
    props: { nodeType: { required: !0, type: String }, onClick: Function },
    render: function () {
      var e = this.nodeType,
        t = this.onClick,
        n = "objectStart" === e || "arrayStart" === e;
      return n || "objectCollapsed" === e || "arrayCollapsed" === e
        ? (0, m.createVNode)(
            "span",
            { class: "vjs-carets vjs-carets-".concat(n ? "open" : "close"), onClick: t },
            [
              (0, m.createVNode)(
                "svg",
                {
                  viewBox: "0 0 1024 1024",
                  focusable: "false",
                  "data-icon": "caret-down",
                  width: "1em",
                  height: "1em",
                  fill: "currentColor",
                  "aria-hidden": "true",
                },
                [
                  (0, m.createVNode)(
                    "path",
                    {
                      d: "M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z",
                    },
                    null
                  ),
                ]
              ),
            ]
          )
        : null;
    },
  });
var k, C;
function x(e) {
  return (x =
    "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
      ? function (e) {
          return typeof e;
        }
      : function (e) {
          return e &&
            "function" == typeof Symbol &&
            e.constructor === Symbol &&
            e !== Symbol.prototype
            ? "symbol"
            : typeof e;
        })(e);
}
function j(e) {
  return Object.prototype.toString.call(e).slice(8, -1).toLowerCase();
}
function S(e) {
  var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "root",
    n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0,
    r = (arguments.length > 3 ? arguments[3] : void 0) || {},
    o = r.key,
    a = r.index,
    i = r.type,
    c = void 0 === i ? "content" : i,
    l = r.showComma,
    u = void 0 !== l && l,
    s = r.length,
    d = void 0 === s ? 1 : s,
    h = j(e);
  if ("array" === h) {
    var f = O(
      e.map(function (e, r, o) {
        return S(e, "".concat(t, "[").concat(r, "]"), n + 1, {
          index: r,
          showComma: r !== o.length - 1,
          length: d,
          type: c,
        });
      })
    );
    return [
      S("[", t, n, { showComma: !1, key: o, length: e.length, type: "arrayStart" })[0],
    ].concat(f, S("]", t, n, { showComma: u, length: e.length, type: "arrayEnd" })[0]);
  }
  if ("object" === h) {
    var p = Object.keys(e),
      v = O(
        p.map(function (r, o, a) {
          return S(
            e[r],
            /^[a-zA-Z_]\w*$/.test(r)
              ? "".concat(t, ".").concat(r)
              : "".concat(t, '["').concat(r, '"]'),
            n + 1,
            { key: r, showComma: o !== a.length - 1, length: d, type: c }
          );
        })
      );
    return [
      S("{", t, n, { showComma: !1, key: o, index: a, length: p.length, type: "objectStart" })[0],
    ].concat(v, S("}", t, n, { showComma: u, length: p.length, type: "objectEnd" })[0]);
  }
  return [{ content: e, level: n, key: o, index: a, path: t, showComma: u, length: d, type: c }];
}
function O(e) {
  if ("function" == typeof Array.prototype.flat) return e.flat();
  for (var t = y(e), n = []; t.length; ) {
    var r = t.shift();
    Array.isArray(r) ? t.unshift.apply(t, y(r)) : n.push(r);
  }
  return n;
}
function V(e) {
  var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : new WeakMap();
  if (null == e) return e;
  if (e instanceof Date) return new Date(e);
  if (e instanceof RegExp) return new RegExp(e);
  if ("object" !== x(e)) return e;
  if (t.get(e)) return t.get(e);
  if (Array.isArray(e)) {
    var n = e.map(function (e) {
      return V(e, t);
    });
    return (t.set(e, n), n);
  }
  var r = {};
  for (var o in e) r[o] = V(e[o], t);
  return (t.set(e, r), r);
}
function L(e, t, n, r, o, a, i) {
  try {
    var c = e[a](i),
      l = c.value;
  } catch (u) {
    return void n(u);
  }
  c.done ? t(l) : Promise.resolve(l).then(r, o);
}
var P = h(207),
  E = h.n(P);
function T(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    (t &&
      (r = r.filter(function (t) {
        return Object.getOwnPropertyDescriptor(e, t).enumerable;
      })),
      n.push.apply(n, r));
  }
  return n;
}
function A(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = null != arguments[t] ? arguments[t] : {};
    t % 2
      ? T(Object(n), !0).forEach(function (t) {
          g(e, t, n[t]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : T(Object(n)).forEach(function (t) {
            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
          });
  }
  return e;
}
var F = {
  data: { type: [String, Number, Boolean, Array, Object], default: null },
  rootPath: { type: String, default: "root" },
  indent: { type: Number, default: 2 },
  showLength: { type: Boolean, default: !1 },
  showDoubleQuotes: { type: Boolean, default: !0 },
  renderNodeKey: Function,
  renderNodeValue: Function,
  renderNodeActions: { type: [Boolean, Function], default: void 0 },
  selectableType: String,
  showSelectController: { type: Boolean, default: !1 },
  showLine: { type: Boolean, default: !0 },
  showLineNumber: { type: Boolean, default: !1 },
  selectOnClickNode: { type: Boolean, default: !0 },
  nodeSelectable: {
    type: Function,
    default: function () {
      return !0;
    },
  },
  highlightSelectedNode: { type: Boolean, default: !0 },
  showIcon: { type: Boolean, default: !1 },
  theme: { type: String, default: "light" },
  showKeyValueSpace: { type: Boolean, default: !0 },
  editable: { type: Boolean, default: !1 },
  editableTrigger: { type: String, default: "click" },
  onNodeClick: { type: Function },
  onNodeMouseover: { type: Function },
  onBracketsClick: { type: Function },
  onIconClick: { type: Function },
  onValueChange: { type: Function },
};
const I = (0, m.defineComponent)({
  name: "TreeNode",
  props: A(
    A({}, F),
    {},
    {
      node: { type: Object, required: !0 },
      collapsed: Boolean,
      checked: Boolean,
      style: Object,
      onSelectedChange: { type: Function },
    }
  ),
  emits: [
    "nodeClick",
    "nodeMouseover",
    "bracketsClick",
    "iconClick",
    "selectedChange",
    "valueChange",
  ],
  setup: function (e, t) {
    var n,
      r,
      o,
      a,
      i = t.emit,
      c = (0, m.computed)(function () {
        return j(e.node.content);
      }),
      l = (0, m.computed)(function () {
        return "vjs-value vjs-value-".concat(c.value);
      }),
      u = (0, m.computed)(function () {
        return e.showDoubleQuotes ? '"'.concat(e.node.key, '"') : e.node.key;
      }),
      s = (0, m.computed)(function () {
        return "multiple" === e.selectableType;
      }),
      d = (0, m.computed)(function () {
        return "single" === e.selectableType;
      }),
      h = (0, m.computed)(function () {
        return e.nodeSelectable(e.node) && (s.value || d.value);
      }),
      f = (0, m.reactive)({ editing: !1 }),
      p = function (t) {
        var n,
          r,
          o =
            "null" === (r = null === (n = t.target) || void 0 === n ? void 0 : n.value)
              ? null
              : "undefined" === r
                ? void 0
                : "true" === r ||
                  ("false" !== r &&
                    (r[0] + r[r.length - 1] === '""' || r[0] + r[r.length - 1] === "''"
                      ? r.slice(1, -1)
                      : ("number" == typeof Number(r) && !isNaN(Number(r))) || "NaN" === r
                        ? Number(r)
                        : r));
        i("valueChange", o, e.node.path);
      },
      v = (0, m.computed)(function () {
        var t,
          n = null === (t = e.node) || void 0 === t ? void 0 : t.content;
        return (
          null === n ? (n = "null") : void 0 === n && (n = "undefined"),
          "string" === c.value ? '"'.concat(n, '"') : n + ""
        );
      }),
      y = function () {
        var t = e.renderNodeValue;
        return t ? t({ node: e.node, defaultValue: v.value }) : v.value;
      },
      k = function () {
        i("bracketsClick", !e.collapsed, e.node);
      },
      C = function () {
        i("iconClick", !e.collapsed, e.node);
      },
      x = function () {
        i("selectedChange", e.node);
      },
      S = function () {
        (i("nodeClick", e.node), h.value && e.selectOnClickNode && i("selectedChange", e.node));
      },
      O = function () {
        i("nodeMouseover", e.node);
      },
      V = function (t) {
        if (e.editable && !f.editing) {
          f.editing = !0;
          var n = function e(n) {
            var r;
            n.target !== t.target &&
              (null === (r = n.target) || void 0 === r ? void 0 : r.parentElement) !== t.target &&
              ((f.editing = !1), document.removeEventListener("click", e));
          };
          (document.removeEventListener("click", n), document.addEventListener("click", n));
        }
      },
      P = ((o = (0, m.ref)(!1)),
      (n = E().mark(function e(t) {
        return E().wrap(
          function (e) {
            for (;;)
              switch ((e.prev = e.next)) {
                case 0:
                  return ((e.prev = 0), (e.next = 3), navigator.clipboard.writeText(t));
                case 3:
                  ((o.value = !0),
                    setTimeout(function () {
                      o.value = !1;
                    }, 300),
                    (e.next = 10));
                  break;
                case 7:
                  ((e.prev = 7), (e.t0 = e.catch(0)));
                case 10:
                case "end":
                  return e.stop();
              }
          },
          e,
          null,
          [[0, 7]]
        );
      })),
      (r = function () {
        var e = this,
          t = arguments;
        return new Promise(function (r, o) {
          var a = n.apply(e, t);
          function i(e) {
            L(a, r, o, i, c, "next", e);
          }
          function c(e) {
            L(a, r, o, i, c, "throw", e);
          }
          i(void 0);
        });
      }),
      (a = function (e) {
        return r.apply(this, arguments);
      }),
      { copy: a }).copy,
      T = function () {
        var t = e.node,
          n = t.key,
          r = t.path,
          o = e.rootPath,
          a = new Function("data", "return data".concat(r.slice(o.length)))(e.data),
          i = JSON.stringify(n ? g({}, n, a) : a, null, 2);
        P(i);
      },
      A = function () {
        var t = e.renderNodeActions;
        if (!t) return null;
        var n = { copy: T };
        return "function" == typeof t
          ? t({ node: e.node, defaultActions: n })
          : (0, m.createVNode)("span", { onClick: T, class: "vjs-tree-node-actions-item" }, [
              (0, m.createTextVNode)("copy"),
            ]);
      };
    return function () {
      var t,
        n = e.node;
      return (0, m.createVNode)(
        "div",
        {
          class: {
            "vjs-tree-node": !0,
            "has-selector": e.showSelectController,
            "has-carets": e.showIcon,
            "is-highlight": e.highlightSelectedNode && e.checked,
            dark: "dark" === e.theme,
          },
          onClick: S,
          onMouseover: O,
          style: e.style,
        },
        [
          e.showLineNumber && (0, m.createVNode)("span", { class: "vjs-node-index" }, [n.id + 1]),
          e.showSelectController &&
            h.value &&
            "objectEnd" !== n.type &&
            "arrayEnd" !== n.type &&
            (0, m.createVNode)(w, { isMultiple: s.value, checked: e.checked, onChange: x }, null),
          (0, m.createVNode)("div", { class: "vjs-indent" }, [
            Array.from(Array(n.level)).map(function (t, n) {
              return (0, m.createVNode)(
                "div",
                { key: n, class: { "vjs-indent-unit": !0, "has-line": e.showLine } },
                [
                  Array.from(Array(e.indent)).map(function () {
                    return (0, m.createVNode)(m.Fragment, null, [(0, m.createTextVNode)(" ")]);
                  }),
                ]
              );
            }),
            e.showIcon && (0, m.createVNode)(N, { nodeType: n.type, onClick: C }, null),
          ]),
          n.key &&
            (0, m.createVNode)("span", { class: "vjs-key" }, [
              ((t = e.renderNodeKey), t ? t({ node: e.node, defaultKey: u.value || "" }) : u.value),
              (0, m.createVNode)("span", { class: "vjs-colon" }, [
                ":".concat(e.showKeyValueSpace ? " " : ""),
              ]),
            ]),
          (0, m.createVNode)("span", null, [
            "content" !== n.type && n.content
              ? (0, m.createVNode)(b, { data: n.content.toString(), onClick: k }, null)
              : (0, m.createVNode)(
                  "span",
                  {
                    class: l.value,
                    onClick:
                      !e.editable || (e.editableTrigger && "click" !== e.editableTrigger)
                        ? void 0
                        : V,
                    onDblclick: e.editable && "dblclick" === e.editableTrigger ? V : void 0,
                  },
                  [
                    e.editable && f.editing
                      ? (0, m.createVNode)(
                          "input",
                          {
                            value: v.value,
                            onChange: p,
                            style: {
                              padding: "3px 8px",
                              border: "1px solid #eee",
                              boxShadow: "none",
                              boxSizing: "border-box",
                              borderRadius: 5,
                              fontFamily: "inherit",
                            },
                          },
                          null
                        )
                      : y(),
                  ]
                ),
            n.showComma && (0, m.createVNode)("span", null, [","]),
            e.showLength &&
              e.collapsed &&
              (0, m.createVNode)("span", { class: "vjs-comment" }, [
                (0, m.createTextVNode)(" // "),
                n.length,
                (0, m.createTextVNode)(" items "),
              ]),
          ]),
          e.renderNodeActions &&
            (0, m.createVNode)("span", { class: "vjs-tree-node-actions" }, [A()]),
        ]
      );
    };
  },
});
function B(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    (t &&
      (r = r.filter(function (t) {
        return Object.getOwnPropertyDescriptor(e, t).enumerable;
      })),
      n.push.apply(n, r));
  }
  return n;
}
function H(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = null != arguments[t] ? arguments[t] : {};
    t % 2
      ? B(Object(n), !0).forEach(function (t) {
          g(e, t, n[t]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : B(Object(n)).forEach(function (t) {
            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
          });
  }
  return e;
}
const M = (0, m.defineComponent)({
  name: "Tree",
  props: H(
    H({}, F),
    {},
    {
      collapsedNodeLength: { type: Number, default: 1 / 0 },
      deep: { type: Number, default: 1 / 0 },
      pathCollapsible: {
        type: Function,
        default: function () {
          return !1;
        },
      },
      virtual: { type: Boolean, default: !1 },
      height: { type: Number, default: 400 },
      itemHeight: { type: Number, default: 20 },
      dynamicHeight: { type: Boolean, default: !0 },
      selectedValue: {
        type: [String, Array],
        default: function () {
          return "";
        },
      },
      collapsedOnClickBrackets: { type: Boolean, default: !0 },
      style: Object,
      onSelectedChange: { type: Function },
      theme: { type: String, default: "light" },
    }
  ),
  slots: ["renderNodeKey", "renderNodeValue", "renderNodeActions"],
  emits: [
    "nodeClick",
    "nodeMouseover",
    "bracketsClick",
    "iconClick",
    "selectedChange",
    "update:selectedValue",
    "update:data",
  ],
  setup: function (e, t) {
    var n = t.emit,
      r = t.slots,
      o = (0, m.ref)(),
      a = (0, m.computed)(function () {
        return S(e.data, e.rootPath);
      }),
      i = function (t, n) {
        return a.value.reduce(function (r, o) {
          var a,
            i = o.level >= t || o.length >= n,
            c = null === (a = e.pathCollapsible) || void 0 === a ? void 0 : a.call(e, o);
          return ("objectStart" !== o.type && "arrayStart" !== o.type) || (!i && !c)
            ? r
            : H(H({}, r), {}, g({}, o.path, 1));
        }, {});
      },
      c = (0, m.reactive)({
        translateY: 0,
        visibleData: null,
        hiddenPaths: i(e.deep, e.collapsedNodeLength),
        startIndex: 0,
        endIndex: 0,
      }),
      l = [],
      u = [],
      s = 0,
      d = {},
      h = function (t) {
        ((l = Array(t)
          .fill(0)
          .map(function () {
            return e.itemHeight || 20;
          })),
          ((u = new Array(t + 1))[0] = 0));
        for (var n = 0; n < t; n++) u[n + 1] = u[n] + l[n];
        s = u[t] || 0;
      },
      f = function (e) {
        var t = l.length;
        (e < 0 && (e = 0), e > t && (e = t));
        for (var n = e; n < t; n++) u[n + 1] = u[n] + l[n];
        s = u[t] || 0;
      },
      p = function (e, t) {
        for (var n = 0, r = e.length - 1; n < r; ) {
          var o = (n + r) >>> 1;
          e[o] < t ? (n = o + 1) : (r = o);
        }
        return n;
      },
      b = (0, m.computed)(function () {
        for (var e = null, t = [], n = a.value.length, r = 0; r < n; r++) {
          var o = H(H({}, a.value[r]), {}, { id: r }),
            i = c.hiddenPaths[o.path];
          if (e && e.path === o.path) {
            var l = "objectStart" === e.type,
              u = H(
                H(H({}, o), e),
                {},
                {
                  showComma: o.showComma,
                  content: l ? "{...}" : "[...]",
                  type: l ? "objectCollapsed" : "arrayCollapsed",
                }
              );
            ((e = null), t.push(u));
          } else {
            if (i && !e) {
              e = o;
              continue;
            }
            if (e) continue;
            t.push(o);
          }
        }
        return t;
      }),
      w = (0, m.computed)(function () {
        var t = e.selectedValue;
        return t && "multiple" === e.selectableType && Array.isArray(t) ? t : [t];
      }),
      N = (0, m.computed)(function () {
        return !e.selectableType || e.selectOnClickNode || e.showSelectController
          ? ""
          : "When selectableType is not null, selectOnClickNode and showSelectController cannot be false at the same time, because this will cause the selection to fail.";
      }),
      k = (0, m.computed)(function () {
        return e.dynamicHeight ? s || 0 : b.value.length * e.itemHeight;
      }),
      C = function t() {
        var n,
          r = b.value;
        if (r)
          if (e.virtual) {
            var a,
              i = (null === (a = o.value) || void 0 === a ? void 0 : a.scrollTop) || 0;
            if (e.dynamicHeight) {
              l.length !== r.length && h(r.length);
              var s = ((n = p(u, i + 1e-4)), Math.max(0, Math.min(n - 1, l.length - 1))),
                v = (function (e, t) {
                  var n = p(u, e + t);
                  return Math.max(0, Math.min(n + 1, l.length));
                })(i, e.height),
                y = Math.max(0, s - 5),
                g = Math.min(r.length, v + 5);
              ((c.startIndex = y),
                (c.endIndex = g),
                (c.translateY = u[y] || 0),
                (c.visibleData = r.slice(y, g)),
                (0, m.nextTick)().then(function () {
                  for (var e = !1, n = c.startIndex; n < c.endIndex; n++) {
                    var r = d[n];
                    if (r) {
                      var o = r.offsetHeight;
                      o && l[n] !== o && ((l[n] = o), (u[n + 1] = u[n] + l[n]), f(n + 1), (e = !0));
                    }
                  }
                  e && t();
                }));
            } else {
              var w = e.height / e.itemHeight,
                N = Math.floor(i / e.itemHeight),
                k = N < 0 ? 0 : N + w > r.length ? r.length - w : N;
              k < 0 && (k = 0);
              var C = k + w;
              ((c.translateY = k * e.itemHeight),
                (c.startIndex = k),
                (c.endIndex = C),
                (c.visibleData = r.slice(k, C)));
            }
          } else
            ((c.translateY = 0), (c.startIndex = 0), (c.endIndex = r.length), (c.visibleData = r));
      },
      x = null,
      j = function () {
        (x && cancelAnimationFrame(x),
          (x = requestAnimationFrame(function () {
            C();
          })));
      },
      O = function (t) {
        var r,
          o = t.path,
          a = e.selectableType;
        if ("multiple" === a) {
          var i = w.value.findIndex(function (e) {
              return e === o;
            }),
            c = y(w.value);
          (-1 !== i ? c.splice(i, 1) : c.push(o),
            n("update:selectedValue", c),
            n("selectedChange", c, y(w.value)));
        } else if ("single" === a && w.value[0] !== o) {
          var l = ((r = w.value),
            (function (e) {
              if (Array.isArray(e)) return e;
            })(r) ||
              (function (e) {
                var t =
                  null == e
                    ? null
                    : ("undefined" != typeof Symbol && e[Symbol.iterator]) || e["@@iterator"];
                if (null != t) {
                  var n,
                    r,
                    o = [],
                    a = !0,
                    i = !1;
                  try {
                    for (
                      t = t.call(e);
                      !(a = (n = t.next()).done) && (o.push(n.value), 1 !== o.length);
                      a = !0
                    );
                  } catch (c) {
                    ((i = !0), (r = c));
                  } finally {
                    try {
                      a || null == t.return || t.return();
                    } finally {
                      if (i) throw r;
                    }
                  }
                  return o;
                }
              })(r) ||
              v(r, 1) ||
              (function () {
                throw new TypeError(
                  "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
                );
              })())[0],
            u = o;
          (n("update:selectedValue", u), n("selectedChange", u, l));
        }
      },
      L = function (e) {
        n("nodeClick", e);
      },
      P = function (e) {
        n("nodeMouseover", e);
      },
      E = function (e, t) {
        if (e) c.hiddenPaths = H(H({}, c.hiddenPaths), {}, g({}, t, 1));
        else {
          var n = H({}, c.hiddenPaths);
          (delete n[t], (c.hiddenPaths = n));
        }
      },
      T = function (t, r) {
        (e.collapsedOnClickBrackets && E(t, r.path), n("bracketsClick", t, r));
      },
      A = function (e, t) {
        (E(e, t.path), n("iconClick", e, t));
      },
      F = function (t, r) {
        var o = V(e.data),
          a = e.rootPath;
        (new Function("data", "val", "data".concat(r.slice(a.length), "=val"))(o, t),
          n("update:data", o));
      };
    return (
      (0, m.watchEffect)(function () {
        N.value &&
          (function (e) {
            throw new Error("[VueJSONPretty] ".concat(e));
          })(N.value);
      }),
      (0, m.watchEffect)(function () {
        b.value &&
          (e.virtual && e.dynamicHeight && l.length !== b.value.length && h(b.value.length), C());
      }),
      (0, m.watch)(
        function () {
          return [e.dynamicHeight, e.itemHeight, a.value.length];
        },
        function () {
          e.virtual && e.dynamicHeight && (h(b.value.length), (0, m.nextTick)(C));
        }
      ),
      (0, m.watch)(
        function () {
          return e.deep;
        },
        function (t) {
          t && (c.hiddenPaths = i(t, e.collapsedNodeLength));
        }
      ),
      (0, m.watch)(
        function () {
          return e.collapsedNodeLength;
        },
        function (t) {
          t && (c.hiddenPaths = i(e.deep, t));
        }
      ),
      function () {
        var t,
          n,
          i,
          l,
          u,
          s = null !== (t = e.renderNodeKey) && void 0 !== t ? t : r.renderNodeKey,
          h = null !== (n = e.renderNodeValue) && void 0 !== n ? n : r.renderNodeValue,
          f =
            null !==
              (i = null !== (l = e.renderNodeActions) && void 0 !== l ? l : r.renderNodeActions) &&
            void 0 !== i &&
            i,
          p =
            null === (u = c.visibleData) || void 0 === u
              ? void 0
              : u.map(function (t, n) {
                  var r = c.startIndex + n;
                  return (0, m.createVNode)(
                    "div",
                    {
                      key: t.id,
                      ref: function (e) {
                        return ((t = r), void ((n = e || null) ? (d[t] = n) : delete d[t]));
                        var t, n;
                      },
                    },
                    [
                      (0, m.createVNode)(
                        I,
                        {
                          data: e.data,
                          rootPath: e.rootPath,
                          indent: e.indent,
                          node: t,
                          collapsed: !!c.hiddenPaths[t.path],
                          theme: e.theme,
                          showDoubleQuotes: e.showDoubleQuotes,
                          showLength: e.showLength,
                          checked: w.value.includes(t.path),
                          selectableType: e.selectableType,
                          showLine: e.showLine,
                          showLineNumber: e.showLineNumber,
                          showSelectController: e.showSelectController,
                          selectOnClickNode: e.selectOnClickNode,
                          nodeSelectable: e.nodeSelectable,
                          highlightSelectedNode: e.highlightSelectedNode,
                          editable: e.editable,
                          editableTrigger: e.editableTrigger,
                          showIcon: e.showIcon,
                          showKeyValueSpace: e.showKeyValueSpace,
                          renderNodeKey: s,
                          renderNodeValue: h,
                          renderNodeActions: f,
                          onNodeClick: L,
                          onNodeMouseover: P,
                          onBracketsClick: T,
                          onIconClick: A,
                          onSelectedChange: O,
                          onValueChange: F,
                          class: e.dynamicHeight ? "dynamic-height" : void 0,
                          style: e.dynamicHeight
                            ? {}
                            : e.itemHeight && 20 !== e.itemHeight
                              ? { lineHeight: "".concat(e.itemHeight, "px") }
                              : {},
                        },
                        null
                      ),
                    ]
                  );
                });
        return (0, m.createVNode)(
          "div",
          {
            ref: o,
            class: { "vjs-tree": !0, "is-virtual": e.virtual, dark: "dark" === e.theme },
            onScroll: e.virtual ? j : void 0,
            style: e.showLineNumber
              ? H(
                  { paddingLeft: "".concat(12 * Number(a.value.length.toString().length), "px") },
                  e.style
                )
              : e.style,
          },
          [
            e.virtual
              ? (0, m.createVNode)(
                  "div",
                  { class: "vjs-tree-list", style: { height: "".concat(e.height, "px") } },
                  [
                    (0, m.createVNode)(
                      "div",
                      {
                        class: "vjs-tree-list-holder",
                        style: { height: "".concat(k.value, "px") },
                      },
                      [
                        (0, m.createVNode)(
                          "div",
                          {
                            class: "vjs-tree-list-holder-inner",
                            style: { transform: "translateY(".concat(c.translateY, "px)") },
                          },
                          [p]
                        ),
                      ]
                    ),
                  ]
                )
              : p,
          ]
        );
      }
    );
  },
});
var D = f.A;
export { D as P };
