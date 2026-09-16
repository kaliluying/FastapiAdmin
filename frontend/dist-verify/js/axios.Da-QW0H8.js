function e(e, t) {
  return function () {
    return e.apply(t, arguments);
  };
}
const { toString: t } = Object.prototype,
  { getPrototypeOf: n } = Object,
  { iterator: r, toStringTag: o } = Symbol,
  s = ((e) => (n) => {
    const r = t.call(n);
    return e[r] || (e[r] = r.slice(8, -1).toLowerCase());
  })(Object.create(null)),
  i = (e) => ((e = e.toLowerCase()), (t) => s(t) === e),
  a = (e) => (t) => typeof t === e,
  { isArray: c } = Array,
  l = a("undefined");
function u(e) {
  return (
    null !== e &&
    !l(e) &&
    null !== e.constructor &&
    !l(e.constructor) &&
    p(e.constructor.isBuffer) &&
    e.constructor.isBuffer(e)
  );
}
const f = i("ArrayBuffer");
const d = a("string"),
  p = a("function"),
  h = a("number"),
  m = (e) => null !== e && "object" == typeof e,
  b = (e) => {
    if ("object" !== s(e)) return !1;
    const t = n(e);
    return !(
      (null !== t && t !== Object.prototype && null !== Object.getPrototypeOf(t)) ||
      o in e ||
      r in e
    );
  },
  y = i("Date"),
  g = i("File"),
  w = i("Blob"),
  E = i("FileList");
const O =
    "undefined" != typeof globalThis
      ? globalThis
      : "undefined" != typeof self
        ? self
        : "undefined" != typeof window
          ? window
          : "undefined" != typeof global
            ? global
            : {},
  R = void 0 !== O.FormData ? O.FormData : void 0,
  S = i("URLSearchParams"),
  [A, _, T, C] = ["ReadableStream", "Request", "Response", "Headers"].map(i);
function v(e, t, { allOwnKeys: n = !1 } = {}) {
  if (null == e) return;
  let r, o;
  if (("object" != typeof e && (e = [e]), c(e)))
    for (r = 0, o = e.length; r < o; r++) t.call(null, e[r], r, e);
  else {
    if (u(e)) return;
    const o = n ? Object.getOwnPropertyNames(e) : Object.keys(e),
      s = o.length;
    let i;
    for (r = 0; r < s; r++) ((i = o[r]), t.call(null, e[i], i, e));
  }
}
function P(e, t) {
  if (u(e)) return null;
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r,
    o = n.length;
  for (; o-- > 0; ) if (((r = n[o]), t === r.toLowerCase())) return r;
  return null;
}
const x =
    "undefined" != typeof globalThis
      ? globalThis
      : "undefined" != typeof self
        ? self
        : "undefined" != typeof window
          ? window
          : global,
  N = (e) => !l(e) && e !== x;
const j = (
    (e) => (t) =>
      e && t instanceof e
  )("undefined" != typeof Uint8Array && n(Uint8Array)),
  D = i("HTMLFormElement"),
  U = (
    ({ hasOwnProperty: e }) =>
    (t, n) =>
      e.call(t, n)
  )(Object.prototype),
  L = i("RegExp"),
  F = (e, t) => {
    const n = Object.getOwnPropertyDescriptors(e),
      r = {};
    (v(n, (n, o) => {
      let s;
      !1 !== (s = t(n, o, e)) && (r[o] = s || n);
    }),
      Object.defineProperties(e, r));
  };
const B = i("AsyncFunction"),
  k =
    ((q = "function" == typeof setImmediate),
    (I = p(x.postMessage)),
    q
      ? setImmediate
      : I
        ? ((M = `axios@${Math.random()}`),
          (z = []),
          x.addEventListener(
            "message",
            ({ source: e, data: t }) => {
              e === x && t === M && z.length && z.shift()();
            },
            !1
          ),
          (e) => {
            (z.push(e), x.postMessage(M, "*"));
          })
        : (e) => setTimeout(e));
var q, I, M, z;
const H =
    "undefined" != typeof queueMicrotask
      ? queueMicrotask.bind(x)
      : ("undefined" != typeof process && process.nextTick) || k,
  W = {
    isArray: c,
    isArrayBuffer: f,
    isBuffer: u,
    isFormData: (e) => {
      if (!e) return !1;
      if (R && e instanceof R) return !0;
      const t = n(e);
      if (!t || t === Object.prototype) return !1;
      if (!p(e.append)) return !1;
      const r = s(e);
      return (
        "formdata" === r || // detect form-data instance
        ("object" === r && p(e.toString) && "[object FormData]" === e.toString())
      );
    },
    isArrayBufferView: function (e) {
      let t;
      return (
        (t =
          "undefined" != typeof ArrayBuffer && ArrayBuffer.isView
            ? ArrayBuffer.isView(e)
            : e && e.buffer && f(e.buffer)),
        t
      );
    },
    isString: d,
    isNumber: h,
    isBoolean: (e) => !0 === e || !1 === e,
    isObject: m,
    isPlainObject: b,
    isEmptyObject: (e) => {
      if (!m(e) || u(e)) return !1;
      try {
        return 0 === Object.keys(e).length && Object.getPrototypeOf(e) === Object.prototype;
      } catch (t) {
        return !1;
      }
    },
    isReadableStream: A,
    isRequest: _,
    isResponse: T,
    isHeaders: C,
    isUndefined: l,
    isDate: y,
    isFile: g,
    isReactNativeBlob: (e) => !(!e || void 0 === e.uri),
    isReactNative: (e) => e && void 0 !== e.getParts,
    isBlob: w,
    isRegExp: L,
    isFunction: p,
    isStream: (e) => m(e) && p(e.pipe),
    isURLSearchParams: S,
    isTypedArray: j,
    isFileList: E,
    forEach: v,
    merge: function e(...t) {
      const { caseless: n, skipUndefined: r } = (N(this) && this) || {},
        o = {},
        s = (t, s) => {
          if ("__proto__" === s || "constructor" === s || "prototype" === s) return;
          const i = (n && P(o, s)) || s,
            a = U(o, i) ? o[i] : void 0;
          b(a) && b(t)
            ? (o[i] = e(a, t))
            : b(t)
              ? (o[i] = e({}, t))
              : c(t)
                ? (o[i] = t.slice())
                : (r && l(t)) || (o[i] = t);
        };
      for (let i = 0, a = t.length; i < a; i++) t[i] && v(t[i], s);
      return o;
    },
    extend: (t, n, r, { allOwnKeys: o } = {}) => (
      v(
        n,
        (n, o) => {
          r && p(n)
            ? Object.defineProperty(t, o, {
                // Null-proto descriptor so a polluted Object.prototype.get cannot
                // hijack defineProperty's accessor-vs-data resolution.
                __proto__: null,
                value: e(n, r),
                writable: !0,
                enumerable: !0,
                configurable: !0,
              })
            : Object.defineProperty(t, o, {
                __proto__: null,
                value: n,
                writable: !0,
                enumerable: !0,
                configurable: !0,
              });
        },
        { allOwnKeys: o }
      ),
      t
    ),
    trim: (e) => (e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "")),
    stripBOM: (e) => (65279 === e.charCodeAt(0) && (e = e.slice(1)), e),
    inherits: (e, t, n, r) => {
      ((e.prototype = Object.create(t.prototype, r)),
        Object.defineProperty(e.prototype, "constructor", {
          __proto__: null,
          value: e,
          writable: !0,
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e, "super", { __proto__: null, value: t.prototype }),
        n && Object.assign(e.prototype, n));
    },
    toFlatObject: (e, t, r, o) => {
      let s, i, a;
      const c = {};
      if (((t = t || {}), null == e)) return t;
      do {
        for (s = Object.getOwnPropertyNames(e), i = s.length; i-- > 0; )
          ((a = s[i]), (o && !o(a, e, t)) || c[a] || ((t[a] = e[a]), (c[a] = !0)));
        e = !1 !== r && n(e);
      } while (e && (!r || r(e, t)) && e !== Object.prototype);
      return t;
    },
    kindOf: s,
    kindOfTest: i,
    endsWith: (e, t, n) => {
      ((e = String(e)), (void 0 === n || n > e.length) && (n = e.length), (n -= t.length));
      const r = e.indexOf(t, n);
      return -1 !== r && r === n;
    },
    toArray: (e) => {
      if (!e) return null;
      if (c(e)) return e;
      let t = e.length;
      if (!h(t)) return null;
      const n = new Array(t);
      for (; t-- > 0; ) n[t] = e[t];
      return n;
    },
    forEachEntry: (e, t) => {
      const n = (e && e[r]).call(e);
      let o;
      for (; (o = n.next()) && !o.done; ) {
        const n = o.value;
        t.call(e, n[0], n[1]);
      }
    },
    matchAll: (e, t) => {
      let n;
      const r = [];
      for (; null !== (n = e.exec(t)); ) r.push(n);
      return r;
    },
    isHTMLForm: D,
    hasOwnProperty: U,
    hasOwnProp: U,
    // an alias to avoid ESLint no-prototype-builtins detection
    reduceDescriptors: F,
    freezeMethods: (e) => {
      F(e, (t, n) => {
        if (p(e) && ["arguments", "caller", "callee"].includes(n)) return !1;
        const r = e[n];
        p(r) &&
          ((t.enumerable = !1),
          "writable" in t
            ? (t.writable = !1)
            : t.set ||
              (t.set = () => {
                throw Error("Can not rewrite read-only method '" + n + "'");
              }));
      });
    },
    toObjectSet: (e, t) => {
      const n = {},
        r = (e) => {
          e.forEach((e) => {
            n[e] = !0;
          });
        };
      return (c(e) ? r(e) : r(String(e).split(t)), n);
    },
    toCamelCase: (e) =>
      e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (e, t, n) {
        return t.toUpperCase() + n;
      }),
    noop: () => {},
    toFiniteNumber: (e, t) => (null != e && Number.isFinite((e = +e)) ? e : t),
    findKey: P,
    global: x,
    isContextDefined: N,
    isSpecCompliantForm: function (e) {
      return !!(e && p(e.append) && "FormData" === e[o] && e[r]);
    },
    toJSONObject: (e) => {
      const t = new WeakSet(),
        n = (e) => {
          if (m(e)) {
            if (t.has(e)) return;
            if (u(e)) return e;
            if (!("toJSON" in e)) {
              t.add(e);
              const r = c(e) ? [] : {};
              return (
                v(e, (e, t) => {
                  const o = n(e);
                  !l(o) && (r[t] = o);
                }),
                t.delete(e),
                r
              );
            }
          }
          return e;
        };
      return n(e);
    },
    isAsyncFn: B,
    isThenable: (e) => e && (m(e) || p(e)) && p(e.then) && p(e.catch),
    setImmediate: k,
    asap: H,
    isIterable: (e) => null != e && p(e[r]),
  },
  J = W.toObjectSet([
    "age",
    "authorization",
    "content-length",
    "content-type",
    "etag",
    "expires",
    "from",
    "host",
    "if-modified-since",
    "if-unmodified-since",
    "last-modified",
    "location",
    "max-forwards",
    "proxy-authorization",
    "referer",
    "retry-after",
    "user-agent",
  ]);
const V = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"),
  K = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function $(e, t) {
  return W.isArray(e)
    ? e.map((e) => $(e, t))
    : (function (e) {
        let t = 0,
          n = e.length;
        for (; t < n; ) {
          const n = e.charCodeAt(t);
          if (9 !== n && 32 !== n) break;
          t += 1;
        }
        for (; n > t; ) {
          const t = e.charCodeAt(n - 1);
          if (9 !== t && 32 !== t) break;
          n -= 1;
        }
        return 0 === t && n === e.length ? e : e.slice(t, n);
      })(String(e).replace(t, ""));
}
function X(e) {
  const t = Object.create(null);
  return (
    W.forEach(e.toJSON(), (e, n) => {
      t[n] = ((e) => $(e, K))(e);
    }),
    t
  );
}
const G = Symbol("internals");
function Q(e) {
  return e && String(e).trim().toLowerCase();
}
function Y(e) {
  return !1 === e || null == e ? e : W.isArray(e) ? e.map(Y) : ((e) => $(e, V))(String(e));
}
function Z(e, t, n, r, o) {
  return W.isFunction(r)
    ? r.call(this, t, n)
    : (o && (t = n),
      W.isString(t)
        ? W.isString(r)
          ? -1 !== t.indexOf(r)
          : W.isRegExp(r)
            ? r.test(t)
            : void 0
        : void 0);
}
let ee = class {
  constructor(e) {
    e && this.set(e);
  }
  set(e, t, n) {
    const r = this;
    function o(e, t, n) {
      const o = Q(t);
      if (!o) throw new Error("header name must be a non-empty string");
      const s = W.findKey(r, o);
      (!s || void 0 === r[s] || !0 === n || (void 0 === n && !1 !== r[s])) && (r[s || t] = Y(e));
    }
    const s = (e, t) => W.forEach(e, (e, n) => o(e, n, t));
    if (W.isPlainObject(e) || e instanceof this.constructor) s(e, t);
    else if (W.isString(e) && (e = e.trim()) && !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim()))
      s(
        ((e) => {
          const t = {};
          let n, r, o;
          return (
            e &&
              e.split("\n").forEach(function (e) {
                ((o = e.indexOf(":")),
                  (n = e.substring(0, o).trim().toLowerCase()),
                  (r = e.substring(o + 1).trim()),
                  !n ||
                    (t[n] && J[n]) ||
                    ("set-cookie" === n
                      ? t[n]
                        ? t[n].push(r)
                        : (t[n] = [r])
                      : (t[n] = t[n] ? t[n] + ", " + r : r)));
              }),
            t
          );
        })(e),
        t
      );
    else if (W.isObject(e) && W.isIterable(e)) {
      let n,
        r,
        o = {};
      for (const t of e) {
        if (!W.isArray(t)) throw TypeError("Object iterator must return a key-value pair");
        o[(r = t[0])] = (n = o[r]) ? (W.isArray(n) ? [...n, t[1]] : [n, t[1]]) : t[1];
      }
      s(o, t);
    } else null != e && o(t, e, n);
    return this;
  }
  get(e, t) {
    if ((e = Q(e))) {
      const n = W.findKey(this, e);
      if (n) {
        const e = this[n];
        if (!t) return e;
        if (!0 === t)
          return (function (e) {
            const t = Object.create(null),
              n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
            let r;
            for (; (r = n.exec(e)); ) t[r[1]] = r[2];
            return t;
          })(e);
        if (W.isFunction(t)) return t.call(this, e, n);
        if (W.isRegExp(t)) return t.exec(e);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(e, t) {
    if ((e = Q(e))) {
      const n = W.findKey(this, e);
      return !(!n || void 0 === this[n] || (t && !Z(0, this[n], n, t)));
    }
    return !1;
  }
  delete(e, t) {
    const n = this;
    let r = !1;
    function o(e) {
      if ((e = Q(e))) {
        const o = W.findKey(n, e);
        !o || (t && !Z(0, n[o], o, t)) || (delete n[o], (r = !0));
      }
    }
    return (W.isArray(e) ? e.forEach(o) : o(e), r);
  }
  clear(e) {
    const t = Object.keys(this);
    let n = t.length,
      r = !1;
    for (; n--; ) {
      const o = t[n];
      (e && !Z(0, this[o], o, e, !0)) || (delete this[o], (r = !0));
    }
    return r;
  }
  normalize(e) {
    const t = this,
      n = {};
    return (
      W.forEach(this, (r, o) => {
        const s = W.findKey(n, o);
        if (s) return ((t[s] = Y(r)), void delete t[o]);
        const i = e
          ? (function (e) {
              return e
                .trim()
                .toLowerCase()
                .replace(/([a-z\d])(\w*)/g, (e, t, n) => t.toUpperCase() + n);
            })(o)
          : String(o).trim();
        (i !== o && delete t[o], (t[i] = Y(r)), (n[i] = !0));
      }),
      this
    );
  }
  concat(...e) {
    return this.constructor.concat(this, ...e);
  }
  toJSON(e) {
    const t = Object.create(null);
    return (
      W.forEach(this, (n, r) => {
        null != n && !1 !== n && (t[r] = e && W.isArray(n) ? n.join(", ") : n);
      }),
      t
    );
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON())
      .map(([e, t]) => e + ": " + t)
      .join("\n");
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(e) {
    return e instanceof this ? e : new this(e);
  }
  static concat(e, ...t) {
    const n = new this(e);
    return (t.forEach((e) => n.set(e)), n);
  }
  static accessor(e) {
    const t = (this[G] = this[G] = { accessors: {} }).accessors,
      n = this.prototype;
    function r(e) {
      const r = Q(e);
      t[r] ||
        (!(function (e, t) {
          const n = W.toCamelCase(" " + t);
          ["get", "set", "has"].forEach((r) => {
            Object.defineProperty(e, r + n, {
              // Null-proto descriptor so a polluted Object.prototype.get cannot turn
              // this data descriptor into an accessor descriptor on the way in.
              __proto__: null,
              value: function (e, n, o) {
                return this[r].call(this, t, e, n, o);
              },
              configurable: !0,
            });
          });
        })(n, e),
        (t[r] = !0));
    }
    return (W.isArray(e) ? e.forEach(r) : r(e), this);
  }
};
(ee.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization",
]),
  W.reduceDescriptors(ee.prototype, ({ value: e }, t) => {
    let n = t[0].toUpperCase() + t.slice(1);
    return {
      get: () => e,
      set(e) {
        this[n] = e;
      },
    };
  }),
  W.freezeMethods(ee));
function te(e, t) {
  const n = new Set(t.map((e) => String(e).toLowerCase())),
    r = [],
    o = (e) => {
      if (null === e || "object" != typeof e) return e;
      if (W.isBuffer(e)) return e;
      if (-1 !== r.indexOf(e)) return;
      let t;
      if ((e instanceof ee && (e = e.toJSON()), r.push(e), W.isArray(e)))
        ((t = []),
          e.forEach((e, n) => {
            const r = o(e);
            W.isUndefined(r) || (t[n] = r);
          }));
      else {
        if (
          !W.isPlainObject(e) &&
          (function (e) {
            if (W.hasOwnProp(e, "toJSON")) return !0;
            let t = Object.getPrototypeOf(e);
            for (; t && t !== Object.prototype; ) {
              if (W.hasOwnProp(t, "toJSON")) return !0;
              t = Object.getPrototypeOf(t);
            }
            return !1;
          })(e)
        )
          return (r.pop(), e);
        t = Object.create(null);
        for (const [r, s] of Object.entries(e)) {
          const e = n.has(r.toLowerCase()) ? "[REDACTED ****]" : o(s);
          W.isUndefined(e) || (t[r] = e);
        }
      }
      return (r.pop(), t);
    };
  return o(e);
}
let ne = class e extends Error {
  static from(t, n, r, o, s, i) {
    const a = new e(t.message, n || t.code, r, o, s);
    return (
      (a.cause = t),
      (a.name = t.name),
      null != t.status && null == a.status && (a.status = t.status),
      i && Object.assign(a, i),
      a
    );
  }
  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [config] The config.
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   *
   * @returns {Error} The created error.
   */ constructor(e, t, n, r, o) {
    (super(e),
      Object.defineProperty(this, "message", {
        // Null-proto descriptor so a polluted Object.prototype.get cannot turn
        // this data descriptor into an accessor descriptor on the way in.
        __proto__: null,
        value: e,
        enumerable: !0,
        writable: !0,
        configurable: !0,
      }),
      (this.name = "AxiosError"),
      (this.isAxiosError = !0),
      t && (this.code = t),
      n && (this.config = n),
      r && (this.request = r),
      o && ((this.response = o), (this.status = o.status)));
  }
  toJSON() {
    const e = this.config,
      t = e && W.hasOwnProp(e, "redact") ? e.redact : void 0,
      n = W.isArray(t) && t.length > 0 ? te(e, t) : W.toJSONObject(e);
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: n,
      code: this.code,
      status: this.status,
    };
  }
};
((ne.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE"),
  (ne.ERR_BAD_OPTION = "ERR_BAD_OPTION"),
  (ne.ECONNABORTED = "ECONNABORTED"),
  (ne.ETIMEDOUT = "ETIMEDOUT"),
  (ne.ECONNREFUSED = "ECONNREFUSED"),
  (ne.ERR_NETWORK = "ERR_NETWORK"),
  (ne.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS"),
  (ne.ERR_DEPRECATED = "ERR_DEPRECATED"),
  (ne.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE"),
  (ne.ERR_BAD_REQUEST = "ERR_BAD_REQUEST"),
  (ne.ERR_CANCELED = "ERR_CANCELED"),
  (ne.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT"),
  (ne.ERR_INVALID_URL = "ERR_INVALID_URL"),
  (ne.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED"));
function re(e) {
  return W.isPlainObject(e) || W.isArray(e);
}
function oe(e) {
  return W.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function se(e, t, n) {
  return e
    ? e
        .concat(t)
        .map(function (e, t) {
          return ((e = oe(e)), !n && t ? "[" + e + "]" : e);
        })
        .join(n ? "." : "")
    : t;
}
const ie = W.toFlatObject(W, {}, null, function (e) {
  return /^is[A-Z]/.test(e);
});
function ae(e, t, n) {
  if (!W.isObject(e)) throw new TypeError("target must be an object");
  t = t || new FormData();
  const r = (n = W.toFlatObject(n, { metaTokens: !0, dots: !1, indexes: !1 }, !1, function (e, t) {
      return !W.isUndefined(t[e]);
    })).metaTokens,
    o = n.visitor || f,
    s = n.dots,
    i = n.indexes,
    a = n.Blob || ("undefined" != typeof Blob && Blob),
    c = void 0 === n.maxDepth ? 100 : n.maxDepth,
    l = a && W.isSpecCompliantForm(t);
  if (!W.isFunction(o)) throw new TypeError("visitor must be a function");
  function u(e) {
    if (null === e) return "";
    if (W.isDate(e)) return e.toISOString();
    if (W.isBoolean(e)) return e.toString();
    if (!l && W.isBlob(e)) throw new ne("Blob is not supported. Use a Buffer instead.");
    return W.isArrayBuffer(e) || W.isTypedArray(e)
      ? l && "function" == typeof Blob
        ? new Blob([e])
        : Buffer.from(e)
      : e;
  }
  function f(e, n, o) {
    let a = e;
    if (W.isReactNative(t) && W.isReactNativeBlob(e)) return (t.append(se(o, n, s), u(e)), !1);
    if (e && !o && "object" == typeof e)
      if (W.endsWith(n, "{}")) ((n = r ? n : n.slice(0, -2)), (e = JSON.stringify(e)));
      else if (
        (W.isArray(e) &&
          (function (e) {
            return W.isArray(e) && !e.some(re);
          })(e)) ||
        ((W.isFileList(e) || W.endsWith(n, "[]")) && (a = W.toArray(e)))
      )
        return (
          (n = oe(n)),
          a.forEach(function (e, r) {
            !W.isUndefined(e) &&
              null !== e &&
              t.append(
                // eslint-disable-next-line no-nested-ternary
                !0 === i ? se([n], r, s) : null === i ? n : n + "[]",
                u(e)
              );
          }),
          !1
        );
    return !!re(e) || (t.append(se(o, n, s), u(e)), !1);
  }
  const d = [],
    p = Object.assign(ie, { defaultVisitor: f, convertValue: u, isVisitable: re });
  if (!W.isObject(e)) throw new TypeError("data must be an object");
  return (
    (function e(n, r, s = 0) {
      if (!W.isUndefined(n)) {
        if (s > c)
          throw new ne(
            "Object is too deeply nested (" + s + " levels). Max depth: " + c,
            ne.ERR_FORM_DATA_DEPTH_EXCEEDED
          );
        if (-1 !== d.indexOf(n)) throw Error("Circular reference detected in " + r.join("."));
        (d.push(n),
          W.forEach(n, function (n, i) {
            !0 ===
              (!(W.isUndefined(n) || null === n) &&
                o.call(t, n, W.isString(i) ? i.trim() : i, r, p)) &&
              e(n, r ? r.concat(i) : [i], s + 1);
          }),
          d.pop());
      }
    })(e),
    t
  );
}
function ce(e) {
  const t = { "!": "%21", "'": "%27", "(": "%28", ")": "%29", "~": "%7E", "%20": "+" };
  return encodeURIComponent(e).replace(/[!'()~]|%20/g, function (e) {
    return t[e];
  });
}
function le(e, t) {
  ((this._pairs = []), e && ae(e, this, t));
}
const ue = le.prototype;
function fe(e) {
  return encodeURIComponent(e)
    .replace(/%3A/gi, ":")
    .replace(/%24/g, "$")
    .replace(/%2C/gi, ",")
    .replace(/%20/g, "+");
}
function de(e, t, n) {
  if (!t) return e;
  const r = (n && n.encode) || fe,
    o = W.isFunction(n) ? { serialize: n } : n,
    s = o && o.serialize;
  let i;
  if (((i = s ? s(t, o) : W.isURLSearchParams(t) ? t.toString() : new le(t, o).toString(r)), i)) {
    const t = e.indexOf("#");
    (-1 !== t && (e = e.slice(0, t)), (e += (-1 === e.indexOf("?") ? "?" : "&") + i));
  }
  return e;
}
((ue.append = function (e, t) {
  this._pairs.push([e, t]);
}),
  (ue.toString = function (e) {
    const t = e
      ? function (t) {
          return e.call(this, t, ce);
        }
      : ce;
    return this._pairs
      .map(function (e) {
        return t(e[0]) + "=" + t(e[1]);
      }, "")
      .join("&");
  }));
class pe {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   * @param {Object} options The options for the interceptor, synchronous and runWhen
   *
   * @return {Number} An ID used to remove interceptor later
   */ use(e, t, n) {
    return (
      this.handlers.push({
        fulfilled: e,
        rejected: t,
        synchronous: !!n && n.synchronous,
        runWhen: n ? n.runWhen : null,
      }),
      this.handlers.length - 1
    );
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {void}
   */ eject(e) {
    this.handlers[e] && (this.handlers[e] = null);
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */ clear() {
    this.handlers && (this.handlers = []);
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */ forEach(e) {
    W.forEach(this.handlers, function (t) {
      null !== t && e(t);
    });
  }
}
const he = {
    silentJSONParsing: !0,
    forcedJSONParsing: !0,
    clarifyTimeoutError: !1,
    legacyInterceptorReqResOrdering: !0,
  },
  me = {
    isBrowser: !0,
    classes: {
      URLSearchParams: "undefined" != typeof URLSearchParams ? URLSearchParams : le,
      FormData: "undefined" != typeof FormData ? FormData : null,
      Blob: "undefined" != typeof Blob ? Blob : null,
    },
    protocols: ["http", "https", "file", "blob", "url", "data"],
  },
  be = "undefined" != typeof window && "undefined" != typeof document,
  ye = ("object" == typeof navigator && navigator) || void 0,
  ge = be && (!ye || ["ReactNative", "NativeScript", "NS"].indexOf(ye.product) < 0),
  we =
    "undefined" != typeof WorkerGlobalScope && // eslint-disable-next-line no-undef
    self instanceof WorkerGlobalScope &&
    "function" == typeof self.importScripts,
  Ee = (be && window.location.href) || "http://localhost",
  Oe = {
    ...Object.freeze(
      Object.defineProperty(
        {
          __proto__: null,
          hasBrowserEnv: be,
          hasStandardBrowserEnv: ge,
          hasStandardBrowserWebWorkerEnv: we,
          navigator: ye,
          origin: Ee,
        },
        Symbol.toStringTag,
        { value: "Module" }
      )
    ),
    ...me,
  };
function Re(e) {
  function t(e, n, r, o) {
    let s = e[o++];
    if ("__proto__" === s) return !0;
    const i = Number.isFinite(+s),
      a = o >= e.length;
    if (((s = !s && W.isArray(r) ? r.length : s), a))
      return (
        W.hasOwnProp(r, s) ? (r[s] = W.isArray(r[s]) ? r[s].concat(n) : [r[s], n]) : (r[s] = n),
        !i
      );
    (W.hasOwnProp(r, s) && W.isObject(r[s])) || (r[s] = []);
    return (
      t(e, n, r[s], o) &&
        W.isArray(r[s]) &&
        (r[s] = (function (e) {
          const t = {},
            n = Object.keys(e);
          let r;
          const o = n.length;
          let s;
          for (r = 0; r < o; r++) ((s = n[r]), (t[s] = e[s]));
          return t;
        })(r[s])),
      !i
    );
  }
  if (W.isFormData(e) && W.isFunction(e.entries)) {
    const n = {};
    return (
      W.forEachEntry(e, (e, r) => {
        t(
          (function (e) {
            return W.matchAll(/\w+|\[(\w*)]/g, e).map((e) => ("[]" === e[0] ? "" : e[1] || e[0]));
          })(e),
          r,
          n,
          0
        );
      }),
      n
    );
  }
  return null;
}
const Se = (e, t) => (null != e && W.hasOwnProp(e, t) ? e[t] : void 0);
const Ae = {
  transitional: he,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function (e, t) {
      const n = t.getContentType() || "",
        r = n.indexOf("application/json") > -1,
        o = W.isObject(e);
      o && W.isHTMLForm(e) && (e = new FormData(e));
      if (W.isFormData(e)) return r ? JSON.stringify(Re(e)) : e;
      if (
        W.isArrayBuffer(e) ||
        W.isBuffer(e) ||
        W.isStream(e) ||
        W.isFile(e) ||
        W.isBlob(e) ||
        W.isReadableStream(e)
      )
        return e;
      if (W.isArrayBufferView(e)) return e.buffer;
      if (W.isURLSearchParams(e))
        return (
          t.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1),
          e.toString()
        );
      let s;
      if (o) {
        const t = Se(this, "formSerializer");
        if (n.indexOf("application/x-www-form-urlencoded") > -1)
          return (function (e, t) {
            return ae(e, new Oe.classes.URLSearchParams(), {
              visitor: function (e, t, n, r) {
                return Oe.isNode && W.isBuffer(e)
                  ? (this.append(t, e.toString("base64")), !1)
                  : r.defaultVisitor.apply(this, arguments);
              },
              ...t,
            });
          })(e, t).toString();
        if ((s = W.isFileList(e)) || n.indexOf("multipart/form-data") > -1) {
          const n = Se(this, "env"),
            r = n && n.FormData;
          return ae(s ? { "files[]": e } : e, r && new r(), t);
        }
      }
      return o || r
        ? (t.setContentType("application/json", !1),
          (function (e, t, n) {
            if (W.isString(e))
              try {
                return ((t || JSON.parse)(e), W.trim(e));
              } catch (r) {
                if ("SyntaxError" !== r.name) throw r;
              }
            return (n || JSON.stringify)(e);
          })(e))
        : e;
    },
  ],
  transformResponse: [
    function (e) {
      const t = Se(this, "transitional") || Ae.transitional,
        n = t && t.forcedJSONParsing,
        r = Se(this, "responseType"),
        o = "json" === r;
      if (W.isResponse(e) || W.isReadableStream(e)) return e;
      if (e && W.isString(e) && ((n && !r) || o)) {
        const n = !(t && t.silentJSONParsing) && o;
        try {
          return JSON.parse(e, Se(this, "parseReviver"));
        } catch (s) {
          if (n) {
            if ("SyntaxError" === s.name)
              throw ne.from(s, ne.ERR_BAD_RESPONSE, this, null, Se(this, "response"));
            throw s;
          }
        }
      }
      return e;
    },
  ],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: { FormData: Oe.classes.FormData, Blob: Oe.classes.Blob },
  validateStatus: function (e) {
    return e >= 200 && e < 300;
  },
  headers: { common: { Accept: "application/json, text/plain, */*", "Content-Type": void 0 } },
};
function _e(e, t) {
  const n = this || Ae,
    r = t || n,
    o = ee.from(r.headers);
  let s = r.data;
  return (
    W.forEach(e, function (e) {
      s = e.call(n, s, o.normalize(), t ? t.status : void 0);
    }),
    o.normalize(),
    s
  );
}
function Te(e) {
  return !(!e || !e.__CANCEL__);
}
W.forEach(["delete", "get", "head", "post", "put", "patch", "query"], (e) => {
  Ae.headers[e] = {};
});
let Ce = class extends ne {
  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   *
   * @returns {CanceledError} The created error.
   */
  constructor(e, t, n) {
    (super(null == e ? "canceled" : e, ne.ERR_CANCELED, t, n),
      (this.name = "CanceledError"),
      (this.__CANCEL__ = !0));
  }
};
function ve(e, t, n) {
  const r = n.config.validateStatus;
  n.status && r && !r(n.status)
    ? t(
        new ne(
          "Request failed with status code " + n.status,
          n.status >= 400 && n.status < 500 ? ne.ERR_BAD_REQUEST : ne.ERR_BAD_RESPONSE,
          n.config,
          n.request,
          n
        )
      )
    : e(n);
}
const Pe = (e, t, n = 3) => {
    let r = 0;
    const o = (function (e, t) {
      e = e || 10;
      const n = new Array(e),
        r = new Array(e);
      let o,
        s = 0,
        i = 0;
      return (
        (t = void 0 !== t ? t : 1e3),
        function (a) {
          const c = Date.now(),
            l = r[i];
          (o || (o = c), (n[s] = a), (r[s] = c));
          let u = i,
            f = 0;
          for (; u !== s; ) ((f += n[u++]), (u %= e));
          if (((s = (s + 1) % e), s === i && (i = (i + 1) % e), c - o < t)) return;
          const d = l && c - l;
          return d ? Math.round((1e3 * f) / d) : void 0;
        }
      );
    })(50, 250);
    return (function (e, t) {
      let n,
        r,
        o = 0,
        s = 1e3 / t;
      const i = (t, s = Date.now()) => {
        ((o = s), (n = null), r && (clearTimeout(r), (r = null)), e(...t));
      };
      return [
        (...e) => {
          const t = Date.now(),
            a = t - o;
          a >= s
            ? i(e, t)
            : ((n = e),
              r ||
                (r = setTimeout(() => {
                  ((r = null), i(n));
                }, s - a)));
        },
        () => n && i(n),
      ];
    })((n) => {
      if (!n || "number" != typeof n.loaded) return;
      const s = n.loaded,
        i = n.lengthComputable ? n.total : void 0,
        a = null != i ? Math.min(s, i) : s,
        c = Math.max(0, a - r),
        l = o(c);
      r = Math.max(r, a);
      e({
        loaded: a,
        total: i,
        progress: i ? a / i : void 0,
        bytes: c,
        rate: l || void 0,
        estimated: l && i ? (i - a) / l : void 0,
        event: n,
        lengthComputable: null != i,
        [t ? "download" : "upload"]: !0,
      });
    }, n);
  },
  xe = (e, t) => {
    const n = null != e;
    return [(r) => t[0]({ lengthComputable: n, total: e, loaded: r }), t[1]];
  },
  Ne =
    (e) =>
    (...t) =>
      W.asap(() => e(...t)),
  je = Oe.hasStandardBrowserEnv
    ? ((e, t) => (n) => (
        (n = new URL(n, Oe.origin)),
        e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)
      ))(new URL(Oe.origin), Oe.navigator && /(msie|trident)/i.test(Oe.navigator.userAgent))
    : () => !0,
  De = Oe.hasStandardBrowserEnv
    ? // Standard browser envs support document.cookie
      {
        write(e, t, n, r, o, s, i) {
          if ("undefined" == typeof document) return;
          const a = [`${e}=${encodeURIComponent(t)}`];
          (W.isNumber(n) && a.push(`expires=${new Date(n).toUTCString()}`),
            W.isString(r) && a.push(`path=${r}`),
            W.isString(o) && a.push(`domain=${o}`),
            !0 === s && a.push("secure"),
            W.isString(i) && a.push(`SameSite=${i}`),
            (document.cookie = a.join("; ")));
        },
        read(e) {
          if ("undefined" == typeof document) return null;
          const t = document.cookie.split(";");
          for (let n = 0; n < t.length; n++) {
            const r = t[n].replace(/^\s+/, ""),
              o = r.indexOf("=");
            if (-1 !== o && r.slice(0, o) === e) return decodeURIComponent(r.slice(o + 1));
          }
          return null;
        },
        remove(e) {
          this.write(e, "", Date.now() - 864e5, "/");
        },
      }
    : // Non-standard browser env (web workers, react-native) lack needed support.
      { write() {}, read: () => null, remove() {} };
function Ue(e, t, n) {
  let r = !("string" == typeof (o = t) && /^([a-z][a-z\d+\-.]*:)?\/\//i.test(o));
  var o;
  return e && (r || !1 === n)
    ? (function (e, t) {
        return t ? e.replace(/\/?\/$/, "") + "/" + t.replace(/^\/+/, "") : e;
      })(e, t)
    : t;
}
const Le = (e) => (e instanceof ee ? { ...e } : e);
function Fe(e, t) {
  t = t || {};
  const n = Object.create(null);
  function r(e, t, n, r) {
    return W.isPlainObject(e) && W.isPlainObject(t)
      ? W.merge.call({ caseless: r }, e, t)
      : W.isPlainObject(t)
        ? W.merge({}, t)
        : W.isArray(t)
          ? t.slice()
          : t;
  }
  function o(e, t, n, o) {
    return W.isUndefined(t) ? (W.isUndefined(e) ? void 0 : r(void 0, e, 0, o)) : r(e, t, 0, o);
  }
  function s(e, t) {
    if (!W.isUndefined(t)) return r(void 0, t);
  }
  function i(e, t) {
    return W.isUndefined(t) ? (W.isUndefined(e) ? void 0 : r(void 0, e)) : r(void 0, t);
  }
  function a(n, o, s) {
    return W.hasOwnProp(t, s) ? r(n, o) : W.hasOwnProp(e, s) ? r(void 0, n) : void 0;
  }
  Object.defineProperty(n, "hasOwnProperty", {
    // Null-proto descriptor so a polluted Object.prototype.get cannot turn
    // this data descriptor into an accessor descriptor on the way in.
    __proto__: null,
    value: Object.prototype.hasOwnProperty,
    enumerable: !1,
    writable: !0,
    configurable: !0,
  });
  const c = {
    url: s,
    method: s,
    data: s,
    baseURL: i,
    transformRequest: i,
    transformResponse: i,
    paramsSerializer: i,
    timeout: i,
    timeoutMessage: i,
    withCredentials: i,
    withXSRFToken: i,
    adapter: i,
    responseType: i,
    xsrfCookieName: i,
    xsrfHeaderName: i,
    onUploadProgress: i,
    onDownloadProgress: i,
    decompress: i,
    maxContentLength: i,
    maxBodyLength: i,
    beforeRedirect: i,
    transport: i,
    httpAgent: i,
    httpsAgent: i,
    cancelToken: i,
    socketPath: i,
    allowedSocketPaths: i,
    responseEncoding: i,
    validateStatus: a,
    headers: (e, t, n) => o(Le(e), Le(t), 0, !0),
  };
  return (
    W.forEach(Object.keys({ ...e, ...t }), function (r) {
      if ("__proto__" === r || "constructor" === r || "prototype" === r) return;
      const s = W.hasOwnProp(c, r) ? c[r] : o,
        i = s(W.hasOwnProp(e, r) ? e[r] : void 0, W.hasOwnProp(t, r) ? t[r] : void 0, r);
      (W.isUndefined(i) && s !== a) || (n[r] = i);
    }),
    n
  );
}
const Be = ["content-type", "content-length"];
const ke = (e) => {
    const t = Fe({}, e),
      n = (e) => (W.hasOwnProp(t, e) ? t[e] : void 0),
      r = n("data");
    let o = n("withXSRFToken");
    const s = n("xsrfHeaderName"),
      i = n("xsrfCookieName");
    let a = n("headers");
    const c = n("auth"),
      l = n("baseURL"),
      u = n("allowAbsoluteUrls"),
      f = n("url");
    var d;
    if (
      ((t.headers = a = ee.from(a)),
      (t.url = de(Ue(l, f, u), e.params, e.paramsSerializer)),
      c &&
        a.set(
          "Authorization",
          "Basic " +
            btoa(
              (c.username || "") +
                ":" +
                (c.password
                  ? ((d = c.password),
                    encodeURIComponent(d).replace(/%([0-9A-F]{2})/gi, (e, t) =>
                      String.fromCharCode(parseInt(t, 16))
                    ))
                  : "")
            )
        ),
      W.isFormData(r) &&
        (Oe.hasStandardBrowserEnv || Oe.hasStandardBrowserWebWorkerEnv
          ? a.setContentType(void 0)
          : W.isFunction(r.getHeaders) &&
            (function (e, t, n) {
              "content-only" === n
                ? Object.entries(t).forEach(([t, n]) => {
                    Be.includes(t.toLowerCase()) && e.set(t, n);
                  })
                : e.set(t);
            })(a, r.getHeaders(), n("formDataHeaderPolicy"))),
      Oe.hasStandardBrowserEnv)
    ) {
      W.isFunction(o) && (o = o(t));
      if (!0 === o || (null == o && je(t.url))) {
        const e = s && i && De.read(i);
        e && a.set(s, e);
      }
    }
    return t;
  },
  qe =
    "undefined" != typeof XMLHttpRequest &&
    function (e) {
      return new Promise(function (t, n) {
        const r = ke(e);
        let o = r.data;
        const s = ee.from(r.headers).normalize();
        let i,
          a,
          c,
          l,
          u,
          { responseType: f, onUploadProgress: d, onDownloadProgress: p } = r;
        function h() {
          (l && l(),
            u && u(),
            r.cancelToken && r.cancelToken.unsubscribe(i),
            r.signal && r.signal.removeEventListener("abort", i));
        }
        let m = new XMLHttpRequest();
        function b() {
          if (!m) return;
          const r = ee.from("getAllResponseHeaders" in m && m.getAllResponseHeaders());
          (ve(
            function (e) {
              (t(e), h());
            },
            function (e) {
              (n(e), h());
            },
            {
              data: f && "text" !== f && "json" !== f ? m.response : m.responseText,
              status: m.status,
              statusText: m.statusText,
              headers: r,
              config: e,
              request: m,
            }
          ),
            (m = null));
        }
        (m.open(r.method.toUpperCase(), r.url, !0),
          (m.timeout = r.timeout),
          "onloadend" in m
            ? (m.onloadend = b)
            : (m.onreadystatechange = function () {
                m &&
                  4 === m.readyState &&
                  (0 !== m.status || (m.responseURL && m.responseURL.startsWith("file:"))) &&
                  setTimeout(b);
              }),
          (m.onabort = function () {
            m && (n(new ne("Request aborted", ne.ECONNABORTED, e, m)), h(), (m = null));
          }),
          (m.onerror = function (t) {
            const r = t && t.message ? t.message : "Network Error",
              o = new ne(r, ne.ERR_NETWORK, e, m);
            ((o.event = t || null), n(o), h(), (m = null));
          }),
          (m.ontimeout = function () {
            let t = r.timeout ? "timeout of " + r.timeout + "ms exceeded" : "timeout exceeded";
            const o = r.transitional || he;
            (r.timeoutErrorMessage && (t = r.timeoutErrorMessage),
              n(new ne(t, o.clarifyTimeoutError ? ne.ETIMEDOUT : ne.ECONNABORTED, e, m)),
              h(),
              (m = null));
          }),
          void 0 === o && s.setContentType(null),
          "setRequestHeader" in m &&
            W.forEach(X(s), function (e, t) {
              m.setRequestHeader(t, e);
            }),
          W.isUndefined(r.withCredentials) || (m.withCredentials = !!r.withCredentials),
          f && "json" !== f && (m.responseType = r.responseType),
          p && (([c, u] = Pe(p, !0)), m.addEventListener("progress", c)),
          d &&
            m.upload &&
            (([a, l] = Pe(d)),
            m.upload.addEventListener("progress", a),
            m.upload.addEventListener("loadend", l)),
          (r.cancelToken || r.signal) &&
            ((i = (t) => {
              m && (n(!t || t.type ? new Ce(null, e, m) : t), m.abort(), h(), (m = null));
            }),
            r.cancelToken && r.cancelToken.subscribe(i),
            r.signal && (r.signal.aborted ? i() : r.signal.addEventListener("abort", i))));
        const y = (function (e) {
          const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
          return (t && t[1]) || "";
        })(r.url);
        !y || Oe.protocols.includes(y)
          ? m.send(o || null)
          : n(new ne("Unsupported protocol " + y + ":", ne.ERR_BAD_REQUEST, e));
      });
    },
  Ie = (e, t) => {
    if (((e = e ? e.filter(Boolean) : []), !t && !e.length)) return;
    const n = new AbortController();
    let r = !1;
    const o = function (e) {
      if (!r) {
        ((r = !0), i());
        const t = e instanceof Error ? e : this.reason;
        n.abort(t instanceof ne ? t : new Ce(t instanceof Error ? t.message : t));
      }
    };
    let s =
      t &&
      setTimeout(() => {
        ((s = null), o(new ne(`timeout of ${t}ms exceeded`, ne.ETIMEDOUT)));
      }, t);
    const i = () => {
      e &&
        (s && clearTimeout(s),
        (s = null),
        e.forEach((e) => {
          e.unsubscribe ? e.unsubscribe(o) : e.removeEventListener("abort", o);
        }),
        (e = null));
    };
    e.forEach((e) => e.addEventListener("abort", o));
    const { signal: a } = n;
    return ((a.unsubscribe = () => W.asap(i)), a);
  },
  Me = function* (e, t) {
    let n = e.byteLength;
    if (n < t) return void (yield e);
    let r,
      o = 0;
    for (; o < n; ) ((r = o + t), yield e.slice(o, r), (o = r));
  },
  ze = async function* (e) {
    if (e[Symbol.asyncIterator]) return void (yield* e);
    const t = e.getReader();
    try {
      for (;;) {
        const { done: e, value: n } = await t.read();
        if (e) break;
        yield n;
      }
    } finally {
      await t.cancel();
    }
  },
  He = (e, t, n, r) => {
    const o = (async function* (e, t) {
      for await (const n of ze(e)) yield* Me(n, t);
    })(e, t);
    let s,
      i = 0,
      a = (e) => {
        s || ((s = !0), r && r(e));
      };
    return new ReadableStream(
      {
        async pull(e) {
          try {
            const { done: t, value: r } = await o.next();
            if (t) return (a(), void e.close());
            let s = r.byteLength;
            if (n) {
              let e = (i += s);
              n(e);
            }
            e.enqueue(new Uint8Array(r));
          } catch (t) {
            throw (a(t), t);
          }
        },
        cancel: (e) => (a(e), o.return()),
      },
      { highWaterMark: 2 }
    );
  };
const We = "1.16.1",
  { isFunction: Je } = W,
  Ve = (e, ...t) => {
    try {
      return !!e(...t);
    } catch (n) {
      return !1;
    }
  },
  Ke = (e) => {
    const t = void 0 !== W.global && null !== W.global ? W.global : globalThis,
      { ReadableStream: n, TextEncoder: r } = t;
    e = W.merge.call({ skipUndefined: !0 }, { Request: t.Request, Response: t.Response }, e);
    const { fetch: o, Request: s, Response: i } = e,
      a = o ? Je(o) : "function" == typeof fetch,
      c = Je(s),
      l = Je(i);
    if (!a) return !1;
    const u = a && Je(n),
      f =
        a &&
        ("function" == typeof r
          ? (
              (e) => (t) =>
                e.encode(t)
            )(new r())
          : async (e) => new Uint8Array(await new s(e).arrayBuffer())),
      d =
        c &&
        u &&
        Ve(() => {
          let e = !1;
          const t = new s(Oe.origin, {
              body: new n(),
              method: "POST",
              get duplex() {
                return ((e = !0), "half");
              },
            }),
            r = t.headers.has("Content-Type");
          return (null != t.body && t.body.cancel(), e && !r);
        }),
      p = l && u && Ve(() => W.isReadableStream(new i("").body)),
      h = { stream: p && ((e) => e.body) };
    a &&
      ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((e) => {
        !h[e] &&
          (h[e] = (t, n) => {
            let r = t && t[e];
            if (r) return r.call(t);
            throw new ne(`Response type '${e}' is not supported`, ne.ERR_NOT_SUPPORT, n);
          });
      });
    const m = async (e, t) => {
      const n = W.toFiniteNumber(e.getContentLength());
      return null == n
        ? (async (e) => {
            if (null == e) return 0;
            if (W.isBlob(e)) return e.size;
            if (W.isSpecCompliantForm(e)) {
              const t = new s(Oe.origin, { method: "POST", body: e });
              return (await t.arrayBuffer()).byteLength;
            }
            return W.isArrayBufferView(e) || W.isArrayBuffer(e)
              ? e.byteLength
              : (W.isURLSearchParams(e) && (e += ""),
                W.isString(e) ? (await f(e)).byteLength : void 0);
          })(t)
        : n;
    };
    return async (e) => {
      let {
        url: t,
        method: n,
        data: a,
        signal: l,
        cancelToken: u,
        timeout: f,
        onDownloadProgress: b,
        onUploadProgress: y,
        responseType: g,
        headers: w,
        withCredentials: E = "same-origin",
        fetchOptions: O,
        maxContentLength: R,
        maxBodyLength: S,
      } = ke(e);
      const A = W.isNumber(R) && R > -1,
        _ = W.isNumber(S) && S > -1;
      let T = o || fetch;
      g = g ? (g + "").toLowerCase() : "text";
      let C = Ie([l, u && u.toAbortSignal()], f),
        v = null;
      const P =
        C &&
        C.unsubscribe &&
        (() => {
          C.unsubscribe();
        });
      let x;
      try {
        if (A && "string" == typeof t && t.startsWith("data:")) {
          const n = (function (e) {
            if (!e || "string" != typeof e) return 0;
            if (!e.startsWith("data:")) return 0;
            const t = e.indexOf(",");
            if (t < 0) return 0;
            const n = e.slice(5, t),
              r = e.slice(t + 1);
            if (/;base64/i.test(n)) {
              let e = r.length;
              const t = r.length;
              for (let a = 0; a < t; a++)
                if (37 === r.charCodeAt(a) && a + 2 < t) {
                  const t = r.charCodeAt(a + 1),
                    n = r.charCodeAt(a + 2);
                  ((t >= 48 && t <= 57) || (t >= 65 && t <= 70) || (t >= 97 && t <= 102)) &&
                    ((n >= 48 && n <= 57) || (n >= 65 && n <= 70) || (n >= 97 && n <= 102)) &&
                    ((e -= 2), (a += 2));
                }
              let n = 0,
                o = t - 1;
              const s = (e) =>
                e >= 2 &&
                37 === r.charCodeAt(e - 2) && // '%'
                51 === r.charCodeAt(e - 1) && // '3'
                (68 === r.charCodeAt(e) || 100 === r.charCodeAt(e));
              (o >= 0 && (61 === r.charCodeAt(o) ? (n++, o--) : s(o) && (n++, (o -= 3))),
                1 === n && o >= 0 && (61 === r.charCodeAt(o) || s(o)) && n++);
              const i = 3 * Math.floor(e / 4) - (n || 0);
              return i > 0 ? i : 0;
            }
            if ("undefined" != typeof Buffer && "function" == typeof Buffer.byteLength)
              return Buffer.byteLength(r, "utf8");
            let o = 0;
            for (let s = 0, i = r.length; s < i; s++) {
              const e = r.charCodeAt(s);
              if (e < 128) o += 1;
              else if (e < 2048) o += 2;
              else if (e >= 55296 && e <= 56319 && s + 1 < i) {
                const e = r.charCodeAt(s + 1);
                e >= 56320 && e <= 57343 ? ((o += 4), s++) : (o += 3);
              } else o += 3;
            }
            return o;
          })(t);
          if (n > R)
            throw new ne("maxContentLength size of " + R + " exceeded", ne.ERR_BAD_RESPONSE, e, v);
        }
        if (_ && "get" !== n && "head" !== n) {
          const t = await m(w, a);
          if ("number" == typeof t && isFinite(t) && t > S)
            throw new ne("Request body larger than maxBodyLength limit", ne.ERR_BAD_REQUEST, e, v);
        }
        if (y && d && "get" !== n && "head" !== n && 0 !== (x = await m(w, a))) {
          let e,
            n = new s(t, { method: "POST", body: a, duplex: "half" });
          if (
            (W.isFormData(a) && (e = n.headers.get("content-type")) && w.setContentType(e), n.body)
          ) {
            const [e, t] = xe(x, Pe(Ne(y)));
            a = He(n.body, 65536, e, t);
          }
        }
        W.isString(E) || (E = E ? "include" : "omit");
        const o = c && "credentials" in s.prototype;
        if (W.isFormData(a)) {
          const e = w.getContentType();
          e &&
            /^multipart\/form-data/i.test(e) &&
            !/boundary=/i.test(e) &&
            w.delete("content-type");
        }
        w.set("User-Agent", "axios/" + We, !1);
        const l = {
          ...O,
          signal: C,
          method: n.toUpperCase(),
          headers: X(w.normalize()),
          body: a,
          duplex: "half",
          credentials: o ? E : void 0,
        };
        v = c && new s(t, l);
        let u = await (c ? T(v, O) : T(t, l));
        if (A) {
          const t = W.toFiniteNumber(u.headers.get("content-length"));
          if (null != t && t > R)
            throw new ne("maxContentLength size of " + R + " exceeded", ne.ERR_BAD_RESPONSE, e, v);
        }
        const f = p && ("stream" === g || "response" === g);
        if (p && u.body && (b || A || (f && P))) {
          const t = {};
          ["status", "statusText", "headers"].forEach((e) => {
            t[e] = u[e];
          });
          const n = W.toFiniteNumber(u.headers.get("content-length")),
            [r, o] = (b && xe(n, Pe(Ne(b), !0))) || [];
          let s = 0;
          const a = (t) => {
            if (A && ((s = t), s > R))
              throw new ne(
                "maxContentLength size of " + R + " exceeded",
                ne.ERR_BAD_RESPONSE,
                e,
                v
              );
            r && r(t);
          };
          u = new i(
            He(u.body, 65536, a, () => {
              (o && o(), P && P());
            }),
            t
          );
        }
        g = g || "text";
        let N = await h[W.findKey(h, g) || "text"](u, e);
        if (A && !p && !f) {
          let t;
          if (
            (null != N &&
              ("number" == typeof N.byteLength
                ? (t = N.byteLength)
                : "number" == typeof N.size
                  ? (t = N.size)
                  : "string" == typeof N &&
                    (t = "function" == typeof r ? new r().encode(N).byteLength : N.length)),
            "number" == typeof t && t > R)
          )
            throw new ne("maxContentLength size of " + R + " exceeded", ne.ERR_BAD_RESPONSE, e, v);
        }
        return (
          !f && P && P(),
          await new Promise((t, n) => {
            ve(t, n, {
              data: N,
              headers: ee.from(u.headers),
              status: u.status,
              statusText: u.statusText,
              config: e,
              request: v,
            });
          })
        );
      } catch (N) {
        if ((P && P(), C && C.aborted && C.reason instanceof ne)) {
          const t = C.reason;
          throw ((t.config = e), v && (t.request = v), N !== t && (t.cause = N), t);
        }
        if (N && "TypeError" === N.name && /Load failed|fetch/i.test(N.message))
          throw Object.assign(new ne("Network Error", ne.ERR_NETWORK, e, v, N && N.response), {
            cause: N.cause || N,
          });
        throw ne.from(N, N && N.code, e, v, N && N.response);
      }
    };
  },
  $e = new Map(),
  Xe = (e) => {
    let t = (e && e.env) || {};
    const { fetch: n, Request: r, Response: o } = t,
      s = [r, o, n];
    let i,
      a,
      c = s.length,
      l = $e;
    for (; c--; )
      ((i = s[c]), (a = l.get(i)), void 0 === a && l.set(i, (a = c ? new Map() : Ke(t))), (l = a));
    return a;
  };
Xe();
const Ge = { http: null, xhr: qe, fetch: { get: Xe } };
W.forEach(Ge, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch (n) {}
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const Qe = (e) => `- ${e}`,
  Ye = (e) => W.isFunction(e) || null === e || !1 === e;
const Ze = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: function (e, t) {
    e = W.isArray(e) ? e : [e];
    const { length: n } = e;
    let r, o;
    const s = {};
    for (let i = 0; i < n; i++) {
      let n;
      if (((r = e[i]), (o = r), !Ye(r) && ((o = Ge[(n = String(r)).toLowerCase()]), void 0 === o)))
        throw new ne(`Unknown adapter '${n}'`);
      if (o && (W.isFunction(o) || (o = o.get(t)))) break;
      s[n || "#" + i] = o;
    }
    if (!o) {
      const e = Object.entries(s).map(
        ([e, t]) =>
          `adapter ${e} ` +
          (!1 === t ? "is not supported by the environment" : "is not available in the build")
      );
      let t = n
        ? e.length > 1
          ? "since :\n" + e.map(Qe).join("\n")
          : " " + Qe(e[0])
        : "as no adapter specified";
      throw new ne("There is no suitable adapter to dispatch the request " + t, "ERR_NOT_SUPPORT");
    }
    return o;
  },
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: Ge,
};
function et(e) {
  if ((e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted))
    throw new Ce(null, e);
}
function tt(e) {
  (et(e),
    (e.headers = ee.from(e.headers)),
    (e.data = _e.call(e, e.transformRequest)),
    -1 !== ["post", "put", "patch"].indexOf(e.method) &&
      e.headers.setContentType("application/x-www-form-urlencoded", !1));
  return Ze.getAdapter(
    e.adapter || Ae.adapter,
    e
  )(e).then(
    function (t) {
      (et(e), (e.response = t));
      try {
        t.data = _e.call(e, e.transformResponse, t);
      } finally {
        delete e.response;
      }
      return ((t.headers = ee.from(t.headers)), t);
    },
    function (t) {
      if (!Te(t) && (et(e), t && t.response)) {
        e.response = t.response;
        try {
          t.response.data = _e.call(e, e.transformResponse, t.response);
        } finally {
          delete e.response;
        }
        t.response.headers = ee.from(t.response.headers);
      }
      return Promise.reject(t);
    }
  );
}
const nt = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  nt[e] = function (n) {
    return typeof n === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const rt = {};
((nt.transitional = function (e, t, n) {
  return (r, o, s) => {
    if (!1 === e)
      throw new ne(
        (function (e, t) {
          return "[Axios v" + We + "] Transitional option '" + e + "'" + t + (n ? ". " + n : "");
        })(o, " has been removed" + (t ? " in " + t : "")),
        ne.ERR_DEPRECATED
      );
    return (t && !rt[o] && (rt[o] = !0), !e || e(r, o, s));
  };
}),
  (nt.spelling = function (e) {
    return (e, t) => !0;
  }));
const ot = {
    assertOptions: function (e, t, n) {
      if ("object" != typeof e) throw new ne("options must be an object", ne.ERR_BAD_OPTION_VALUE);
      const r = Object.keys(e);
      let o = r.length;
      for (; o-- > 0; ) {
        const s = r[o],
          i = Object.prototype.hasOwnProperty.call(t, s) ? t[s] : void 0;
        if (i) {
          const t = e[s],
            n = void 0 === t || i(t, s, e);
          if (!0 !== n) throw new ne("option " + s + " must be " + n, ne.ERR_BAD_OPTION_VALUE);
          continue;
        }
        if (!0 !== n) throw new ne("Unknown option " + s, ne.ERR_BAD_OPTION);
      }
    },
    validators: nt,
  },
  st = ot.validators;
let it = class {
  constructor(e) {
    ((this.defaults = e || {}), (this.interceptors = { request: new pe(), response: new pe() }));
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */ async request(e, t) {
    try {
      return await this._request(e, t);
    } catch (n) {
      if (n instanceof Error) {
        let e = {};
        Error.captureStackTrace ? Error.captureStackTrace(e) : (e = new Error());
        const t = (() => {
          if (!e.stack) return "";
          const t = e.stack.indexOf("\n");
          return -1 === t ? "" : e.stack.slice(t + 1);
        })();
        try {
          if (n.stack) {
            if (t) {
              const e = t.indexOf("\n"),
                r = -1 === e ? -1 : t.indexOf("\n", e + 1),
                o = -1 === r ? "" : t.slice(r + 1);
              String(n.stack).endsWith(o) || (n.stack += "\n" + t);
            }
          } else n.stack = t;
        } catch (r) {}
      }
      throw n;
    }
  }
  _request(e, t) {
    ("string" == typeof e ? ((t = t || {}).url = e) : (t = e || {}), (t = Fe(this.defaults, t)));
    const { transitional: n, paramsSerializer: r, headers: o } = t;
    (void 0 !== n &&
      ot.assertOptions(
        n,
        {
          silentJSONParsing: st.transitional(st.boolean),
          forcedJSONParsing: st.transitional(st.boolean),
          clarifyTimeoutError: st.transitional(st.boolean),
          legacyInterceptorReqResOrdering: st.transitional(st.boolean),
        },
        !1
      ),
      null != r &&
        (W.isFunction(r)
          ? (t.paramsSerializer = { serialize: r })
          : ot.assertOptions(r, { encode: st.function, serialize: st.function }, !0)),
      void 0 !== t.allowAbsoluteUrls ||
        (void 0 !== this.defaults.allowAbsoluteUrls
          ? (t.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls)
          : (t.allowAbsoluteUrls = !0)),
      ot.assertOptions(
        t,
        { baseUrl: st.spelling("baseURL"), withXsrfToken: st.spelling("withXSRFToken") },
        !0
      ),
      (t.method = (t.method || this.defaults.method || "get").toLowerCase()));
    let s = o && W.merge(o.common, o[t.method]);
    (o &&
      W.forEach(["delete", "get", "head", "post", "put", "patch", "query", "common"], (e) => {
        delete o[e];
      }),
      (t.headers = ee.concat(s, o)));
    const i = [];
    let a = !0;
    this.interceptors.request.forEach(function (e) {
      if ("function" == typeof e.runWhen && !1 === e.runWhen(t)) return;
      a = a && e.synchronous;
      const n = t.transitional || he;
      n && n.legacyInterceptorReqResOrdering
        ? i.unshift(e.fulfilled, e.rejected)
        : i.push(e.fulfilled, e.rejected);
    });
    const c = [];
    let l;
    this.interceptors.response.forEach(function (e) {
      c.push(e.fulfilled, e.rejected);
    });
    let u,
      f = 0;
    if (!a) {
      const e = [tt.bind(this), void 0];
      for (e.unshift(...i), e.push(...c), u = e.length, l = Promise.resolve(t); f < u; )
        l = l.then(e[f++], e[f++]);
      return l;
    }
    u = i.length;
    let d = t;
    for (; f < u; ) {
      const e = i[f++],
        t = i[f++];
      try {
        d = e(d);
      } catch (p) {
        t.call(this, p);
        break;
      }
    }
    try {
      l = tt.call(this, d);
    } catch (p) {
      return Promise.reject(p);
    }
    for (f = 0, u = c.length; f < u; ) l = l.then(c[f++], c[f++]);
    return l;
  }
  getUri(e) {
    return de(
      Ue((e = Fe(this.defaults, e)).baseURL, e.url, e.allowAbsoluteUrls),
      e.params,
      e.paramsSerializer
    );
  }
};
(W.forEach(["delete", "get", "head", "options"], function (e) {
  it.prototype[e] = function (t, n) {
    return this.request(Fe(n || {}, { method: e, url: t, data: (n || {}).data }));
  };
}),
  W.forEach(["post", "put", "patch", "query"], function (e) {
    function t(t) {
      return function (n, r, o) {
        return this.request(
          Fe(o || {}, {
            method: e,
            headers: t ? { "Content-Type": "multipart/form-data" } : {},
            url: n,
            data: r,
          })
        );
      };
    }
    ((it.prototype[e] = t()), "query" !== e && (it.prototype[e + "Form"] = t(!0)));
  }));
const at = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
  WebServerIsDown: 521,
  ConnectionTimedOut: 522,
  OriginIsUnreachable: 523,
  TimeoutOccurred: 524,
  SslHandshakeFailed: 525,
  InvalidSslCertificate: 526,
};
Object.entries(at).forEach(([e, t]) => {
  at[t] = e;
});
const ct = (function t(n) {
  const r = new it(n),
    o = e(it.prototype.request, r);
  return (
    W.extend(o, it.prototype, r, { allOwnKeys: !0 }),
    W.extend(o, r, null, { allOwnKeys: !0 }),
    (o.create = function (e) {
      return t(Fe(n, e));
    }),
    o
  );
})(Ae);
((ct.Axios = it),
  (ct.CanceledError = Ce),
  (ct.CancelToken = class e {
    constructor(e) {
      if ("function" != typeof e) throw new TypeError("executor must be a function.");
      let t;
      this.promise = new Promise(function (e) {
        t = e;
      });
      const n = this;
      (this.promise.then((e) => {
        if (!n._listeners) return;
        let t = n._listeners.length;
        for (; t-- > 0; ) n._listeners[t](e);
        n._listeners = null;
      }),
        (this.promise.then = (e) => {
          let t;
          const r = new Promise((e) => {
            (n.subscribe(e), (t = e));
          }).then(e);
          return (
            (r.cancel = function () {
              n.unsubscribe(t);
            }),
            r
          );
        }),
        e(function (e, r, o) {
          n.reason || ((n.reason = new Ce(e, r, o)), t(n.reason));
        }));
    }
    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */ throwIfRequested() {
      if (this.reason) throw this.reason;
    }
    /**
     * Subscribe to the cancel signal
     */ subscribe(e) {
      this.reason
        ? e(this.reason)
        : this._listeners
          ? this._listeners.push(e)
          : (this._listeners = [e]);
    }
    /**
     * Unsubscribe from the cancel signal
     */ unsubscribe(e) {
      if (!this._listeners) return;
      const t = this._listeners.indexOf(e);
      -1 !== t && this._listeners.splice(t, 1);
    }
    toAbortSignal() {
      const e = new AbortController(),
        t = (t) => {
          e.abort(t);
        };
      return (this.subscribe(t), (e.signal.unsubscribe = () => this.unsubscribe(t)), e.signal);
    }
    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */ static source() {
      let t;
      return {
        token: new e(function (e) {
          t = e;
        }),
        cancel: t,
      };
    }
  }),
  (ct.isCancel = Te),
  (ct.VERSION = We),
  (ct.toFormData = ae),
  (ct.AxiosError = ne),
  (ct.Cancel = ct.CanceledError),
  (ct.all = function (e) {
    return Promise.all(e);
  }),
  (ct.spread = function (e) {
    return function (t) {
      return e.apply(null, t);
    };
  }),
  (ct.isAxiosError = function (e) {
    return W.isObject(e) && !0 === e.isAxiosError;
  }),
  (ct.mergeConfig = Fe),
  (ct.AxiosHeaders = ee),
  (ct.formToJSON = (e) => Re(W.isHTMLForm(e) ? new FormData(e) : e)),
  (ct.getAdapter = Ze.getAdapter),
  (ct.HttpStatusCode = at),
  (ct.default = ct));
const {
  Axios: lt,
  AxiosError: ut,
  CanceledError: ft,
  isCancel: dt,
  CancelToken: pt,
  VERSION: ht,
  all: mt,
  Cancel: bt,
  isAxiosError: yt,
  spread: gt,
  toFormData: wt,
  AxiosHeaders: Et,
  HttpStatusCode: Ot,
  formToJSON: Rt,
  getAdapter: St,
  mergeConfig: At,
  create: _t,
} = ct;
export { ct as a };
