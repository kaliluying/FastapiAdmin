import {
  r as e,
  y as t,
  B as n,
  a as o,
  q as r,
  z as s,
  t as i,
  T as a,
  p as l,
  h as c,
  E as u,
  c as f,
  g as d,
  k as p,
  o as h,
  i as m,
  x as g,
  d as v,
  e as _,
  w as y,
  u as b,
  A as w,
  P as E,
  m as S,
  N as k,
  l as x,
  s as O,
  R as T,
  C as A,
  I as C,
  S as R,
  M as I,
  G as N,
  j as P,
  H as F,
  F as L,
  v as M,
  K as D,
  L as j,
  J as $,
  n as V,
  Q as U,
  b as B,
  D as H,
  f as W,
  O as z,
} from "./@intlify.CbtlSmdZ.js";
// @__NO_SIDE_EFFECTS__
function G(e) {
  const t = Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (e) => e in t;
}
const q = {},
  Y = [],
  K = () => {},
  J = () => !1,
  Q = (e) =>
    111 === e.charCodeAt(0) &&
    110 === e.charCodeAt(1) && // uppercase letter
    (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97),
  X = (e) => e.startsWith("onUpdate:"),
  Z = Object.assign,
  ee = (e, t) => {
    const n = e.indexOf(t);
    n > -1 && e.splice(n, 1);
  },
  te = Object.prototype.hasOwnProperty,
  ne = (e, t) => te.call(e, t),
  oe = Array.isArray,
  re = (e) => "[object Map]" === pe(e),
  se = (e) => "[object Set]" === pe(e),
  ie = (e) => "[object Date]" === pe(e),
  ae = (e) => "function" == typeof e,
  le = (e) => "string" == typeof e,
  ce = (e) => "symbol" == typeof e,
  ue = (e) => null !== e && "object" == typeof e,
  fe = (e) => (ue(e) || ae(e)) && ae(e.then) && ae(e.catch),
  de = Object.prototype.toString,
  pe = (e) => de.call(e),
  he = (e) => "[object Object]" === pe(e),
  me = (e) => le(e) && "NaN" !== e && "-" !== e[0] && "" + parseInt(e, 10) === e,
  ge = G(
    // the leading comma is intentional so empty string "" is also included
    ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
  ),
  ve = (e) => {
    const t = Object.create(null);
    return (n) => t[n] || (t[n] = e(n));
  },
  _e = /-\w/g,
  ye = ve((e) => e.replace(_e, (e) => e.slice(1).toUpperCase())),
  be = /\B([A-Z])/g,
  we = ve((e) => e.replace(be, "-$1").toLowerCase()),
  Ee = ve((e) => e.charAt(0).toUpperCase() + e.slice(1)),
  Se = ve((e) => (e ? `on${Ee(e)}` : "")),
  ke = (e, t) => !Object.is(e, t),
  xe = (e, ...t) => {
    for (let n = 0; n < e.length; n++) e[n](...t);
  },
  Oe = (e, t, n, o = !1) => {
    Object.defineProperty(e, t, { configurable: !0, enumerable: !1, writable: o, value: n });
  },
  Te = (e) => {
    const t = parseFloat(e);
    return isNaN(t) ? e : t;
  },
  Ae = (e) => {
    const t = le(e) ? Number(e) : NaN;
    return isNaN(t) ? e : t;
  };
let Ce;
const Re = () =>
    Ce ||
    (Ce =
      "undefined" != typeof globalThis
        ? globalThis
        : "undefined" != typeof self
          ? self
          : "undefined" != typeof window
            ? window
            : "undefined" != typeof global
              ? global
              : {}),
  Ie = G(
    "Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error,Symbol"
  );
function Ne(e) {
  if (oe(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const o = e[n],
        r = le(o) ? Me(o) : Ne(o);
      if (r) for (const e in r) t[e] = r[e];
    }
    return t;
  }
  if (le(e) || ue(e)) return e;
}
const Pe = /;(?![^(]*\))/g,
  Fe = /:([^]+)/,
  Le = /\/\*[^]*?\*\//g;
function Me(e) {
  const t = {};
  return (
    e
      .replace(Le, "")
      .split(Pe)
      .forEach((e) => {
        if (e) {
          const n = e.split(Fe);
          n.length > 1 && (t[n[0].trim()] = n[1].trim());
        }
      }),
    t
  );
}
function De(e) {
  let t = "";
  if (le(e)) t = e;
  else if (oe(e))
    for (let n = 0; n < e.length; n++) {
      const o = De(e[n]);
      o && (t += o + " ");
    }
  else if (ue(e)) for (const n in e) e[n] && (t += n + " ");
  return t.trim();
}
function je(e) {
  if (!e) return null;
  let { class: t, style: n } = e;
  return (t && !le(t) && (e.class = De(t)), n && (e.style = Ne(n)), e);
}
const $e = G("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly");
function Ve(e) {
  return !!e || "" === e;
}
function Ue(e, t) {
  if (e === t) return !0;
  let n = ie(e),
    o = ie(t);
  if (n || o) return !(!n || !o) && e.getTime() === t.getTime();
  if (((n = ce(e)), (o = ce(t)), n || o)) return e === t;
  if (((n = oe(e)), (o = oe(t)), n || o))
    return (
      !(!n || !o) &&
      (function (e, t) {
        if (e.length !== t.length) return !1;
        let n = !0;
        for (let o = 0; n && o < e.length; o++) n = Ue(e[o], t[o]);
        return n;
      })(e, t)
    );
  if (((n = ue(e)), (o = ue(t)), n || o)) {
    if (!n || !o) return !1;
    if (Object.keys(e).length !== Object.keys(t).length) return !1;
    for (const n in e) {
      const o = e.hasOwnProperty(n),
        r = t.hasOwnProperty(n);
      if ((o && !r) || (!o && r) || !Ue(e[n], t[n])) return !1;
    }
  }
  return String(e) === String(t);
}
function Be(e, t) {
  return e.findIndex((e) => Ue(e, t));
}
const He = (e) => !(!e || !0 !== e.__v_isRef),
  We = (e) =>
    le(e)
      ? e
      : null == e
        ? ""
        : oe(e) || (ue(e) && (e.toString === de || !ae(e.toString)))
          ? He(e)
            ? We(e.value)
            : JSON.stringify(e, ze, 2)
          : String(e),
  ze = (e, t) =>
    He(t)
      ? ze(e, t.value)
      : re(t)
        ? {
            [`Map(${t.size})`]: [...t.entries()].reduce(
              (e, [t, n], o) => ((e[Ge(t, o) + " =>"] = n), e),
              {}
            ),
          }
        : se(t)
          ? { [`Set(${t.size})`]: [...t.values()].map((e) => Ge(e)) }
          : ce(t)
            ? Ge(t)
            : !ue(t) || oe(t) || he(t)
              ? t
              : String(t),
  Ge = (e, t = "") => {
    var n;
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    return ce(e) ? `Symbol(${null != (n = e.description) ? n : t})` : e;
  };
function qe(e) {
  return null == e ? "initial" : "string" == typeof e ? ("" === e ? " " : e) : String(e);
}
let Ye, Ke;
class Je {
  // TODO isolatedDeclarations "__v_skip"
  constructor(e = !1) {
    ((this.detached = e),
      (this._active = !0),
      (this._on = 0),
      (this.effects = []),
      (this.cleanups = []),
      (this._isPaused = !1),
      (this._warnOnRun = !0),
      (this.__v_skip = !0),
      !e &&
        Ye &&
        (Ye.active
          ? ((this.parent = Ye), (this.index = (Ye.scopes || (Ye.scopes = [])).push(this) - 1))
          : ((this._active = !1), (this._warnOnRun = !1))));
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      let e, t;
      if (((this._isPaused = !0), this.scopes))
        for (e = 0, t = this.scopes.length; e < t; e++) this.scopes[e].pause();
      for (e = 0, t = this.effects.length; e < t; e++) this.effects[e].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */ resume() {
    if (this._active && this._isPaused) {
      let e, t;
      if (((this._isPaused = !1), this.scopes))
        for (e = 0, t = this.scopes.length; e < t; e++) this.scopes[e].resume();
      for (e = 0, t = this.effects.length; e < t; e++) this.effects[e].resume();
    }
  }
  run(e) {
    if (this._active) {
      const t = Ye;
      try {
        return ((Ye = this), e());
      } finally {
        Ye = t;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */ on() {
    1 === ++this._on && ((this.prevScope = Ye), (Ye = this));
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */ off() {
    if (this._on > 0 && 0 === --this._on) {
      if (Ye === this) Ye = this.prevScope;
      else {
        let e = Ye;
        for (; e; ) {
          if (e.prevScope === this) {
            e.prevScope = this.prevScope;
            break;
          }
          e = e.prevScope;
        }
      }
      this.prevScope = void 0;
    }
  }
  stop(e) {
    if (this._active) {
      let t, n;
      for (this._active = !1, t = 0, n = this.effects.length; t < n; t++) this.effects[t].stop();
      for (this.effects.length = 0, t = 0, n = this.cleanups.length; t < n; t++) this.cleanups[t]();
      if (((this.cleanups.length = 0), this.scopes)) {
        for (t = 0, n = this.scopes.length; t < n; t++) this.scopes[t].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !e) {
        const e = this.parent.scopes.pop();
        e && e !== this && ((this.parent.scopes[this.index] = e), (e.index = this.index));
      }
      this.parent = void 0;
    }
  }
}
function Qe(e) {
  return new Je(e);
}
function Xe() {
  return Ye;
}
function Ze(e, t = !1) {
  Ye && Ye.cleanups.push(e);
}
const et = new WeakSet();
class tt {
  constructor(e) {
    ((this.fn = e),
      (this.deps = void 0),
      (this.depsTail = void 0),
      (this.flags = 5),
      (this.next = void 0),
      (this.cleanup = void 0),
      (this.scheduler = void 0),
      Ye && (Ye.active ? Ye.effects.push(this) : (this.flags &= -2)));
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    64 & this.flags && ((this.flags &= -65), et.has(this) && (et.delete(this), this.trigger()));
  }
  /**
   * @internal
   */ notify() {
    (2 & this.flags && !(32 & this.flags)) || 8 & this.flags || st(this);
  }
  run() {
    if (!(1 & this.flags)) return this.fn();
    ((this.flags |= 2), _t(this), lt(this));
    const e = Ke,
      t = ht;
    ((Ke = this), (ht = !0));
    try {
      return this.fn();
    } finally {
      (ct(this), (Ke = e), (ht = t), (this.flags &= -3));
    }
  }
  stop() {
    if (1 & this.flags) {
      for (let e = this.deps; e; e = e.nextDep) dt(e);
      ((this.deps = this.depsTail = void 0),
        _t(this),
        this.onStop && this.onStop(),
        (this.flags &= -2));
    }
  }
  trigger() {
    64 & this.flags ? et.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */ runIfDirty() {
    ut(this) && this.run();
  }
  get dirty() {
    return ut(this);
  }
}
let nt,
  ot,
  rt = 0;
function st(e, t = !1) {
  if (((e.flags |= 8), t)) return ((e.next = ot), void (ot = e));
  ((e.next = nt), (nt = e));
}
function it() {
  rt++;
}
function at() {
  if (--rt > 0) return;
  if (ot) {
    let e = ot;
    for (ot = void 0; e; ) {
      const t = e.next;
      ((e.next = void 0), (e.flags &= -9), (e = t));
    }
  }
  let e;
  for (; nt; ) {
    let n = nt;
    for (nt = void 0; n; ) {
      const o = n.next;
      if (((n.next = void 0), (n.flags &= -9), 1 & n.flags))
        try {
          n.trigger();
        } catch (t) {
          e || (e = t);
        }
      n = o;
    }
  }
  if (e) throw e;
}
function lt(e) {
  for (let t = e.deps; t; t = t.nextDep)
    ((t.version = -1), (t.prevActiveLink = t.dep.activeLink), (t.dep.activeLink = t));
}
function ct(e) {
  let t,
    n = e.depsTail,
    o = n;
  for (; o; ) {
    const e = o.prevDep;
    (-1 === o.version ? (o === n && (n = e), dt(o), pt(o)) : (t = o),
      (o.dep.activeLink = o.prevActiveLink),
      (o.prevActiveLink = void 0),
      (o = e));
  }
  ((e.deps = t), (e.depsTail = n));
}
function ut(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (
      t.dep.version !== t.version ||
      (t.dep.computed && (ft(t.dep.computed) || t.dep.version !== t.version))
    )
      return !0;
  return !!e._dirty;
}
function ft(e) {
  if (4 & e.flags && !(16 & e.flags)) return;
  if (((e.flags &= -17), e.globalVersion === yt)) return;
  if (((e.globalVersion = yt), !e.isSSR && 128 & e.flags && ((!e.deps && !e._dirty) || !ut(e))))
    return;
  e.flags |= 2;
  const t = e.dep,
    n = Ke,
    o = ht;
  ((Ke = e), (ht = !0));
  try {
    lt(e);
    const n = e.fn(e._value);
    (0 === t.version || ke(n, e._value)) && ((e.flags |= 128), (e._value = n), t.version++);
  } catch (r) {
    throw (t.version++, r);
  } finally {
    ((Ke = n), (ht = o), ct(e), (e.flags &= -3));
  }
}
function dt(e, t = !1) {
  const { dep: n, prevSub: o, nextSub: r } = e;
  if (
    (o && ((o.nextSub = r), (e.prevSub = void 0)),
    r && ((r.prevSub = o), (e.nextSub = void 0)),
    n.subs === e && ((n.subs = o), !o && n.computed))
  ) {
    n.computed.flags &= -5;
    for (let e = n.computed.deps; e; e = e.nextDep) dt(e, !0);
  }
  t || --n.sc || !n.map || n.map.delete(n.key);
}
function pt(e) {
  const { prevDep: t, nextDep: n } = e;
  (t && ((t.nextDep = n), (e.prevDep = void 0)), n && ((n.prevDep = t), (e.nextDep = void 0)));
}
let ht = !0;
const mt = [];
function gt() {
  (mt.push(ht), (ht = !1));
}
function vt() {
  const e = mt.pop();
  ht = void 0 === e || e;
}
function _t(e) {
  const { cleanup: t } = e;
  if (((e.cleanup = void 0), t)) {
    const e = Ke;
    Ke = void 0;
    try {
      t();
    } finally {
      Ke = e;
    }
  }
}
let yt = 0;
class bt {
  constructor(e, t) {
    ((this.sub = e),
      (this.dep = t),
      (this.version = t.version),
      (this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0));
  }
}
class wt {
  // TODO isolatedDeclarations "__v_skip"
  constructor(e) {
    ((this.computed = e),
      (this.version = 0),
      (this.activeLink = void 0),
      (this.subs = void 0),
      (this.map = void 0),
      (this.key = void 0),
      (this.sc = 0),
      (this.__v_skip = !0));
  }
  track(e) {
    if (!Ke || !ht || Ke === this.computed) return;
    let t = this.activeLink;
    if (void 0 === t || t.sub !== Ke)
      ((t = this.activeLink = new bt(Ke, this)),
        Ke.deps
          ? ((t.prevDep = Ke.depsTail), (Ke.depsTail.nextDep = t), (Ke.depsTail = t))
          : (Ke.deps = Ke.depsTail = t),
        Et(t));
    else if (-1 === t.version && ((t.version = this.version), t.nextDep)) {
      const e = t.nextDep;
      ((e.prevDep = t.prevDep),
        t.prevDep && (t.prevDep.nextDep = e),
        (t.prevDep = Ke.depsTail),
        (t.nextDep = void 0),
        (Ke.depsTail.nextDep = t),
        (Ke.depsTail = t),
        Ke.deps === t && (Ke.deps = e));
    }
    return t;
  }
  trigger(e) {
    (this.version++, yt++, this.notify(e));
  }
  notify(e) {
    it();
    try {
      0;
      for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
    } finally {
      at();
    }
  }
}
function Et(e) {
  if ((e.dep.sc++, 4 & e.sub.flags)) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let e = t.deps; e; e = e.nextDep) Et(e);
    }
    const n = e.dep.subs;
    (n !== e && ((e.prevSub = n), n && (n.nextSub = e)), (e.dep.subs = e));
  }
}
const St = new WeakMap(),
  kt = Symbol(""),
  xt = Symbol(""),
  Ot = Symbol("");
function Tt(e, t, n) {
  if (ht && Ke) {
    let t = St.get(e);
    t || St.set(e, (t = new Map()));
    let o = t.get(n);
    (o || (t.set(n, (o = new wt())), (o.map = t), (o.key = n)), o.track());
  }
}
function At(e, t, n, o, r, s) {
  const i = St.get(e);
  if (!i) return void yt++;
  const a = (e) => {
    e && e.trigger();
  };
  if ((it(), "clear" === t)) i.forEach(a);
  else {
    const r = oe(e),
      s = r && me(n);
    if (r && "length" === n) {
      const e = Number(o);
      i.forEach((t, n) => {
        ("length" === n || n === Ot || (!ce(n) && n >= e)) && a(t);
      });
    } else
      switch (((void 0 !== n || i.has(void 0)) && a(i.get(n)), s && a(i.get(Ot)), t)) {
        case "add":
          r ? s && a(i.get("length")) : (a(i.get(kt)), re(e) && a(i.get(xt)));
          break;
        case "delete":
          r || (a(i.get(kt)), re(e) && a(i.get(xt)));
          break;
        case "set":
          re(e) && a(i.get(kt));
      }
  }
  at();
}
function Ct(e) {
  const t = yn(e);
  return t === e ? t : (Tt(t, 0, Ot), vn(e) ? t : t.map(wn));
}
function Rt(e) {
  return (Tt((e = yn(e)), 0, Ot), e);
}
function It(e, t) {
  return gn(e) ? En(mn(e) ? wn(t) : t) : wn(t);
}
const Nt = {
  __proto__: null,
  [Symbol.iterator]() {
    return Pt(this, Symbol.iterator, (e) => It(this, e));
  },
  concat(...e) {
    return Ct(this).concat(...e.map((e) => (oe(e) ? Ct(e) : e)));
  },
  entries() {
    return Pt(this, "entries", (e) => ((e[1] = It(this, e[1])), e));
  },
  every(e, t) {
    return Lt(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Lt(this, "filter", e, t, (e) => e.map((e) => It(this, e)), arguments);
  },
  find(e, t) {
    return Lt(this, "find", e, t, (e) => It(this, e), arguments);
  },
  findIndex(e, t) {
    return Lt(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Lt(this, "findLast", e, t, (e) => It(this, e), arguments);
  },
  findLastIndex(e, t) {
    return Lt(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Lt(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return Dt(this, "includes", e);
  },
  indexOf(...e) {
    return Dt(this, "indexOf", e);
  },
  join(e) {
    return Ct(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return Dt(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Lt(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return jt(this, "pop");
  },
  push(...e) {
    return jt(this, "push", e);
  },
  reduce(e, ...t) {
    return Mt(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Mt(this, "reduceRight", e, t);
  },
  shift() {
    return jt(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Lt(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return jt(this, "splice", e);
  },
  toReversed() {
    return Ct(this).toReversed();
  },
  toSorted(e) {
    return Ct(this).toSorted(e);
  },
  toSpliced(...e) {
    return Ct(this).toSpliced(...e);
  },
  unshift(...e) {
    return jt(this, "unshift", e);
  },
  values() {
    return Pt(this, "values", (e) => It(this, e));
  },
};
function Pt(e, t, n) {
  const o = Rt(e),
    r = o[t]();
  return (
    o === e ||
      vn(e) ||
      ((r._next = r.next),
      (r.next = () => {
        const e = r._next();
        return (e.done || (e.value = n(e.value)), e);
      })),
    r
  );
}
const Ft = Array.prototype;
function Lt(e, t, n, o, r, s) {
  const i = Rt(e),
    a = i !== e && !vn(e),
    l = i[t];
  if (l !== Ft[t]) {
    const t = l.apply(e, s);
    return a ? wn(t) : t;
  }
  let c = n;
  i !== e &&
    (a
      ? (c = function (t, o) {
          return n.call(this, It(e, t), o, e);
        })
      : n.length > 2 &&
        (c = function (t, o) {
          return n.call(this, t, o, e);
        }));
  const u = l.call(i, c, o);
  return a && r ? r(u) : u;
}
function Mt(e, t, n, o) {
  const r = Rt(e);
  let s = n,
    i = !1;
  r !== e &&
    (r !== e && !vn(e)
      ? ((i = 0 === o.length),
        (s = function (t, o, r) {
          return (i && ((i = !1), (t = It(e, t))), n.call(this, t, It(e, o), r, e));
        }))
      : n.length > 3 &&
        (s = function (t, o, r) {
          return n.call(this, t, o, r, e);
        }));
  const a = r[t](s, ...o);
  return i ? It(e, a) : a;
}
function Dt(e, t, n) {
  const o = yn(e);
  Tt(o, 0, Ot);
  const r = o[t](...n);
  return (-1 !== r && !1 !== r) || !_n(n[0]) ? r : ((n[0] = yn(n[0])), o[t](...n));
}
function jt(e, t, n = []) {
  (gt(), it());
  const o = yn(e)[t].apply(e, n);
  return (at(), vt(), o);
}
const $t = G("__proto__,__v_isRef,__isVue"),
  Vt = new Set(
    Object.getOwnPropertyNames(Symbol)
      .filter((e) => "arguments" !== e && "caller" !== e)
      .map((e) => Symbol[e])
      .filter(ce)
  );
function Ut(e) {
  ce(e) || (e = String(e));
  const t = yn(this);
  return (Tt(t, 0, e), t.hasOwnProperty(e));
}
class Bt {
  constructor(e = !1, t = !1) {
    ((this._isReadonly = e), (this._isShallow = t));
  }
  get(e, t, n) {
    if ("__v_skip" === t) return e.__v_skip;
    const o = this._isReadonly,
      r = this._isShallow;
    if ("__v_isReactive" === t) return !o;
    if ("__v_isReadonly" === t) return o;
    if ("__v_isShallow" === t) return r;
    if ("__v_raw" === t)
      return n === (o ? (r ? ln : an) : r ? sn : rn).get(e) || // receiver is not the reactive proxy, but has the same prototype
        // this means the receiver is a user proxy of the reactive proxy
        Object.getPrototypeOf(e) === Object.getPrototypeOf(n)
        ? e
        : void 0;
    const s = oe(e);
    if (!o) {
      let e;
      if (s && (e = Nt[t])) return e;
      if ("hasOwnProperty" === t) return Ut;
    }
    const i = Reflect.get(
      e,
      t,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      Sn(e) ? e : n
    );
    if (ce(t) ? Vt.has(t) : $t(t)) return i;
    if ((o || Tt(e, 0, t), r)) return i;
    if (Sn(i)) {
      const e = s && me(t) ? i : i.value;
      return o && ue(e) ? dn(e) : e;
    }
    return ue(i) ? (o ? dn(i) : un(i)) : i;
  }
}
class Ht extends Bt {
  constructor(e = !1) {
    super(!1, e);
  }
  set(e, t, n, o) {
    let r = e[t];
    const s = oe(e) && me(t);
    if (!this._isShallow) {
      const e = gn(r);
      if ((vn(n) || gn(n) || ((r = yn(r)), (n = yn(n))), !s && Sn(r) && !Sn(n)))
        return (e || (r.value = n), !0);
    }
    const i = s ? Number(t) < e.length : ne(e, t),
      a = Reflect.set(e, t, n, Sn(e) ? e : o);
    return (e === yn(o) && (i ? ke(n, r) && At(e, "set", t, n) : At(e, "add", t, n)), a);
  }
  deleteProperty(e, t) {
    const n = ne(e, t);
    e[t];
    const o = Reflect.deleteProperty(e, t);
    return (o && n && At(e, "delete", t, void 0), o);
  }
  has(e, t) {
    const n = Reflect.has(e, t);
    return ((ce(t) && Vt.has(t)) || Tt(e, 0, t), n);
  }
  ownKeys(e) {
    return (Tt(e, 0, oe(e) ? "length" : kt), Reflect.ownKeys(e));
  }
}
class Wt extends Bt {
  constructor(e = !1) {
    super(!0, e);
  }
  set(e, t) {
    return !0;
  }
  deleteProperty(e, t) {
    return !0;
  }
}
const zt = new Ht(),
  Gt = new Wt(),
  qt = new Ht(!0),
  Yt = new Wt(!0),
  Kt = (e) => e,
  Jt = (e) => Reflect.getPrototypeOf(e);
function Qt(e) {
  return function (...t) {
    return "delete" !== e && ("clear" === e ? void 0 : this);
  };
}
function Xt(e, t) {
  const n = {
    get(n) {
      const o = this.__v_raw,
        r = yn(o),
        s = yn(n);
      e || (ke(n, s) && Tt(r, 0, n), Tt(r, 0, s));
      const { has: i } = Jt(r),
        a = t ? Kt : e ? En : wn;
      return i.call(r, n) ? a(o.get(n)) : i.call(r, s) ? a(o.get(s)) : void (o !== r && o.get(n));
    },
    get size() {
      const t = this.__v_raw;
      return (!e && Tt(yn(t), 0, kt), t.size);
    },
    has(t) {
      const n = this.__v_raw,
        o = yn(n),
        r = yn(t);
      return (
        e || (ke(t, r) && Tt(o, 0, t), Tt(o, 0, r)),
        t === r ? n.has(t) : n.has(t) || n.has(r)
      );
    },
    forEach(n, o) {
      const r = this,
        s = r.__v_raw,
        i = t ? Kt : e ? En : wn;
      return (!e && Tt(yn(s), 0, kt), s.forEach((e, t) => n.call(o, i(e), i(t), r)));
    },
  };
  Z(
    n,
    e
      ? { add: Qt("add"), set: Qt("set"), delete: Qt("delete"), clear: Qt("clear") }
      : {
          add(e) {
            const n = yn(this),
              o = Jt(n),
              r = yn(e),
              s = t || vn(e) || gn(e) ? e : r;
            return (
              o.has.call(n, s) ||
                (ke(e, s) && o.has.call(n, e)) ||
                (ke(r, s) && o.has.call(n, r)) ||
                (n.add(s), At(n, "add", s, s)),
              this
            );
          },
          set(e, n) {
            t || vn(n) || gn(n) || (n = yn(n));
            const o = yn(this),
              { has: r, get: s } = Jt(o);
            let i = r.call(o, e);
            i || ((e = yn(e)), (i = r.call(o, e)));
            const a = s.call(o, e);
            return (o.set(e, n), i ? ke(n, a) && At(o, "set", e, n) : At(o, "add", e, n), this);
          },
          delete(e) {
            const t = yn(this),
              { has: n, get: o } = Jt(t);
            let r = n.call(t, e);
            (r || ((e = yn(e)), (r = n.call(t, e))), o && o.call(t, e));
            const s = t.delete(e);
            return (r && At(t, "delete", e, void 0), s);
          },
          clear() {
            const e = yn(this),
              t = 0 !== e.size,
              n = e.clear();
            return (t && At(e, "clear", void 0, void 0), n);
          },
        }
  );
  return (
    ["keys", "values", "entries", Symbol.iterator].forEach((o) => {
      n[o] = (function (e, t, n) {
        return function (...o) {
          const r = this.__v_raw,
            s = yn(r),
            i = re(s),
            a = "entries" === e || (e === Symbol.iterator && i),
            l = "keys" === e && i,
            c = r[e](...o),
            u = n ? Kt : t ? En : wn;
          return (
            !t && Tt(s, 0, l ? xt : kt),
            Z(
              // inheriting all iterator properties
              Object.create(c),
              {
                // iterator protocol
                next() {
                  const { value: e, done: t } = c.next();
                  return t
                    ? { value: e, done: t }
                    : { value: a ? [u(e[0]), u(e[1])] : u(e), done: t };
                },
              }
            )
          );
        };
      })(o, e, t);
    }),
    n
  );
}
function Zt(e, t) {
  const n = Xt(e, t);
  return (t, o, r) =>
    "__v_isReactive" === o
      ? !e
      : "__v_isReadonly" === o
        ? e
        : "__v_raw" === o
          ? t
          : Reflect.get(ne(n, o) && o in t ? n : t, o, r);
}
const en = { get: Zt(!1, !1) },
  tn = { get: Zt(!1, !0) },
  nn = { get: Zt(!0, !1) },
  on = { get: Zt(!0, !0) },
  rn = new WeakMap(),
  sn = new WeakMap(),
  an = new WeakMap(),
  ln = new WeakMap();
function cn(e) {
  return e.__v_skip || !Object.isExtensible(e)
    ? 0
    : (function (e) {
        switch (e) {
          case "Object":
          case "Array":
            return 1;
          case "Map":
          case "Set":
          case "WeakMap":
          case "WeakSet":
            return 2;
          default:
            return 0;
        }
      })(((e) => pe(e).slice(8, -1))(e));
}
// @__NO_SIDE_EFFECTS__
function un(e) {
  return gn(e) ? e : hn(e, !1, zt, en, rn);
}
// @__NO_SIDE_EFFECTS__
function fn(e) {
  return hn(e, !1, qt, tn, sn);
}
// @__NO_SIDE_EFFECTS__
function dn(e) {
  return hn(e, !0, Gt, nn, an);
}
// @__NO_SIDE_EFFECTS__
function pn(e) {
  return hn(e, !0, Yt, on, ln);
}
function hn(e, t, n, o, r) {
  if (!ue(e)) return e;
  if (e.__v_raw && (!t || !e.__v_isReactive)) return e;
  const s = cn(e);
  if (0 === s) return e;
  const i = r.get(e);
  if (i) return i;
  const a = new Proxy(e, 2 === s ? o : n);
  return (r.set(e, a), a);
}
// @__NO_SIDE_EFFECTS__
function mn(e) {
  return gn(e) ? mn(e.__v_raw) : !(!e || !e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function gn(e) {
  return !(!e || !e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function vn(e) {
  return !(!e || !e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function _n(e) {
  return !!e && !!e.__v_raw;
}
// @__NO_SIDE_EFFECTS__
function yn(e) {
  const t = e && e.__v_raw;
  return t ? yn(t) : e;
}
function bn(e) {
  return (!ne(e, "__v_skip") && Object.isExtensible(e) && Oe(e, "__v_skip", !0), e);
}
const wn = (e) => (ue(e) ? un(e) : e),
  En = (e) => (ue(e) ? dn(e) : e);
// @__NO_SIDE_EFFECTS__
function Sn(e) {
  return !!e && !0 === e.__v_isRef;
}
// @__NO_SIDE_EFFECTS__
function kn(e) {
  return On(e, !1);
}
// @__NO_SIDE_EFFECTS__
function xn(e) {
  return On(e, !0);
}
function On(e, t) {
  return Sn(e) ? e : new Tn(e, t);
}
class Tn {
  constructor(e, t) {
    ((this.dep = new wt()),
      (this.__v_isRef = !0),
      (this.__v_isShallow = !1),
      (this._rawValue = t ? e : yn(e)),
      (this._value = t ? e : wn(e)),
      (this.__v_isShallow = t));
  }
  get value() {
    return (this.dep.track(), this._value);
  }
  set value(e) {
    const t = this._rawValue,
      n = this.__v_isShallow || vn(e) || gn(e);
    ke((e = n ? e : yn(e)), t) &&
      ((this._rawValue = e), (this._value = n ? e : wn(e)), this.dep.trigger());
  }
}
function An(e) {
  e.dep && e.dep.trigger();
}
function Cn(e) {
  return Sn(e) ? e.value : e;
}
function Rn(e) {
  return ae(e) ? e() : Cn(e);
}
const In = {
  get: (e, t, n) => ("__v_raw" === t ? e : Cn(Reflect.get(e, t, n))),
  set: (e, t, n, o) => {
    const r = e[t];
    return Sn(r) && !Sn(n) ? ((r.value = n), !0) : Reflect.set(e, t, n, o);
  },
};
function Nn(e) {
  return mn(e) ? e : new Proxy(e, In);
}
class Pn {
  constructor(e) {
    ((this.__v_isRef = !0), (this._value = void 0));
    const t = (this.dep = new wt()),
      { get: n, set: o } = e(t.track.bind(t), t.trigger.bind(t));
    ((this._get = n), (this._set = o));
  }
  get value() {
    return (this._value = this._get());
  }
  set value(e) {
    this._set(e);
  }
}
function Fn(e) {
  return new Pn(e);
}
// @__NO_SIDE_EFFECTS__
function Ln(e) {
  const t = oe(e) ? new Array(e.length) : {};
  for (const n in e) t[n] = $n(e, n);
  return t;
}
class Mn {
  constructor(e, t, n) {
    ((this._object = e),
      (this._defaultValue = n),
      (this.__v_isRef = !0),
      (this._value = void 0),
      (this._key = ce(t) ? t : String(t)),
      (this._raw = yn(e)));
    let o = !0,
      r = e;
    if (!oe(e) || ce(this._key) || !me(this._key))
      do {
        o = !_n(r) || vn(r);
      } while (o && (r = r.__v_raw));
    this._shallow = o;
  }
  get value() {
    let e = this._object[this._key];
    return (this._shallow && (e = Cn(e)), (this._value = void 0 === e ? this._defaultValue : e));
  }
  set value(e) {
    if (this._shallow && Sn(this._raw[this._key])) {
      const t = this._object[this._key];
      if (Sn(t)) return void (t.value = e);
    }
    this._object[this._key] = e;
  }
  get dep() {
    return (function (e, t) {
      const n = St.get(e);
      return n && n.get(t);
    })(this._raw, this._key);
  }
}
class Dn {
  constructor(e) {
    ((this._getter = e), (this.__v_isRef = !0), (this.__v_isReadonly = !0), (this._value = void 0));
  }
  get value() {
    return (this._value = this._getter());
  }
}
// @__NO_SIDE_EFFECTS__
function jn(e, t, n) {
  return Sn(e) ? e : ae(e) ? new Dn(e) : ue(e) && arguments.length > 1 ? $n(e, t, n) : kn(e);
}
function $n(e, t, n) {
  return new Mn(e, t, n);
}
class Vn {
  constructor(e, t, n) {
    ((this.fn = e),
      (this.setter = t),
      (this._value = void 0),
      (this.dep = new wt(this)),
      (this.__v_isRef = !0),
      (this.deps = void 0),
      (this.depsTail = void 0),
      (this.flags = 16),
      (this.globalVersion = yt - 1),
      (this.next = void 0),
      (this.effect = this),
      (this.__v_isReadonly = !t),
      (this.isSSR = n));
  }
  /**
   * @internal
   */ notify() {
    if (
      ((this.flags |= 16),
      !(8 & this.flags) && // avoid infinite self recursion
        Ke !== this)
    )
      return (st(this, !0), !0);
  }
  get value() {
    const e = this.dep.track();
    return (ft(this), e && (e.version = this.dep.version), this._value);
  }
  set value(e) {
    this.setter && this.setter(e);
  }
}
// @__NO_SIDE_EFFECTS__
function Un(e, t, n = !1) {
  let o, r;
  ae(e) ? (o = e) : ((o = e.get), (r = e.set));
  return new Vn(o, r, n);
}
const Bn = {},
  Hn = new WeakMap();
let Wn;
function zn(e, t = !1, n = Wn) {
  if (n) {
    let t = Hn.get(n);
    (t || Hn.set(n, (t = [])), t.push(e));
  }
}
function Gn(e, t = Infinity, n) {
  if (t <= 0 || !ue(e) || e.__v_skip) return e;
  if (((n = n || new Map()).get(e) || 0) >= t) return e;
  if ((n.set(e, t), t--, Sn(e))) Gn(e.value, t, n);
  else if (oe(e)) for (let o = 0; o < e.length; o++) Gn(e[o], t, n);
  else if (se(e) || re(e))
    e.forEach((e) => {
      Gn(e, t, n);
    });
  else if (he(e)) {
    for (const o in e) Gn(e[o], t, n);
    for (const o of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, o) && Gn(e[o], t, n);
  }
  return e;
}
const qn = [];
const Yn = {
  sp: "serverPrefetch hook",
  bc: "beforeCreate hook",
  c: "created hook",
  bm: "beforeMount hook",
  m: "mounted hook",
  bu: "beforeUpdate hook",
  u: "updated",
  bum: "beforeUnmount hook",
  um: "unmounted hook",
  a: "activated hook",
  da: "deactivated hook",
  ec: "errorCaptured hook",
  rtc: "renderTracked hook",
  rtg: "renderTriggered hook",
  0: "setup function",
  1: "render function",
  2: "watcher getter",
  3: "watcher callback",
  4: "watcher cleanup function",
  5: "native event handler",
  6: "component event handler",
  7: "vnode hook",
  8: "directive hook",
  9: "transition hook",
  10: "app errorHandler",
  11: "app warnHandler",
  12: "ref function",
  13: "async component loader",
  14: "scheduler flush",
  15: "component update",
  16: "app unmount cleanup function",
};
function Kn(e, t, n, o) {
  try {
    return o ? e(...o) : e();
  } catch (r) {
    Qn(r, t, n);
  }
}
function Jn(e, t, n, o) {
  if (ae(e)) {
    const r = Kn(e, t, n, o);
    return (
      r &&
        fe(r) &&
        r.catch((e) => {
          Qn(e, t, n);
        }),
      r
    );
  }
  if (oe(e)) {
    const r = [];
    for (let s = 0; s < e.length; s++) r.push(Jn(e[s], t, n, o));
    return r;
  }
}
function Qn(e, t, n, o = !0) {
  t && t.vnode;
  const { errorHandler: r, throwUnhandledErrorInProduction: s } = (t && t.appContext.config) || q;
  if (t) {
    let o = t.parent;
    const s = t.proxy,
      i = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; o; ) {
      const t = o.ec;
      if (t) for (let n = 0; n < t.length; n++) if (!1 === t[n](e, s, i)) return;
      o = o.parent;
    }
    if (r) return (gt(), Kn(r, null, 10, [e, s, i]), void vt());
  }
  !(function (e, t, n, o = !0, r = !1) {
    if (r) throw e;
  })(e, 0, 0, o, s);
}
const Xn = [];
let Zn = -1;
const eo = [];
let to = null,
  no = 0;
const oo = Promise.resolve();
let ro = null;
function so(e) {
  const t = ro || oo;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function io(e) {
  if (!(1 & e.flags)) {
    const t = fo(e),
      n = Xn[Xn.length - 1];
    (!n || // fast path when the job id is larger than the tail
    (!(2 & e.flags) && t >= fo(n))
      ? Xn.push(e)
      : Xn.splice(
          (function (e) {
            let t = Zn + 1,
              n = Xn.length;
            for (; t < n; ) {
              const o = (t + n) >>> 1,
                r = Xn[o],
                s = fo(r);
              s < e || (s === e && 2 & r.flags) ? (t = o + 1) : (n = o);
            }
            return t;
          })(t),
          0,
          e
        ),
      (e.flags |= 1),
      ao());
  }
}
function ao() {
  ro || (ro = oo.then(po));
}
function lo(e) {
  (oe(e)
    ? eo.push(...e)
    : to && -1 === e.id
      ? to.splice(no + 1, 0, e)
      : 1 & e.flags || (eo.push(e), (e.flags |= 1)),
    ao());
}
function co(e, t, n = Zn + 1) {
  for (; n < Xn.length; n++) {
    const t = Xn[n];
    if (t && 2 & t.flags) {
      if (e && t.id !== e.uid) continue;
      (Xn.splice(n, 1), n--, 4 & t.flags && (t.flags &= -2), t(), 4 & t.flags || (t.flags &= -2));
    }
  }
}
function uo(e) {
  if (eo.length) {
    const e = [...new Set(eo)].sort((e, t) => fo(e) - fo(t));
    if (((eo.length = 0), to)) return void to.push(...e);
    for (to = e, no = 0; no < to.length; no++) {
      const e = to[no];
      (4 & e.flags && (e.flags &= -2), 8 & e.flags || e(), (e.flags &= -2));
    }
    ((to = null), (no = 0));
  }
}
const fo = (e) => (null == e.id ? (2 & e.flags ? -1 : Infinity) : e.id);
function po(e) {
  try {
    for (Zn = 0; Zn < Xn.length; Zn++) {
      const e = Xn[Zn];
      !e ||
        8 & e.flags ||
        (4 & e.flags && (e.flags &= -2), Kn(e, e.i, e.i ? 15 : 14), 4 & e.flags || (e.flags &= -2));
    }
  } finally {
    for (; Zn < Xn.length; Zn++) {
      const e = Xn[Zn];
      e && (e.flags &= -2);
    }
    ((Zn = -1), (Xn.length = 0), uo(), (ro = null), (Xn.length || eo.length) && po());
  }
}
let ho,
  mo = [];
let go = null,
  vo = null;
function _o(e) {
  const t = go;
  return ((go = e), (vo = (e && e.type.__scopeId) || null), t);
}
function yo(e, t = go, n) {
  if (!t) return e;
  if (e._n) return e;
  const o = (...n) => {
    o._d && Ci(-1);
    const r = _o(t);
    let s;
    try {
      s = e(...n);
    } finally {
      (_o(r), o._d && Ci(1));
    }
    return s;
  };
  return ((o._n = !0), (o._c = !0), (o._d = !0), o);
}
function bo(e, t) {
  if (null === go) return e;
  const n = pa(go),
    o = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [e, s, i, a = q] = t[r];
    e &&
      (ae(e) && (e = { mounted: e, updated: e }),
      e.deep && Gn(s),
      o.push({ dir: e, instance: n, value: s, oldValue: void 0, arg: i, modifiers: a }));
  }
  return e;
}
function wo(e, t, n, o) {
  const r = e.dirs,
    s = t && t.dirs;
  for (let i = 0; i < r.length; i++) {
    const a = r[i];
    s && (a.oldValue = s[i].value);
    let l = a.dir[o];
    l && (gt(), Jn(l, n, 8, [e.el, a, e, t]), vt());
  }
}
function Eo(e, t) {
  if (Xi) {
    let n = Xi.provides;
    const o = Xi.parent && Xi.parent.provides;
    (o === n && (n = Xi.provides = Object.create(o)), (n[e] = t));
  }
}
function So(e, t, n = !1) {
  const o = Zi();
  if (o || As) {
    let r = As
      ? As._context.provides
      : o
        ? null == o.parent || o.ce
          ? o.vnode.appContext && o.vnode.appContext.provides
          : o.parent.provides
        : void 0;
    if (r && e in r) return r[e];
    if (arguments.length > 1) return n && ae(t) ? t.call(o && o.proxy) : t;
  }
}
function ko() {
  return !(!Zi() && !As);
}
const xo = Symbol.for("v-scx"),
  Oo = () => So(xo);
function To(e, t) {
  return Ro(e, null, t);
}
function Ao(e, t) {
  return Ro(e, null, { flush: "sync" });
}
function Co(e, t, n) {
  return Ro(e, t, n);
}
function Ro(e, t, n = q) {
  const { immediate: o, deep: r, flush: s, once: i } = n,
    a = Z({}, n),
    l = (t && o) || (!t && "post" !== s);
  let c;
  if (aa)
    if ("sync" === s) {
      const e = Oo();
      c = e.__watcherHandles || (e.__watcherHandles = []);
    } else if (!l) {
      const e = () => {};
      return ((e.stop = K), (e.resume = K), (e.pause = K), e);
    }
  const u = Xi;
  a.call = (e, t, n) => Jn(e, u, t, n);
  let f = !1;
  ("post" === s
    ? (a.scheduler = (e) => {
        ti(e, u && u.suspense);
      })
    : "sync" !== s &&
      ((f = !0),
      (a.scheduler = (e, t) => {
        t ? e() : io(e);
      })),
    (a.augmentJob = (e) => {
      (t && (e.flags |= 4), f && ((e.flags |= 2), u && ((e.id = u.uid), (e.i = u))));
    }));
  const d = (function (e, t, n = q) {
    const { immediate: o, deep: r, once: s, scheduler: i, augmentJob: a, call: l } = n,
      c = (e) => (r ? e : vn(e) || !1 === r || 0 === r ? Gn(e, 1) : Gn(e));
    let u,
      f,
      d,
      p,
      h = !1,
      m = !1;
    if (
      (Sn(e)
        ? ((f = () => e.value), (h = vn(e)))
        : mn(e)
          ? ((f = () => c(e)), (h = !0))
          : oe(e)
            ? ((m = !0),
              (h = e.some((e) => mn(e) || vn(e))),
              (f = () =>
                e.map((e) =>
                  Sn(e) ? e.value : mn(e) ? c(e) : ae(e) ? (l ? l(e, 2) : e()) : void 0
                )))
            : (f = ae(e)
                ? t
                  ? l
                    ? () => l(e, 2)
                    : e
                  : () => {
                      if (d) {
                        gt();
                        try {
                          d();
                        } finally {
                          vt();
                        }
                      }
                      const t = Wn;
                      Wn = u;
                      try {
                        return l ? l(e, 3, [p]) : e(p);
                      } finally {
                        Wn = t;
                      }
                    }
                : K),
      t && r)
    ) {
      const e = f,
        t = !0 === r ? Infinity : r;
      f = () => Gn(e(), t);
    }
    const g = Xe(),
      v = () => {
        (u.stop(), g && g.active && ee(g.effects, u));
      };
    if (s && t) {
      const e = t;
      t = (...t) => {
        (e(...t), v());
      };
    }
    let _ = m ? new Array(e.length).fill(Bn) : Bn;
    const y = (e) => {
      if (1 & u.flags && (u.dirty || e))
        if (t) {
          const e = u.run();
          if (r || h || (m ? e.some((e, t) => ke(e, _[t])) : ke(e, _))) {
            d && d();
            const n = Wn;
            Wn = u;
            try {
              const n = [
                e,
                // pass undefined as the old value when it's changed for the first time
                _ === Bn ? void 0 : m && _[0] === Bn ? [] : _,
                p,
              ];
              ((_ = e),
                l
                  ? l(t, 3, n)
                  : // @ts-expect-error
                    t(...n));
            } finally {
              Wn = n;
            }
          }
        } else u.run();
    };
    return (
      a && a(y),
      (u = new tt(f)),
      (u.scheduler = i ? () => i(y, !1) : y),
      (p = (e) => zn(e, !1, u)),
      (d = u.onStop =
        () => {
          const e = Hn.get(u);
          if (e) {
            if (l) l(e, 4);
            else for (const t of e) t();
            Hn.delete(u);
          }
        }),
      t ? (o ? y(!0) : (_ = u.run())) : i ? i(y.bind(null, !0), !0) : u.run(),
      (v.pause = u.pause.bind(u)),
      (v.resume = u.resume.bind(u)),
      (v.stop = v),
      v
    );
  })(e, t, a);
  return (aa && (c ? c.push(d) : l && d()), d);
}
function Io(e, t, n) {
  const o = this.proxy,
    r = le(e) ? (e.includes(".") ? No(o, e) : () => o[e]) : e.bind(o, o);
  let s;
  ae(t) ? (s = t) : ((s = t.handler), (n = t));
  const i = na(this),
    a = Ro(r, s.bind(o), n);
  return (i(), a);
}
function No(e, t) {
  const n = t.split(".");
  return () => {
    let t = e;
    for (let e = 0; e < n.length && t; e++) t = t[n[e]];
    return t;
  };
}
const Po = new WeakMap(),
  Fo = Symbol("_vte"),
  Lo = (e) => e.__isTeleport,
  Mo = (e) => e && (e.disabled || "" === e.disabled),
  Do = (e) => "undefined" != typeof SVGElement && e instanceof SVGElement,
  jo = (e) => "function" == typeof MathMLElement && e instanceof MathMLElement,
  $o = (e, t) => {
    const n = e && e.to;
    if (le(n)) {
      if (t) {
        return t(n);
      }
      return null;
    }
    return n;
  };
function Vo(e, t, n, { o: { insert: o }, m: r }, s = 2) {
  0 === s && o(e.targetAnchor, t, n);
  const { el: i, anchor: a, shapeFlag: l, children: c, props: u } = e,
    f = 2 === s;
  if ((f && o(i, t, n), !Po.has(e) && (!f || Mo(u)) && 16 & l))
    for (let d = 0; d < c.length; d++) r(c[d], t, n, 2);
  f && o(a, t, n);
}
const Uo = {
  name: "Teleport",
  __isTeleport: !0,
  process(e, t, n, o, r, s, i, a, l, c) {
    const {
        mc: u,
        pc: f,
        pbc: d,
        o: { insert: p, querySelector: h, createText: m, createComment: g, parentNode: v },
      } = c,
      _ = Mo(t.props);
    let { dynamicChildren: y } = t;
    const b = (e, t, n) => {
        16 & e.shapeFlag && u(e.children, t, n, r, s, i, a, l);
      },
      w = (e = t) => {
        const n = Mo(e.props),
          o = (e.target = $o(e.props, h)),
          s = Ho(o, e, m, p);
        o &&
          ("svg" !== i && Do(o) ? (i = "svg") : "mathml" !== i && jo(o) && (i = "mathml"),
          r && r.isCE && (r.ce._teleportTargets || (r.ce._teleportTargets = new Set())).add(o),
          n || (b(e, o, s), Bo(e, !1)));
      },
      E = (e) => {
        const t = () => {
          if (Po.get(e) === t) {
            if ((Po.delete(e), Mo(e.props))) {
              const t = v(e.el) || n;
              (b(e, t, e.anchor), Bo(e, !0));
            }
            w(e);
          }
        };
        (Po.set(e, t), ti(t, s));
      };
    if (null == e) {
      const e = (t.el = m("")),
        r = (t.anchor = m(""));
      if (
        (p(e, n, o),
        p(r, n, o),
        ((S = t.props) && (S.defer || "" === S.defer)) || (s && s.pendingBranch))
      )
        return void E(t);
      (_ && (b(t, n, r), Bo(t, !0)), w());
    } else {
      t.el = e.el;
      const o = (t.anchor = e.anchor),
        u = Po.get(e);
      if (u) return ((u.flags |= 8), Po.delete(e), void E(t));
      t.targetStart = e.targetStart;
      const p = (t.target = e.target),
        m = (t.targetAnchor = e.targetAnchor),
        g = Mo(e.props),
        v = g ? n : p,
        b = g ? o : m;
      if (
        ("svg" === i || Do(p) ? (i = "svg") : ("mathml" === i || jo(p)) && (i = "mathml"),
        y
          ? (d(e.dynamicChildren, y, v, r, s, i, a), li(e, t, !0))
          : l || f(e, t, v, b, r, s, i, a, !1),
        _)
      )
        g
          ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to)
          : Vo(t, n, o, c, 1);
      else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
        const e = (t.target = $o(t.props, h));
        e && Vo(t, e, null, c, 0);
      } else g && Vo(t, p, m, c, 1);
      Bo(t, _);
    }
    var S;
  },
  remove(e, t, n, { um: o, o: { remove: r } }, s) {
    const {
      shapeFlag: i,
      children: a,
      anchor: l,
      targetStart: c,
      targetAnchor: u,
      target: f,
      props: d,
    } = e;
    let p = s || !Mo(d);
    const h = Po.get(e);
    if ((h && ((h.flags |= 8), Po.delete(e), (p = !1)), f && (r(c), r(u)), s && r(l), 16 & i))
      for (let m = 0; m < a.length; m++) {
        const e = a[m];
        o(e, t, n, p, !!e.dynamicChildren);
      }
  },
  move: Vo,
  hydrate: function (
    e,
    t,
    n,
    o,
    r,
    s,
    { o: { nextSibling: i, parentNode: a, querySelector: l, insert: c, createText: u } },
    f
  ) {
    function d(e, n) {
      let o = n;
      for (; o; ) {
        if (o && 8 === o.nodeType)
          if ("teleport start anchor" === o.data) t.targetStart = o;
          else if ("teleport anchor" === o.data) {
            ((t.targetAnchor = o), (e._lpa = t.targetAnchor && i(t.targetAnchor)));
            break;
          }
        o = i(o);
      }
    }
    function p(e, t) {
      t.anchor = f(i(e), t, a(e), n, o, r, s);
    }
    const h = (t.target = $o(t.props, l)),
      m = Mo(t.props);
    if (h) {
      const l = h._lpa || h.firstChild;
      (16 & t.shapeFlag &&
        (m
          ? (p(e, t),
            d(h, l),
            t.targetAnchor ||
              Ho(
                h,
                t,
                u,
                c,
                // if target is the same as the main view, insert anchors before current node
                // to avoid hydrating mismatch
                a(e) === h ? e : null
              ))
          : ((t.anchor = i(e)),
            d(h, l),
            t.targetAnchor || Ho(h, t, u, c),
            f(l && i(l), t, h, n, o, r, s))),
        Bo(t, m));
    } else m && 16 & t.shapeFlag && (p(e, t), (t.targetStart = e), (t.targetAnchor = i(e)));
    return t.anchor && i(t.anchor);
  },
};
function Bo(e, t) {
  const n = e.ctx;
  if (n && n.ut) {
    let o, r;
    for (
      t ? ((o = e.el), (r = e.anchor)) : ((o = e.targetStart), (r = e.targetAnchor));
      o && o !== r;
    )
      (1 === o.nodeType && o.setAttribute("data-v-owner", n.uid), (o = o.nextSibling));
    n.ut();
  }
}
function Ho(e, t, n, o, r = null) {
  const s = (t.targetStart = n("")),
    i = (t.targetAnchor = n(""));
  return ((s[Fo] = i), e && (o(s, e, r), o(i, e, r)), i);
}
const Wo = Symbol("_leaveCb"),
  zo = Symbol("_enterCb");
function Go() {
  const e = { isMounted: !1, isLeaving: !1, isUnmounting: !1, leavingVNodes: new Map() };
  return (
    Mr(() => {
      e.isMounted = !0;
    }),
    $r(() => {
      e.isUnmounting = !0;
    }),
    e
  );
}
const qo = [Function, Array],
  Yo = {
    mode: String,
    appear: Boolean,
    persisted: Boolean,
    // enter
    onBeforeEnter: qo,
    onEnter: qo,
    onAfterEnter: qo,
    onEnterCancelled: qo,
    // leave
    onBeforeLeave: qo,
    onLeave: qo,
    onAfterLeave: qo,
    onLeaveCancelled: qo,
    // appear
    onBeforeAppear: qo,
    onAppear: qo,
    onAfterAppear: qo,
    onAppearCancelled: qo,
  },
  Ko = (e) => {
    const t = e.subTree;
    return t.component ? Ko(t.component) : t;
  };
function Jo(e) {
  let t = e[0];
  if (e.length > 1)
    for (const n of e)
      if (n.type !== Ei) {
        t = n;
        break;
      }
  return t;
}
const Qo = {
  name: "BaseTransition",
  props: Yo,
  setup(e, { slots: t }) {
    const n = Zi(),
      o = Go();
    return () => {
      const r = t.default && or(t.default(), !0),
        s =
          r && r.length
            ? Jo(r)
            : // Keep explicit default-slot conditionals on the same transition path
              // as regular v-if branches, which render a comment placeholder.
              n.subTree
              ? Hi()
              : void 0;
      if (!s) return;
      const i = yn(e),
        { mode: a } = i;
      if (o.isLeaving) return er(s);
      const l = tr(s);
      if (!l) return er(s);
      let c = Zo(
        l,
        i,
        o,
        n,
        // #11061, ensure enterHooks is fresh after clone
        (e) => (c = e)
      );
      l.type !== Ei && nr(l, c);
      let u = n.subTree && tr(n.subTree);
      if (u && u.type !== Ei && !Fi(u, l) && Ko(n).type !== Ei) {
        let e = Zo(u, i, o, n);
        if ((nr(u, e), "out-in" === a && l.type !== Ei))
          return (
            (o.isLeaving = !0),
            (e.afterLeave = () => {
              ((o.isLeaving = !1),
                8 & n.job.flags || n.update(),
                delete e.afterLeave,
                (u = void 0));
            }),
            er(s)
          );
        "in-out" === a && l.type !== Ei
          ? (e.delayLeave = (e, t, n) => {
              ((Xo(o, u)[String(u.key)] = u),
                (e[Wo] = () => {
                  (t(), (e[Wo] = void 0), delete c.delayedLeave, (u = void 0));
                }),
                (c.delayedLeave = () => {
                  (n(), delete c.delayedLeave, (u = void 0));
                }));
            })
          : (u = void 0);
      } else u && (u = void 0);
      return s;
    };
  },
};
function Xo(e, t) {
  const { leavingVNodes: n } = e;
  let o = n.get(t.type);
  return (o || ((o = Object.create(null)), n.set(t.type, o)), o);
}
function Zo(e, t, n, o, r) {
  const {
      appear: s,
      mode: i,
      persisted: a = !1,
      onBeforeEnter: l,
      onEnter: c,
      onAfterEnter: u,
      onEnterCancelled: f,
      onBeforeLeave: d,
      onLeave: p,
      onAfterLeave: h,
      onLeaveCancelled: m,
      onBeforeAppear: g,
      onAppear: v,
      onAfterAppear: _,
      onAppearCancelled: y,
    } = t,
    b = String(e.key),
    w = Xo(n, e),
    E = (e, t) => {
      e && Jn(e, o, 9, t);
    },
    S = (e, t) => {
      const n = t[1];
      (E(e, t), oe(e) ? e.every((e) => e.length <= 1) && n() : e.length <= 1 && n());
    },
    k = {
      mode: i,
      persisted: a,
      beforeEnter(t) {
        let o = l;
        if (!n.isMounted) {
          if (!s) return;
          o = g || l;
        }
        t[Wo] &&
          t[Wo](
            !0
            /* cancelled */
          );
        const r = w[b];
        (r && Fi(e, r) && r.el[Wo] && r.el[Wo](), E(o, [t]));
      },
      enter(t) {
        if (w[b] === e) return;
        let o = c,
          r = u,
          i = f;
        if (!n.isMounted) {
          if (!s) return;
          ((o = v || c), (r = _ || u), (i = y || f));
        }
        let a = !1;
        t[zo] = (e) => {
          a || ((a = !0), E(e ? i : r, [t]), k.delayedLeave && k.delayedLeave(), (t[zo] = void 0));
        };
        const l = t[zo].bind(null, !1);
        o ? S(o, [t, l]) : l();
      },
      leave(t, o) {
        const r = String(e.key);
        if (
          (t[zo] &&
            t[zo](
              !0
              /* cancelled */
            ),
          n.isUnmounting)
        )
          return o();
        E(d, [t]);
        let s = !1;
        t[Wo] = (n) => {
          s || ((s = !0), o(), E(n ? m : h, [t]), (t[Wo] = void 0), w[r] === e && delete w[r]);
        };
        const i = t[Wo].bind(null, !1);
        ((w[r] = e), p ? S(p, [t, i]) : i());
      },
      clone(e) {
        const s = Zo(e, t, n, o, r);
        return (r && r(s), s);
      },
    };
  return k;
}
function er(e) {
  if (kr(e)) return (((e = Vi(e)).children = null), e);
}
function tr(e) {
  if (!kr(e)) return Lo(e.type) && e.children ? Jo(e.children) : e;
  if (e.component) return e.component.subTree;
  const { shapeFlag: t, children: n } = e;
  if (n) {
    if (16 & t) return n[0];
    if (32 & t && ae(n.default)) return n.default();
  }
}
function nr(e, t) {
  6 & e.shapeFlag && e.component
    ? ((e.transition = t), nr(e.component.subTree, t))
    : 128 & e.shapeFlag
      ? ((e.ssContent.transition = t.clone(e.ssContent)),
        (e.ssFallback.transition = t.clone(e.ssFallback)))
      : (e.transition = t);
}
function or(e, t = !1, n) {
  let o = [],
    r = 0;
  for (let s = 0; s < e.length; s++) {
    let i = e[s];
    const a = null == n ? i.key : String(n) + String(null != i.key ? i.key : s);
    i.type === bi
      ? (128 & i.patchFlag && r++, (o = o.concat(or(i.children, t, a))))
      : (t || i.type !== Ei) && o.push(null != a ? Vi(i, { key: a }) : i);
  }
  if (r > 1) for (let s = 0; s < o.length; s++) o[s].patchFlag = -2;
  return o;
}
// @__NO_SIDE_EFFECTS__
function rr(e, t) {
  return ae(e)
    ? // #8236: extend call and options.name access are considered side-effects
      // by Rollup, so we have to wrap it in a pure-annotated IIFE.
      (() => Z({ name: e.name }, t, { setup: e }))()
    : e;
}
function sr(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function ir(e) {
  const t = Zi(),
    n = xn(null);
  if (t) {
    const o = t.refs === q ? (t.refs = {}) : t.refs;
    Object.defineProperty(o, e, { enumerable: !0, get: () => n.value, set: (e) => (n.value = e) });
  }
  return n;
}
function ar(e, t) {
  let n;
  return !(!(n = Object.getOwnPropertyDescriptor(e, t)) || n.configurable);
}
const lr = new WeakMap();
function cr(e, t, n, o, r = !1) {
  if (oe(e)) return void e.forEach((e, s) => cr(e, t && (oe(t) ? t[s] : t), n, o, r));
  if (wr(o) && !r)
    return void (
      512 & o.shapeFlag &&
      o.type.__asyncResolved &&
      o.component.subTree.component &&
      cr(e, t, n, o.component.subTree)
    );
  const s = 4 & o.shapeFlag ? pa(o.component) : o.el,
    i = r ? null : s,
    { i: a, r: l } = e,
    c = t && t.r,
    u = a.refs === q ? (a.refs = {}) : a.refs,
    f = a.setupState,
    d = yn(f),
    p = f === q ? J : (e) => !ar(u, e) && ne(d, e),
    h = (e, t) => !t || !ar(u, t);
  if (null != c && c !== l)
    if ((ur(t), le(c))) ((u[c] = null), p(c) && (f[c] = null));
    else if (Sn(c)) {
      const e = t;
      (h(0, e.k) && (c.value = null), e.k && (u[e.k] = null));
    }
  if (ae(l)) Kn(l, a, 12, [i, u]);
  else {
    const t = le(l),
      o = Sn(l);
    if (t || o) {
      const a = () => {
        if (e.f) {
          const n = t ? (p(l) ? f[l] : u[l]) : h() || !e.k ? l.value : u[e.k];
          if (r) oe(n) && ee(n, s);
          else if (oe(n)) n.includes(s) || n.push(s);
          else if (t) ((u[l] = [s]), p(l) && (f[l] = u[l]));
          else {
            const t = [s];
            (h(0, e.k) && (l.value = t), e.k && (u[e.k] = t));
          }
        } else
          t
            ? ((u[l] = i), p(l) && (f[l] = i))
            : o && (h(0, e.k) && (l.value = i), e.k && (u[e.k] = i));
      };
      if (i) {
        const t = () => {
          (a(), lr.delete(e));
        };
        ((t.id = -1), lr.set(e, t), ti(t, n));
      } else (ur(e), a());
    }
  }
}
function ur(e) {
  const t = lr.get(e);
  t && ((t.flags |= 8), lr.delete(e));
}
let fr = !1;
const dr = () => {
    fr || (fr = !0);
  },
  pr = (e) => {
    if (1 === e.nodeType)
      return ((e) => e.namespaceURI.includes("svg") && "foreignObject" !== e.tagName)(e)
        ? "svg"
        : ((e) => e.namespaceURI.includes("MathML"))(e)
          ? "mathml"
          : void 0;
  },
  hr = (e) => 8 === e.nodeType;
function mr(e) {
  const {
      mt: t,
      p: n,
      o: {
        patchProp: o,
        createText: r,
        nextSibling: s,
        parentNode: i,
        remove: a,
        insert: l,
        createComment: c,
      },
    } = e,
    u = (n, o, a, c, _, y = !1) => {
      y = y || !!o.dynamicChildren;
      const b = hr(n) && "[" === n.data,
        w = () => h(n, o, a, c, _, b),
        { type: E, ref: S, shapeFlag: k, patchFlag: x } = o;
      let O = n.nodeType;
      ((o.el = n), -2 === x && ((y = !1), (o.dynamicChildren = null)));
      let T = null;
      switch (E) {
        case wi:
          3 !== O
            ? "" === o.children
              ? (l((o.el = r("")), i(n), n), (T = n))
              : (T = w())
            : (n.data !== o.children && (dr(), (n.data = o.children)), (T = s(n)));
          break;
        case Ei:
          v(n)
            ? ((T = s(n)), g((o.el = n.content.firstChild), n, a))
            : (T = 8 !== O || b ? w() : s(n));
          break;
        case Si:
          if ((b && (O = (n = s(n)).nodeType), 1 === O || 3 === O)) {
            T = n;
            const e = !o.children.length;
            for (let t = 0; t < o.staticCount; t++)
              (e && (o.children += 1 === T.nodeType ? T.outerHTML : T.data),
                t === o.staticCount - 1 && (o.anchor = T),
                (T = s(T)));
            return b ? s(T) : T;
          }
          w();
          break;
        case bi:
          T = b ? p(n, o, a, c, _, y) : w();
          break;
        default:
          if (1 & k)
            T =
              (1 === O && o.type.toLowerCase() === n.tagName.toLowerCase()) || v(n)
                ? f(n, o, a, c, _, y)
                : w();
          else if (6 & k) {
            o.slotScopeIds = _;
            const e = i(n);
            if (
              ((T = b
                ? m(n)
                : hr(n) && "teleport start" === n.data
                  ? m(n, n.data, "teleport end")
                  : s(n)),
              t(o, e, null, a, c, pr(e), y),
              wr(o) && !o.type.__asyncResolved)
            ) {
              let t;
              (b
                ? ((t = ji(bi)), (t.anchor = T ? T.previousSibling : e.lastChild))
                : (t = 3 === n.nodeType ? Ui("") : ji("div")),
                (t.el = n),
                (o.component.subTree = t));
            }
          } else
            64 & k
              ? (T = 8 !== O ? w() : o.type.hydrate(n, o, a, c, _, y, e, d))
              : 128 & k && (T = o.type.hydrate(n, o, a, c, pr(i(n)), _, y, e, u));
      }
      return (null != S && cr(S, null, c, o), T);
    },
    f = (e, t, n, r, s, i) => {
      i = i || !!t.dynamicChildren;
      const { type: l, props: c, patchFlag: u, shapeFlag: f, dirs: p, transition: h } = t,
        m = "input" === l || "option" === l;
      if (m || -1 !== u) {
        p && wo(t, null, n, "created");
        let l,
          _ = !1;
        if (v(e)) {
          _ =
            ai(
              null,
              // no need check parentSuspense in hydration
              h
            ) &&
            n &&
            n.vnode.props &&
            n.vnode.props.appear;
          const o = e.content.firstChild;
          if (_) {
            const e = o.getAttribute("class");
            (e && (o.$cls = e), h.beforeEnter(o));
          }
          (g(o, e, n), (t.el = e = o));
        }
        if (16 & f && (!c || (!c.innerHTML && !c.textContent))) {
          let o = d(e.firstChild, t, e, n, r, s, i);
          for (; o; ) {
            _r(
              e,
              1
              /* CHILDREN */
            ) || dr();
            const t = o;
            ((o = o.nextSibling), a(t));
          }
        } else if (8 & f) {
          let n = t.children;
          "\n" !== n[0] || ("PRE" !== e.tagName && "TEXTAREA" !== e.tagName) || (n = n.slice(1));
          const { textContent: o } = e;
          o !== n && // innerHTML normalize \r\n or \r into a single \n in the DOM
            o !== n.replace(/\r\n|\r/g, "\n") &&
            (_r(
              e,
              0
              /* TEXT */
            ) || dr(),
            (e.textContent = t.children));
        }
        if (c)
          if (m || !i || 48 & u) {
            const t = e.tagName.includes("-");
            for (const r in c)
              ((m && (r.endsWith("value") || "indeterminate" === r)) ||
                (Q(r) && !ge(r)) || // force hydrate v-bind with .prop modifiers
                "." === r[0] ||
                (t && !ge(r))) &&
                o(e, r, null, c[r], void 0, n);
          } else if (c.onClick) o(e, "onClick", null, c.onClick, void 0, n);
          else if (4 & u && mn(c.style)) for (const e in c.style) c.style[e];
        ((l = c && c.onVnodeBeforeMount) && Yi(l, n, t),
          p && wo(t, null, n, "beforeMount"),
          ((l = c && c.onVnodeMounted) || p || _) &&
            _i(() => {
              (l && Yi(l, n, t), _ && h.enter(e), p && wo(t, null, n, "mounted"));
            }, r));
      }
      return e.nextSibling;
    },
    d = (e, t, o, i, a, c, f) => {
      f = f || !!t.dynamicChildren;
      const d = t.children,
        p = d.length;
      for (let h = 0; h < p; h++) {
        const t = f ? d[h] : (d[h] = Wi(d[h])),
          m = t.type === wi;
        e
          ? (m &&
              !f &&
              h + 1 < p &&
              Wi(d[h + 1]).type === wi &&
              (l(r(e.data.slice(t.children.length)), o, s(e)), (e.data = t.children)),
            (e = u(e, t, i, a, c, f)))
          : m && !t.children
            ? l((t.el = r("")), o)
            : (_r(
                o,
                1
                /* CHILDREN */
              ) || dr(),
              n(null, t, o, null, i, a, pr(o), c));
      }
      return e;
    },
    p = (e, t, n, o, r, a) => {
      const { slotScopeIds: u } = t;
      u && (r = r ? r.concat(u) : u);
      const f = i(e),
        p = d(s(e), t, f, n, o, r, a);
      return p && hr(p) && "]" === p.data
        ? s((t.anchor = p))
        : (dr(), l((t.anchor = c("]")), f, p), p);
    },
    h = (e, t, o, r, l, c) => {
      if (
        (_r(
          e.parentElement,
          1
          /* CHILDREN */
        ) || dr(),
        (t.el = null),
        c)
      ) {
        const t = m(e);
        for (;;) {
          const n = s(e);
          if (!n || n === t) break;
          a(n);
        }
      }
      const u = s(e),
        f = i(e);
      return (a(e), n(null, t, f, u, o, r, pr(f), l), o && ((o.vnode.el = t.el), Vs(o, t.el)), u);
    },
    m = (e, t = "[", n = "]") => {
      let o = 0;
      for (; e; )
        if ((e = s(e)) && hr(e) && (e.data === t && o++, e.data === n)) {
          if (0 === o) return s(e);
          o--;
        }
      return e;
    },
    g = (e, t, n) => {
      const o = t.parentNode;
      o && o.replaceChild(e, t);
      let r = n;
      for (; r; ) (r.vnode.el === t && (r.vnode.el = r.subTree.el = e), (r = r.parent));
    },
    v = (e) => 1 === e.nodeType && "TEMPLATE" === e.tagName;
  return [
    (e, t) => {
      if (!t.hasChildNodes()) return (n(null, e, t), uo(), void (t._vnode = e));
      (u(t.firstChild, e, null, null, null), uo(), (t._vnode = e));
    },
    u,
  ];
}
const gr = "data-allow-mismatch",
  vr = { 0: "text", 1: "children", 2: "class", 3: "style", 4: "attribute" };
function _r(e, t) {
  if (0 === t || 1 === t) for (; e && !e.hasAttribute(gr); ) e = e.parentElement;
  const n = e && e.getAttribute(gr);
  if (null == n) return !1;
  if ("" === n) return !0;
  {
    const e = n.split(",");
    return !(0 !== t || !e.includes("children")) || e.includes(vr[t]);
  }
}
const yr = Re().requestIdleCallback || ((e) => setTimeout(e, 1)),
  br = Re().cancelIdleCallback || ((e) => clearTimeout(e));
const wr = (e) => !!e.type.__asyncLoader;
// @__NO_SIDE_EFFECTS__
function Er(e) {
  ae(e) && (e = { loader: e });
  const {
    loader: t,
    loadingComponent: n,
    errorComponent: o,
    delay: r = 200,
    hydrate: s,
    timeout: i,
    suspensible:
      // undefined = never times out
      a = !0,
    onError: l,
  } = e;
  let c,
    u = null,
    f = 0;
  const d = () => {
    let e;
    return (
      u ||
      (e = u =
        t()
          .catch((e) => {
            if (((e = e instanceof Error ? e : new Error(String(e))), l))
              return new Promise((t, n) => {
                l(
                  e,
                  () => t((f++, (u = null), d())),
                  () => n(e),
                  f + 1
                );
              });
            throw e;
          })
          .then((t) =>
            e !== u && u
              ? u
              : (t && (t.__esModule || "Module" === t[Symbol.toStringTag]) && (t = t.default),
                (c = t),
                t)
          ))
    );
  };
  return rr({
    name: "AsyncComponentWrapper",
    __asyncLoader: d,
    __asyncHydrate(e, t, n) {
      let o = !1;
      (t.bu || (t.bu = [])).push(() => (o = !0));
      const r = () => {
          o || n();
        },
        i = s
          ? () => {
              const n = s(r, (t) =>
                (function (e, t) {
                  if (hr(e) && "[" === e.data) {
                    let n = 1,
                      o = e.nextSibling;
                    for (; o; ) {
                      if (1 === o.nodeType) {
                        if (!1 === t(o)) break;
                      } else if (hr(o))
                        if ("]" === o.data) {
                          if (0 === --n) break;
                        } else "[" === o.data && n++;
                      o = o.nextSibling;
                    }
                  } else t(e);
                })(e, t)
              );
              n && (t.bum || (t.bum = [])).push(n);
            }
          : r;
      c ? i() : d().then(() => !t.isUnmounted && i());
    },
    get __asyncResolved() {
      return c;
    },
    setup() {
      const e = Xi;
      if ((sr(e), c)) return () => Sr(c, e);
      const t = (t) => {
        ((u = null), Qn(t, e, 13, !o));
      };
      if ((a && e.suspense) || aa)
        return d()
          .then((t) => () => Sr(t, e))
          .catch((e) => (t(e), () => (o ? ji(o, { error: e }) : null)));
      const s = kn(!1),
        l = kn(),
        f = kn(!!r);
      return (
        r &&
          setTimeout(() => {
            f.value = !1;
          }, r),
        null != i &&
          setTimeout(() => {
            if (!s.value && !l.value) {
              const e = new Error(`Async component timed out after ${i}ms.`);
              (t(e), (l.value = e));
            }
          }, i),
        d()
          .then(() => {
            ((s.value = !0), e.parent && kr(e.parent.vnode) && e.parent.update());
          })
          .catch((e) => {
            (t(e), (l.value = e));
          }),
        () =>
          s.value && c
            ? Sr(c, e)
            : l.value && o
              ? ji(o, { error: l.value })
              : n && !f.value
                ? Sr(n, e)
                : void 0
      );
    },
  });
}
function Sr(e, t) {
  const { ref: n, props: o, children: r, ce: s } = t.vnode,
    i = ji(e, o, r);
  return ((i.ref = n), (i.ce = s), delete t.vnode.ce, i);
}
const kr = (e) => e.type.__isKeepAlive,
  xr = {
    name: "KeepAlive",
    // Marker for special handling inside the renderer. We are not using a ===
    // check directly on KeepAlive in the renderer, because importing it directly
    // would prevent it from being tree-shaken.
    __isKeepAlive: !0,
    props: {
      include: [String, RegExp, Array],
      exclude: [String, RegExp, Array],
      max: [String, Number],
    },
    setup(e, { slots: t }) {
      const n = Zi(),
        o = n.ctx;
      if (!o.renderer)
        return () => {
          const e = t.default && t.default();
          return e && 1 === e.length ? e[0] : e;
        };
      const r = new Map(),
        s = new Set();
      let i = null;
      const a = n.suspense,
        {
          renderer: {
            p: l,
            m: c,
            um: u,
            o: { createElement: f },
          },
        } = o,
        d = f("div");
      function p(e) {
        (Ir(e), u(e, n, a, !0));
      }
      function h(e) {
        r.forEach((t, n) => {
          const o = ha(wr(t) ? t.type.__asyncResolved || {} : t.type);
          o && !e(o) && m(n);
        });
      }
      function m(e) {
        const t = r.get(e);
        (!t || (i && Fi(t, i)) ? i && Ir(i) : p(t), r.delete(e), s.delete(e));
      }
      ((o.activate = (e, t, n, o, r) => {
        const s = e.component;
        (c(e, t, n, 0, a),
          l(s.vnode, e, t, n, s, a, o, e.slotScopeIds, r),
          ti(() => {
            ((s.isDeactivated = !1), s.a && xe(s.a));
            const t = e.props && e.props.onVnodeMounted;
            t && Yi(t, s.parent, e);
          }, a));
      }),
        (o.deactivate = (e) => {
          const t = e.component;
          (ui(t.m),
            ui(t.a),
            c(e, d, null, 1, a),
            ti(() => {
              t.da && xe(t.da);
              const n = e.props && e.props.onVnodeUnmounted;
              (n && Yi(n, t.parent, e), (t.isDeactivated = !0));
            }, a));
        }),
        Co(
          () => [e.include, e.exclude],
          ([e, t]) => {
            (e && h((t) => Or(e, t)), t && h((e) => !Or(t, e)));
          },
          // prune post-render after `current` has been updated
          { flush: "post", deep: !0 }
        ));
      let g = null;
      const v = () => {
        null != g &&
          (di(n.subTree.type)
            ? ti(() => {
                r.set(g, Nr(n.subTree));
              }, n.subTree.suspense)
            : r.set(g, Nr(n.subTree)));
      };
      return (
        Mr(v),
        jr(v),
        $r(() => {
          r.forEach((e) => {
            const { subTree: t, suspense: o } = n,
              r = Nr(t);
            if (e.type === r.type && e.key === r.key) {
              Ir(r);
              const e = r.component.da;
              return void (e && ti(e, o));
            }
            p(e);
          });
        }),
        () => {
          if (((g = null), !t.default)) return (i = null);
          const n = t.default(),
            o = n[0];
          if (n.length > 1) return ((i = null), n);
          if (!(Pi(o) && (4 & o.shapeFlag || 128 & o.shapeFlag))) return ((i = null), o);
          let a = Nr(o);
          if (a.type === Ei) return ((i = null), a);
          const l = a.type,
            c = ha(wr(a) ? a.type.__asyncResolved || {} : l),
            { include: u, exclude: f, max: d } = e;
          if ((u && (!c || !Or(u, c))) || (f && c && Or(f, c)))
            return ((a.shapeFlag &= -257), (i = a), o);
          const p = null == a.key ? l : a.key,
            h = r.get(p);
          return (
            a.el && ((a = Vi(a)), 128 & o.shapeFlag && (o.ssContent = a)),
            (g = p),
            h
              ? ((a.el = h.el),
                (a.component = h.component),
                a.transition && nr(a, a.transition),
                (a.shapeFlag |= 512),
                s.delete(p),
                s.add(p))
              : (s.add(p), d && s.size > parseInt(d, 10) && m(s.values().next().value)),
            (a.shapeFlag |= 256),
            (i = a),
            di(o.type) ? o : a
          );
        }
      );
    },
  };
function Or(e, t) {
  return oe(e)
    ? e.some((e) => Or(e, t))
    : le(e)
      ? e.split(",").includes(t)
      : "[object RegExp]" === pe(e) && ((e.lastIndex = 0), e.test(t));
}
function Tr(e, t) {
  Cr(e, "a", t);
}
function Ar(e, t) {
  Cr(e, "da", t);
}
function Cr(e, t, n = Xi) {
  const o =
    e.__wdc ||
    (e.__wdc = () => {
      let t = n;
      for (; t; ) {
        if (t.isDeactivated) return;
        t = t.parent;
      }
      return e();
    });
  if ((Pr(t, o, n), n)) {
    let e = n.parent;
    for (; e && e.parent; ) (kr(e.parent.vnode) && Rr(o, t, n, e), (e = e.parent));
  }
}
function Rr(e, t, n, o) {
  const r = Pr(
    t,
    e,
    o,
    !0
    /* prepend */
  );
  Vr(() => {
    ee(o[t], r);
  }, n);
}
function Ir(e) {
  ((e.shapeFlag &= -257), (e.shapeFlag &= -513));
}
function Nr(e) {
  return 128 & e.shapeFlag ? e.ssContent : e;
}
function Pr(e, t, n = Xi, o = !1) {
  if (n) {
    const r = n[e] || (n[e] = []),
      s =
        t.__weh ||
        (t.__weh = (...o) => {
          gt();
          const r = na(n),
            s = Jn(t, n, e, o);
          return (r(), vt(), s);
        });
    return (o ? r.unshift(s) : r.push(s), s);
  }
}
const Fr =
    (e) =>
    (t, n = Xi) => {
      (aa && "sp" !== e) || Pr(e, (...e) => t(...e), n);
    },
  Lr = Fr("bm"),
  Mr = Fr("m"),
  Dr = Fr("bu"),
  jr = Fr("u"),
  $r = Fr("bum"),
  Vr = Fr("um"),
  Ur = Fr("sp"),
  Br = Fr("rtg"),
  Hr = Fr("rtc");
function Wr(e, t = Xi) {
  Pr("ec", e, t);
}
const zr = "components";
function Gr(e, t) {
  return Jr(zr, e, !0, t) || e;
}
const qr = Symbol.for("v-ndc");
function Yr(e) {
  return le(e) ? Jr(zr, e, !1) || e : e || qr;
}
function Kr(e) {
  return Jr("directives", e);
}
function Jr(e, t, n = !0, o = !1) {
  const r = go || Xi;
  if (r) {
    const n = r.type;
    if (e === zr) {
      const e = ha(n, !1);
      if (e && (e === t || e === ye(t) || e === Ee(ye(t)))) return n;
    }
    const s =
      // local registration
      // check instance[type] first which is resolved for options API
      Qr(r[e] || n[e], t) || // global registration
      Qr(r.appContext[e], t);
    return !s && o ? n : s;
  }
}
function Qr(e, t) {
  return e && (e[t] || e[ye(t)] || e[Ee(ye(t))]);
}
function Xr(e, t, n, o) {
  let r;
  const s = n && n[o],
    i = oe(e);
  if (i || le(e)) {
    let n = !1,
      o = !1;
    (i && mn(e) && ((n = !vn(e)), (o = gn(e)), (e = Rt(e))), (r = new Array(e.length)));
    for (let i = 0, a = e.length; i < a; i++)
      r[i] = t(n ? (o ? En(wn(e[i])) : wn(e[i])) : e[i], i, void 0, s && s[i]);
  } else if ("number" == typeof e) {
    r = new Array(e);
    for (let n = 0; n < e; n++) r[n] = t(n + 1, n, void 0, s && s[n]);
  } else if (ue(e))
    if (e[Symbol.iterator]) r = Array.from(e, (e, n) => t(e, n, void 0, s && s[n]));
    else {
      const n = Object.keys(e);
      r = new Array(n.length);
      for (let o = 0, i = n.length; o < i; o++) {
        const i = n[o];
        r[o] = t(e[i], i, o, s && s[o]);
      }
    }
  else r = [];
  return (n && (n[o] = r), r);
}
function Zr(e, t) {
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    if (oe(o)) for (let t = 0; t < o.length; t++) e[o[t].name] = o[t].fn;
    else
      o &&
        (e[o.name] = o.key
          ? (...e) => {
              const t = o.fn(...e);
              return (t && (t.key = o.key), t);
            }
          : o.fn);
  }
  return e;
}
function es(e, t, n = {}, o, r) {
  if (go.ce || (go.parent && wr(go.parent) && go.parent.ce)) {
    const e = Object.keys(n).length > 0;
    return (
      "default" !== t && (n.name = t),
      Oi(),
      Ni(bi, null, [ji("slot", n, o && o())], e ? -2 : 64)
    );
  }
  let s = e[t];
  (s && s._c && (s._d = !1), Oi());
  const i = s && ts(s(n)),
    a =
      n.key || // slot content array of a dynamic conditional slot may have a branch
      // key attached in the `createSlots` helper, respect that
      (i && i.key),
    l = Ni(
      bi,
      {
        key:
          (a && !ce(a) ? a : `_${t}`) + // #7256 force differentiate fallback content from actual content
          (!i && o ? "_fb" : ""),
      },
      i || (o ? o() : []),
      i && 1 === e._ ? 64 : -2
    );
  return (!r && l.scopeId && (l.slotScopeIds = [l.scopeId + "-s"]), s && s._c && (s._d = !0), l);
}
function ts(e) {
  return e.some((e) => !Pi(e) || (e.type !== Ei && !(e.type === bi && !ts(e.children)))) ? e : null;
}
function ns(e, t) {
  const n = {};
  for (const o in e) n[t && /[A-Z]/.test(o) ? `on:${o}` : Se(o)] = e[o];
  return n;
}
const os = (e) => (e ? (ra(e) ? pa(e) : os(e.parent)) : null),
  rs =
    // Move PURE marker to new line to workaround compiler discarding it
    // due to type annotation
    Z(Object.create(null), {
      $: (e) => e,
      $el: (e) => e.vnode.el,
      $data: (e) => e.data,
      $props: (e) => e.props,
      $attrs: (e) => e.attrs,
      $slots: (e) => e.slots,
      $refs: (e) => e.refs,
      $parent: (e) => os(e.parent),
      $root: (e) => os(e.root),
      $host: (e) => e.ce,
      $emit: (e) => e.emit,
      $options: (e) => vs(e),
      $forceUpdate: (e) =>
        e.f ||
        (e.f = () => {
          io(e.update);
        }),
      $nextTick: (e) => e.n || (e.n = so.bind(e.proxy)),
      $watch: (e) => Io.bind(e),
    }),
  ss = (e, t) => e !== q && !e.__isScriptSetup && ne(e, t),
  is = {
    get({ _: e }, t) {
      if ("__v_skip" === t) return !0;
      const {
        ctx: n,
        setupState: o,
        data: r,
        props: s,
        accessCache: i,
        type: a,
        appContext: l,
      } = e;
      if ("$" !== t[0]) {
        const e = i[t];
        if (void 0 !== e)
          switch (e) {
            case 1:
              return o[t];
            case 2:
              return r[t];
            case 4:
              return n[t];
            case 3:
              return s[t];
          }
        else {
          if (ss(o, t)) return ((i[t] = 1), o[t]);
          if (r !== q && ne(r, t)) return ((i[t] = 2), r[t]);
          if (ne(s, t)) return ((i[t] = 3), s[t]);
          if (n !== q && ne(n, t)) return ((i[t] = 4), n[t]);
          ps && (i[t] = 0);
        }
      }
      const c = rs[t];
      let u, f;
      return c
        ? ("$attrs" === t && Tt(e.attrs, 0, ""), c(e))
        : // css module (injected by vue-loader)
          (u = a.__cssModules) && (u = u[t])
          ? u
          : n !== q && ne(n, t)
            ? ((i[t] = 4), n[t])
            : // global properties
              ((f = l.config.globalProperties), ne(f, t) ? f[t] : void 0);
    },
    set({ _: e }, t, n) {
      const { data: o, setupState: r, ctx: s } = e;
      return ss(r, t)
        ? ((r[t] = n), !0)
        : o !== q && ne(o, t)
          ? ((o[t] = n), !0)
          : !ne(e.props, t) && ("$" !== t[0] || !(t.slice(1) in e)) && ((s[t] = n), !0);
    },
    has(
      { _: { data: e, setupState: t, accessCache: n, ctx: o, appContext: r, props: s, type: i } },
      a
    ) {
      let l;
      return !!(
        n[a] ||
        (e !== q && "$" !== a[0] && ne(e, a)) ||
        ss(t, a) ||
        ne(s, a) ||
        ne(o, a) ||
        ne(rs, a) ||
        ne(r.config.globalProperties, a) ||
        ((l = i.__cssModules) && l[a])
      );
    },
    defineProperty(e, t, n) {
      return (
        null != n.get ? (e._.accessCache[t] = 0) : ne(n, "value") && this.set(e, t, n.value, null),
        Reflect.defineProperty(e, t, n)
      );
    },
  },
  as = Z({}, is, {
    get(e, t) {
      if (t !== Symbol.unscopables) return is.get(e, t, e);
    },
    has: (e, t) => "_" !== t[0] && !Ie(t),
  });
function ls() {
  return us().slots;
}
function cs() {
  return us().attrs;
}
function us(e) {
  const t = Zi();
  return t.setupContext || (t.setupContext = da(t));
}
function fs(e) {
  return oe(e) ? e.reduce((e, t) => ((e[t] = null), e), {}) : e;
}
function ds(e, t) {
  return e && t ? (oe(e) && oe(t) ? e.concat(t) : Z({}, fs(e), fs(t))) : e || t;
}
let ps = !0;
function hs(e) {
  const t = vs(e),
    n = e.proxy,
    o = e.ctx;
  ((ps = !1), t.beforeCreate && ms(t.beforeCreate, e, "bc"));
  const {
    // state
    data: r,
    computed: s,
    methods: i,
    watch: a,
    provide: l,
    inject: c,
    created:
      // lifecycle
      u,
    beforeMount: f,
    mounted: d,
    beforeUpdate: p,
    updated: h,
    activated: m,
    deactivated: g,
    beforeDestroy: v,
    beforeUnmount: _,
    destroyed: y,
    unmounted: b,
    render: w,
    renderTracked: E,
    renderTriggered: S,
    errorCaptured: k,
    serverPrefetch: x,
    expose:
      // public API
      O,
    inheritAttrs: T,
    components:
      // assets
      A,
    directives: C,
    filters: R,
  } = t;
  if (
    (c &&
      (function (e, t) {
        oe(e) && (e = ws(e));
        for (const n in e) {
          const o = e[n];
          let r;
          ((r = ue(o)
            ? "default" in o
              ? So(o.from || n, o.default, !0)
              : So(o.from || n)
            : So(o)),
            Sn(r)
              ? Object.defineProperty(t, n, {
                  enumerable: !0,
                  configurable: !0,
                  get: () => r.value,
                  set: (e) => (r.value = e),
                })
              : (t[n] = r));
        }
      })(c, o, null),
    i)
  )
    for (const N in i) {
      const e = i[N];
      ae(e) && (o[N] = e.bind(n));
    }
  if (r) {
    const t = r.call(n, n);
    ue(t) && (e.data = un(t));
  }
  if (((ps = !0), s))
    for (const N in s) {
      const e = s[N],
        t = ae(e) ? e.bind(n, n) : ae(e.get) ? e.get.bind(n, n) : K,
        r = !ae(e) && ae(e.set) ? e.set.bind(n) : K,
        i = ma({ get: t, set: r });
      Object.defineProperty(o, N, {
        enumerable: !0,
        configurable: !0,
        get: () => i.value,
        set: (e) => (i.value = e),
      });
    }
  if (a) for (const N in a) gs(a[N], o, n, N);
  if (l) {
    const e = ae(l) ? l.call(n) : l;
    Reflect.ownKeys(e).forEach((t) => {
      Eo(t, e[t]);
    });
  }
  function I(e, t) {
    oe(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
  }
  if (
    (u && ms(u, e, "c"),
    I(Lr, f),
    I(Mr, d),
    I(Dr, p),
    I(jr, h),
    I(Tr, m),
    I(Ar, g),
    I(Wr, k),
    I(Hr, E),
    I(Br, S),
    I($r, _),
    I(Vr, b),
    I(Ur, x),
    oe(O))
  )
    if (O.length) {
      const t = e.exposed || (e.exposed = {});
      O.forEach((e) => {
        Object.defineProperty(t, e, { get: () => n[e], set: (t) => (n[e] = t), enumerable: !0 });
      });
    } else e.exposed || (e.exposed = {});
  (w && e.render === K && (e.render = w),
    null != T && (e.inheritAttrs = T),
    A && (e.components = A),
    C && (e.directives = C),
    x && sr(e));
}
function ms(e, t, n) {
  Jn(oe(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function gs(e, t, n, o) {
  let r = o.includes(".") ? No(n, o) : () => n[o];
  if (le(e)) {
    const n = t[e];
    ae(n) && Co(r, n);
  } else if (ae(e)) Co(r, e.bind(n));
  else if (ue(e))
    if (oe(e)) e.forEach((e) => gs(e, t, n, o));
    else {
      const o = ae(e.handler) ? e.handler.bind(n) : t[e.handler];
      ae(o) && Co(r, o, e);
    }
}
function vs(e) {
  const t = e.type,
    { mixins: n, extends: o } = t,
    {
      mixins: r,
      optionsCache: s,
      config: { optionMergeStrategies: i },
    } = e.appContext,
    a = s.get(t);
  let l;
  return (
    a
      ? (l = a)
      : r.length || n || o
        ? ((l = {}), r.length && r.forEach((e) => _s(l, e, i, !0)), _s(l, t, i))
        : (l = t),
    ue(t) && s.set(t, l),
    l
  );
}
function _s(e, t, n, o = !1) {
  const { mixins: r, extends: s } = t;
  (s && _s(e, s, n, !0), r && r.forEach((t) => _s(e, t, n, !0)));
  for (const i in t)
    if (o && "expose" === i);
    else {
      const o = ys[i] || (n && n[i]);
      e[i] = o ? o(e[i], t[i]) : t[i];
    }
  return e;
}
const ys = {
  data: bs,
  props: ks,
  emits: ks,
  // objects
  methods: Ss,
  computed: Ss,
  // lifecycle
  beforeCreate: Es,
  created: Es,
  beforeMount: Es,
  mounted: Es,
  beforeUpdate: Es,
  updated: Es,
  beforeDestroy: Es,
  beforeUnmount: Es,
  destroyed: Es,
  unmounted: Es,
  activated: Es,
  deactivated: Es,
  errorCaptured: Es,
  serverPrefetch: Es,
  // assets
  components: Ss,
  directives: Ss,
  // watch
  watch: function (e, t) {
    if (!e) return t;
    if (!t) return e;
    const n = Z(Object.create(null), e);
    for (const o in t) n[o] = Es(e[o], t[o]);
    return n;
  },
  // provide / inject
  provide: bs,
  inject: function (e, t) {
    return Ss(ws(e), ws(t));
  },
};
function bs(e, t) {
  return t
    ? e
      ? function () {
          return Z(ae(e) ? e.call(this, this) : e, ae(t) ? t.call(this, this) : t);
        }
      : t
    : e;
}
function ws(e) {
  if (oe(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
    return t;
  }
  return e;
}
function Es(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Ss(e, t) {
  return e ? Z(Object.create(null), e, t) : t;
}
function ks(e, t) {
  return e
    ? oe(e) && oe(t)
      ? [...new Set([...e, ...t])]
      : Z(Object.create(null), fs(e), fs(null != t ? t : {}))
    : t;
}
function xs() {
  return {
    app: null,
    config: {
      isNativeTag: J,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {},
    },
    mixins: [],
    components: {},
    directives: {},
    provides: Object.create(null),
    optionsCache: new WeakMap(),
    propsCache: new WeakMap(),
    emitsCache: new WeakMap(),
  };
}
let Os = 0;
function Ts(e, t) {
  return function (n, o = null) {
    (ae(n) || (n = Z({}, n)), null == o || ue(o) || (o = null));
    const r = xs(),
      s = new WeakSet(),
      i = [];
    let a = !1;
    const l = (r.app = {
      _uid: Os++,
      _component: n,
      _props: o,
      _container: null,
      _context: r,
      _instance: null,
      version: _a,
      get config() {
        return r.config;
      },
      set config(e) {},
      use: (e, ...t) => (
        s.has(e) ||
          (e && ae(e.install) ? (s.add(e), e.install(l, ...t)) : ae(e) && (s.add(e), e(l, ...t))),
        l
      ),
      mixin: (e) => (r.mixins.includes(e) || r.mixins.push(e), l),
      component: (e, t) => (t ? ((r.components[e] = t), l) : r.components[e]),
      directive: (e, t) => (t ? ((r.directives[e] = t), l) : r.directives[e]),
      mount(s, i, c) {
        if (!a) {
          const u = l._ceVNode || ji(n, o);
          return (
            (u.appContext = r),
            !0 === c ? (c = "svg") : !1 === c && (c = void 0),
            i && t ? t(u, s) : e(u, s, c),
            (a = !0),
            (l._container = s),
            (s.__vue_app__ = l),
            pa(u.component)
          );
        }
      },
      onUnmount(e) {
        i.push(e);
      },
      unmount() {
        a && (Jn(i, l._instance, 16), e(null, l._container), delete l._container.__vue_app__);
      },
      provide: (e, t) => ((r.provides[e] = t), l),
      runWithContext(e) {
        const t = As;
        As = l;
        try {
          return e();
        } finally {
          As = t;
        }
      },
    });
    return l;
  };
}
let As = null;
function Cs(e, t, n = q) {
  const o = Zi(),
    r = ye(t),
    s = we(t),
    i = Rs(e, r),
    a = Fn((i, a) => {
      let l,
        c,
        u = q;
      return (
        Ao(() => {
          const t = e[r];
          ke(l, t) && ((l = t), a());
        }),
        {
          get: () => (i(), n.get ? n.get(l) : l),
          set(e) {
            const i = n.set ? n.set(e) : e;
            if (!(ke(i, l) || (u !== q && ke(e, u)))) return;
            const f = o.vnode.props;
            ((f && // check if parent has passed v-model
              (t in f || r in f || s in f) &&
              (`onUpdate:${t}` in f || `onUpdate:${r}` in f || `onUpdate:${s}` in f)) ||
              ((l = e), a()),
              o.emit(`update:${t}`, i),
              ke(e, i) && ke(e, u) && !ke(i, c) && a(),
              (u = e),
              (c = i));
          },
        }
      );
    });
  return (
    (a[Symbol.iterator] = () => {
      let e = 0;
      return { next: () => (e < 2 ? { value: e++ ? i || q : a, done: !1 } : { done: !0 }) };
    }),
    a
  );
}
const Rs = (e, t) =>
  "modelValue" === t || "model-value" === t
    ? e.modelModifiers
    : e[`${t}Modifiers`] || e[`${ye(t)}Modifiers`] || e[`${we(t)}Modifiers`];
function Is(e, t, ...n) {
  if (e.isUnmounted) return;
  const o = e.vnode.props || q;
  let r = n;
  const s = t.startsWith("update:"),
    i = s && Rs(o, t.slice(7));
  let a;
  i && (i.trim && (r = n.map((e) => (le(e) ? e.trim() : e))), i.number && (r = n.map(Te)));
  let l =
    o[(a = Se(t))] || // also try camelCase event handler (#2249)
    o[(a = Se(ye(t)))];
  (!l && s && (l = o[(a = Se(we(t)))]), l && Jn(l, e, 6, r));
  const c = o[a + "Once"];
  if (c) {
    if (e.emitted) {
      if (e.emitted[a]) return;
    } else e.emitted = {};
    ((e.emitted[a] = !0), Jn(c, e, 6, r));
  }
}
const Ns = new WeakMap();
function Ps(e, t, n = !1) {
  const o = n ? Ns : t.emitsCache,
    r = o.get(e);
  if (void 0 !== r) return r;
  const s = e.emits;
  let i = {},
    a = !1;
  if (!ae(e)) {
    const o = (e) => {
      const n = Ps(e, t, !0);
      n && ((a = !0), Z(i, n));
    };
    (!n && t.mixins.length && t.mixins.forEach(o),
      e.extends && o(e.extends),
      e.mixins && e.mixins.forEach(o));
  }
  return s || a
    ? (oe(s) ? s.forEach((e) => (i[e] = null)) : Z(i, s), ue(e) && o.set(e, i), i)
    : (ue(e) && o.set(e, null), null);
}
function Fs(e, t) {
  return (
    !(!e || !Q(t)) &&
    ((t = t.slice(2).replace(/Once$/, "")),
    ne(e, t[0].toLowerCase() + t.slice(1)) || ne(e, we(t)) || ne(e, t))
  );
}
function Ls(e) {
  const {
      type: t,
      vnode: n,
      proxy: o,
      withProxy: r,
      propsOptions: [s],
      slots: i,
      attrs: a,
      emit: l,
      render: c,
      renderCache: u,
      props: f,
      data: d,
      setupState: p,
      ctx: h,
      inheritAttrs: m,
    } = e,
    g = _o(e);
  let v, _;
  try {
    if (4 & n.shapeFlag) {
      const e = r || o,
        t = e;
      ((v = Wi(c.call(t, e, u, f, p, d, h))), (_ = a));
    } else {
      const e = t;
      (0,
        (v = Wi(e.length > 1 ? e(f, { attrs: a, slots: i, emit: l }) : e(f, null))),
        (_ = t.props ? a : Ms(a)));
    }
  } catch (b) {
    ((ki.length = 0), Qn(b, e, 1), (v = ji(Ei)));
  }
  let y = v;
  if (_ && !1 !== m) {
    const e = Object.keys(_),
      { shapeFlag: t } = y;
    e.length && 7 & t && (s && e.some(X) && (_ = Ds(_, s)), (y = Vi(y, _, !1, !0)));
  }
  return (
    n.dirs && ((y = Vi(y, null, !1, !0)), (y.dirs = y.dirs ? y.dirs.concat(n.dirs) : n.dirs)),
    n.transition && nr(y, n.transition),
    (v = y),
    _o(g),
    v
  );
}
const Ms = (e) => {
    let t;
    for (const n in e) ("class" === n || "style" === n || Q(n)) && ((t || (t = {}))[n] = e[n]);
    return t;
  },
  Ds = (e, t) => {
    const n = {};
    for (const o in e) (X(o) && o.slice(9) in t) || (n[o] = e[o]);
    return n;
  };
function js(e, t, n) {
  const o = Object.keys(t);
  if (o.length !== Object.keys(e).length) return !0;
  for (let r = 0; r < o.length; r++) {
    const s = o[r];
    if ($s(t, e, s) && !Fs(n, s)) return !0;
  }
  return !1;
}
function $s(e, t, n) {
  const o = e[n],
    r = t[n];
  return "style" === n && ue(o) && ue(r) ? !Ue(o, r) : o !== r;
}
function Vs({ vnode: e, parent: t, suspense: n }, o) {
  for (; t; ) {
    const n = t.subTree;
    if (
      (n.suspense && n.suspense.activeBranch === e && ((n.suspense.vnode.el = n.el = o), (e = n)),
      n !== e)
    )
      break;
    (((e = t.vnode).el = o), (t = t.parent));
  }
  n && n.activeBranch === e && (n.vnode.el = o);
}
const Us = {},
  Bs = () => Object.create(Us),
  Hs = (e) => Object.getPrototypeOf(e) === Us;
function Ws(e, t, n, o) {
  const [r, s] = e.propsOptions;
  let i,
    a = !1;
  if (t)
    for (let l in t) {
      if (ge(l)) continue;
      const c = t[l];
      let u;
      r && ne(r, (u = ye(l)))
        ? s && s.includes(u)
          ? ((i || (i = {}))[u] = c)
          : (n[u] = c)
        : Fs(e.emitsOptions, l) || (l in o && c === o[l]) || ((o[l] = c), (a = !0));
    }
  if (s) {
    const t = yn(n),
      o = i || q;
    for (let i = 0; i < s.length; i++) {
      const a = s[i];
      n[a] = zs(r, t, a, o[a], e, !ne(o, a));
    }
  }
  return a;
}
function zs(e, t, n, o, r, s) {
  const i = e[n];
  if (null != i) {
    const e = ne(i, "default");
    if (e && void 0 === o) {
      const e = i.default;
      if (i.type !== Function && !i.skipFactory && ae(e)) {
        const { propsDefaults: s } = r;
        if (n in s) o = s[n];
        else {
          const i = na(r);
          ((o = s[n] = e.call(null, t)), i());
        }
      } else o = e;
      r.ce && r.ce._setProp(n, o);
    }
    i[0] &&
    /* shouldCast */
      (s && !e
        ? (o = !1)
        : !i[1] ||
          /* shouldCastTrue */
          ("" !== o && o !== we(n)) ||
          (o = !0));
  }
  return o;
}
const Gs = new WeakMap();
function qs(e, t, n = !1) {
  const o = n ? Gs : t.propsCache,
    r = o.get(e);
  if (r) return r;
  const s = e.props,
    i = {},
    a = [];
  let l = !1;
  if (!ae(e)) {
    const o = (e) => {
      l = !0;
      const [n, o] = qs(e, t, !0);
      (Z(i, n), o && a.push(...o));
    };
    (!n && t.mixins.length && t.mixins.forEach(o),
      e.extends && o(e.extends),
      e.mixins && e.mixins.forEach(o));
  }
  if (!s && !l) return (ue(e) && o.set(e, Y), Y);
  if (oe(s))
    for (let u = 0; u < s.length; u++) {
      const e = ye(s[u]);
      Ys(e) && (i[e] = q);
    }
  else if (s)
    for (const u in s) {
      const e = ye(u);
      if (Ys(e)) {
        const t = s[u],
          n = (i[e] = oe(t) || ae(t) ? { type: t } : Z({}, t)),
          o = n.type;
        let r = !1,
          l = !0;
        if (oe(o))
          for (let e = 0; e < o.length; ++e) {
            const t = o[e],
              n = ae(t) && t.name;
            if ("Boolean" === n) {
              r = !0;
              break;
            }
            "String" === n && (l = !1);
          }
        else r = ae(o) && "Boolean" === o.name;
        ((n[0] =
        /* shouldCast */
          r),
          (n[1] =
          /* shouldCastTrue */
            l),
          (r || ne(n, "default")) && a.push(e));
      }
    }
  const c = [i, a];
  return (ue(e) && o.set(e, c), c);
}
function Ys(e) {
  return "$" !== e[0] && !ge(e);
}
const Ks = (e) => "_" === e || "_ctx" === e || "$stable" === e,
  Js = (e) => (oe(e) ? e.map(Wi) : [Wi(e)]),
  Qs = (e, t, n) => {
    if (t._n) return t;
    const o = yo((...e) => Js(t(...e)), n);
    return ((o._c = !1), o);
  },
  Xs = (e, t, n) => {
    const o = e._ctx;
    for (const r in e) {
      if (Ks(r)) continue;
      const n = e[r];
      if (ae(n)) t[r] = Qs(0, n, o);
      else if (null != n) {
        const e = Js(n);
        t[r] = () => e;
      }
    }
  },
  Zs = (e, t) => {
    const n = Js(t);
    e.slots.default = () => n;
  },
  ei = (e, t, n) => {
    for (const o in t) (!n && Ks(o)) || (e[o] = t[o]);
  },
  ti = _i;
function ni(e) {
  return ri(e);
}
function oi(e) {
  return ri(e, mr);
}
function ri(e, t) {
  Re().__VUE__ = !0;
  const {
      insert: n,
      remove: o,
      patchProp: r,
      createElement: s,
      createText: i,
      createComment: a,
      setText: l,
      setElementText: c,
      parentNode: u,
      nextSibling: f,
      setScopeId: d = K,
      insertStaticContent: p,
    } = e,
    h = (e, t, n, o = null, r = null, s = null, i = void 0, a = null, l = !!t.dynamicChildren) => {
      if (e === t) return;
      (e && !Fi(e, t) && ((o = V(e)), L(e, r, s, !0), (e = null)),
        -2 === t.patchFlag && ((l = !1), (t.dynamicChildren = null)));
      const { type: c, ref: u, shapeFlag: f } = t;
      switch (c) {
        case wi:
          m(e, t, n, o);
          break;
        case Ei:
          g(e, t, n, o);
          break;
        case Si:
          null == e && v(t, n, o, i);
          break;
        case bi:
          x(e, t, n, o, r, s, i, a, l);
          break;
        default:
          1 & f
            ? _(e, t, n, o, r, s, i, a, l)
            : 6 & f
              ? O(e, t, n, o, r, s, i, a, l)
              : (64 & f || 128 & f) && c.process(e, t, n, o, r, s, i, a, l, H);
      }
      null != u && r
        ? cr(u, e && e.ref, s, t || e, !t)
        : null == u && e && null != e.ref && cr(e.ref, null, s, e, !0);
    },
    m = (e, t, o, r) => {
      if (null == e) n((t.el = i(t.children)), o, r);
      else {
        const n = (t.el = e.el);
        t.children !== e.children && l(n, t.children);
      }
    },
    g = (e, t, o, r) => {
      null == e ? n((t.el = a(t.children || "")), o, r) : (t.el = e.el);
    },
    v = (e, t, n, o) => {
      [e.el, e.anchor] = p(e.children, t, n, o, e.el, e.anchor);
    },
    _ = (e, t, n, o, r, s, i, a, l) => {
      if (("svg" === t.type ? (i = "svg") : "math" === t.type && (i = "mathml"), null == e))
        y(t, n, o, r, s, i, a, l);
      else {
        const n = e.el && e.el._isVueCE ? e.el : null;
        try {
          (n && n._beginPatch(), E(e, t, r, s, i, a, l));
        } finally {
          n && n._endPatch();
        }
      }
    },
    y = (e, t, o, i, a, l, u, f) => {
      let d, p;
      const { props: h, shapeFlag: m, transition: g, dirs: v } = e;
      if (
        ((d = e.el = s(e.type, l, h && h.is, h)),
        8 & m ? c(d, e.children) : 16 & m && w(e.children, d, null, i, a, si(e, l), u, f),
        v && wo(e, null, i, "created"),
        b(d, e, e.scopeId, u, i),
        h)
      ) {
        for (const e in h) "value" === e || ge(e) || r(d, e, null, h[e], l, i);
        ("value" in h && r(d, "value", null, h.value, l),
          (p = h.onVnodeBeforeMount) && Yi(p, i, e));
      }
      v && wo(e, null, i, "beforeMount");
      const _ = ai(a, g);
      (_ && g.beforeEnter(d),
        n(d, t, o),
        ((p = h && h.onVnodeMounted) || _ || v) &&
          ti(() => {
            try {
              (p && Yi(p, i, e), _ && g.enter(d), v && wo(e, null, i, "mounted"));
            } finally {
            }
          }, a));
    },
    b = (e, t, n, o, r) => {
      if ((n && d(e, n), o)) for (let s = 0; s < o.length; s++) d(e, o[s]);
      if (r) {
        let n = r.subTree;
        if (t === n || (di(n.type) && (n.ssContent === t || n.ssFallback === t))) {
          const t = r.vnode;
          b(e, t, t.scopeId, t.slotScopeIds, r.parent);
        }
      }
    },
    w = (e, t, n, o, r, s, i, a, l = 0) => {
      for (let c = l; c < e.length; c++) {
        const l = (e[c] = a ? zi(e[c]) : Wi(e[c]));
        h(null, l, t, n, o, r, s, i, a);
      }
    },
    E = (e, t, n, o, s, i, a) => {
      const l = (t.el = e.el);
      let { patchFlag: u, dynamicChildren: f, dirs: d } = t;
      u |= 16 & e.patchFlag;
      const p = e.props || q,
        h = t.props || q;
      let m;
      if (
        (n && ii(n, !1),
        (m = h.onVnodeBeforeUpdate) && Yi(m, n, t, e),
        d && wo(t, e, n, "beforeUpdate"),
        n && ii(n, !0),
        ((p.innerHTML && null == h.innerHTML) || (p.textContent && null == h.textContent)) &&
          c(l, ""),
        f
          ? S(e.dynamicChildren, f, l, n, o, si(t, s), i)
          : a || I(e, t, l, null, n, o, si(t, s), i, !1),
        u > 0)
      ) {
        if (16 & u) k(l, p, h, n, s);
        else if (
          (2 & u && p.class !== h.class && r(l, "class", null, h.class, s),
          4 & u && r(l, "style", p.style, h.style, s),
          8 & u)
        ) {
          const e = t.dynamicProps;
          for (let t = 0; t < e.length; t++) {
            const o = e[t],
              i = p[o],
              a = h[o];
            (a === i && "value" !== o) || r(l, o, i, a, s, n);
          }
        }
        1 & u && e.children !== t.children && c(l, t.children);
      } else a || null != f || k(l, p, h, n, s);
      ((m = h.onVnodeUpdated) || d) &&
        ti(() => {
          (m && Yi(m, n, t, e), d && wo(t, e, n, "updated"));
        }, o);
    },
    S = (e, t, n, o, r, s, i) => {
      for (let a = 0; a < t.length; a++) {
        const l = e[a],
          c = t[a],
          f =
            // oldVNode may be an errored async setup() component inside Suspense
            // which will not have a mounted element
            l.el && // - In the case of a Fragment, we need to provide the actual parent
            // of the Fragment itself so it can move its children.
            (l.type === bi || // - In the case of different nodes, there is going to be a replacement
              // which also requires the correct parent container
              !Fi(l, c) || // - In the case of a component, it could contain anything.
              198 & l.shapeFlag)
              ? u(l.el)
              : // In other cases, the parent container is not actually used so we
                // just pass the block element here to avoid a DOM parentNode call.
                n;
        h(l, c, f, null, o, r, s, i, !0);
      }
    },
    k = (e, t, n, o, s) => {
      if (t !== n) {
        if (t !== q) for (const i in t) ge(i) || i in n || r(e, i, t[i], null, s, o);
        for (const i in n) {
          if (ge(i)) continue;
          const a = n[i],
            l = t[i];
          a !== l && "value" !== i && r(e, i, l, a, s, o);
        }
        "value" in n && r(e, "value", t.value, n.value, s);
      }
    },
    x = (e, t, o, r, s, a, l, c, u) => {
      const f = (t.el = e ? e.el : i("")),
        d = (t.anchor = e ? e.anchor : i(""));
      let { patchFlag: p, dynamicChildren: h, slotScopeIds: m } = t;
      (m && (c = c ? c.concat(m) : m),
        null == e
          ? (n(f, o, r),
            n(d, o, r),
            w(
              // #10007
              // such fragment like `<></>` will be compiled into
              // a fragment which doesn't have a children.
              // In this case fallback to an empty array
              t.children || [],
              o,
              d,
              s,
              a,
              l,
              c,
              u
            ))
          : p > 0 &&
              64 & p &&
              h && // #2715 the previous fragment could've been a BAILed one as a result
              // of renderSlot() with no valid children
              e.dynamicChildren &&
              e.dynamicChildren.length === h.length
            ? (S(e.dynamicChildren, h, o, s, a, l, c),
              // #2080 if the stable fragment has a key, it's a <template v-for> that may
              //  get moved around. Make sure all root level vnodes inherit el.
              // #2134 or if it's a component root, it may also get moved around
              // as the component is being moved.
              (null != t.key || (s && t === s.subTree)) &&
                li(
                  e,
                  t,
                  !0
                  /* shallow */
                ))
            : I(e, t, o, d, s, a, l, c, u));
    },
    O = (e, t, n, o, r, s, i, a, l) => {
      ((t.slotScopeIds = a),
        null == e
          ? 512 & t.shapeFlag
            ? r.ctx.activate(t, n, o, i, l)
            : T(t, n, o, r, s, i, l)
          : A(e, t, l));
    },
    T = (e, t, n, o, r, s, i) => {
      const a = (e.component = Qi(e, o, r));
      if ((kr(e) && (a.ctx.renderer = H), la(a, !1, i), a.asyncDep)) {
        if ((r && r.registerDep(a, C, i), !e.el)) {
          const o = (a.subTree = ji(Ei));
          (g(null, o, t, n), (e.placeholder = o.el));
        }
      } else C(a, e, t, n, r, s, i);
    },
    A = (e, t, n) => {
      const o = (t.component = e.component);
      if (
        (function (e, t, n) {
          const { props: o, children: r, component: s } = e,
            { props: i, children: a, patchFlag: l } = t,
            c = s.emitsOptions;
          if (t.dirs || t.transition) return !0;
          if (!(n && l >= 0))
            return !((!r && !a) || (a && a.$stable)) || (o !== i && (o ? !i || js(o, i, c) : !!i));
          if (1024 & l) return !0;
          if (16 & l) return o ? js(o, i, c) : !!i;
          if (8 & l) {
            const e = t.dynamicProps;
            for (let t = 0; t < e.length; t++) {
              const n = e[t];
              if ($s(i, o, n) && !Fs(c, n)) return !0;
            }
          }
          return !1;
        })(e, t, n)
      ) {
        if (o.asyncDep && !o.asyncResolved) return void R(o, t, n);
        ((o.next = t), o.update());
      } else ((t.el = e.el), (o.vnode = t));
    },
    C = (e, t, n, o, r, s, i) => {
      e.scope.on();
      const a = (e.effect = new tt(() => {
        if (e.isMounted) {
          let { next: t, bu: n, u: o, parent: a, vnode: c } = e;
          {
            const n = ci(e);
            if (n)
              return (
                t && ((t.el = c.el), R(e, t, i)),
                void n.asyncDep.then(() => {
                  ti(() => {
                    e.isUnmounted || l();
                  }, r);
                })
              );
          }
          let f,
            d = t;
          (ii(e, !1),
            t ? ((t.el = c.el), R(e, t, i)) : (t = c),
            n && xe(n),
            (f = t.props && t.props.onVnodeBeforeUpdate) && Yi(f, a, t, c),
            ii(e, !0));
          const p = Ls(e),
            m = e.subTree;
          ((e.subTree = p),
            h(
              m,
              p,
              // parent may have changed if it's in a teleport
              u(m.el),
              // anchor may have changed if it's in a fragment
              V(m),
              e,
              r,
              s
            ),
            (t.el = p.el),
            null === d && Vs(e, p.el),
            o && ti(o, r),
            (f = t.props && t.props.onVnodeUpdated) && ti(() => Yi(f, a, t, c), r));
        } else {
          let i;
          const { el: a, props: l } = t,
            { bm: c, m: u, parent: f, root: d, type: p } = e,
            m = wr(t);
          if (
            (ii(e, !1),
            c && xe(c),
            !m && (i = l && l.onVnodeBeforeMount) && Yi(i, f, t),
            ii(e, !0),
            a && z)
          ) {
            const t = () => {
              ((e.subTree = Ls(e)), z(a, e.subTree, e, r, null));
            };
            m && p.__asyncHydrate ? p.__asyncHydrate(a, e, t) : t();
          } else {
            d.ce &&
              d.ce._hasShadowRoot() &&
              d.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
            const i = (e.subTree = Ls(e));
            (h(null, i, n, o, e, r, s), (t.el = i.el));
          }
          if ((u && ti(u, r), !m && (i = l && l.onVnodeMounted))) {
            const e = t;
            ti(() => Yi(i, f, e), r);
          }
          ((256 & t.shapeFlag || (f && wr(f.vnode) && 256 & f.vnode.shapeFlag)) &&
            e.a &&
            ti(e.a, r),
            (e.isMounted = !0),
            (t = n = o = null));
        }
      }));
      e.scope.off();
      const l = (e.update = a.run.bind(a)),
        c = (e.job = a.runIfDirty.bind(a));
      ((c.i = e), (c.id = e.uid), (a.scheduler = () => io(c)), ii(e, !0), l());
    },
    R = (e, t, n) => {
      t.component = e;
      const o = e.vnode.props;
      ((e.vnode = t),
        (e.next = null),
        (function (e, t, n, o) {
          const {
              props: r,
              attrs: s,
              vnode: { patchFlag: i },
            } = e,
            a = yn(r),
            [l] = e.propsOptions;
          let c = !1;
          if (
            // always force full diff in dev
            // - #1942 if hmr is enabled with sfc component
            // - vite#872 non-sfc component used by sfc component
            !(o || i > 0) ||
            16 & i
          ) {
            let o;
            Ws(e, t, r, s) && (c = !0);
            for (const s in a)
              (t && // for camelCase
                (ne(t, s) || // it's possible the original props was passed in as kebab-case
                  // and converted to camelCase (#955)
                  ((o = we(s)) !== s && ne(t, o)))) ||
                (l
                  ? !n || // for camelCase
                    (void 0 === n[s] && // for kebab-case
                      void 0 === n[o]) ||
                    (r[s] = zs(l, a, s, void 0, e, !0))
                  : delete r[s]);
            if (s !== a) for (const e in s) (t && ne(t, e)) || (delete s[e], (c = !0));
          } else if (8 & i) {
            const n = e.vnode.dynamicProps;
            for (let o = 0; o < n.length; o++) {
              let i = n[o];
              if (Fs(e.emitsOptions, i)) continue;
              const u = t[i];
              if (l)
                if (ne(s, i)) u !== s[i] && ((s[i] = u), (c = !0));
                else {
                  const t = ye(i);
                  r[t] = zs(l, a, t, u, e, !1);
                }
              else u !== s[i] && ((s[i] = u), (c = !0));
            }
          }
          c && At(e.attrs, "set", "");
        })(e, t.props, o, n),
        ((e, t, n) => {
          const { vnode: o, slots: r } = e;
          let s = !0,
            i = q;
          if (32 & o.shapeFlag) {
            const e = t._;
            (e ? (n && 1 === e ? (s = !1) : ei(r, t, n)) : ((s = !t.$stable), Xs(t, r)), (i = t));
          } else t && (Zs(e, t), (i = { default: 1 }));
          if (s) for (const a in r) Ks(a) || null != i[a] || delete r[a];
        })(e, t.children, n),
        gt(),
        co(e),
        vt());
    },
    I = (e, t, n, o, r, s, i, a, l = !1) => {
      const u = e && e.children,
        f = e ? e.shapeFlag : 0,
        d = t.children,
        { patchFlag: p, shapeFlag: h } = t;
      if (p > 0) {
        if (128 & p) return void P(u, d, n, o, r, s, i, a, l);
        if (256 & p) return void N(u, d, n, o, r, s, i, a, l);
      }
      8 & h
        ? (16 & f && $(u, r, s), d !== u && c(n, d))
        : 16 & f
          ? 16 & h
            ? P(u, d, n, o, r, s, i, a, l)
            : $(u, r, s, !0)
          : (8 & f && c(n, ""), 16 & h && w(d, n, o, r, s, i, a, l));
    },
    N = (e, t, n, o, r, s, i, a, l) => {
      t = t || Y;
      const c = (e = e || Y).length,
        u = t.length,
        f = Math.min(c, u);
      let d;
      for (d = 0; d < f; d++) {
        const o = (t[d] = l ? zi(t[d]) : Wi(t[d]));
        h(e[d], o, n, null, r, s, i, a, l);
      }
      c > u ? $(e, r, s, !0, !1, f) : w(t, n, o, r, s, i, a, l, f);
    },
    P = (e, t, n, o, r, s, i, a, l) => {
      let c = 0;
      const u = t.length;
      let f = e.length - 1,
        d = u - 1;
      for (; c <= f && c <= d; ) {
        const o = e[c],
          u = (t[c] = l ? zi(t[c]) : Wi(t[c]));
        if (!Fi(o, u)) break;
        (h(o, u, n, null, r, s, i, a, l), c++);
      }
      for (; c <= f && c <= d; ) {
        const o = e[f],
          c = (t[d] = l ? zi(t[d]) : Wi(t[d]));
        if (!Fi(o, c)) break;
        (h(o, c, n, null, r, s, i, a, l), f--, d--);
      }
      if (c > f) {
        if (c <= d) {
          const e = d + 1,
            f = e < u ? t[e].el : o;
          for (; c <= d; ) (h(null, (t[c] = l ? zi(t[c]) : Wi(t[c])), n, f, r, s, i, a, l), c++);
        }
      } else if (c > d) for (; c <= f; ) (L(e[c], r, s, !0), c++);
      else {
        const p = c,
          m = c,
          g = new Map();
        for (c = m; c <= d; c++) {
          const e = (t[c] = l ? zi(t[c]) : Wi(t[c]));
          null != e.key && g.set(e.key, c);
        }
        let v,
          _ = 0;
        const y = d - m + 1;
        let b = !1,
          w = 0;
        const E = new Array(y);
        for (c = 0; c < y; c++) E[c] = 0;
        for (c = p; c <= f; c++) {
          const o = e[c];
          if (_ >= y) {
            L(o, r, s, !0);
            continue;
          }
          let u;
          if (null != o.key) u = g.get(o.key);
          else
            for (v = m; v <= d; v++)
              if (0 === E[v - m] && Fi(o, t[v])) {
                u = v;
                break;
              }
          void 0 === u
            ? L(o, r, s, !0)
            : ((E[u - m] = c + 1),
              u >= w ? (w = u) : (b = !0),
              h(o, t[u], n, null, r, s, i, a, l),
              _++);
        }
        const S = b
          ? (function (e) {
              const t = e.slice(),
                n = [0];
              let o, r, s, i, a;
              const l = e.length;
              for (o = 0; o < l; o++) {
                const l = e[o];
                if (0 !== l) {
                  if (((r = n[n.length - 1]), e[r] < l)) {
                    ((t[o] = r), n.push(o));
                    continue;
                  }
                  for (s = 0, i = n.length - 1; s < i; )
                    ((a = (s + i) >> 1), e[n[a]] < l ? (s = a + 1) : (i = a));
                  l < e[n[s]] && (s > 0 && (t[o] = n[s - 1]), (n[s] = o));
                }
              }
              ((s = n.length), (i = n[s - 1]));
              for (; s-- > 0; ) ((n[s] = i), (i = t[i]));
              return n;
            })(E)
          : Y;
        for (v = S.length - 1, c = y - 1; c >= 0; c--) {
          const e = m + c,
            f = t[e],
            d = t[e + 1],
            p =
              e + 1 < u
                ? // #13559, #14173 fallback to el placeholder for unresolved async component
                  d.el || fi(d)
                : o;
          0 === E[c]
            ? h(null, f, n, p, r, s, i, a, l)
            : b && (v < 0 || c !== S[v] ? F(f, n, p, 2) : v--);
        }
      }
    },
    F = (e, t, r, s, i = null) => {
      const { el: a, type: l, transition: c, children: u, shapeFlag: d } = e;
      if (6 & d) return void F(e.component.subTree, t, r, s);
      if (128 & d) return void e.suspense.move(t, r, s);
      if (64 & d) return void l.move(e, t, r, H);
      if (l === bi) {
        n(a, t, r);
        for (let e = 0; e < u.length; e++) F(u[e], t, r, s);
        return void n(e.anchor, t, r);
      }
      if (l === Si)
        return void (({ el: e, anchor: t }, o, r) => {
          let s;
          for (; e && e !== t; ) ((s = f(e)), n(e, o, r), (e = s));
          n(t, o, r);
        })(e, t, r);
      if (2 !== s && 1 & d && c)
        if (0 === s) (c.beforeEnter(a), n(a, t, r), ti(() => c.enter(a), i));
        else {
          const { leave: s, delayLeave: i, afterLeave: l } = c,
            u = () => {
              e.ctx.isUnmounted ? o(a) : n(a, t, r);
            },
            f = () => {
              (a._isLeaving &&
                a[Wo](
                  !0
                  /* cancelled */
                ),
                s(a, () => {
                  (u(), l && l());
                }));
            };
          i ? i(a, u, f) : f();
        }
      else n(a, t, r);
    },
    L = (e, t, n, o = !1, r = !1) => {
      const {
        type: s,
        props: i,
        ref: a,
        children: l,
        dynamicChildren: c,
        shapeFlag: u,
        patchFlag: f,
        dirs: d,
        cacheIndex: p,
        memo: h,
      } = e;
      if (
        (-2 === f && (r = !1),
        null != a && (gt(), cr(a, null, n, e, !0), vt()),
        null != p && (t.renderCache[p] = void 0),
        256 & u)
      )
        return void t.ctx.deactivate(e);
      const m = 1 & u && d,
        g = !wr(e);
      let v;
      if ((g && (v = i && i.onVnodeBeforeUnmount) && Yi(v, t, e), 6 & u)) j(e.component, n, o);
      else {
        if (128 & u) return void e.suspense.unmount(n, o);
        (m && wo(e, null, t, "beforeUnmount"),
          64 & u
            ? e.type.remove(e, t, n, H, o)
            : c && // #5154
                // when v-once is used inside a block, setBlockTracking(-1) marks the
                // parent block with hasOnce: true
                // so that it doesn't take the fast path during unmount - otherwise
                // components nested in v-once are never unmounted.
                !c.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
                (s !== bi || (f > 0 && 64 & f))
              ? $(c, t, n, !1, !0)
              : ((s === bi && 384 & f) || (!r && 16 & u)) && $(l, t, n),
          o && M(e));
      }
      const _ = null != h && null == p;
      ((g && (v = i && i.onVnodeUnmounted)) || m || _) &&
        ti(() => {
          (v && Yi(v, t, e), m && wo(e, null, t, "unmounted"), _ && (e.el = null));
        }, n);
    },
    M = (e) => {
      const { type: t, el: n, anchor: r, transition: s } = e;
      if (t === bi) return void D(n, r);
      if (t === Si)
        return void (({ el: e, anchor: t }) => {
          let n;
          for (; e && e !== t; ) ((n = f(e)), o(e), (e = n));
          o(t);
        })(e);
      const i = () => {
        (o(n), s && !s.persisted && s.afterLeave && s.afterLeave());
      };
      if (1 & e.shapeFlag && s && !s.persisted) {
        const { leave: t, delayLeave: o } = s,
          r = () => t(n, i);
        o ? o(e.el, i, r) : r();
      } else i();
    },
    D = (e, t) => {
      let n;
      for (; e !== t; ) ((n = f(e)), o(e), (e = n));
      o(t);
    },
    j = (e, t, n) => {
      const { bum: o, scope: r, job: s, subTree: i, um: a, m: l, a: c } = e;
      (ui(l),
        ui(c),
        o && xe(o),
        r.stop(),
        s && ((s.flags |= 8), L(i, e, t, n)),
        a && ti(a, t),
        ti(() => {
          e.isUnmounted = !0;
        }, t));
    },
    $ = (e, t, n, o = !1, r = !1, s = 0) => {
      for (let i = s; i < e.length; i++) L(e[i], t, n, o, r);
    },
    V = (e) => {
      if (6 & e.shapeFlag) return V(e.component.subTree);
      if (128 & e.shapeFlag) return e.suspense.next();
      const t = f(e.anchor || e.el),
        n = t && t[Fo];
      return n ? f(n) : t;
    };
  let U = !1;
  const B = (e, t, n) => {
      let o;
      (null == e
        ? t._vnode && (L(t._vnode, null, null, !0), (o = t._vnode.component))
        : h(t._vnode || null, e, t, null, null, null, n),
        (t._vnode = e),
        U || ((U = !0), co(o), uo(), (U = !1)));
    },
    H = { p: h, um: L, m: F, r: M, mt: T, mc: w, pc: I, pbc: S, n: V, o: e };
  let W, z;
  return (t && ([W, z] = t(H)), { render: B, hydrate: W, createApp: Ts(B, W) });
}
function si({ type: e, props: t }, n) {
  return ("svg" === n && "foreignObject" === e) ||
    ("mathml" === n && "annotation-xml" === e && t && t.encoding && t.encoding.includes("html"))
    ? void 0
    : n;
}
function ii({ effect: e, job: t }, n) {
  n ? ((e.flags |= 32), (t.flags |= 4)) : ((e.flags &= -33), (t.flags &= -5));
}
function ai(e, t) {
  return (!e || (e && !e.pendingBranch)) && t && !t.persisted;
}
function li(e, t, n = !1) {
  const o = e.children,
    r = t.children;
  if (oe(o) && oe(r))
    for (let s = 0; s < o.length; s++) {
      const e = o[s];
      let t = r[s];
      (1 & t.shapeFlag &&
        !t.dynamicChildren &&
        ((t.patchFlag <= 0 || 32 === t.patchFlag) && ((t = r[s] = zi(r[s])), (t.el = e.el)),
        n || -2 === t.patchFlag || li(e, t)),
        t.type === wi && (-1 === t.patchFlag && (t = r[s] = zi(t)), (t.el = e.el)),
        t.type !== Ei || t.el || (t.el = e.el));
    }
}
function ci(e) {
  const t = e.subTree.component;
  if (t) return t.asyncDep && !t.asyncResolved ? t : ci(t);
}
function ui(e) {
  if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function fi(e) {
  if (e.placeholder) return e.placeholder;
  const t = e.component;
  return t ? fi(t.subTree) : null;
}
const di = (e) => e.__isSuspense;
let pi = 0;
const hi = {
  name: "Suspense",
  // In order to make Suspense tree-shakable, we need to avoid importing it
  // directly in the renderer. The renderer checks for the __isSuspense flag
  // on a vnode's type and calls the `process` method, passing in renderer
  // internals.
  __isSuspense: !0,
  process(e, t, n, o, r, s, i, a, l, c) {
    if (null == e)
      !(function (e, t, n, o, r, s, i, a, l) {
        const {
            p: c,
            o: { createElement: u },
          } = l,
          f = u("div"),
          d = (e.suspense = gi(e, r, o, t, f, n, s, i, a, l));
        (c(null, (d.pendingBranch = e.ssContent), f, null, o, d, s, i),
          d.deps > 0
            ? (mi(e, "onPending"),
              mi(e, "onFallback"),
              c(
                null,
                e.ssFallback,
                t,
                n,
                o,
                null,
                // fallback tree will not have suspense context
                s,
                i
              ),
              yi(d, e.ssFallback))
            : d.resolve(!1, !0));
      })(t, n, o, r, s, i, a, l, c);
    else {
      if (s && s.deps > 0 && !e.suspense.isInFallback)
        return ((t.suspense = e.suspense), (t.suspense.vnode = t), void (t.el = e.el));
      !(function (e, t, n, o, r, s, i, a, { p: l, um: c, o: { createElement: u } }) {
        const f = (t.suspense = e.suspense);
        ((f.vnode = t), (t.el = e.el));
        const d = t.ssContent,
          p = t.ssFallback,
          { activeBranch: h, pendingBranch: m, isInFallback: g, isHydrating: v } = f;
        if (m)
          ((f.pendingBranch = d),
            Fi(m, d)
              ? (l(m, d, f.hiddenContainer, null, r, f, s, i, a),
                f.deps <= 0
                  ? f.resolve()
                  : g &&
                    (v ||
                      (l(
                        h,
                        p,
                        n,
                        o,
                        r,
                        null,
                        // fallback tree will not have suspense context
                        s,
                        i,
                        a
                      ),
                      yi(f, p))))
              : ((f.pendingId = pi++),
                v ? ((f.isHydrating = !1), (f.activeBranch = m)) : c(m, r, f),
                (f.deps = 0),
                (f.effects.length = 0),
                (f.hiddenContainer = u("div")),
                g
                  ? (l(null, d, f.hiddenContainer, null, r, f, s, i, a),
                    f.deps <= 0
                      ? f.resolve()
                      : (l(
                          h,
                          p,
                          n,
                          o,
                          r,
                          null,
                          // fallback tree will not have suspense context
                          s,
                          i,
                          a
                        ),
                        yi(f, p)))
                  : h && Fi(h, d)
                    ? (l(h, d, n, o, r, f, s, i, a), f.resolve(!0))
                    : (l(null, d, f.hiddenContainer, null, r, f, s, i, a),
                      f.deps <= 0 && f.resolve())));
        else if (h && Fi(h, d)) (l(h, d, n, o, r, f, s, i, a), yi(f, d));
        else if (
          (mi(t, "onPending"),
          (f.pendingBranch = d),
          512 & d.shapeFlag ? (f.pendingId = d.component.suspenseId) : (f.pendingId = pi++),
          l(null, d, f.hiddenContainer, null, r, f, s, i, a),
          f.deps <= 0)
        )
          f.resolve();
        else {
          const { timeout: e, pendingId: t } = f;
          e > 0
            ? setTimeout(() => {
                f.pendingId === t && f.fallback(p);
              }, e)
            : 0 === e && f.fallback(p);
        }
      })(e, t, n, o, r, i, a, l, c);
    }
  },
  hydrate: function (e, t, n, o, r, s, i, a, l) {
    const c = (t.suspense = gi(
        t,
        o,
        n,
        e.parentNode,
        // eslint-disable-next-line no-restricted-globals
        document.createElement("div"),
        null,
        r,
        s,
        i,
        a,
        !0
      )),
      u = l(e, (c.pendingBranch = t.ssContent), n, c, s, i);
    0 === c.deps && c.resolve(!1, !0);
    return u;
  },
  normalize: function (e) {
    const { shapeFlag: t, children: n } = e,
      o = 32 & t;
    ((e.ssContent = vi(o ? n.default : n)), (e.ssFallback = o ? vi(n.fallback) : ji(Ei)));
  },
};
function mi(e, t) {
  const n = e.props && e.props[t];
  ae(n) && n();
}
function gi(e, t, n, o, r, s, i, a, l, c, u = !1) {
  const {
    p: f,
    m: d,
    um: p,
    n: h,
    o: { parentNode: m, remove: g },
  } = c;
  let v;
  const _ = (function (e) {
    const t = e.props && e.props.suspensible;
    return null != t && !1 !== t;
  })(e);
  _ && t && t.pendingBranch && ((v = t.pendingId), t.deps++);
  const y = e.props ? Ae(e.props.timeout) : void 0,
    b = s,
    w = {
      vnode: e,
      parent: t,
      parentComponent: n,
      namespace: i,
      container: o,
      hiddenContainer: r,
      deps: 0,
      pendingId: pi++,
      timeout: "number" == typeof y ? y : -1,
      activeBranch: null,
      isFallbackMountPending: !1,
      pendingBranch: null,
      isInFallback: !u,
      isHydrating: u,
      isUnmounted: !1,
      effects: [],
      resolve(e = !1, n = !1) {
        const {
          vnode: o,
          activeBranch: r,
          pendingBranch: i,
          pendingId: a,
          effects: l,
          parentComponent: c,
          container: u,
          isInFallback: f,
        } = w;
        let g = !1;
        if (w.isHydrating) w.isHydrating = !1;
        else if (!e) {
          g = r && i.transition && "out-in" === i.transition.mode;
          let e = !1;
          (g &&
            (r.transition.afterLeave = () => {
              a === w.pendingId &&
                (d(i, u, s !== b || e ? s : h(r), 0),
                lo(l),
                f && o.ssFallback && (o.ssFallback.el = null));
            }),
            r &&
              !w.isFallbackMountPending &&
              (m(r.el) === u && ((s = h(r)), (e = !0)),
              p(r, c, w, !0),
              !g && f && o.ssFallback && ti(() => (o.ssFallback.el = null), w)),
            g || d(i, u, s, 0));
        }
        ((w.isFallbackMountPending = !1),
          yi(w, i),
          (w.pendingBranch = null),
          (w.isInFallback = !1));
        let y = w.parent,
          E = !1;
        for (; y; ) {
          if (y.pendingBranch) {
            (y.effects.push(...l), (E = !0));
            break;
          }
          y = y.parent;
        }
        (E || g || lo(l),
          (w.effects = []),
          _ &&
            t &&
            t.pendingBranch &&
            v === t.pendingId &&
            (t.deps--, 0 !== t.deps || n || t.resolve()),
          mi(o, "onResolve"));
      },
      fallback(e) {
        if (!w.pendingBranch) return;
        const { vnode: t, activeBranch: n, parentComponent: o, container: r, namespace: s } = w;
        mi(t, "onFallback");
        const i = h(n),
          c = () => {
            ((w.isFallbackMountPending = !1),
              w.isInFallback &&
                (f(
                  null,
                  e,
                  r,
                  i,
                  o,
                  null,
                  // fallback tree will not have suspense context
                  s,
                  a,
                  l
                ),
                yi(w, e)));
          },
          u = e.transition && "out-in" === e.transition.mode;
        (u && ((w.isFallbackMountPending = !0), (n.transition.afterLeave = c)),
          (w.isInFallback = !0),
          p(
            n,
            o,
            null,
            // no suspense so unmount hooks fire now
            !0
          ),
          u || c());
      },
      move(e, t, n) {
        (w.activeBranch && d(w.activeBranch, e, t, n), (w.container = e));
      },
      next: () => w.activeBranch && h(w.activeBranch),
      registerDep(e, t, n) {
        const o = !!w.pendingBranch;
        o && w.deps++;
        const r = e.vnode.el;
        e.asyncDep
          .catch((t) => {
            Qn(t, e, 0);
          })
          .then((s) => {
            if (e.isUnmounted || w.isUnmounted || w.pendingId !== e.suspenseId) return;
            (oa(), (e.asyncResolved = !0));
            const { vnode: a } = e;
            (ca(e, s, !1), r && (a.el = r));
            const l = !r && e.subTree.el;
            (t(
              e,
              a,
              // component may have been moved before resolve.
              // if this is not a hydration, instance.subTree will be the comment
              // placeholder.
              m(r || e.subTree.el),
              // anchor will not be used if this is hydration, so only need to
              // consider the comment placeholder case.
              r ? null : h(e.subTree),
              w,
              i,
              n
            ),
              l && ((a.placeholder = null), g(l)),
              Vs(e, a.el),
              o && 0 === --w.deps && w.resolve());
          });
      },
      unmount(e, t) {
        ((w.isUnmounted = !0),
          w.activeBranch && p(w.activeBranch, n, e, t),
          w.pendingBranch && p(w.pendingBranch, n, e, t));
      },
    };
  return w;
}
function vi(e) {
  let t;
  if (ae(e)) {
    const n = Ai && e._c;
    (n && ((e._d = !1), Oi()), (e = e()), n && ((e._d = !0), (t = xi), Ti()));
  }
  if (oe(e)) {
    const t = (function (e) {
      let t;
      for (let n = 0; n < e.length; n++) {
        const o = e[n];
        if (!Pi(o)) return;
        if (o.type !== Ei || "v-if" === o.children) {
          if (t) return;
          t = o;
        }
      }
      return t;
    })(e);
    e = t;
  }
  return (
    (e = Wi(e)),
    t && !e.dynamicChildren && (e.dynamicChildren = t.filter((t) => t !== e)),
    e
  );
}
function _i(e, t) {
  t && t.pendingBranch ? (oe(e) ? t.effects.push(...e) : t.effects.push(e)) : lo(e);
}
function yi(e, t) {
  e.activeBranch = t;
  const { vnode: n, parentComponent: o } = e;
  let r = t.el;
  for (; !r && t.component; ) r = (t = t.component.subTree).el;
  ((n.el = r), o && o.subTree === n && ((o.vnode.el = r), Vs(o, r)));
}
const bi = Symbol.for("v-fgt"),
  wi = Symbol.for("v-txt"),
  Ei = Symbol.for("v-cmt"),
  Si = Symbol.for("v-stc"),
  ki = [];
let xi = null;
function Oi(e = !1) {
  ki.push((xi = e ? null : []));
}
function Ti() {
  (ki.pop(), (xi = ki[ki.length - 1] || null));
}
let Ai = 1;
function Ci(e, t = !1) {
  ((Ai += e), e < 0 && xi && t && (xi.hasOnce = !0));
}
function Ri(e) {
  return ((e.dynamicChildren = Ai > 0 ? xi || Y : null), Ti(), Ai > 0 && xi && xi.push(e), e);
}
function Ii(e, t, n, o, r, s) {
  return Ri(Di(e, t, n, o, r, s, !0));
}
function Ni(e, t, n, o, r) {
  return Ri(ji(e, t, n, o, r, !0));
}
function Pi(e) {
  return !!e && !0 === e.__v_isVNode;
}
function Fi(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Li = ({ key: e }) => (null != e ? e : null),
  Mi = ({ ref: e, ref_key: t, ref_for: n }) => (
    "number" == typeof e && (e = "" + e),
    null != e ? (le(e) || Sn(e) || ae(e) ? { i: go, r: e, k: t, f: !!n } : e) : null
  );
function Di(e, t = null, n = null, o = 0, r = null, s = e === bi ? 0 : 1, i = !1, a = !1) {
  const l = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Li(t),
    ref: t && Mi(t),
    scopeId: vo,
    slotScopeIds: null,
    children: n,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: s,
    patchFlag: o,
    dynamicProps: r,
    dynamicChildren: null,
    appContext: null,
    ctx: go,
  };
  return (
    a ? (Gi(l, n), 128 & s && e.normalize(l)) : n && (l.shapeFlag |= le(n) ? 8 : 16),
    Ai > 0 && // avoid a block node from tracking itself
      !i && // has current parent block
      xi && // presence of a patch flag indicates this node needs patching on updates.
      // component nodes also should always be patched, because even if the
      // component doesn't need to update, it needs to persist the instance on to
      // the next vnode so that it can be properly unmounted later.
      (l.patchFlag > 0 || 6 & s) && // the EVENTS flag is only for hydration and if it is the only flag, the
      // vnode should not be considered dynamic due to handler caching.
      32 !== l.patchFlag &&
      xi.push(l),
    l
  );
}
const ji = function (e, t = null, n = null, o = 0, r = null, s = !1) {
  (e && e !== qr) || (e = Ei);
  if (Pi(e)) {
    const o = Vi(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return (
      n && Gi(o, n),
      Ai > 0 && !s && xi && (6 & o.shapeFlag ? (xi[xi.indexOf(e)] = o) : xi.push(o)),
      (o.patchFlag = -2),
      o
    );
  }
  ((i = e), ae(i) && "__vccOpts" in i && (e = e.__vccOpts));
  var i;
  if (t) {
    t = $i(t);
    let { class: e, style: n } = t;
    (e && !le(e) && (t.class = De(e)),
      ue(n) && (_n(n) && !oe(n) && (n = Z({}, n)), (t.style = Ne(n))));
  }
  const a = le(e) ? 1 : di(e) ? 128 : Lo(e) ? 64 : ue(e) ? 4 : ae(e) ? 2 : 0;
  return Di(e, t, n, o, r, a, s, !0);
};
function $i(e) {
  return e ? (_n(e) || Hs(e) ? Z({}, e) : e) : null;
}
function Vi(e, t, n = !1, o = !1) {
  const { props: r, ref: s, patchFlag: i, children: a, transition: l } = e,
    c = t ? qi(r || {}, t) : r,
    u = {
      __v_isVNode: !0,
      __v_skip: !0,
      type: e.type,
      props: c,
      key: c && Li(c),
      ref:
        t && t.ref
          ? // #2078 in the case of <component :is="vnode" ref="extra"/>
            // if the vnode itself already has a ref, cloneVNode will need to merge
            // the refs so the single vnode can be set on multiple refs
            n && s
            ? oe(s)
              ? s.concat(Mi(t))
              : [s, Mi(t)]
            : Mi(t)
          : s,
      scopeId: e.scopeId,
      slotScopeIds: e.slotScopeIds,
      children: a,
      target: e.target,
      targetStart: e.targetStart,
      targetAnchor: e.targetAnchor,
      staticCount: e.staticCount,
      shapeFlag: e.shapeFlag,
      // if the vnode is cloned with extra props, we can no longer assume its
      // existing patch flag to be reliable and need to add the FULL_PROPS flag.
      // note: preserve flag for fragments since they use the flag for children
      // fast paths only.
      patchFlag: t && e.type !== bi ? (-1 === i ? 16 : 16 | i) : i,
      dynamicProps: e.dynamicProps,
      dynamicChildren: e.dynamicChildren,
      appContext: e.appContext,
      dirs: e.dirs,
      transition: l,
      // These should technically only be non-null on mounted VNodes. However,
      // they *should* be copied for kept-alive vnodes. So we just always copy
      // them since them being non-null during a mount doesn't affect the logic as
      // they will simply be overwritten.
      component: e.component,
      suspense: e.suspense,
      ssContent: e.ssContent && Vi(e.ssContent),
      ssFallback: e.ssFallback && Vi(e.ssFallback),
      placeholder: e.placeholder,
      el: e.el,
      anchor: e.anchor,
      ctx: e.ctx,
      ce: e.ce,
    };
  return (l && o && nr(u, l.clone(u)), u);
}
function Ui(e = " ", t = 0) {
  return ji(wi, null, e, t);
}
function Bi(e, t) {
  const n = ji(Si, null, e);
  return ((n.staticCount = t), n);
}
function Hi(e = "", t = !1) {
  return t ? (Oi(), Ni(Ei, null, e)) : ji(Ei, null, e);
}
function Wi(e) {
  return null == e || "boolean" == typeof e
    ? ji(Ei)
    : oe(e)
      ? ji(
          bi,
          null,
          // #3666, avoid reference pollution when reusing vnode
          e.slice()
        )
      : Pi(e)
        ? zi(e)
        : ji(wi, null, String(e));
}
function zi(e) {
  return (null === e.el && -1 !== e.patchFlag) || e.memo ? e : Vi(e);
}
function Gi(e, t) {
  let n = 0;
  const { shapeFlag: o } = e;
  if (null == t) t = null;
  else if (oe(t)) n = 16;
  else if ("object" == typeof t) {
    if (65 & o) {
      const n = t.default;
      return void (n && (n._c && (n._d = !1), Gi(e, n()), n._c && (n._d = !0)));
    }
    {
      n = 32;
      const o = t._;
      o || Hs(t)
        ? 3 === o && go && (1 === go.slots._ ? (t._ = 1) : ((t._ = 2), (e.patchFlag |= 1024)))
        : (t._ctx = go);
    }
  } else
    ae(t)
      ? ((t = { default: t, _ctx: go }), (n = 32))
      : ((t = String(t)), 64 & o ? ((n = 16), (t = [Ui(t)])) : (n = 8));
  ((e.children = t), (e.shapeFlag |= n));
}
function qi(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const o = e[n];
    for (const e in o)
      if ("class" === e) t.class !== o.class && (t.class = De([t.class, o.class]));
      else if ("style" === e) t.style = Ne([t.style, o.style]);
      else if (Q(e)) {
        const n = t[e],
          r = o[e];
        !r || n === r || (oe(n) && n.includes(r))
          ? null != r || null != n || X(e) || (t[e] = r)
          : (t[e] = n ? [].concat(n, r) : r);
      } else "" !== e && (t[e] = o[e]);
  }
  return t;
}
function Yi(e, t, n, o = null) {
  Jn(e, t, 7, [n, o]);
}
const Ki = xs();
let Ji = 0;
function Qi(e, t, n) {
  const o = e.type,
    r = (t ? t.appContext : e.appContext) || Ki,
    s = {
      uid: Ji++,
      vnode: e,
      type: o,
      parent: t,
      appContext: r,
      root: null,
      // to be immediately set
      next: null,
      subTree: null,
      // will be set synchronously right after creation
      effect: null,
      update: null,
      // will be set synchronously right after creation
      job: null,
      scope: new Je(
        !0
        /* detached */
      ),
      render: null,
      proxy: null,
      exposed: null,
      exposeProxy: null,
      withProxy: null,
      provides: t ? t.provides : Object.create(r.provides),
      ids: t ? t.ids : ["", 0, 0],
      accessCache: null,
      renderCache: [],
      // local resolved assets
      components: null,
      directives: null,
      // resolved props and emits options
      propsOptions: qs(o, r),
      emitsOptions: Ps(o, r),
      // emit
      emit: null,
      // to be set immediately
      emitted: null,
      // props default value
      propsDefaults: q,
      // inheritAttrs
      inheritAttrs: o.inheritAttrs,
      // state
      ctx: q,
      data: q,
      props: q,
      attrs: q,
      slots: q,
      refs: q,
      setupState: q,
      setupContext: null,
      // suspense related
      suspense: n,
      suspenseId: n ? n.pendingId : 0,
      asyncDep: null,
      asyncResolved: !1,
      // lifecycle hooks
      // not using enums here because it results in computed properties
      isMounted: !1,
      isUnmounted: !1,
      isDeactivated: !1,
      bc: null,
      c: null,
      bm: null,
      m: null,
      bu: null,
      u: null,
      um: null,
      bum: null,
      da: null,
      a: null,
      rtg: null,
      rtc: null,
      ec: null,
      sp: null,
    };
  return (
    (s.ctx = { _: s }),
    (s.root = t ? t.root : s),
    (s.emit = Is.bind(null, s)),
    e.ce && e.ce(s),
    s
  );
}
let Xi = null;
const Zi = () => Xi || go;
let ea, ta;
{
  const e = Re(),
    t = (t, n) => {
      let o;
      return (
        (o = e[t]) || (o = e[t] = []),
        o.push(n),
        (e) => {
          o.length > 1 ? o.forEach((t) => t(e)) : o[0](e);
        }
      );
    };
  ((ea = t("__VUE_INSTANCE_SETTERS__", (e) => (Xi = e))),
    (ta = t("__VUE_SSR_SETTERS__", (e) => (aa = e))));
}
const na = (e) => {
    const t = Xi;
    return (
      ea(e),
      e.scope.on(),
      () => {
        (e.scope.off(), ea(t));
      }
    );
  },
  oa = () => {
    (Xi && Xi.scope.off(), ea(null));
  };
function ra(e) {
  return 4 & e.vnode.shapeFlag;
}
let sa,
  ia,
  aa = !1;
function la(e, t = !1, n = !1) {
  t && ta(t);
  const { props: o, children: r } = e.vnode,
    s = ra(e);
  (!(function (e, t, n, o = !1) {
    const r = {},
      s = Bs();
    ((e.propsDefaults = Object.create(null)), Ws(e, t, r, s));
    for (const i in e.propsOptions[0]) i in r || (r[i] = void 0);
    (n ? (e.props = o ? r : fn(r)) : e.type.props ? (e.props = r) : (e.props = s), (e.attrs = s));
  })(e, o, s, t),
    ((e, t, n) => {
      const o = (e.slots = Bs());
      if (32 & e.vnode.shapeFlag) {
        const e = t._;
        e ? (ei(o, t, n), n && Oe(o, "_", e, !0)) : Xs(t, o);
      } else t && Zs(e, t);
    })(e, r, n || t));
  const i = s
    ? (function (e, t) {
        const n = e.type;
        ((e.accessCache = Object.create(null)), (e.proxy = new Proxy(e.ctx, is)));
        const { setup: o } = n;
        if (o) {
          gt();
          const n = (e.setupContext = o.length > 1 ? da(e) : null),
            r = na(e),
            s = Kn(o, e, 0, [e.props, n]),
            i = fe(s);
          if ((vt(), r(), (!i && !e.sp) || wr(e) || sr(e), i)) {
            if ((s.then(oa, oa), t))
              return s
                .then((n) => {
                  ca(e, n, t);
                })
                .catch((t) => {
                  Qn(t, e, 0);
                });
            e.asyncDep = s;
          } else ca(e, s, t);
        } else ua(e, t);
      })(e, t)
    : void 0;
  return (t && ta(!1), i);
}
function ca(e, t, n) {
  (ae(t)
    ? e.type.__ssrInlineRender
      ? (e.ssrRender = t)
      : (e.render = t)
    : ue(t) && (e.setupState = Nn(t)),
    ua(e, n));
}
function ua(e, t, n) {
  const o = e.type;
  if (!e.render) {
    if (!t && sa && !o.render) {
      const t = o.template || vs(e).template;
      if (t) {
        const { isCustomElement: n, compilerOptions: r } = e.appContext.config,
          { delimiters: s, compilerOptions: i } = o,
          a = Z(Z({ isCustomElement: n, delimiters: s }, r), i);
        o.render = sa(t, a);
      }
    }
    ((e.render = o.render || K), ia && ia(e));
  }
  {
    const t = na(e);
    gt();
    try {
      hs(e);
    } finally {
      (vt(), t());
    }
  }
}
const fa = { get: (e, t) => (Tt(e, 0, ""), e[t]) };
function da(e) {
  const t = (t) => {
    e.exposed = t || {};
  };
  return { attrs: new Proxy(e.attrs, fa), slots: e.slots, emit: e.emit, expose: t };
}
function pa(e) {
  return e.exposed
    ? e.exposeProxy ||
        (e.exposeProxy = new Proxy(Nn(bn(e.exposed)), {
          get: (t, n) => (n in t ? t[n] : n in rs ? rs[n](e) : void 0),
          has: (e, t) => t in e || t in rs,
        }))
    : e.proxy;
}
function ha(e, t = !0) {
  return ae(e) ? e.displayName || e.name : e.name || (t && e.__name);
}
const ma = (e, t) => Un(e, 0, aa);
function ga(e, t, n) {
  try {
    Ci(-1);
    const o = arguments.length;
    return 2 === o
      ? ue(t) && !oe(t)
        ? Pi(t)
          ? ji(e, null, [t])
          : ji(e, t)
        : ji(e, null, t)
      : (o > 3 ? (n = Array.prototype.slice.call(arguments, 2)) : 3 === o && Pi(n) && (n = [n]),
        ji(e, t, n));
  } finally {
    Ci(1);
  }
}
function va(e, t) {
  const n = e.memo;
  if (n.length != t.length) return !1;
  for (let o = 0; o < n.length; o++) if (ke(n[o], t[o])) return !1;
  return (Ai > 0 && xi && xi.push(e), !0);
}
const _a = "3.5.34",
  ya = K,
  ba = Yn,
  wa = ho,
  Ea = function e(t, n) {
    var o, r;
    if (((ho = t), ho))
      ((ho.enabled = !0), mo.forEach(({ event: e, args: t }) => ho.emit(e, ...t)), (mo = []));
    else if (
      // handle late devtools injection - only do this if we are in an actual
      // browser environment to avoid the timer handle stalling test runner exit
      // (#4815)
      "undefined" != typeof window && // some envs mock window but not fully
      window.HTMLElement && // also exclude jsdom
      // eslint-disable-next-line no-restricted-syntax
      !(null == (r = null == (o = window.navigator) ? void 0 : o.userAgent)
        ? void 0
        : r.includes("jsdom"))
    ) {
      ((n.__VUE_DEVTOOLS_HOOK_REPLAY__ = n.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((t) => {
        e(t, n);
      }),
        setTimeout(() => {
          ho || ((n.__VUE_DEVTOOLS_HOOK_REPLAY__ = null), (mo = []));
        }, 3e3));
    } else mo = [];
  },
  Sa = {
    createComponentInstance: Qi,
    setupComponent: la,
    renderComponentRoot: Ls,
    setCurrentRenderingInstance: _o,
    isVNode: Pi,
    normalizeVNode: Wi,
    getComponentPublicInstance: pa,
    ensureValidVNode: ts,
    pushWarningContext: function (e) {
      qn.push(e);
    },
    popWarningContext: function () {
      qn.pop();
    },
  };
let ka;
const xa = "undefined" != typeof window && window.trustedTypes;
if (xa)
  try {
    ka = xa.createPolicy("vue", { createHTML: (e) => e });
  } catch (um) {}
const Oa = ka ? (e) => ka.createHTML(e) : (e) => e,
  Ta = "undefined" != typeof document ? document : null,
  Aa = Ta && Ta.createElement("template"),
  Ca = {
    insert: (e, t, n) => {
      t.insertBefore(e, n || null);
    },
    remove: (e) => {
      const t = e.parentNode;
      t && t.removeChild(e);
    },
    createElement: (e, t, n, o) => {
      const r =
        "svg" === t
          ? Ta.createElementNS("http://www.w3.org/2000/svg", e)
          : "mathml" === t
            ? Ta.createElementNS("http://www.w3.org/1998/Math/MathML", e)
            : n
              ? Ta.createElement(e, { is: n })
              : Ta.createElement(e);
      return (
        "select" === e && o && null != o.multiple && r.setAttribute("multiple", o.multiple),
        r
      );
    },
    createText: (e) => Ta.createTextNode(e),
    createComment: (e) => Ta.createComment(e),
    setText: (e, t) => {
      e.nodeValue = t;
    },
    setElementText: (e, t) => {
      e.textContent = t;
    },
    parentNode: (e) => e.parentNode,
    nextSibling: (e) => e.nextSibling,
    querySelector: (e) => Ta.querySelector(e),
    setScopeId(e, t) {
      e.setAttribute(t, "");
    },
    // __UNSAFE__
    // Reason: innerHTML.
    // Static content here can only come from compiled templates.
    // As long as the user only uses trusted templates, this is safe.
    insertStaticContent(e, t, n, o, r, s) {
      const i = n ? n.previousSibling : t.lastChild;
      if (r && (r === s || r.nextSibling))
        for (; t.insertBefore(r.cloneNode(!0), n), r !== s && (r = r.nextSibling); );
      else {
        Aa.innerHTML = Oa(
          "svg" === o ? `<svg>${e}</svg>` : "mathml" === o ? `<math>${e}</math>` : e
        );
        const r = Aa.content;
        if ("svg" === o || "mathml" === o) {
          const e = r.firstChild;
          for (; e.firstChild; ) r.appendChild(e.firstChild);
          r.removeChild(e);
        }
        t.insertBefore(r, n);
      }
      return [
        // first
        i ? i.nextSibling : t.firstChild,
        // last
        n ? n.previousSibling : t.lastChild,
      ];
    },
  },
  Ra = "transition",
  Ia = "animation",
  Na = Symbol("_vtc"),
  Pa = {
    name: String,
    type: String,
    css: { type: Boolean, default: !0 },
    duration: [String, Number, Object],
    enterFromClass: String,
    enterActiveClass: String,
    enterToClass: String,
    appearFromClass: String,
    appearActiveClass: String,
    appearToClass: String,
    leaveFromClass: String,
    leaveActiveClass: String,
    leaveToClass: String,
  },
  Fa = Z({}, Yo, Pa),
  La = ((e) => ((e.displayName = "Transition"), (e.props = Fa), e))((e, { slots: t }) =>
    ga(Qo, ja(e), t)
  ),
  Ma = (e, t = []) => {
    oe(e) ? e.forEach((e) => e(...t)) : e && e(...t);
  },
  Da = (e) => !!e && (oe(e) ? e.some((e) => e.length > 1) : e.length > 1);
function ja(e) {
  const t = {};
  for (const A in e) A in Pa || (t[A] = e[A]);
  if (!1 === e.css) return t;
  const {
      name: n = "v",
      type: o,
      duration: r,
      enterFromClass: s = `${n}-enter-from`,
      enterActiveClass: i = `${n}-enter-active`,
      enterToClass: a = `${n}-enter-to`,
      appearFromClass: l = s,
      appearActiveClass: c = i,
      appearToClass: u = a,
      leaveFromClass: f = `${n}-leave-from`,
      leaveActiveClass: d = `${n}-leave-active`,
      leaveToClass: p = `${n}-leave-to`,
    } = e,
    h = (function (e) {
      if (null == e) return null;
      if (ue(e)) return [$a(e.enter), $a(e.leave)];
      {
        const t = $a(e);
        return [t, t];
      }
    })(r),
    m = h && h[0],
    g = h && h[1],
    {
      onBeforeEnter: v,
      onEnter: _,
      onEnterCancelled: y,
      onLeave: b,
      onLeaveCancelled: w,
      onBeforeAppear: E = v,
      onAppear: S = _,
      onAppearCancelled: k = y,
    } = t,
    x = (e, t, n, o) => {
      ((e._enterCancelled = o), Ua(e, t ? u : a), Ua(e, t ? c : i), n && n());
    },
    O = (e, t) => {
      ((e._isLeaving = !1), Ua(e, f), Ua(e, p), Ua(e, d), t && t());
    },
    T = (e) => (t, n) => {
      const r = e ? S : _,
        i = () => x(t, e, n);
      (Ma(r, [t, i]),
        Ba(() => {
          (Ua(t, e ? l : s), Va(t, e ? u : a), Da(r) || Wa(t, o, m, i));
        }));
    };
  return Z(t, {
    onBeforeEnter(e) {
      (Ma(v, [e]), Va(e, s), Va(e, i));
    },
    onBeforeAppear(e) {
      (Ma(E, [e]), Va(e, l), Va(e, c));
    },
    onEnter: T(!1),
    onAppear: T(!0),
    onLeave(e, t) {
      e._isLeaving = !0;
      const n = () => O(e, t);
      (Va(e, f),
        e._enterCancelled ? (Va(e, d), Ya(e)) : (Ya(e), Va(e, d)),
        Ba(() => {
          e._isLeaving && (Ua(e, f), Va(e, p), Da(b) || Wa(e, o, g, n));
        }),
        Ma(b, [e, n]));
    },
    onEnterCancelled(e) {
      (x(e, !1, void 0, !0), Ma(y, [e]));
    },
    onAppearCancelled(e) {
      (x(e, !0, void 0, !0), Ma(k, [e]));
    },
    onLeaveCancelled(e) {
      (O(e), Ma(w, [e]));
    },
  });
}
function $a(e) {
  return Ae(e);
}
function Va(e, t) {
  (t.split(/\s+/).forEach((t) => t && e.classList.add(t)), (e[Na] || (e[Na] = new Set())).add(t));
}
function Ua(e, t) {
  t.split(/\s+/).forEach((t) => t && e.classList.remove(t));
  const n = e[Na];
  n && (n.delete(t), n.size || (e[Na] = void 0));
}
function Ba(e) {
  requestAnimationFrame(() => {
    requestAnimationFrame(e);
  });
}
let Ha = 0;
function Wa(e, t, n, o) {
  const r = (e._endId = ++Ha),
    s = () => {
      r === e._endId && o();
    };
  if (null != n) return setTimeout(s, n);
  const { type: i, timeout: a, propCount: l } = za(e, t);
  if (!i) return o();
  const c = i + "end";
  let u = 0;
  const f = () => {
      (e.removeEventListener(c, d), s());
    },
    d = (t) => {
      t.target === e && ++u >= l && f();
    };
  (setTimeout(() => {
    u < l && f();
  }, a + 1),
    e.addEventListener(c, d));
}
function za(e, t) {
  const n = window.getComputedStyle(e),
    o = (e) => (n[e] || "").split(", "),
    r = o(`${Ra}Delay`),
    s = o(`${Ra}Duration`),
    i = Ga(r, s),
    a = o(`${Ia}Delay`),
    l = o(`${Ia}Duration`),
    c = Ga(a, l);
  let u = null,
    f = 0,
    d = 0;
  t === Ra
    ? i > 0 && ((u = Ra), (f = i), (d = s.length))
    : t === Ia
      ? c > 0 && ((u = Ia), (f = c), (d = l.length))
      : ((f = Math.max(i, c)),
        (u = f > 0 ? (i > c ? Ra : Ia) : null),
        (d = u ? (u === Ra ? s.length : l.length) : 0));
  return {
    type: u,
    timeout: f,
    propCount: d,
    hasTransform: u === Ra && /\b(?:transform|all)(?:,|$)/.test(o(`${Ra}Property`).toString()),
  };
}
function Ga(e, t) {
  for (; e.length < t.length; ) e = e.concat(e);
  return Math.max(...t.map((t, n) => qa(t) + qa(e[n])));
}
function qa(e) {
  return "auto" === e ? 0 : 1e3 * Number(e.slice(0, -1).replace(",", "."));
}
function Ya(e) {
  return (e ? e.ownerDocument : document).body.offsetHeight;
}
const Ka = Symbol("_vod"),
  Ja = Symbol("_vsh"),
  Qa = {
    // used for prop mismatch check during hydration
    name: "show",
    beforeMount(e, { value: t }, { transition: n }) {
      ((e[Ka] = "none" === e.style.display ? "" : e.style.display),
        n && t ? n.beforeEnter(e) : Xa(e, t));
    },
    mounted(e, { value: t }, { transition: n }) {
      n && t && n.enter(e);
    },
    updated(e, { value: t, oldValue: n }, { transition: o }) {
      !t != !n &&
        (o
          ? t
            ? (o.beforeEnter(e), Xa(e, !0), o.enter(e))
            : o.leave(e, () => {
                Xa(e, !1);
              })
          : Xa(e, t));
    },
    beforeUnmount(e, { value: t }) {
      Xa(e, t);
    },
  };
function Xa(e, t) {
  ((e.style.display = t ? e[Ka] : "none"), (e[Ja] = !t));
}
const Za = Symbol("");
function el(e) {
  const t = Zi();
  if (!t) return;
  const n = (t.ut = (n = e(t.proxy)) => {
      Array.from(document.querySelectorAll(`[data-v-owner="${t.uid}"]`)).forEach((e) => nl(e, n));
    }),
    o = () => {
      const o = e(t.proxy);
      (t.ce ? nl(t.ce, o) : tl(t.subTree, o), n(o));
    };
  (Dr(() => {
    lo(o);
  }),
    Mr(() => {
      Co(o, K, { flush: "post" });
      const e = new MutationObserver(o);
      (e.observe(t.subTree.el.parentNode, { childList: !0 }), Vr(() => e.disconnect()));
    }));
}
function tl(e, t) {
  if (128 & e.shapeFlag) {
    const n = e.suspense;
    ((e = n.activeBranch),
      n.pendingBranch &&
        !n.isHydrating &&
        n.effects.push(() => {
          tl(n.activeBranch, t);
        }));
  }
  for (; e.component; ) e = e.component.subTree;
  if (1 & e.shapeFlag && e.el) nl(e.el, t);
  else if (e.type === bi) e.children.forEach((e) => tl(e, t));
  else if (e.type === Si) {
    let { el: n, anchor: o } = e;
    for (; n && (nl(n, t), n !== o); ) n = n.nextSibling;
  }
}
function nl(e, t) {
  if (1 === e.nodeType) {
    const n = e.style;
    let o = "";
    for (const e in t) {
      const r = qe(t[e]);
      (n.setProperty(`--${e}`, r), (o += `--${e}: ${r};`));
    }
    n[Za] = o;
  }
}
const ol = /(?:^|;)\s*display\s*:/;
const rl = /\s*!important$/;
function sl(e, t, n) {
  if (oe(n)) n.forEach((n) => sl(e, t, n));
  else if ((null == n && (n = ""), t.startsWith("--"))) e.setProperty(t, n);
  else {
    const o = (function (e, t) {
      const n = al[t];
      if (n) return n;
      let o = ye(t);
      if ("filter" !== o && o in e) return (al[t] = o);
      o = Ee(o);
      for (let r = 0; r < il.length; r++) {
        const n = il[r] + o;
        if (n in e) return (al[t] = n);
      }
      return t;
    })(e, t);
    rl.test(n) ? e.setProperty(we(o), n.replace(rl, ""), "important") : (e[o] = n);
  }
}
const il = ["Webkit", "Moz", "ms"],
  al = {};
function ll(e, t, n, o) {
  return "TEXTAREA" === e.tagName && ("width" === t || "height" === t) && le(o) && n === o;
}
const cl = "http://www.w3.org/1999/xlink";
function ul(e, t, n, o, r, s = $e(t)) {
  o && t.startsWith("xlink:")
    ? null == n
      ? e.removeAttributeNS(cl, t.slice(6, t.length))
      : e.setAttributeNS(cl, t, n)
    : null == n || (s && !Ve(n))
      ? e.removeAttribute(t)
      : e.setAttribute(t, s ? "" : ce(n) ? String(n) : n);
}
function fl(e, t, n, o, r) {
  if ("innerHTML" === t || "textContent" === t)
    return void (null != n && (e[t] = "innerHTML" === t ? Oa(n) : n));
  const s = e.tagName;
  if (
    "value" === t &&
    "PROGRESS" !== s && // custom elements may use _value internally
    !s.includes("-")
  ) {
    const o = "OPTION" === s ? e.getAttribute("value") || "" : e.value,
      r =
        null == n
          ? // #11647: value should be set as empty string for null and undefined,
            // but <input type="checkbox"> should be set as 'on'.
            "checkbox" === e.type
            ? "on"
            : ""
          : String(n);
    return (
      (o === r && "_value" in e) || (e.value = r),
      null == n && e.removeAttribute(t),
      void (e._value = n)
    );
  }
  let i = !1;
  if ("" === n || null == n) {
    const o = typeof e[t];
    "boolean" === o
      ? (n = Ve(n))
      : null == n && "string" === o
        ? ((n = ""), (i = !0))
        : "number" === o && ((n = 0), (i = !0));
  }
  try {
    e[t] = n;
  } catch (um) {}
  i && e.removeAttribute(r || t);
}
function dl(e, t, n, o) {
  e.addEventListener(t, n, o);
}
const pl = Symbol("_vei");
function hl(e, t, n, o, r = null) {
  const s = e[pl] || (e[pl] = {}),
    i = s[t];
  if (o && i) i.value = o;
  else {
    const [n, a] = (function (e) {
      let t;
      if (ml.test(e)) {
        let n;
        for (t = {}; (n = e.match(ml)); )
          ((e = e.slice(0, e.length - n[0].length)), (t[n[0].toLowerCase()] = !0));
      }
      const n = ":" === e[2] ? e.slice(3) : we(e.slice(2));
      return [n, t];
    })(t);
    if (o) {
      const i = (s[t] = (function (e, t) {
        const n = (e) => {
          if (e._vts) {
            if (e._vts <= n.attached) return;
          } else e._vts = Date.now();
          Jn(
            (function (e, t) {
              if (oe(t)) {
                const n = e.stopImmediatePropagation;
                return (
                  (e.stopImmediatePropagation = () => {
                    (n.call(e), (e._stopped = !0));
                  }),
                  t.map((e) => (t) => !t._stopped && e && e(t))
                );
              }
              return t;
            })(e, n.value),
            t,
            5,
            [e]
          );
        };
        return ((n.value = e), (n.attached = _l()), n);
      })(o, r));
      dl(e, n, i, a);
    } else
      i &&
        (!(function (e, t, n, o) {
          e.removeEventListener(t, n, o);
        })(e, n, i, a),
        (s[t] = void 0));
  }
}
const ml = /(?:Once|Passive|Capture)$/;
let gl = 0;
const vl = Promise.resolve(),
  _l = () => gl || (vl.then(() => (gl = 0)), (gl = Date.now()));
const yl = (e) =>
    111 === e.charCodeAt(0) &&
    110 === e.charCodeAt(1) && // lowercase letter
    e.charCodeAt(2) > 96 &&
    e.charCodeAt(2) < 123,
  bl = (e, t, n, o, r, s) => {
    const i = "svg" === r;
    "class" === t
      ? (function (e, t, n) {
          const o = e[Na];
          (o && (t = (t ? [t, ...o] : [...o]).join(" ")),
            null == t
              ? e.removeAttribute("class")
              : n
                ? e.setAttribute("class", t)
                : (e.className = t));
        })(e, o, i)
      : "style" === t
        ? (function (e, t, n) {
            const o = e.style,
              r = le(n);
            let s = !1;
            if (n && !r) {
              if (t)
                if (le(t))
                  for (const e of t.split(";")) {
                    const t = e.slice(0, e.indexOf(":")).trim();
                    null == n[t] && sl(o, t, "");
                  }
                else for (const e in t) null == n[e] && sl(o, e, "");
              for (const r in n) {
                "display" === r && (s = !0);
                const i = n[r];
                null != i ? ll(e, r, !le(t) && t ? t[r] : void 0, i) || sl(o, r, i) : sl(o, r, "");
              }
            } else if (r) {
              if (t !== n) {
                const e = o[Za];
                (e && (n += ";" + e), (o.cssText = n), (s = ol.test(n)));
              }
            } else t && e.removeAttribute("style");
            Ka in e && ((e[Ka] = s ? o.display : ""), e[Ja] && (o.display = "none"));
          })(e, n, o)
        : Q(t)
          ? X(t) || hl(e, t, 0, o, s)
          : (
                "." === t[0]
                  ? ((t = t.slice(1)), 1)
                  : "^" === t[0]
                    ? ((t = t.slice(1)), 0)
                    : (function (e, t, n, o) {
                        if (o)
                          return (
                            "innerHTML" === t || "textContent" === t || !!(t in e && yl(t) && ae(n))
                          );
                        if (
                          "spellcheck" === t ||
                          "draggable" === t ||
                          "translate" === t ||
                          "autocorrect" === t
                        )
                          return !1;
                        if ("sandbox" === t && "IFRAME" === e.tagName) return !1;
                        if ("form" === t) return !1;
                        if ("list" === t && "INPUT" === e.tagName) return !1;
                        if ("type" === t && "TEXTAREA" === e.tagName) return !1;
                        if ("width" === t || "height" === t) {
                          const t = e.tagName;
                          if ("IMG" === t || "VIDEO" === t || "CANVAS" === t || "SOURCE" === t)
                            return !1;
                        }
                        if (yl(t) && le(n)) return !1;
                        return t in e;
                      })(e, t, o, i)
              )
            ? (fl(e, t, o),
              e.tagName.includes("-") ||
                ("value" !== t && "checked" !== t && "selected" !== t) ||
                ul(e, t, o, i, 0, "value" !== t))
            : // #11081 force set props for possible async custom element
              e._isVueCE && // #12408 check if it's declared prop or it's async custom element
                ((function (e, t) {
                  const n =
                    // @ts-expect-error _def is private
                    e._def.props;
                  if (!n) return !1;
                  const o = ye(t);
                  return Array.isArray(n)
                    ? n.some((e) => ye(e) === o)
                    : Object.keys(n).some((e) => ye(e) === o);
                })(e, t) || // @ts-expect-error _def is private
                  (e._def.__asyncLoader && (/[A-Z]/.test(t) || !le(o))))
              ? fl(e, ye(t), o, 0, t)
              : ("true-value" === t
                  ? (e._trueValue = o)
                  : "false-value" === t && (e._falseValue = o),
                ul(e, t, o, i));
  };
const wl = {};
// @__NO_SIDE_EFFECTS__
function El(e, t, n) {
  let o = rr(e, t);
  he(o) && (o = Z({}, o, t));
  class r extends kl {
    constructor(e) {
      super(o, e, n);
    }
  }
  return ((r.def = o), r);
}
const Sl = "undefined" != typeof HTMLElement ? HTMLElement : class {};
class kl extends Sl {
  constructor(e, t = {}, n = lc) {
    (super(),
      (this._def = e),
      (this._props = t),
      (this._createApp = n),
      (this._isVueCE = !0),
      (this._instance = null),
      (this._app = null),
      (this._nonce = this._def.nonce),
      (this._connected = !1),
      (this._resolved = !1),
      (this._patching = !1),
      (this._dirty = !1),
      (this._numberProps = null),
      (this._styleChildren = new WeakSet()),
      (this._styleAnchors = new WeakMap()),
      (this._ob = null),
      this.shadowRoot && n !== lc
        ? (this._root = this.shadowRoot)
        : !1 !== e.shadowRoot
          ? (this.attachShadow(Z({}, e.shadowRootOptions, { mode: "open" })),
            (this._root = this.shadowRoot))
          : (this._root = this));
  }
  connectedCallback() {
    if (!this.isConnected) return;
    (this.shadowRoot || this._resolved || this._parseSlots(), (this._connected = !0));
    let e = this;
    for (
      ;
      (e =
        e && // #12479 should check assignedSlot first to get correct parent
        (e.assignedSlot || e.parentNode || e.host));
    )
      if (e instanceof kl) {
        this._parent = e;
        break;
      }
    this._instance ||
      (this._resolved
        ? this._mount(this._def)
        : e && e._pendingResolve
          ? (this._pendingResolve = e._pendingResolve.then(() => {
              ((this._pendingResolve = void 0), this._resolveDef());
            }))
          : this._resolveDef());
  }
  _setParent(e = this._parent) {
    e && ((this._instance.parent = e._instance), this._inheritParentContext(e));
  }
  _inheritParentContext(e = this._parent) {
    e && this._app && Object.setPrototypeOf(this._app._context.provides, e._instance.provides);
  }
  disconnectedCallback() {
    ((this._connected = !1),
      so(() => {
        this._connected ||
          (this._ob && (this._ob.disconnect(), (this._ob = null)),
          this._app && this._app.unmount(),
          this._instance && (this._instance.ce = void 0),
          (this._app = this._instance = null),
          this._teleportTargets &&
            (this._teleportTargets.clear(), (this._teleportTargets = void 0)));
      }));
  }
  _processMutations(e) {
    for (const t of e) this._setAttr(t.attributeName);
  }
  /**
   * resolve inner component definition (handle possible async component)
   */ _resolveDef() {
    if (this._pendingResolve) return;
    for (let n = 0; n < this.attributes.length; n++) this._setAttr(this.attributes[n].name);
    ((this._ob = new MutationObserver(this._processMutations.bind(this))),
      this._ob.observe(this, { attributes: !0 }));
    const e = (e, t = !1) => {
        ((this._resolved = !0), (this._pendingResolve = void 0));
        const { props: n, styles: o } = e;
        let r;
        if (n && !oe(n))
          for (const s in n) {
            const e = n[s];
            (e === Number || (e && e.type === Number)) &&
              (s in this._props && (this._props[s] = Ae(this._props[s])),
              ((r || (r = Object.create(null)))[ye(s)] = !0));
          }
        ((this._numberProps = r),
          this._resolveProps(e),
          this.shadowRoot && this._applyStyles(o),
          this._mount(e));
      },
      t = this._def.__asyncLoader;
    t
      ? (this._pendingResolve = t().then((t) => {
          ((t.configureApp = this._def.configureApp), e((this._def = t), !0));
        }))
      : e(this._def);
  }
  _mount(e) {
    ((this._app = this._createApp(e)),
      this._inheritParentContext(),
      e.configureApp && e.configureApp(this._app),
      (this._app._ceVNode = this._createVNode()),
      this._app.mount(this._root));
    const t = this._instance && this._instance.exposed;
    if (t)
      for (const n in t)
        ne(this, n) ||
          Object.defineProperty(this, n, {
            // unwrap ref to be consistent with public instance behavior
            get: () => Cn(t[n]),
          });
  }
  _resolveProps(e) {
    const { props: t } = e,
      n = oe(t) ? t : Object.keys(t || {});
    for (const o of Object.keys(this)) "_" !== o[0] && n.includes(o) && this._setProp(o, this[o]);
    for (const o of n.map(ye))
      Object.defineProperty(this, o, {
        get() {
          return this._getProp(o);
        },
        set(e) {
          this._setProp(o, e, !0, !this._patching);
        },
      });
  }
  _setAttr(e) {
    if (e.startsWith("data-v-")) return;
    const t = this.hasAttribute(e);
    let n = t ? this.getAttribute(e) : wl;
    const o = ye(e);
    (t && this._numberProps && this._numberProps[o] && (n = Ae(n)), this._setProp(o, n, !1, !0));
  }
  /**
   * @internal
   */ _getProp(e) {
    return this._props[e];
  }
  /**
   * @internal
   */ _setProp(e, t, n = !0, o = !1) {
    if (
      t !== this._props[e] &&
      ((this._dirty = !0),
      t === wl
        ? delete this._props[e]
        : ((this._props[e] = t), "key" === e && this._app && (this._app._ceVNode.key = t)),
      o && this._instance && this._update(),
      n)
    ) {
      const n = this._ob;
      (n && (this._processMutations(n.takeRecords()), n.disconnect()),
        !0 === t
          ? this.setAttribute(we(e), "")
          : "string" == typeof t || "number" == typeof t
            ? this.setAttribute(we(e), t + "")
            : t || this.removeAttribute(we(e)),
        n && n.observe(this, { attributes: !0 }));
    }
  }
  _update() {
    const e = this._createVNode();
    (this._app && (e.appContext = this._app._context), ac(e, this._root));
  }
  _createVNode() {
    const e = {};
    this.shadowRoot || (e.onVnodeMounted = e.onVnodeUpdated = this._renderSlots.bind(this));
    const t = ji(this._def, Z(e, this._props));
    return (
      this._instance ||
        (t.ce = (e) => {
          ((this._instance = e), (e.ce = this), (e.isCE = !0));
          const t = (e, t) => {
            this.dispatchEvent(
              new CustomEvent(e, he(t[0]) ? Z({ detail: t }, t[0]) : { detail: t })
            );
          };
          ((e.emit = (e, ...n) => {
            (t(e, n), we(e) !== e && t(we(e), n));
          }),
            this._setParent());
        }),
      t
    );
  }
  _applyStyles(e, t, n) {
    if (!e) return;
    if (t) {
      if (t === this._def || this._styleChildren.has(t)) return;
      this._styleChildren.add(t);
    }
    const o = this._nonce,
      r = this.shadowRoot,
      s = n
        ? this._getStyleAnchor(n) || this._getStyleAnchor(this._def)
        : this._getRootStyleInsertionAnchor(r);
    let i = null;
    for (let a = e.length - 1; a >= 0; a--) {
      const l = document.createElement("style");
      (o && l.setAttribute("nonce", o),
        (l.textContent = e[a]),
        r.insertBefore(l, i || s),
        (i = l),
        0 === a && (n || this._styleAnchors.set(this._def, l), t && this._styleAnchors.set(t, l)));
    }
  }
  _getStyleAnchor(e) {
    if (!e) return null;
    const t = this._styleAnchors.get(e);
    return t && t.parentNode === this.shadowRoot ? t : (t && this._styleAnchors.delete(e), null);
  }
  _getRootStyleInsertionAnchor(e) {
    for (let t = 0; t < e.childNodes.length; t++) {
      const n = e.childNodes[t];
      if (!(n instanceof HTMLStyleElement)) return n;
    }
    return null;
  }
  /**
   * Only called when shadowRoot is false
   */ _parseSlots() {
    const e = (this._slots = {});
    let t;
    for (; (t = this.firstChild); ) {
      const n = (1 === t.nodeType && t.getAttribute("slot")) || "default";
      ((e[n] || (e[n] = [])).push(t), this.removeChild(t));
    }
  }
  /**
   * Only called when shadowRoot is false
   */ _renderSlots() {
    const e = this._getSlots(),
      t = this._instance.type.__scopeId;
    for (let n = 0; n < e.length; n++) {
      const o = e[n],
        r = o.getAttribute("name") || "default",
        s = this._slots[r],
        i = o.parentNode;
      if (s)
        for (const e of s) {
          if (t && 1 === e.nodeType) {
            const n = t + "-s",
              o = document.createTreeWalker(e, 1);
            let r;
            for (e.setAttribute(n, ""); (r = o.nextNode()); ) r.setAttribute(n, "");
          }
          i.insertBefore(e, o);
        }
      else for (; o.firstChild; ) i.insertBefore(o.firstChild, o);
      i.removeChild(o);
    }
  }
  /**
   * @internal
   */ _getSlots() {
    const e = [this];
    this._teleportTargets && e.push(...this._teleportTargets);
    const t = new Set();
    for (const n of e) {
      const e = n.querySelectorAll("slot");
      for (let n = 0; n < e.length; n++) t.add(e[n]);
    }
    return Array.from(t);
  }
  /**
   * @internal
   */ _injectChildStyle(e, t) {
    this._applyStyles(e.styles, e, t);
  }
  /**
   * @internal
   */ _beginPatch() {
    ((this._patching = !0), (this._dirty = !1));
  }
  /**
   * @internal
   */ _endPatch() {
    ((this._patching = !1), this._dirty && this._instance && this._update());
  }
  /**
   * @internal
   */ _hasShadowRoot() {
    return !1 !== this._def.shadowRoot;
  }
  /**
   * @internal
   */ _removeChildStyle(e) {}
}
function xl(e) {
  const t = Zi(),
    n = t && t.ce;
  return n || null;
}
const Ol = new WeakMap(),
  Tl = new WeakMap(),
  Al = Symbol("_moveCb"),
  Cl = Symbol("_enterCb"),
  Rl = ((e) => (delete e.props.mode, e))({
    name: "TransitionGroup",
    props: Z({}, Fa, { tag: String, moveClass: String }),
    setup(e, { slots: t }) {
      const n = Zi(),
        o = Go();
      let r, s;
      return (
        jr(() => {
          if (!r.length) return;
          const t = e.moveClass || `${e.name || "v"}-move`;
          if (
            !(function (e, t, n) {
              const o = e.cloneNode(),
                r = e[Na];
              r &&
                r.forEach((e) => {
                  e.split(/\s+/).forEach((e) => e && o.classList.remove(e));
                });
              (n.split(/\s+/).forEach((e) => e && o.classList.add(e)), (o.style.display = "none"));
              const s = 1 === t.nodeType ? t : t.parentNode;
              s.appendChild(o);
              const { hasTransform: i } = za(o);
              return (s.removeChild(o), i);
            })(r[0].el, n.vnode.el, t)
          )
            return void (r = []);
          (r.forEach(Il), r.forEach(Nl));
          const o = r.filter(Pl);
          (Ya(n.vnode.el),
            o.forEach((e) => {
              const n = e.el,
                o = n.style;
              (Va(n, t), (o.transform = o.webkitTransform = o.transitionDuration = ""));
              const r = (n[Al] = (e) => {
                (e && e.target !== n) ||
                  (e && !e.propertyName.endsWith("transform")) ||
                  (n.removeEventListener("transitionend", r), (n[Al] = null), Ua(n, t));
              });
              n.addEventListener("transitionend", r);
            }),
            (r = []));
        }),
        () => {
          const i = yn(e),
            a = ja(i);
          let l = i.tag || bi;
          if (((r = []), s))
            for (let e = 0; e < s.length; e++) {
              const t = s[e];
              t.el &&
                t.el instanceof Element &&
                (r.push(t), nr(t, Zo(t, a, o, n)), Ol.set(t, Fl(t.el)));
            }
          s = t.default ? or(t.default()) : [];
          for (let e = 0; e < s.length; e++) {
            const t = s[e];
            null != t.key && nr(t, Zo(t, a, o, n));
          }
          return ji(l, null, s);
        }
      );
    },
  });
function Il(e) {
  const t = e.el;
  (t[Al] && t[Al](), t[Cl] && t[Cl]());
}
function Nl(e) {
  Tl.set(e, Fl(e.el));
}
function Pl(e) {
  const t = Ol.get(e),
    n = Tl.get(e),
    o = t.left - n.left,
    r = t.top - n.top;
  if (o || r) {
    const t = e.el,
      n = t.style,
      s = t.getBoundingClientRect();
    let i = 1,
      a = 1;
    return (
      t.offsetWidth && (i = s.width / t.offsetWidth),
      t.offsetHeight && (a = s.height / t.offsetHeight),
      (Number.isFinite(i) && 0 !== i) || (i = 1),
      (Number.isFinite(a) && 0 !== a) || (a = 1),
      Math.abs(i - 1) < 0.01 && (i = 1),
      Math.abs(a - 1) < 0.01 && (a = 1),
      (n.transform = n.webkitTransform = `translate(${o / i}px,${r / a}px)`),
      (n.transitionDuration = "0s"),
      e
    );
  }
}
function Fl(e) {
  const t = e.getBoundingClientRect();
  return { left: t.left, top: t.top };
}
const Ll = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return oe(t) ? (e) => xe(t, e) : t;
};
function Ml(e) {
  e.target.composing = !0;
}
function Dl(e) {
  const t = e.target;
  t.composing && ((t.composing = !1), t.dispatchEvent(new Event("input")));
}
const jl = Symbol("_assign");
function $l(e, t, n) {
  return (t && (e = e.trim()), n && (e = Te(e)), e);
}
const Vl = {
    created(e, { modifiers: { lazy: t, trim: n, number: o } }, r) {
      e[jl] = Ll(r);
      const s = o || (r.props && "number" === r.props.type);
      (dl(e, t ? "change" : "input", (t) => {
        t.target.composing || e[jl]($l(e.value, n, s));
      }),
        (n || s) &&
          dl(e, "change", () => {
            e.value = $l(e.value, n, s);
          }),
        t || (dl(e, "compositionstart", Ml), dl(e, "compositionend", Dl), dl(e, "change", Dl)));
    },
    // set value on mounted so it's after min/max for type="range"
    mounted(e, { value: t }) {
      e.value = null == t ? "" : t;
    },
    beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: o, trim: r, number: s } }, i) {
      if (((e[jl] = Ll(i)), e.composing)) return;
      const a = null == t ? "" : t;
      if (((!s && "number" !== e.type) || /^0\d/.test(e.value) ? e.value : Te(e.value)) === a)
        return;
      const l = e.getRootNode();
      if (
        (l instanceof Document || l instanceof ShadowRoot) &&
        l.activeElement === e &&
        "range" !== e.type
      ) {
        if (o && t === n) return;
        if (r && e.value.trim() === a) return;
      }
      e.value = a;
    },
  },
  Ul = {
    // #4096 array checkboxes need to be deep traversed
    deep: !0,
    created(e, t, n) {
      ((e[jl] = Ll(n)),
        dl(e, "change", () => {
          const t = e._modelValue,
            n = Gl(e),
            o = e.checked,
            r = e[jl];
          if (oe(t)) {
            const e = Be(t, n),
              s = -1 !== e;
            if (o && !s) r(t.concat(n));
            else if (!o && s) {
              const n = [...t];
              (n.splice(e, 1), r(n));
            }
          } else if (se(t)) {
            const e = new Set(t);
            (o ? e.add(n) : e.delete(n), r(e));
          } else r(ql(e, o));
        }));
    },
    // set initial checked on mount to wait for true-value/false-value
    mounted: Bl,
    beforeUpdate(e, t, n) {
      ((e[jl] = Ll(n)), Bl(e, t, n));
    },
  };
function Bl(e, { value: t, oldValue: n }, o) {
  let r;
  if (((e._modelValue = t), oe(t))) r = Be(t, o.props.value) > -1;
  else if (se(t)) r = t.has(o.props.value);
  else {
    if (t === n) return;
    r = Ue(t, ql(e, !0));
  }
  e.checked !== r && (e.checked = r);
}
const Hl = {
    created(e, { value: t }, n) {
      ((e.checked = Ue(t, n.props.value)),
        (e[jl] = Ll(n)),
        dl(e, "change", () => {
          e[jl](Gl(e));
        }));
    },
    beforeUpdate(e, { value: t, oldValue: n }, o) {
      ((e[jl] = Ll(o)), t !== n && (e.checked = Ue(t, o.props.value)));
    },
  },
  Wl = {
    // <select multiple> value need to be deep traversed
    deep: !0,
    created(e, { value: t, modifiers: { number: n } }, o) {
      const r = se(t);
      (dl(e, "change", () => {
        const t = Array.prototype.filter
          .call(e.options, (e) => e.selected)
          .map((e) => (n ? Te(Gl(e)) : Gl(e)));
        (e[jl](e.multiple ? (r ? new Set(t) : t) : t[0]),
          (e._assigning = !0),
          so(() => {
            e._assigning = !1;
          }));
      }),
        (e[jl] = Ll(o)));
    },
    // set value in mounted & updated because <select> relies on its children
    // <option>s.
    mounted(e, { value: t }) {
      zl(e, t);
    },
    beforeUpdate(e, t, n) {
      e[jl] = Ll(n);
    },
    updated(e, { value: t }) {
      e._assigning || zl(e, t);
    },
  };
function zl(e, t) {
  const n = e.multiple,
    o = oe(t);
  if (!n || o || se(t)) {
    for (let r = 0, s = e.options.length; r < s; r++) {
      const s = e.options[r],
        i = Gl(s);
      if (n)
        if (o) {
          const e = typeof i;
          s.selected =
            "string" === e || "number" === e
              ? t.some((e) => String(e) === String(i))
              : Be(t, i) > -1;
        } else s.selected = t.has(i);
      else if (Ue(Gl(s), t)) return void (e.selectedIndex !== r && (e.selectedIndex = r));
    }
    n || -1 === e.selectedIndex || (e.selectedIndex = -1);
  }
}
function Gl(e) {
  return "_value" in e ? e._value : e.value;
}
function ql(e, t) {
  const n = t ? "_trueValue" : "_falseValue";
  return n in e ? e[n] : t;
}
const Yl = {
  created(e, t, n) {
    Jl(e, t, n, null, "created");
  },
  mounted(e, t, n) {
    Jl(e, t, n, null, "mounted");
  },
  beforeUpdate(e, t, n, o) {
    Jl(e, t, n, o, "beforeUpdate");
  },
  updated(e, t, n, o) {
    Jl(e, t, n, o, "updated");
  },
};
function Kl(e, t) {
  switch (e) {
    case "SELECT":
      return Wl;
    case "TEXTAREA":
      return Vl;
    default:
      switch (t) {
        case "checkbox":
          return Ul;
        case "radio":
          return Hl;
        default:
          return Vl;
      }
  }
}
function Jl(e, t, n, o, r) {
  const s = Kl(e.tagName, n.props && n.props.type)[r];
  s && s(e, t, n, o);
}
const Ql = ["ctrl", "shift", "alt", "meta"],
  Xl = {
    stop: (e) => e.stopPropagation(),
    prevent: (e) => e.preventDefault(),
    self: (e) => e.target !== e.currentTarget,
    ctrl: (e) => !e.ctrlKey,
    shift: (e) => !e.shiftKey,
    alt: (e) => !e.altKey,
    meta: (e) => !e.metaKey,
    left: (e) => "button" in e && 0 !== e.button,
    middle: (e) => "button" in e && 1 !== e.button,
    right: (e) => "button" in e && 2 !== e.button,
    exact: (e, t) => Ql.some((n) => e[`${n}Key`] && !t.includes(n)),
  },
  Zl = (e, t) => {
    if (!e) return e;
    const n = e._withMods || (e._withMods = {}),
      o = t.join(".");
    return (
      n[o] ||
      (n[o] = (n, ...o) => {
        for (let e = 0; e < t.length; e++) {
          const o = Xl[t[e]];
          if (o && o(n, t)) return;
        }
        return e(n, ...o);
      })
    );
  },
  ec = {
    esc: "escape",
    space: " ",
    up: "arrow-up",
    left: "arrow-left",
    right: "arrow-right",
    down: "arrow-down",
    delete: "backspace",
  },
  tc = (e, t) => {
    const n = e._withKeys || (e._withKeys = {}),
      o = t.join(".");
    return (
      n[o] ||
      (n[o] = (n) => {
        if (!("key" in n)) return;
        const o = we(n.key);
        return t.some((e) => e === o || ec[e] === o) ? e(n) : void 0;
      })
    );
  },
  nc = Z({ patchProp: bl }, Ca);
let oc,
  rc = !1;
function sc() {
  return oc || (oc = ni(nc));
}
function ic() {
  return ((oc = rc ? oc : oi(nc)), (rc = !0), oc);
}
const ac = (...e) => {
    sc().render(...e);
  },
  lc = (...e) => {
    const t = sc().createApp(...e),
      { mount: n } = t;
    return (
      (t.mount = (e) => {
        const o = fc(e);
        if (!o) return;
        const r = t._component;
        (ae(r) || r.render || r.template || (r.template = o.innerHTML),
          1 === o.nodeType && (o.textContent = ""));
        const s = n(o, !1, uc(o));
        return (
          o instanceof Element && (o.removeAttribute("v-cloak"), o.setAttribute("data-v-app", "")),
          s
        );
      }),
      t
    );
  },
  cc = (...e) => {
    const t = ic().createApp(...e),
      { mount: n } = t;
    return (
      (t.mount = (e) => {
        const t = fc(e);
        if (t) return n(t, !0, uc(t));
      }),
      t
    );
  };
function uc(e) {
  return e instanceof SVGElement
    ? "svg"
    : "function" == typeof MathMLElement && e instanceof MathMLElement
      ? "mathml"
      : void 0;
}
function fc(e) {
  if (le(e)) {
    return document.querySelector(e);
  }
  return e;
}
let dc = !1;
const pc = Object.freeze(
  Object.defineProperty(
    {
      __proto__: null,
      BaseTransition: Qo,
      BaseTransitionPropsValidators: Yo,
      Comment: Ei,
      DeprecationTypes: null,
      EffectScope: Je,
      ErrorCodes: {
        SETUP_FUNCTION: 0,
        0: "SETUP_FUNCTION",
        RENDER_FUNCTION: 1,
        1: "RENDER_FUNCTION",
        NATIVE_EVENT_HANDLER: 5,
        5: "NATIVE_EVENT_HANDLER",
        COMPONENT_EVENT_HANDLER: 6,
        6: "COMPONENT_EVENT_HANDLER",
        VNODE_HOOK: 7,
        7: "VNODE_HOOK",
        DIRECTIVE_HOOK: 8,
        8: "DIRECTIVE_HOOK",
        TRANSITION_HOOK: 9,
        9: "TRANSITION_HOOK",
        APP_ERROR_HANDLER: 10,
        10: "APP_ERROR_HANDLER",
        APP_WARN_HANDLER: 11,
        11: "APP_WARN_HANDLER",
        FUNCTION_REF: 12,
        12: "FUNCTION_REF",
        ASYNC_COMPONENT_LOADER: 13,
        13: "ASYNC_COMPONENT_LOADER",
        SCHEDULER: 14,
        14: "SCHEDULER",
        COMPONENT_UPDATE: 15,
        15: "COMPONENT_UPDATE",
        APP_UNMOUNT_CLEANUP: 16,
        16: "APP_UNMOUNT_CLEANUP",
      },
      ErrorTypeStrings: ba,
      Fragment: bi,
      KeepAlive: xr,
      ReactiveEffect: tt,
      Static: Si,
      Suspense: hi,
      Teleport: Uo,
      Text: wi,
      TrackOpTypes: { GET: "get", HAS: "has", ITERATE: "iterate" },
      Transition: La,
      TransitionGroup: Rl,
      TriggerOpTypes: { SET: "set", ADD: "add", DELETE: "delete", CLEAR: "clear" },
      VueElement: kl,
      assertNumber: function (e, t) {},
      callWithAsyncErrorHandling: Jn,
      callWithErrorHandling: Kn,
      camelize: ye,
      capitalize: Ee,
      cloneVNode: Vi,
      compatUtils: null,
      compile: () => {},
      computed: ma,
      createApp: lc,
      createBlock: Ni,
      createCommentVNode: Hi,
      createElementBlock: Ii,
      createElementVNode: Di,
      createHydrationRenderer: oi,
      createPropsRestProxy: function (e, t) {
        const n = {};
        for (const o in e)
          t.includes(o) || Object.defineProperty(n, o, { enumerable: !0, get: () => e[o] });
        return n;
      },
      createRenderer: ni,
      createSSRApp: cc,
      createSlots: Zr,
      createStaticVNode: Bi,
      createTextVNode: Ui,
      createVNode: ji,
      customRef: Fn,
      defineAsyncComponent: Er,
      defineComponent: rr,
      defineCustomElement: El,
      defineEmits: function () {
        return null;
      },
      defineExpose: function (e) {},
      defineModel: function () {},
      defineOptions: function (e) {},
      defineProps: function () {
        return null;
      },
      defineSSRCustomElement: /* @__NO_SIDE_EFFECTS__ */ (e, t) => El(e, t, cc),
      defineSlots: function () {
        return null;
      },
      devtools: wa,
      effect: function (e, t) {
        e.effect instanceof tt && (e = e.effect.fn);
        const n = new tt(e);
        t && Z(n, t);
        try {
          n.run();
        } catch (r) {
          throw (n.stop(), r);
        }
        const o = n.run.bind(n);
        return ((o.effect = n), o);
      },
      effectScope: Qe,
      getCurrentInstance: Zi,
      getCurrentScope: Xe,
      getCurrentWatcher: function () {
        return Wn;
      },
      getTransitionRawChildren: or,
      guardReactiveProps: $i,
      h: ga,
      handleError: Qn,
      hasInjectionContext: ko,
      hydrate: (...e) => {
        ic().hydrate(...e);
      },
      hydrateOnIdle:
        (e = 1e4) =>
        (t) => {
          const n = yr(t, { timeout: e });
          return () => br(n);
        },
      hydrateOnInteraction:
        (e = []) =>
        (t, n) => {
          le(e) && (e = [e]);
          let o = !1;
          const r = (e) => {
              o || ((o = !0), s(), t(), e.target.dispatchEvent(new e.constructor(e.type, e)));
            },
            s = () => {
              n((t) => {
                for (const n of e) t.removeEventListener(n, r);
              });
            };
          return (
            n((t) => {
              for (const n of e) t.addEventListener(n, r, { once: !0 });
            }),
            s
          );
        },
      hydrateOnMediaQuery: (e) => (t) => {
        if (e) {
          const n = matchMedia(e);
          if (!n.matches)
            return (
              n.addEventListener("change", t, { once: !0 }),
              () => n.removeEventListener("change", t)
            );
          t();
        }
      },
      hydrateOnVisible: (e) => (t, n) => {
        const o = new IntersectionObserver((e) => {
          for (const n of e)
            if (n.isIntersecting) {
              (o.disconnect(), t());
              break;
            }
        }, e);
        return (
          n((e) => {
            if (e instanceof Element)
              return (function (e) {
                const { top: t, left: n, bottom: o, right: r } = e.getBoundingClientRect(),
                  { innerHeight: s, innerWidth: i } = window;
                return (
                  ((t > 0 && t < s) || (o > 0 && o < s)) && ((n > 0 && n < i) || (r > 0 && r < i))
                );
              })(e)
                ? (t(), o.disconnect(), !1)
                : void o.observe(e);
          }),
          () => o.disconnect()
        );
      },
      initCustomFormatter: function () {},
      initDirectivesForSSR: () => {
        dc ||
          ((dc = !0),
          (Vl.getSSRProps = ({ value: e }) => ({ value: e })),
          (Hl.getSSRProps = ({ value: e }, t) => {
            if (t.props && Ue(t.props.value, e)) return { checked: !0 };
          }),
          (Ul.getSSRProps = ({ value: e }, t) => {
            if (oe(e)) {
              if (t.props && Be(e, t.props.value) > -1) return { checked: !0 };
            } else if (se(e)) {
              if (t.props && e.has(t.props.value)) return { checked: !0 };
            } else if (e) return { checked: !0 };
          }),
          (Yl.getSSRProps = (e, t) => {
            if ("string" != typeof t.type) return;
            const n = Kl(
              // resolveDynamicModel expects an uppercase tag name, but vnode.type is lowercase
              t.type.toUpperCase(),
              t.props && t.props.type
            );
            return n.getSSRProps ? n.getSSRProps(e, t) : void 0;
          }),
          (Qa.getSSRProps = ({ value: e }) => {
            if (!e) return { style: { display: "none" } };
          }));
      },
      inject: So,
      isMemoSame: va,
      isProxy: _n,
      isReactive: mn,
      isReadonly: gn,
      isRef: Sn,
      isRuntimeOnly: () => !sa,
      isShallow: vn,
      isVNode: Pi,
      markRaw: bn,
      mergeDefaults: function (e, t) {
        const n = fs(e);
        for (const o in t) {
          if (o.startsWith("__skip")) continue;
          let e = n[o];
          (e
            ? oe(e) || ae(e)
              ? (e = n[o] = { type: e, default: t[o] })
              : (e.default = t[o])
            : null === e && (e = n[o] = { default: t[o] }),
            e && t[`__skip_${o}`] && (e.skipFactory = !0));
        }
        return n;
      },
      mergeModels: ds,
      mergeProps: qi,
      nextTick: so,
      nodeOps: Ca,
      normalizeClass: De,
      normalizeProps: je,
      normalizeStyle: Ne,
      onActivated: Tr,
      onBeforeMount: Lr,
      onBeforeUnmount: $r,
      onBeforeUpdate: Dr,
      onDeactivated: Ar,
      onErrorCaptured: Wr,
      onMounted: Mr,
      onRenderTracked: Hr,
      onRenderTriggered: Br,
      onScopeDispose: Ze,
      onServerPrefetch: Ur,
      onUnmounted: Vr,
      onUpdated: jr,
      onWatcherCleanup: zn,
      openBlock: Oi,
      patchProp: bl,
      popScopeId: function () {
        vo = null;
      },
      provide: Eo,
      proxyRefs: Nn,
      pushScopeId: function (e) {
        vo = e;
      },
      queuePostFlushCb: lo,
      reactive: un,
      readonly: dn,
      ref: kn,
      registerRuntimeCompiler: function (e) {
        ((sa = e),
          (ia = (e) => {
            e.render._rc && (e.withProxy = new Proxy(e.ctx, as));
          }));
      },
      render: ac,
      renderList: Xr,
      renderSlot: es,
      resolveComponent: Gr,
      resolveDirective: Kr,
      resolveDynamicComponent: Yr,
      resolveFilter: null,
      resolveTransitionHooks: Zo,
      setBlockTracking: Ci,
      setDevtoolsHook: Ea,
      setTransitionHooks: nr,
      shallowReactive: fn,
      shallowReadonly: pn,
      shallowRef: xn,
      ssrContextKey: xo,
      ssrUtils: Sa,
      stop: function (e) {
        e.effect.stop();
      },
      toDisplayString: We,
      toHandlerKey: Se,
      toHandlers: ns,
      toRaw: yn,
      toRef: jn,
      toRefs: Ln,
      toValue: Rn,
      transformVNodeArgs: function (e) {},
      triggerRef: An,
      unref: Cn,
      useAttrs: cs,
      useCssModule: function (e = "$style") {
        {
          const t = Zi();
          if (!t) return q;
          const n = t.type.__cssModules;
          if (!n) return q;
          const o = n[e];
          return o || q;
        }
      },
      useCssVars: el,
      useHost: xl,
      useId: function () {
        const e = Zi();
        return e ? (e.appContext.config.idPrefix || "v") + "-" + e.ids[0] + e.ids[1]++ : "";
      },
      useModel: Cs,
      useSSRContext: Oo,
      useShadowRoot: function () {
        const e = xl();
        return e && e.shadowRoot;
      },
      useSlots: ls,
      useTemplateRef: ir,
      useTransitionState: Go,
      vModelCheckbox: Ul,
      vModelDynamic: Yl,
      vModelRadio: Hl,
      vModelSelect: Wl,
      vModelText: Vl,
      vShow: Qa,
      version: _a,
      warn: ya,
      watch: Co,
      watchEffect: To,
      watchPostEffect: function (e, t) {
        return Ro(e, null, { flush: "post" });
      },
      watchSyncEffect: Ao,
      withAsyncContext: function (e) {
        const t = Zi(),
          n = aa;
        let o = e();
        (oa(), n && ta(!1));
        const r = () => {
            (na(t), n && ta(!0));
          },
          s = () => {
            (Zi() !== t && t.scope.off(), oa(), n && ta(!1));
          };
        return (
          fe(o) &&
            (o = o.catch((e) => {
              throw (r(), Promise.resolve().then(() => Promise.resolve().then(s)), e);
            })),
          [
            o,
            () => {
              (r(), Promise.resolve().then(s));
            },
          ]
        );
      },
      withCtx: yo,
      withDefaults: function (e, t) {
        return null;
      },
      withDirectives: bo,
      withKeys: tc,
      withMemo: function (e, t, n, o) {
        const r = n[o];
        if (r && va(r, e)) return r;
        const s = t();
        return ((s.memo = e.slice()), (s.cacheIndex = o), (n[o] = s));
      },
      withModifiers: Zl,
      withScopeId: (e) => yo,
    },
    Symbol.toStringTag,
    { value: "Module" }
  )
);
function hc(e, t) {
  const n = xn();
  return (
    To(
      () => {
        n.value = e();
      },
      { ...t, flush: null != void 0 ? void 0 : "sync" }
    ),
    dn(n)
  );
}
function mc(e) {
  return !!Xe() && (Ze(e), !0);
}
function gc(e) {
  return "function" == typeof e ? e() : Cn(e);
}
function vc(e) {
  return un(
    Sn((t = ma(e)))
      ? new Proxy(
          {},
          {
            get: (e, n, o) => Cn(Reflect.get(t.value, n, o)),
            set: (e, n, o) => (
              Sn(t.value[n]) && !Sn(o) ? (t.value[n].value = o) : (t.value[n] = o),
              !0
            ),
            deleteProperty: (e, n) => Reflect.deleteProperty(t.value, n),
            has: (e, n) => Reflect.has(t.value, n),
            ownKeys: () => Object.keys(t.value),
            getOwnPropertyDescriptor: () => ({ enumerable: !0, configurable: !0 }),
          }
        )
      : t
  );
  var t;
}
const _c = "undefined" != typeof window && "undefined" != typeof document;
"undefined" != typeof WorkerGlobalScope && (globalThis, WorkerGlobalScope);
const yc = (e) => null != e,
  bc = Object.prototype.toString,
  wc = (e, t, n) => Math.min(n, Math.max(t, e)),
  Ec = () => {},
  Sc = kc();
function kc() {
  var e, t;
  return (
    _c &&
    (null == (e = null == window ? void 0 : window.navigator) ? void 0 : e.userAgent) &&
    (/iP(?:ad|hone|od)/.test(window.navigator.userAgent) ||
      ((null == (t = null == window ? void 0 : window.navigator) ? void 0 : t.maxTouchPoints) > 2 &&
        /iPad|Macintosh/.test(null == window ? void 0 : window.navigator.userAgent)))
  );
}
function xc(e, t) {
  return function (...n) {
    return new Promise((o, r) => {
      Promise.resolve(e(() => t.apply(this, n), { fn: t, thisArg: this, args: n }))
        .then(o)
        .catch(r);
    });
  };
}
function Oc(e, t = 200, n = {}) {
  return xc(
    (function (e, t = {}) {
      let n,
        o,
        r = Ec;
      const s = (e) => {
        (clearTimeout(e), r(), (r = Ec));
      };
      return (i) => {
        const a = gc(e),
          l = gc(t.maxWait);
        return (
          n && s(n),
          a <= 0 || (void 0 !== l && l <= 0)
            ? (o && (s(o), (o = null)), Promise.resolve(i()))
            : new Promise((e, c) => {
                ((r = t.rejectOnCancel ? c : e),
                  l &&
                    !o &&
                    (o = setTimeout(() => {
                      (n && s(n), (o = null), e(i()));
                    }, l)),
                  (n = setTimeout(() => {
                    (o && s(o), (o = null), e(i()));
                  }, a)));
              })
        );
      };
    })(t, n),
    e
  );
}
function Tc(e, t = 200, n = {}) {
  const o = kn(e.value),
    r = Oc(
      () => {
        o.value = e.value;
      },
      t,
      n
    );
  return (Co(e, () => r()), o);
}
function Ac(e, t = 200, n = !1, o = !0, r = !1) {
  return xc(
    (function (...e) {
      let t,
        n,
        o,
        r,
        s,
        i,
        a = 0,
        l = !0,
        c = Ec;
      Sn(e[0]) || "object" != typeof e[0]
        ? ([o, r = !0, s = !0, i = !1] = e)
        : ({ delay: o, trailing: r = !0, leading: s = !0, rejectOnCancel: i = !1 } = e[0]);
      const u = () => {
        t && (clearTimeout(t), (t = void 0), c(), (c = Ec));
      };
      return (e) => {
        const f = gc(o),
          d = Date.now() - a,
          p = () => (n = e());
        return (
          u(),
          f <= 0
            ? ((a = Date.now()), p())
            : (d > f && (s || !l)
                ? ((a = Date.now()), p())
                : r &&
                  (n = new Promise((e, n) => {
                    ((c = i ? n : e),
                      (t = setTimeout(
                        () => {
                          ((a = Date.now()), (l = !0), e(p()), u());
                        },
                        Math.max(0, f - d)
                      )));
                  })),
              s || t || (t = setTimeout(() => (l = !0), f)),
              (l = !1),
              n)
        );
      };
    })(t, n, o, r),
    e
  );
}
function Cc(e, t = !0, n) {
  Zi() ? Mr(e, n) : t ? e() : so(e);
}
function Rc(e, t, n = {}) {
  const { immediate: o = !0 } = n,
    r = kn(!1);
  let s = null;
  function i() {
    s && (clearTimeout(s), (s = null));
  }
  function a() {
    ((r.value = !1), i());
  }
  function l(...n) {
    (i(),
      (r.value = !0),
      (s = setTimeout(() => {
        ((r.value = !1), (s = null), e(...n));
      }, gc(t))));
  }
  return (o && ((r.value = !0), _c && l()), mc(a), { isPending: dn(r), start: l, stop: a });
}
const Ic = _c ? window : void 0,
  Nc = _c ? window.document : void 0;
function Pc(e) {
  var t;
  const n = gc(e);
  return null != (t = null == n ? void 0 : n.$el) ? t : n;
}
function Fc(...e) {
  let t, n, o, r;
  if (
    ("string" == typeof e[0] || Array.isArray(e[0])
      ? (([n, o, r] = e), (t = Ic))
      : ([t, n, o, r] = e),
    !t)
  )
    return Ec;
  (Array.isArray(n) || (n = [n]), Array.isArray(o) || (o = [o]));
  const s = [],
    i = () => {
      (s.forEach((e) => e()), (s.length = 0));
    },
    a = Co(
      () => [Pc(t), gc(r)],
      ([e, t]) => {
        if ((i(), !e)) return;
        const r = ((a = t), "[object Object]" === bc.call(a) ? { ...t } : t);
        var a;
        s.push(
          ...n.flatMap((t) =>
            o.map((n) =>
              ((e, t, n, o) => (e.addEventListener(t, n, o), () => e.removeEventListener(t, n, o)))(
                e,
                t,
                n,
                r
              )
            )
          )
        );
      },
      { immediate: !0, flush: "post" }
    ),
    l = () => {
      (a(), i());
    };
  return (mc(l), l);
}
let Lc,
  Mc = !1;
function Dc(e, t, n = {}) {
  const { window: o = Ic, ignore: r = [], capture: s = !0, detectIframe: i = !1 } = n;
  if (!o) return Ec;
  Sc &&
    !Mc &&
    ((Mc = !0),
    Array.from(o.document.body.children).forEach((e) => e.addEventListener("click", Ec)),
    o.document.documentElement.addEventListener("click", Ec));
  let a = !0;
  const l = (e) =>
    gc(r).some((t) => {
      if ("string" == typeof t)
        return Array.from(o.document.querySelectorAll(t)).some(
          (t) => t === e.target || e.composedPath().includes(t)
        );
      {
        const n = Pc(t);
        return n && (e.target === n || e.composedPath().includes(n));
      }
    });
  const c = (n) => {
    const o = Pc(e);
    null != n.target &&
      (o instanceof Element ||
        !(function (e) {
          const t = gc(e);
          return t && 16 === t.$.subTree.shapeFlag;
        })(e) ||
        !(function (e, t) {
          const n = gc(e),
            o = n.$.subTree && n.$.subTree.children;
          return (
            !(null == o || !Array.isArray(o)) &&
            o.some((e) => e.el === t.target || t.composedPath().includes(e.el))
          );
        })(e, n)) &&
      o &&
      o !== n.target &&
      !n.composedPath().includes(o) &&
      (0 === n.detail && (a = !l(n)), a ? t(n) : (a = !0));
  };
  let u = !1;
  const f = [
    Fc(
      o,
      "click",
      (e) => {
        u ||
          ((u = !0),
          setTimeout(() => {
            u = !1;
          }, 0),
          c(e));
      },
      { passive: !0, capture: s }
    ),
    Fc(
      o,
      "pointerdown",
      (t) => {
        const n = Pc(e);
        a = !l(t) && !(!n || t.composedPath().includes(n));
      },
      { passive: !0 }
    ),
    i &&
      Fc(o, "blur", (n) => {
        setTimeout(() => {
          var r;
          const s = Pc(e);
          "IFRAME" !== (null == (r = o.document.activeElement) ? void 0 : r.tagName) ||
            (null == s ? void 0 : s.contains(o.document.activeElement)) ||
            t(n);
        }, 0);
      }),
  ].filter(Boolean);
  return () => f.forEach((e) => e());
}
function jc(e) {
  const t = (function () {
    const e = kn(!1),
      t = Zi();
    return (
      t &&
        Mr(() => {
          e.value = !0;
        }, t),
      e
    );
  })();
  return ma(() => (t.value, Boolean(e())));
}
function $c(e, t, n = {}) {
  const { window: o = Ic, ...r } = n;
  let s;
  const i = jc(() => o && "MutationObserver" in o),
    a = () => {
      s && (s.disconnect(), (s = void 0));
    },
    l = ma(() => {
      const t = gc(e),
        n = (Array.isArray(t) ? t : [t]).map(Pc).filter(yc);
      return new Set(n);
    }),
    c = Co(
      () => l.value,
      (e) => {
        (a(),
          i.value && e.size && ((s = new MutationObserver(t)), e.forEach((e) => s.observe(e, r))));
      },
      { immediate: !0, flush: "post" }
    ),
    u = () => {
      (c(), a());
    };
  return (
    mc(u),
    { isSupported: i, stop: u, takeRecords: () => (null == s ? void 0 : s.takeRecords()) }
  );
}
function Vc(e = {}) {
  var t;
  const { window: n = Ic, deep: o = !0, triggerOnRemoval: r = !1 } = e,
    s = null != (t = e.document) ? t : null == n ? void 0 : n.document,
    i = kn(),
    a = () => {
      i.value = (() => {
        var e;
        let t = null == s ? void 0 : s.activeElement;
        if (o)
          for (; null == t ? void 0 : t.shadowRoot; )
            t = null == (e = null == t ? void 0 : t.shadowRoot) ? void 0 : e.activeElement;
        return t;
      })();
    };
  return (
    n &&
      (Fc(
        n,
        "blur",
        (e) => {
          null === e.relatedTarget && a();
        },
        !0
      ),
      Fc(n, "focus", a, !0)),
    r &&
      $c(
        s,
        (e) => {
          e.filter((e) => e.removedNodes.length)
            .map((e) => Array.from(e.removedNodes))
            .flat()
            .forEach((e) => {
              e === i.value && a();
            });
        },
        { childList: !0, subtree: !0 }
      ),
    a(),
    i
  );
}
function Uc(e, t, n = {}) {
  const { window: o = Ic, initialValue: r, observe: s = !1 } = n,
    i = kn(r),
    a = ma(() => {
      var e;
      return Pc(t) || (null == (e = null == o ? void 0 : o.document) ? void 0 : e.documentElement);
    });
  function l() {
    var t;
    const n = gc(e),
      s = gc(a);
    if (s && o && n) {
      const e = null == (t = o.getComputedStyle(s).getPropertyValue(n)) ? void 0 : t.trim();
      i.value = e || r;
    }
  }
  return (
    s && $c(a, l, { attributeFilter: ["style", "class"], window: o }),
    Co(
      [a, () => gc(e)],
      (e, t) => {
        (t[0] && t[1] && t[0].style.removeProperty(t[1]), l());
      },
      { immediate: !0 }
    ),
    Co(i, (t) => {
      var n;
      const o = gc(e);
      (null == (n = a.value) ? void 0 : n.style) &&
        o &&
        (null == t ? a.value.style.removeProperty(o) : a.value.style.setProperty(o, t));
    }),
    i
  );
}
function Bc(e = {}) {
  const { document: t = Nc } = e;
  if (!t) return kn("visible");
  const n = kn(t.visibilityState);
  return (
    Fc(t, "visibilitychange", () => {
      n.value = t.visibilityState;
    }),
    n
  );
}
function Hc(e, t, n = {}) {
  const { window: o = Ic, ...r } = n;
  let s;
  const i = jc(() => o && "ResizeObserver" in o),
    a = () => {
      s && (s.disconnect(), (s = void 0));
    },
    l = Co(
      ma(() => {
        const t = gc(e);
        return Array.isArray(t) ? t.map((e) => Pc(e)) : [Pc(t)];
      }),
      (e) => {
        if ((a(), i.value && o)) {
          s = new ResizeObserver(t);
          for (const t of e) t && s.observe(t, r);
        }
      },
      { immediate: !0, flush: "post" }
    ),
    c = () => {
      (a(), l());
    };
  return (mc(c), { isSupported: i, stop: c });
}
function Wc(e, t = {}) {
  const {
      reset: n = !0,
      windowResize: o = !0,
      windowScroll: r = !0,
      immediate: s = !0,
      updateTiming: i = "sync",
    } = t,
    a = kn(0),
    l = kn(0),
    c = kn(0),
    u = kn(0),
    f = kn(0),
    d = kn(0),
    p = kn(0),
    h = kn(0);
  function m() {
    const t = Pc(e);
    if (!t)
      return void (
        n &&
        ((a.value = 0),
        (l.value = 0),
        (c.value = 0),
        (u.value = 0),
        (f.value = 0),
        (d.value = 0),
        (p.value = 0),
        (h.value = 0))
      );
    const o = t.getBoundingClientRect();
    ((a.value = o.height),
      (l.value = o.bottom),
      (c.value = o.left),
      (u.value = o.right),
      (f.value = o.top),
      (d.value = o.width),
      (p.value = o.x),
      (h.value = o.y));
  }
  function g() {
    "sync" === i ? m() : "next-frame" === i && requestAnimationFrame(() => m());
  }
  return (
    Hc(e, g),
    Co(
      () => Pc(e),
      (e) => !e && g()
    ),
    $c(e, g, { attributeFilter: ["style", "class"] }),
    r && Fc("scroll", g, { capture: !0, passive: !0 }),
    o && Fc("resize", g, { passive: !0 }),
    Cc(() => {
      s && g();
    }),
    { height: a, bottom: l, left: c, right: u, top: f, width: d, x: p, y: h, update: g }
  );
}
function zc(e, t = { width: 0, height: 0 }, n = {}) {
  const { window: o = Ic, box: r = "content-box" } = n,
    s = ma(() => {
      var t, n;
      return null == (n = null == (t = Pc(e)) ? void 0 : t.namespaceURI)
        ? void 0
        : n.includes("svg");
    }),
    i = kn(t.width),
    a = kn(t.height),
    { stop: l } = Hc(
      e,
      ([t]) => {
        const n =
          "border-box" === r
            ? t.borderBoxSize
            : "content-box" === r
              ? t.contentBoxSize
              : t.devicePixelContentBoxSize;
        if (o && s.value) {
          const t = Pc(e);
          if (t) {
            const e = t.getBoundingClientRect();
            ((i.value = e.width), (a.value = e.height));
          }
        } else if (n) {
          const e = Array.isArray(n) ? n : [n];
          ((i.value = e.reduce((e, { inlineSize: t }) => e + t, 0)),
            (a.value = e.reduce((e, { blockSize: t }) => e + t, 0)));
        } else ((i.value = t.contentRect.width), (a.value = t.contentRect.height));
      },
      n
    );
  Cc(() => {
    const n = Pc(e);
    n &&
      ((i.value = "offsetWidth" in n ? n.offsetWidth : t.width),
      (a.value = "offsetHeight" in n ? n.offsetHeight : t.height));
  });
  const c = Co(
    () => Pc(e),
    (e) => {
      ((i.value = e ? t.width : 0), (a.value = e ? t.height : 0));
    }
  );
  return {
    width: i,
    height: a,
    stop: function () {
      (l(), c());
    },
  };
}
function Gc(e, t, n = {}) {
  const { root: o, rootMargin: r = "0px", threshold: s = 0, window: i = Ic, immediate: a = !0 } = n,
    l = jc(() => i && "IntersectionObserver" in i),
    c = ma(() => {
      const t = gc(e);
      return (Array.isArray(t) ? t : [t]).map(Pc).filter(yc);
    });
  let u = Ec;
  const f = kn(a),
    d = l.value
      ? Co(
          () => [c.value, Pc(o), f.value],
          ([e, n]) => {
            if ((u(), !f.value)) return;
            if (!e.length) return;
            const o = new IntersectionObserver(t, { root: Pc(n), rootMargin: r, threshold: s });
            (e.forEach((e) => e && o.observe(e)),
              (u = () => {
                (o.disconnect(), (u = Ec));
              }));
          },
          { immediate: a, flush: "post" }
        )
      : Ec,
    p = () => {
      (u(), d(), (f.value = !1));
    };
  return (
    mc(p),
    {
      isSupported: l,
      isActive: f,
      pause() {
        (u(), (f.value = !1));
      },
      resume() {
        f.value = !0;
      },
      stop: p,
    }
  );
}
function qc(e, t, n, o = {}) {
  var r, s, i;
  const {
      clone: a = !1,
      passive: l = !1,
      eventName: c,
      deep: u = !1,
      defaultValue: f,
      shouldEmit: d,
    } = o,
    p = Zi(),
    h =
      n ||
      (null == p ? void 0 : p.emit) ||
      (null == (r = null == p ? void 0 : p.$emit) ? void 0 : r.bind(p)) ||
      (null == (i = null == (s = null == p ? void 0 : p.proxy) ? void 0 : s.$emit)
        ? void 0
        : i.bind(null == p ? void 0 : p.proxy));
  let m = c;
  (t || (t = "modelValue"), (m = m || `update:${t.toString()}`));
  const g = (e) => {
      return a ? ("function" == typeof a ? a(e) : ((t = e), JSON.parse(JSON.stringify(t)))) : e;
      var t;
    },
    v = () => (void 0 !== e[t] ? g(e[t]) : f),
    _ = (e) => {
      d ? d(e) && h(m, e) : h(m, e);
    };
  if (l) {
    const n = kn(v());
    let o = !1;
    return (
      Co(
        () => e[t],
        (e) => {
          o || ((o = !0), (n.value = g(e)), so(() => (o = !1)));
        }
      ),
      Co(
        n,
        (n) => {
          o || (n === e[t] && !u) || _(n);
        },
        { deep: u }
      ),
      n
    );
  }
  return ma({
    get: () => v(),
    set(e) {
      _(e);
    },
  });
}
function Yc(e = {}) {
  const { window: t = Ic } = e;
  if (!t) return kn(!1);
  const n = kn(t.document.hasFocus());
  return (
    Fc(t, "blur", () => {
      n.value = !1;
    }),
    Fc(t, "focus", () => {
      n.value = !0;
    }),
    n
  );
}
function Kc(e = {}) {
  const {
      window: t = Ic,
      initialWidth: n = Number.POSITIVE_INFINITY,
      initialHeight: o = Number.POSITIVE_INFINITY,
      listenOrientation: r = !0,
      includeScrollbar: s = !0,
      type: i = "inner",
    } = e,
    a = kn(n),
    l = kn(o),
    c = () => {
      t &&
        ("outer" === i
          ? ((a.value = t.outerWidth), (l.value = t.outerHeight))
          : s
            ? ((a.value = t.innerWidth), (l.value = t.innerHeight))
            : ((a.value = t.document.documentElement.clientWidth),
              (l.value = t.document.documentElement.clientHeight)));
    };
  if ((c(), Cc(c), Fc("resize", c, { passive: !0 }), r)) {
    const e = (function (e, t = {}) {
      const { window: n = Ic } = t,
        o = jc(() => n && "matchMedia" in n && "function" == typeof n.matchMedia);
      let r;
      const s = kn(!1),
        i = (e) => {
          s.value = e.matches;
        },
        a = () => {
          r &&
            ("removeEventListener" in r ? r.removeEventListener("change", i) : r.removeListener(i));
        },
        l = To(() => {
          o.value &&
            (a(),
            (r = n.matchMedia(gc(e))),
            "addEventListener" in r ? r.addEventListener("change", i) : r.addListener(i),
            (s.value = r.matches));
        });
      return (
        mc(() => {
          (l(), a(), (r = void 0));
        }),
        s
      );
    })("(orientation: portrait)");
    Co(e, () => c());
  }
  return { width: a, height: l };
}
const Jc = (e) => (Lc = e),
  Qc =
    /* istanbul ignore next */
    Symbol();
function Xc(e) {
  return (
    e &&
    "object" == typeof e &&
    "[object Object]" === Object.prototype.toString.call(e) &&
    "function" != typeof e.toJSON
  );
}
var Zc, eu;
function tu() {
  const e = Qe(!0),
    t = e.run(() => kn({}));
  let n = [],
    o = [];
  const r = bn({
    install(e) {
      (Jc(r),
        (r._a = e),
        e.provide(Qc, r),
        (e.config.globalProperties.$pinia = r),
        o.forEach((e) => n.push(e)),
        (o = []));
    },
    use(e) {
      return (this._a ? n.push(e) : o.push(e), this);
    },
    _p: n,
    // it's actually undefined here
    // @ts-expect-error
    _a: null,
    _e: e,
    _s: new Map(),
    state: t,
  });
  return r;
}
(((eu = Zc || (Zc = {})).direct = "direct"),
  (eu.patchObject = "patch object"),
  (eu.patchFunction = "patch function"));
const nu = () => {};
function ou(e, t, n, o = nu) {
  e.add(t);
  const r = () => {
    e.delete(t) && o();
  };
  return (!n && Xe() && Ze(r), r);
}
function ru(e, ...t) {
  e.forEach((e) => {
    e(...t);
  });
}
const su = (e) => e(),
  iu = Symbol(),
  au = Symbol();
function lu(e, t) {
  e instanceof Map && t instanceof Map
    ? t.forEach((t, n) => e.set(n, t))
    : e instanceof Set && t instanceof Set && t.forEach(e.add, e);
  for (const n in t) {
    if (!t.hasOwnProperty(n)) continue;
    const o = t[n],
      r = e[n];
    Xc(r) && Xc(o) && e.hasOwnProperty(n) && !Sn(o) && !mn(o) ? (e[n] = lu(r, o)) : (e[n] = o);
  }
  return e;
}
const cu =
  /* istanbul ignore next */
  Symbol();
function uu(e) {
  return !Xc(e) || !Object.prototype.hasOwnProperty.call(e, cu);
}
const { assign: fu } = Object;
function du(e) {
  return !(!Sn(e) || !e.effect);
}
function pu(e, t, n = {}, o, r, s) {
  let i;
  const a = fu({ actions: {} }, n),
    l = { deep: !0 };
  let c,
    u,
    f,
    d = new Set(),
    p = new Set();
  const h = o.state.value[e];
  let m;
  function g(t) {
    let n;
    ((c = u = !1),
      "function" == typeof t
        ? (t(o.state.value[e]), (n = { type: Zc.patchFunction, storeId: e, events: f }))
        : (lu(o.state.value[e], t),
          (n = { type: Zc.patchObject, payload: t, storeId: e, events: f })));
    const r = (m = Symbol());
    (so().then(() => {
      m === r && (c = !0);
    }),
      (u = !0),
      ru(d, n, o.state.value[e]));
  }
  s || h || (o.state.value[e] = {});
  const v = s
    ? function () {
        const { state: e } = n,
          t = e ? e() : {};
        this.$patch((e) => {
          fu(e, t);
        });
      }
    : /* istanbul ignore next */ nu;
  const _ = (t, n = "") => {
      if (iu in t) return ((t[au] = n), t);
      const r = function () {
        Jc(o);
        const n = Array.from(arguments),
          s = new Set(),
          i = new Set();
        let a;
        ru(p, {
          args: n,
          name: r[au],
          store: y,
          after: function (e) {
            s.add(e);
          },
          onError: function (e) {
            i.add(e);
          },
        });
        try {
          a = t.apply(this && this.$id === e ? this : y, n);
        } catch (l) {
          throw (ru(i, l), l);
        }
        return a instanceof Promise
          ? a.then((e) => (ru(s, e), e)).catch((e) => (ru(i, e), Promise.reject(e)))
          : (ru(s, a), a);
      };
      return ((r[iu] = !0), (r[au] = n), r);
    },
    y = un({
      _p: o,
      // _s: scope,
      $id: e,
      $onAction: ou.bind(null, p),
      $patch: g,
      $reset: v,
      $subscribe(t, n = {}) {
        const r = ou(d, t, n.detached, () => s()),
          s = i.run(() =>
            Co(
              () => o.state.value[e],
              (o) => {
                ("sync" === n.flush ? u : c) && t({ storeId: e, type: Zc.direct, events: f }, o);
              },
              fu({}, l, n)
            )
          );
        return r;
      },
      $dispose: function () {
        (i.stop(), d.clear(), p.clear(), o._s.delete(e));
      },
    });
  o._s.set(e, y);
  const b = ((o._a && o._a.runWithContext) || su)(() =>
    o._e.run(() => (i = Qe()).run(() => t({ action: _ })))
  );
  for (const w in b) {
    const t = b[w];
    if ((Sn(t) && !du(t)) || mn(t))
      s || (h && uu(t) && (Sn(t) ? (t.value = h[w]) : lu(t, h[w])), (o.state.value[e][w] = t));
    else if ("function" == typeof t) {
      const e = _(t, w);
      ((b[w] = e), (a.actions[w] = t));
    }
  }
  return (
    fu(y, b),
    fu(yn(y), b),
    Object.defineProperty(y, "$state", {
      get: () => o.state.value[e],
      set: (e) => {
        g((t) => {
          fu(t, e);
        });
      },
    }),
    o._p.forEach((e) => {
      fu(
        y,
        i.run(() => e({ store: y, app: o._a, pinia: o, options: a }))
      );
    }),
    h && s && n.hydrate && n.hydrate(y.$state, h),
    (c = !0),
    (u = !0),
    y
  );
}
// @__NO_SIDE_EFFECTS__
function hu(e, t, n) {
  let o;
  const r = "function" == typeof t;
  function s(n, s) {
    const i = ko();
    ((n = // in test mode, ignore the argument provided as we can always retrieve a
      // pinia instance with getActivePinia()
      n || (i ? So(Qc, null) : null)) && Jc(n),
      (n = Lc)._s.has(e) ||
        (r
          ? pu(e, t, o, n)
          : (function (e, t, n) {
              const { state: o, actions: r, getters: s } = t,
                i = n.state.value[e];
              let a;
              a = pu(
                e,
                function () {
                  i || (n.state.value[e] = o ? o() : {});
                  const t = Ln(n.state.value[e]);
                  return fu(
                    t,
                    r,
                    Object.keys(s || {}).reduce(
                      (t, o) => (
                        (t[o] = bn(
                          ma(() => {
                            Jc(n);
                            const t = n._s.get(e);
                            return s[o].call(t, t);
                          })
                        )),
                        t
                      ),
                      {}
                    )
                  );
                },
                t,
                n,
                0,
                !0
              );
            })(e, o, n)));
    return n._s.get(e);
  }
  return ((o = r ? n : t), (s.$id = e), s);
}
function mu(e) {
  const t = yn(e),
    n = {};
  for (const o in t) {
    const r = t[o];
    r.effect
      ? (n[o] = // ...
          ma({
            get: () => e[o],
            set(t) {
              e[o] = t;
            },
          }))
      : (Sn(r) || mn(r)) &&
        (n[o] = // ---
          jn(e, o));
  }
  return n;
}
function gu(e, t) {
  if (null == e) return;
  let n = e;
  for (let o = 0; o < t.length; o++) {
    if (void 0 === n || void 0 === n[t[o]]) return;
    if (null === n || null === n[t[o]]) return null;
    n = n[t[o]];
  }
  return n;
}
function vu(e, t, n) {
  if (0 === n.length) return t;
  const o = n[0];
  return (
    n.length > 1 &&
      (t = vu(
        "object" == typeof e && null !== e && Object.prototype.hasOwnProperty.call(e, o)
          ? e[o]
          : Number.isInteger(Number(n[1]))
            ? []
            : {},
        t,
        Array.prototype.slice.call(n, 1)
      )),
    Number.isInteger(Number(o)) && Array.isArray(e)
      ? e.slice()[o]
      : Object.assign({}, e, { [o]: t })
  );
}
function _u(e, t) {
  if (null == e || 0 === t.length) return e;
  if (1 === t.length) {
    if (null == e) return e;
    if (Number.isInteger(t[0]) && Array.isArray(e))
      return Array.prototype.slice.call(e, 0).splice(t[0], 1);
    const n = {};
    for (const t in e) n[t] = e[t];
    return (delete n[t[0]], n);
  }
  if (null == e[t[0]]) {
    if (Number.isInteger(t[0]) && Array.isArray(e)) return Array.prototype.concat.call([], e);
    const n = {};
    for (const t in e) n[t] = e[t];
    return n;
  }
  return vu(e, _u(e[t[0]], Array.prototype.slice.call(t, 1)), [t[0]]);
}
function yu(e, t) {
  return t
    .map((e) => e.split("."))
    .map((t) => [t, gu(e, t)])
    .filter((e) => void 0 !== e[1])
    .reduce((e, t) => vu(e, t[1], t[0]), {});
}
function bu(e, t) {
  return t.map((e) => e.split(".")).reduce((e, t) => _u(e, t), e);
}
function wu(
  e,
  {
    storage: t,
    serializer: n,
    key: o,
    debug: r,
    pick: s,
    omit: i,
    beforeHydrate: a,
    afterHydrate: l,
  },
  c,
  u = !0
) {
  try {
    u && a?.(c);
    const r = t.getItem(o);
    if (r) {
      const t = n.deserialize(r),
        o = s ? yu(t, s) : t,
        a = i ? bu(o, i) : o;
      e.$patch(a);
    }
    u && l?.(c);
  } catch (f) {}
}
function Eu(e, { storage: t, serializer: n, key: o, debug: r, pick: s, omit: i }) {
  try {
    const r = s ? yu(e, s) : e,
      a = i ? bu(r, i) : r,
      l = n.serialize(a);
    t.setItem(o, l);
  } catch (a) {}
}
var Su = (function (e = {}) {
  return function (t) {
    !(function (e, t, n) {
      const {
        pinia: o,
        store: r,
        options: { persist: s = n },
      } = e;
      if (!s) return;
      if (!(r.$id in o.state.value)) {
        const e = o._s.get(r.$id.replace("__hot:", ""));
        return void (e && Promise.resolve().then(() => e.$persist()));
      }
      const i = (Array.isArray(s) ? s : !0 === s ? [{}] : [s]).map(t);
      ((r.$hydrate = ({ runHooks: t = !0 } = {}) => {
        i.forEach((n) => {
          wu(r, n, e, t);
        });
      }),
        (r.$persist = () => {
          i.forEach((e) => {
            Eu(r.$state, e);
          });
        }),
        i.forEach((t) => {
          (wu(r, t, e), r.$subscribe((e, n) => Eu(n, t), { detached: !0 }));
        }));
    })(
      t,
      (n) => {
        const o =
          ((r = n.key),
          (s = t.store.$id),
          "function" == typeof r ? r(s) : "string" == typeof r ? r : s);
        var r, s;
        return {
          key: (e.key ? e.key : (e) => e)(o),
          debug: n.debug ?? e.debug ?? !1,
          serializer: n.serializer ??
            e.serializer ?? {
              serialize: (e) => JSON.stringify(e),
              deserialize: (e) => JSON.parse(e),
            },
          storage: n.storage ?? e.storage ?? window.localStorage,
          beforeHydrate: n.beforeHydrate ?? e.beforeHydrate,
          afterHydrate: n.afterHydrate ?? e.afterHydrate,
          pick: n.pick,
          omit: n.omit,
        };
      },
      e.auto ?? !1
    );
  };
})();
const ku = "undefined" != typeof document;
function xu(e) {
  return "object" == typeof e || "displayName" in e || "props" in e || "__vccOpts" in e;
}
const Ou = Object.assign;
function Tu(e, t) {
  const n = {};
  for (const o in t) {
    const r = t[o];
    n[o] = Cu(r) ? r.map(e) : e(r);
  }
  return n;
}
const Au = () => {},
  Cu = Array.isArray;
function Ru(e, t) {
  const n = {};
  for (const o in e) n[o] = o in t ? t[o] : e[o];
  return n;
}
let Iu = (function (e) {
  return (
    (e[(e.MATCHER_NOT_FOUND = 1)] = "MATCHER_NOT_FOUND"),
    (e[(e.NAVIGATION_GUARD_REDIRECT = 2)] = "NAVIGATION_GUARD_REDIRECT"),
    (e[(e.NAVIGATION_ABORTED = 4)] = "NAVIGATION_ABORTED"),
    (e[(e.NAVIGATION_CANCELLED = 8)] = "NAVIGATION_CANCELLED"),
    (e[(e.NAVIGATION_DUPLICATED = 16)] = "NAVIGATION_DUPLICATED"),
    e
  );
})({});
const Nu = Symbol("");
function Pu(e, t) {
  return Ou(new Error(), { type: e, [Nu]: !0 }, t);
}
function Fu(e, t) {
  return e instanceof Error && Nu in e && (null == t || !!(e.type & t));
}
(Iu.MATCHER_NOT_FOUND,
  Iu.NAVIGATION_GUARD_REDIRECT,
  Iu.NAVIGATION_ABORTED,
  Iu.NAVIGATION_CANCELLED,
  Iu.NAVIGATION_DUPLICATED);
const Lu = Symbol(""),
  Mu = Symbol(""),
  Du = Symbol(""),
  ju = Symbol(""),
  $u = Symbol("");
function Vu() {
  return So(Du);
}
function Uu(e) {
  return So(ju);
}
const Bu = /#/g,
  Hu = /&/g,
  Wu = /\//g,
  zu = /=/g,
  Gu = /\?/g,
  qu = /\+/g,
  Yu = /%5B/g,
  Ku = /%5D/g,
  Ju = /%5E/g,
  Qu = /%60/g,
  Xu = /%7B/g,
  Zu = /%7C/g,
  ef = /%7D/g,
  tf = /%20/g;
function nf(e) {
  return null == e
    ? ""
    : encodeURI("" + e)
        .replace(Zu, "|")
        .replace(Yu, "[")
        .replace(Ku, "]");
}
function of(e) {
  return nf(e)
    .replace(qu, "%2B")
    .replace(tf, "+")
    .replace(Bu, "%23")
    .replace(Hu, "%26")
    .replace(Qu, "`")
    .replace(Xu, "{")
    .replace(ef, "}")
    .replace(Ju, "^");
}
function rf(e) {
  return of(e).replace(zu, "%3D");
}
function sf(e) {
  return (function (e) {
    return nf(e).replace(Bu, "%23").replace(Gu, "%3F");
  })(e).replace(Wu, "%2F");
}
function af(e) {
  if (null == e) return null;
  try {
    return decodeURIComponent("" + e);
  } catch {}
  return "" + e;
}
const lf = /\/$/;
function cf(e, t, n = "/") {
  let o,
    r = {},
    s = "",
    i = "";
  const a = t.indexOf("#");
  let l = t.indexOf("?");
  return (
    (l = a >= 0 && l > a ? -1 : l),
    l >= 0 && ((o = t.slice(0, l)), (s = t.slice(l, a > 0 ? a : t.length)), (r = e(s.slice(1)))),
    a >= 0 && ((o = o || t.slice(0, a)), (i = t.slice(a, t.length))),
    (o = (function (e, t) {
      if (e.startsWith("/")) return e;
      if (!e) return t;
      const n = t.split("/"),
        o = e.split("/"),
        r = o[o.length - 1];
      (".." !== r && "." !== r) || o.push("");
      let s,
        i,
        a = n.length - 1;
      for (s = 0; s < o.length; s++)
        if (((i = o[s]), "." !== i)) {
          if (".." !== i) break;
          a > 1 && a--;
        }
      return n.slice(0, a).join("/") + "/" + o.slice(s).join("/");
    })(null != o ? o : t, n)),
    { fullPath: o + s + i, path: o, query: r, hash: af(i) }
  );
}
function uf(e, t) {
  return t && e.toLowerCase().startsWith(t.toLowerCase()) ? e.slice(t.length) || "/" : e;
}
function ff(e, t) {
  return (e.aliasOf || e) === (t.aliasOf || t);
}
function df(e, t) {
  if (Object.keys(e).length !== Object.keys(t).length) return !1;
  for (var n in e) if (!pf(e[n], t[n])) return !1;
  return !0;
}
function pf(e, t) {
  return Cu(e) ? hf(e, t) : Cu(t) ? hf(t, e) : (e && e.valueOf()) === (t && t.valueOf());
}
function hf(e, t) {
  return Cu(t)
    ? e.length === t.length && e.every((e, n) => e === t[n])
    : 1 === e.length && e[0] === t;
}
const mf = {
  path: "/",
  name: void 0,
  params: {},
  query: {},
  hash: "",
  fullPath: "/",
  matched: [],
  meta: {},
  redirectedFrom: void 0,
};
let gf = (function (e) {
    return ((e.pop = "pop"), (e.push = "push"), e);
  })({}),
  vf = (function (e) {
    return ((e.back = "back"), (e.forward = "forward"), (e.unknown = ""), e);
  })({});
function _f(e) {
  if (!e)
    if (ku) {
      const t = document.querySelector("base");
      e = (e = (t && t.getAttribute("href")) || "/").replace(/^\w+:\/\/[^/]+/, "");
    } else e = "/";
  return ("/" !== e[0] && "#" !== e[0] && (e = "/" + e), e.replace(lf, ""));
}
const yf = /^[^#]+#/;
function bf(e, t) {
  return e.replace(yf, "#") + t;
}
const wf = () => ({ left: window.scrollX, top: window.scrollY });
function Ef(e) {
  let t;
  if ("el" in e) {
    const n = e.el,
      o = "string" == typeof n && n.startsWith("#"),
      r =
        "string" == typeof n
          ? o
            ? document.getElementById(n.slice(1))
            : document.querySelector(n)
          : n;
    if (!r) return;
    t = (function (e, t) {
      const n = document.documentElement.getBoundingClientRect(),
        o = e.getBoundingClientRect();
      return {
        behavior: t.behavior,
        left: o.left - n.left - (t.left || 0),
        top: o.top - n.top - (t.top || 0),
      };
    })(r, e);
  } else t = e;
  "scrollBehavior" in document.documentElement.style
    ? window.scrollTo(t)
    : window.scrollTo(
        null != t.left ? t.left : window.scrollX,
        null != t.top ? t.top : window.scrollY
      );
}
function Sf(e, t) {
  return (history.state ? history.state.position - t : -1) + e;
}
const kf = new Map();
function xf(e) {
  return "string" == typeof e || "symbol" == typeof e;
}
function Of(e) {
  const t = {};
  if ("" === e || "?" === e) return t;
  const n = ("?" === e[0] ? e.slice(1) : e).split("&");
  for (let o = 0; o < n.length; ++o) {
    const e = n[o].replace(qu, " "),
      r = e.indexOf("="),
      s = af(r < 0 ? e : e.slice(0, r)),
      i = r < 0 ? null : af(e.slice(r + 1));
    if (s in t) {
      let e = t[s];
      (Cu(e) || (e = t[s] = [e]), e.push(i));
    } else t[s] = i;
  }
  return t;
}
function Tf(e) {
  let t = "";
  for (let n in e) {
    const o = e[n];
    ((n = rf(n)),
      null != o
        ? (Cu(o) ? o.map((e) => e && of(e)) : [o && of(o)]).forEach((e) => {
            void 0 !== e && ((t += (t.length ? "&" : "") + n), null != e && (t += "=" + e));
          })
        : void 0 !== o && (t += (t.length ? "&" : "") + n));
  }
  return t;
}
function Af(e) {
  const t = {};
  for (const n in e) {
    const o = e[n];
    void 0 !== o &&
      (t[n] = Cu(o) ? o.map((e) => (null == e ? null : "" + e)) : null == o ? o : "" + o);
  }
  return t;
}
function Cf() {
  let e = [];
  return {
    add: function (t) {
      return (
        e.push(t),
        () => {
          const n = e.indexOf(t);
          n > -1 && e.splice(n, 1);
        }
      );
    },
    list: () => e.slice(),
    reset: function () {
      e = [];
    },
  };
}
function Rf(e, t, n, o, r, s = (e) => e()) {
  const i = o && (o.enterCallbacks[r] = o.enterCallbacks[r] || []);
  return () =>
    new Promise((a, l) => {
      const c = (e) => {
          var s;
          !1 === e
            ? l(Pu(Iu.NAVIGATION_ABORTED, { from: n, to: t }))
            : e instanceof Error
              ? l(e)
              : "string" == typeof (s = e) || (s && "object" == typeof s)
                ? l(Pu(Iu.NAVIGATION_GUARD_REDIRECT, { from: t, to: e }))
                : (i && o.enterCallbacks[r] === i && "function" == typeof e && i.push(e), a());
        },
        u = s(() => e.call(o && o.instances[r], t, n, c));
      let f = Promise.resolve(u);
      (e.length < 3 && (f = f.then(c)), f.catch((e) => l(e)));
    });
}
function If(e, t, n, o, r = (e) => e()) {
  const s = [];
  for (const i of e)
    for (const e in i.components) {
      let a = i.components[e];
      if ("beforeRouteEnter" === t || i.instances[e])
        if (xu(a)) {
          const l = (a.__vccOpts || a)[t];
          l && s.push(Rf(l, n, o, i, e, r));
        } else {
          let l = a();
          s.push(() =>
            l.then((s) => {
              if (!s) throw new Error(`Couldn't resolve component "${e}" at "${i.path}"`);
              const a =
                (l = s).__esModule ||
                "Module" === l[Symbol.toStringTag] ||
                (l.default && xu(l.default))
                  ? s.default
                  : s;
              var l;
              ((i.mods[e] = s), (i.components[e] = a));
              const c = (a.__vccOpts || a)[t];
              return c && Rf(c, n, o, i, e, r)();
            })
          );
        }
    }
  return s;
}
function Nf(e, t) {
  const { pathname: n, search: o, hash: r } = t,
    s = e.indexOf("#");
  if (s > -1) {
    let t = r.includes(e.slice(s)) ? e.slice(s).length : 1,
      n = r.slice(t);
    return ("/" !== n[0] && (n = "/" + n), uf(n, ""));
  }
  return uf(n, e) + o + r;
}
function Pf(e, t, n, o = !1, r = !1) {
  return {
    back: e,
    current: t,
    forward: n,
    replaced: o,
    position: window.history.length,
    scroll: r ? wf() : null,
  };
}
function Ff(e) {
  const { history: t, location: n } = window,
    o = { value: Nf(e, n) },
    r = { value: t.state };
  function s(o, s, i) {
    const a = e.indexOf("#"),
      l =
        a > -1
          ? (n.host && document.querySelector("base") ? e : e.slice(a)) + o
          : location.protocol + "//" + location.host + e + o;
    try {
      (t[i ? "replaceState" : "pushState"](s, "", l), (r.value = s));
    } catch (c) {
      n[i ? "replace" : "assign"](l);
    }
  }
  return (
    r.value ||
      s(
        o.value,
        {
          back: null,
          current: o.value,
          forward: null,
          position: t.length - 1,
          replaced: !0,
          scroll: null,
        },
        !0
      ),
    {
      location: o,
      state: r,
      push: function (e, n) {
        const i = Ou({}, r.value, t.state, { forward: e, scroll: wf() });
        (s(i.current, i, !0),
          s(e, Ou({}, Pf(o.value, e, null), { position: i.position + 1 }, n), !1),
          (o.value = e));
      },
      replace: function (e, n) {
        (s(
          e,
          Ou({}, t.state, Pf(r.value.back, e, r.value.forward, !0), n, {
            position: r.value.position,
          }),
          !0
        ),
          (o.value = e));
      },
    }
  );
}
function Lf(e) {
  const t = Ff((e = _f(e))),
    n = (function (e, t, n, o) {
      let r = [],
        s = [],
        i = null;
      const a = ({ state: s }) => {
        const a = Nf(e, location),
          l = n.value,
          c = t.value;
        let u = 0;
        if (s) {
          if (((n.value = a), (t.value = s), i && i === l)) return void (i = null);
          u = c ? s.position - c.position : 0;
        } else o(a);
        r.forEach((e) => {
          e(n.value, l, {
            delta: u,
            type: gf.pop,
            direction: u ? (u > 0 ? vf.forward : vf.back) : vf.unknown,
          });
        });
      };
      function l() {
        if ("hidden" === document.visibilityState) {
          const { history: e } = window;
          if (!e.state) return;
          e.replaceState(Ou({}, e.state, { scroll: wf() }), "");
        }
      }
      return (
        window.addEventListener("popstate", a),
        window.addEventListener("pagehide", l),
        document.addEventListener("visibilitychange", l),
        {
          pauseListeners: function () {
            i = n.value;
          },
          listen: function (e) {
            r.push(e);
            const t = () => {
              const t = r.indexOf(e);
              t > -1 && r.splice(t, 1);
            };
            return (s.push(t), t);
          },
          destroy: function () {
            for (const e of s) e();
            ((s = []),
              window.removeEventListener("popstate", a),
              window.removeEventListener("pagehide", l),
              document.removeEventListener("visibilitychange", l));
          },
        }
      );
    })(e, t.state, t.location, t.replace);
  const o = Ou(
    {
      location: "",
      base: e,
      go: function (e, t = !0) {
        (t || n.pauseListeners(), history.go(e));
      },
      createHref: bf.bind(null, e),
    },
    t,
    n
  );
  return (
    Object.defineProperty(o, "location", { enumerable: !0, get: () => t.location.value }),
    Object.defineProperty(o, "state", { enumerable: !0, get: () => t.state.value }),
    o
  );
}
function Mf(e) {
  return (
    (e = location.host ? e || location.pathname + location.search : "").includes("#") || (e += "#"),
    Lf(e)
  );
}
let Df = (function (e) {
  return (
    (e[(e.Static = 0)] = "Static"),
    (e[(e.Param = 1)] = "Param"),
    (e[(e.Group = 2)] = "Group"),
    e
  );
})({});
var jf = (function (e) {
  return (
    (e[(e.Static = 0)] = "Static"),
    (e[(e.Param = 1)] = "Param"),
    (e[(e.ParamRegExp = 2)] = "ParamRegExp"),
    (e[(e.ParamRegExpEnd = 3)] = "ParamRegExpEnd"),
    (e[(e.EscapeNext = 4)] = "EscapeNext"),
    e
  );
})(jf || {});
const $f = { type: Df.Static, value: "" },
  Vf = /[a-zA-Z0-9_]/;
const Uf = "[^/]+?",
  Bf = { sensitive: !1, strict: !1, start: !0, end: !0 };
var Hf = (function (e) {
  return (
    (e[(e._multiplier = 10)] = "_multiplier"),
    (e[(e.Root = 90)] = "Root"),
    (e[(e.Segment = 40)] = "Segment"),
    (e[(e.SubSegment = 30)] = "SubSegment"),
    (e[(e.Static = 40)] = "Static"),
    (e[(e.Dynamic = 20)] = "Dynamic"),
    (e[(e.BonusCustomRegExp = 10)] = "BonusCustomRegExp"),
    (e[(e.BonusWildcard = -50)] = "BonusWildcard"),
    (e[(e.BonusRepeatable = -20)] = "BonusRepeatable"),
    (e[(e.BonusOptional = -8)] = "BonusOptional"),
    (e[(e.BonusStrict = 0.7000000000000001)] = "BonusStrict"),
    (e[(e.BonusCaseSensitive = 0.25)] = "BonusCaseSensitive"),
    e
  );
})(Hf || {});
const Wf = /[.+*?^${}()[\]/\\]/g;
function zf(e, t) {
  let n = 0;
  for (; n < e.length && n < t.length; ) {
    const o = t[n] - e[n];
    if (o) return o;
    n++;
  }
  return e.length < t.length
    ? 1 === e.length && e[0] === Hf.Static + Hf.Segment
      ? -1
      : 1
    : e.length > t.length
      ? 1 === t.length && t[0] === Hf.Static + Hf.Segment
        ? 1
        : -1
      : 0;
}
function Gf(e, t) {
  let n = 0;
  const o = e.score,
    r = t.score;
  for (; n < o.length && n < r.length; ) {
    const e = zf(o[n], r[n]);
    if (e) return e;
    n++;
  }
  if (1 === Math.abs(r.length - o.length)) {
    if (qf(o)) return 1;
    if (qf(r)) return -1;
  }
  return r.length - o.length;
}
function qf(e) {
  const t = e[e.length - 1];
  return e.length > 0 && t[t.length - 1] < 0;
}
const Yf = { strict: !1, end: !0, sensitive: !1 };
function Kf(e, t, n) {
  const o = (function (e, t) {
      const n = Ou({}, Bf, t),
        o = [];
      let r = n.start ? "^" : "";
      const s = [];
      for (const l of e) {
        const e = l.length ? [] : [Hf.Root];
        n.strict && !l.length && (r += "/");
        for (let t = 0; t < l.length; t++) {
          const o = l[t];
          let i = Hf.Segment + (n.sensitive ? Hf.BonusCaseSensitive : 0);
          if (o.type === Df.Static)
            (t || (r += "/"), (r += o.value.replace(Wf, "\\$&")), (i += Hf.Static));
          else if (o.type === Df.Param) {
            const { value: e, repeatable: n, optional: c, regexp: u } = o;
            s.push({ name: e, repeatable: n, optional: c });
            const f = u || Uf;
            if (f !== Uf) {
              i += Hf.BonusCustomRegExp;
              try {
                new RegExp(`(${f})`);
              } catch (a) {
                throw new Error(`Invalid custom RegExp for param "${e}" (${f}): ` + a.message);
              }
            }
            let d = n ? `((?:${f})(?:/(?:${f}))*)` : `(${f})`;
            (t || (d = c && l.length < 2 ? `(?:/${d})` : "/" + d),
              c && (d += "?"),
              (r += d),
              (i += Hf.Dynamic),
              c && (i += Hf.BonusOptional),
              n && (i += Hf.BonusRepeatable),
              ".*" === f && (i += Hf.BonusWildcard));
          }
          e.push(i);
        }
        o.push(e);
      }
      if (n.strict && n.end) {
        const e = o.length - 1;
        o[e][o[e].length - 1] += Hf.BonusStrict;
      }
      (n.strict || (r += "/?"),
        n.end ? (r += "$") : n.strict && !r.endsWith("/") && (r += "(?:/|$)"));
      const i = new RegExp(r, n.sensitive ? "" : "i");
      return {
        re: i,
        score: o,
        keys: s,
        parse: function (e) {
          const t = e.match(i),
            n = {};
          if (!t) return null;
          for (let o = 1; o < t.length; o++) {
            const e = t[o] || "",
              r = s[o - 1];
            n[r.name] = e && r.repeatable ? e.split("/") : e;
          }
          return n;
        },
        stringify: function (t) {
          let n = "",
            o = !1;
          for (const r of e) {
            ((o && n.endsWith("/")) || (n += "/"), (o = !1));
            for (const e of r)
              if (e.type === Df.Static) n += e.value;
              else if (e.type === Df.Param) {
                const { value: s, repeatable: i, optional: a } = e,
                  l = s in t ? t[s] : "";
                if (Cu(l) && !i)
                  throw new Error(
                    `Provided param "${s}" is an array but it is not repeatable (* or + modifiers)`
                  );
                const c = Cu(l) ? l.join("/") : l;
                if (!c) {
                  if (!a) throw new Error(`Missing required param "${s}"`);
                  r.length < 2 && (n.endsWith("/") ? (n = n.slice(0, -1)) : (o = !0));
                }
                n += c;
              }
          }
          return n || "/";
        },
      };
    })(
      (function (e) {
        if (!e) return [[]];
        if ("/" === e) return [[$f]];
        if (!e.startsWith("/")) throw new Error(`Invalid path "${e}"`);
        function t(e) {
          throw new Error(`ERR (${n})/"${c}": ${e}`);
        }
        let n = jf.Static,
          o = n;
        const r = [];
        let s;
        function i() {
          (s && r.push(s), (s = []));
        }
        let a,
          l = 0,
          c = "",
          u = "";
        function f() {
          c &&
            (n === jf.Static
              ? s.push({ type: Df.Static, value: c })
              : n === jf.Param || n === jf.ParamRegExp || n === jf.ParamRegExpEnd
                ? (s.length > 1 &&
                    ("*" === a || "+" === a) &&
                    t(`A repeatable param (${c}) must be alone in its segment. eg: '/:ids+.`),
                  s.push({
                    type: Df.Param,
                    value: c,
                    regexp: u,
                    repeatable: "*" === a || "+" === a,
                    optional: "*" === a || "?" === a,
                  }))
                : t("Invalid state to consume buffer"),
            (c = ""));
        }
        function d() {
          c += a;
        }
        for (; l < e.length; )
          switch (((a = e[l++]), n)) {
            case jf.Static:
              "\\" === a
                ? ((o = n), (n = jf.EscapeNext))
                : "/" === a
                  ? (c && f(), i())
                  : ":" === a
                    ? (f(), (n = jf.Param))
                    : d();
              break;
            case jf.EscapeNext:
              (d(), (n = o));
              break;
            case jf.Param:
              "(" === a
                ? (n = jf.ParamRegExp)
                : Vf.test(a)
                  ? d()
                  : (f(), (n = jf.Static), "*" !== a && "?" !== a && "+" !== a && l--);
              break;
            case jf.ParamRegExp:
              ")" === a
                ? "\\" == u[u.length - 1]
                  ? (u = u.slice(0, -1) + a)
                  : (n = jf.ParamRegExpEnd)
                : (u += a);
              break;
            case jf.ParamRegExpEnd:
              (f(), (n = jf.Static), "*" !== a && "?" !== a && "+" !== a && l--, (u = ""));
              break;
            default:
              t("Unknown state");
          }
        return (
          n === jf.ParamRegExp && t(`Unfinished custom RegExp for param "${c}"`),
          f(),
          i(),
          r
        );
      })(e.path),
      n
    ),
    r = Ou(o, { record: e, parent: t, children: [], alias: [] });
  return (t && !r.record.aliasOf == !t.record.aliasOf && t.children.push(r), r);
}
function Jf(e, t) {
  const n = [],
    o = new Map();
  function r(e, n, o) {
    const a = !o,
      l = Xf(e);
    l.aliasOf = o && o.record;
    const c = Ru(t, e),
      u = [l];
    if ("alias" in e) {
      const t = "string" == typeof e.alias ? [e.alias] : e.alias;
      for (const e of t)
        u.push(
          Xf(
            Ou({}, l, {
              components: o ? o.record.components : l.components,
              path: e,
              aliasOf: o ? o.record : l,
            })
          )
        );
    }
    let f, d;
    for (const t of u) {
      const { path: u } = t;
      if (n && "/" !== u[0]) {
        const e = n.record.path,
          o = "/" === e[e.length - 1] ? "" : "/";
        t.path = n.record.path + (u && o + u);
      }
      if (
        ((f = Kf(t, n, c)),
        o
          ? o.alias.push(f)
          : ((d = d || f), d !== f && d.alias.push(f), a && e.name && !ed(f) && s(e.name)),
        nd(f) && i(f),
        l.children)
      ) {
        const e = l.children;
        for (let t = 0; t < e.length; t++) r(e[t], f, o && o.children[t]);
      }
      o = o || f;
    }
    return d
      ? () => {
          s(d);
        }
      : Au;
  }
  function s(e) {
    if (xf(e)) {
      const t = o.get(e);
      t && (o.delete(e), n.splice(n.indexOf(t), 1), t.children.forEach(s), t.alias.forEach(s));
    } else {
      const t = n.indexOf(e);
      t > -1 &&
        (n.splice(t, 1),
        e.record.name && o.delete(e.record.name),
        e.children.forEach(s),
        e.alias.forEach(s));
    }
  }
  function i(e) {
    const t = (function (e, t) {
      let n = 0,
        o = t.length;
      for (; n !== o; ) {
        const r = (n + o) >> 1;
        Gf(e, t[r]) < 0 ? (o = r) : (n = r + 1);
      }
      const r = (function (e) {
        let t = e;
        for (; (t = t.parent); ) if (nd(t) && 0 === Gf(e, t)) return t;
      })(e);
      r && (o = t.lastIndexOf(r, o - 1));
      return o;
    })(e, n);
    (n.splice(t, 0, e), e.record.name && !ed(e) && o.set(e.record.name, e));
  }
  return (
    (t = Ru(Yf, t)),
    e.forEach((e) => r(e)),
    {
      addRoute: r,
      resolve: function (e, t) {
        let r,
          s,
          i,
          a = {};
        if ("name" in e && e.name) {
          if (((r = o.get(e.name)), !r)) throw Pu(Iu.MATCHER_NOT_FOUND, { location: e });
          ((i = r.record.name),
            (a = Ou(
              Qf(
                t.params,
                r.keys
                  .filter((e) => !e.optional)
                  .concat(r.parent ? r.parent.keys.filter((e) => e.optional) : [])
                  .map((e) => e.name)
              ),
              e.params &&
                Qf(
                  e.params,
                  r.keys.map((e) => e.name)
                )
            )),
            (s = r.stringify(a)));
        } else if (null != e.path)
          ((s = e.path),
            (r = n.find((e) => e.re.test(s))),
            r &&
              ((a = r.parse(s)),
              (i = r.record.name),
              r.keys.forEach((e) => {
                e.optional && !a[e.name] && delete a[e.name];
              })));
        else {
          if (((r = t.name ? o.get(t.name) : n.find((e) => e.re.test(t.path))), !r))
            throw Pu(Iu.MATCHER_NOT_FOUND, { location: e, currentLocation: t });
          ((i = r.record.name), (a = Ou({}, t.params, e.params)), (s = r.stringify(a)));
        }
        const l = [];
        let c = r;
        for (; c; ) (l.unshift(c.record), (c = c.parent));
        return { name: i, path: s, params: a, matched: l, meta: td(l) };
      },
      removeRoute: s,
      clearRoutes: function () {
        ((n.length = 0), o.clear());
      },
      getRoutes: function () {
        return n;
      },
      getRecordMatcher: function (e) {
        return o.get(e);
      },
    }
  );
}
function Qf(e, t) {
  const n = {};
  for (const o of t) o in e && (n[o] = e[o]);
  return n;
}
function Xf(e) {
  const t = {
    path: e.path,
    redirect: e.redirect,
    name: e.name,
    meta: e.meta || {},
    aliasOf: e.aliasOf,
    beforeEnter: e.beforeEnter,
    props: Zf(e),
    children: e.children || [],
    instances: {},
    leaveGuards: new Set(),
    updateGuards: new Set(),
    enterCallbacks: {},
    components: "components" in e ? e.components || null : e.component && { default: e.component },
  };
  return (Object.defineProperty(t, "mods", { value: {} }), t);
}
function Zf(e) {
  const t = {},
    n = e.props || !1;
  if ("component" in e) t.default = n;
  else for (const o in e.components) t[o] = "object" == typeof n ? n[o] : n;
  return t;
}
function ed(e) {
  for (; e; ) {
    if (e.record.aliasOf) return !0;
    e = e.parent;
  }
  return !1;
}
function td(e) {
  return e.reduce((e, t) => Ou(e, t.meta), {});
}
function nd({ record: e }) {
  return !!(e.name || (e.components && Object.keys(e.components).length) || e.redirect);
}
function od(e) {
  const t = So(Du),
    n = So(ju),
    o = ma(() => {
      const n = Cn(e.to);
      return t.resolve(n);
    }),
    r = ma(() => {
      const { matched: e } = o.value,
        { length: t } = e,
        r = e[t - 1],
        s = n.matched;
      if (!r || !s.length) return -1;
      const i = s.findIndex(ff.bind(null, r));
      if (i > -1) return i;
      const a = sd(e[t - 2]);
      return t > 1 && sd(r) === a && s[s.length - 1].path !== a
        ? s.findIndex(ff.bind(null, e[t - 2]))
        : i;
    }),
    s = ma(
      () =>
        r.value > -1 &&
        (function (e, t) {
          for (const n in t) {
            const o = t[n],
              r = e[n];
            if ("string" == typeof o) {
              if (o !== r) return !1;
            } else if (
              !Cu(r) ||
              r.length !== o.length ||
              o.some((e, t) => e.valueOf() !== r[t].valueOf())
            )
              return !1;
          }
          return !0;
        })(n.params, o.value.params)
    ),
    i = ma(() => r.value > -1 && r.value === n.matched.length - 1 && df(n.params, o.value.params));
  return {
    route: o,
    href: ma(() => o.value.href),
    isActive: s,
    isExactActive: i,
    navigate: function (n = {}) {
      if (
        (function (e) {
          if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
          if (e.defaultPrevented) return;
          if (void 0 !== e.button && 0 !== e.button) return;
          if (e.currentTarget && e.currentTarget.getAttribute) {
            const t = e.currentTarget.getAttribute("target");
            if (/\b_blank\b/i.test(t)) return;
          }
          e.preventDefault && e.preventDefault();
          return !0;
        })(n)
      ) {
        const n = t[Cn(e.replace) ? "replace" : "push"](Cn(e.to)).catch(Au);
        return (
          e.viewTransition &&
            "undefined" != typeof document &&
            "startViewTransition" in document &&
            document.startViewTransition(() => n),
          n
        );
      }
      return Promise.resolve();
    },
  };
}
const rd = rr({
  name: "RouterLink",
  compatConfig: { MODE: 3 },
  props: {
    to: { type: [String, Object], required: !0 },
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    custom: Boolean,
    ariaCurrentValue: { type: String, default: "page" },
    viewTransition: Boolean,
  },
  useLink: od,
  setup(e, { slots: t }) {
    const n = un(od(e)),
      { options: o } = So(Du),
      r = ma(() => ({
        [id(e.activeClass, o.linkActiveClass, "router-link-active")]: n.isActive,
        [id(e.exactActiveClass, o.linkExactActiveClass, "router-link-exact-active")]:
          n.isExactActive,
      }));
    return () => {
      const o = t.default && (1 === (s = t.default(n)).length ? s[0] : s);
      var s;
      return e.custom
        ? o
        : ga(
            "a",
            {
              "aria-current": n.isExactActive ? e.ariaCurrentValue : null,
              href: n.href,
              onClick: n.navigate,
              class: r.value,
            },
            o
          );
    };
  },
});
function sd(e) {
  return e ? (e.aliasOf ? e.aliasOf.path : e.path) : "";
}
const id = (e, t, n) => (null != e ? e : null != t ? t : n);
function ad(e, t) {
  if (!e) return null;
  const n = e(t);
  return 1 === n.length ? n[0] : n;
}
const ld = rr({
  name: "RouterView",
  inheritAttrs: !1,
  props: { name: { type: String, default: "default" }, route: Object },
  compatConfig: { MODE: 3 },
  setup(e, { attrs: t, slots: n }) {
    const o = So($u),
      r = ma(() => e.route || o.value),
      s = So(Mu, 0),
      i = ma(() => {
        let e = Cn(s);
        const { matched: t } = r.value;
        let n;
        for (; (n = t[e]) && !n.components; ) e++;
        return e;
      }),
      a = ma(() => r.value.matched[i.value]);
    (Eo(
      Mu,
      ma(() => i.value + 1)
    ),
      Eo(Lu, a),
      Eo($u, r));
    const l = kn();
    return (
      Co(
        () => [l.value, a.value, e.name],
        ([e, t, n], [o, r, s]) => {
          (t &&
            ((t.instances[n] = e),
            r &&
              r !== t &&
              e &&
              e === o &&
              (t.leaveGuards.size || (t.leaveGuards = r.leaveGuards),
              t.updateGuards.size || (t.updateGuards = r.updateGuards))),
            !e || !t || (r && ff(t, r) && o) || (t.enterCallbacks[n] || []).forEach((t) => t(e)));
        },
        { flush: "post" }
      ),
      () => {
        const o = r.value,
          s = e.name,
          i = a.value,
          c = i && i.components[s];
        if (!c) return ad(n.default, { Component: c, route: o });
        const u = i.props[s],
          f = u ? (!0 === u ? o.params : "function" == typeof u ? u(o) : u) : null,
          d = ga(
            c,
            Ou({}, f, t, {
              onVnodeUnmounted: (e) => {
                e.component.isUnmounted && (i.instances[s] = null);
              },
              ref: l,
            })
          );
        return ad(n.default, { Component: d, route: o }) || d;
      }
    );
  },
});
function cd(e) {
  const t = Jf(e.routes, e),
    n = e.parseQuery || Of,
    o = e.stringifyQuery || Tf,
    r = e.history,
    s = Cf(),
    i = Cf(),
    a = Cf(),
    l = xn(mf);
  let c = mf;
  ku &&
    e.scrollBehavior &&
    "scrollRestoration" in history &&
    (history.scrollRestoration = "manual");
  const u = Tu.bind(null, (e) => "" + e),
    f = Tu.bind(null, sf),
    d = Tu.bind(null, af);
  function p(e, s) {
    if (((s = Ou({}, s || l.value)), "string" == typeof e)) {
      const o = cf(n, e, s.path),
        i = t.resolve({ path: o.path }, s),
        a = r.createHref(o.fullPath);
      return Ou(o, i, { params: d(i.params), redirectedFrom: void 0, href: a });
    }
    let i;
    if (null != e.path) i = Ou({}, e, { path: cf(n, e.path, s.path).path });
    else {
      const t = Ou({}, e.params);
      for (const e in t) null == t[e] && delete t[e];
      ((i = Ou({}, e, { params: f(t) })), (s.params = f(s.params)));
    }
    const a = t.resolve(i, s),
      c = e.hash || "";
    a.params = u(d(a.params));
    const p = (function (e, t) {
      const n = t.query ? e(t.query) : "";
      return t.path + (n && "?") + n + (t.hash || "");
    })(
      o,
      Ou({}, e, {
        hash: ((h = c), nf(h).replace(Xu, "{").replace(ef, "}").replace(Ju, "^")),
        path: a.path,
      })
    );
    var h;
    const m = r.createHref(p);
    return Ou({ fullPath: p, hash: c, query: o === Tf ? Af(e.query) : e.query || {} }, a, {
      redirectedFrom: void 0,
      href: m,
    });
  }
  function h(e) {
    return "string" == typeof e ? cf(n, e, l.value.path) : Ou({}, e);
  }
  function m(e, t) {
    if (c !== e) return Pu(Iu.NAVIGATION_CANCELLED, { from: t, to: e });
  }
  function g(e) {
    return _(e);
  }
  function v(e, t) {
    const n = e.matched[e.matched.length - 1];
    if (n && n.redirect) {
      const { redirect: o } = n;
      let r = "function" == typeof o ? o(e, t) : o;
      return (
        "string" == typeof r &&
          ((r = r.includes("?") || r.includes("#") ? (r = h(r)) : { path: r }), (r.params = {})),
        Ou({ query: e.query, hash: e.hash, params: null != r.path ? {} : e.params }, r)
      );
    }
  }
  function _(e, t) {
    const n = (c = p(e)),
      r = l.value,
      s = e.state,
      i = e.force,
      a = !0 === e.replace,
      u = v(n, r);
    if (u)
      return _(
        Ou(h(u), { state: "object" == typeof u ? Ou({}, s, u.state) : s, force: i, replace: a }),
        t || n
      );
    const f = n;
    let d;
    return (
      (f.redirectedFrom = t),
      !i &&
        (function (e, t, n) {
          const o = t.matched.length - 1,
            r = n.matched.length - 1;
          return (
            o > -1 &&
            o === r &&
            ff(t.matched[o], n.matched[r]) &&
            df(t.params, n.params) &&
            e(t.query) === e(n.query) &&
            t.hash === n.hash
          );
        })(o, r, n) &&
        ((d = Pu(Iu.NAVIGATION_DUPLICATED, { to: f, from: r })), I(r, r, !0, !1)),
      (d ? Promise.resolve(d) : w(f, r))
        .catch((e) => (Fu(e) ? (Fu(e, Iu.NAVIGATION_GUARD_REDIRECT) ? e : R(e)) : C(e, f, r)))
        .then((e) => {
          if (e) {
            if (Fu(e, Iu.NAVIGATION_GUARD_REDIRECT))
              return _(
                Ou({ replace: a }, h(e.to), {
                  state: "object" == typeof e.to ? Ou({}, s, e.to.state) : s,
                  force: i,
                }),
                t || f
              );
          } else e = S(f, r, !0, a, s);
          return (E(f, r, e), e);
        })
    );
  }
  function y(e, t) {
    const n = m(e, t);
    return n ? Promise.reject(n) : Promise.resolve();
  }
  function b(e) {
    const t = F.values().next().value;
    return t && "function" == typeof t.runWithContext ? t.runWithContext(e) : e();
  }
  function w(e, t) {
    let n;
    const [o, r, a] = (function (e, t) {
      const n = [],
        o = [],
        r = [],
        s = Math.max(t.matched.length, e.matched.length);
      for (let i = 0; i < s; i++) {
        const s = t.matched[i];
        s && (e.matched.find((e) => ff(e, s)) ? o.push(s) : n.push(s));
        const a = e.matched[i];
        a && (t.matched.find((e) => ff(e, a)) || r.push(a));
      }
      return [n, o, r];
    })(e, t);
    n = If(o.reverse(), "beforeRouteLeave", e, t);
    for (const s of o)
      s.leaveGuards.forEach((o) => {
        n.push(Rf(o, e, t));
      });
    const l = y.bind(null, e, t);
    return (
      n.push(l),
      M(n)
        .then(() => {
          n = [];
          for (const o of s.list()) n.push(Rf(o, e, t));
          return (n.push(l), M(n));
        })
        .then(() => {
          n = If(r, "beforeRouteUpdate", e, t);
          for (const o of r)
            o.updateGuards.forEach((o) => {
              n.push(Rf(o, e, t));
            });
          return (n.push(l), M(n));
        })
        .then(() => {
          n = [];
          for (const o of a)
            if (o.beforeEnter)
              if (Cu(o.beforeEnter)) for (const r of o.beforeEnter) n.push(Rf(r, e, t));
              else n.push(Rf(o.beforeEnter, e, t));
          return (n.push(l), M(n));
        })
        .then(
          () => (
            e.matched.forEach((e) => (e.enterCallbacks = {})),
            (n = If(a, "beforeRouteEnter", e, t, b)),
            n.push(l),
            M(n)
          )
        )
        .then(() => {
          n = [];
          for (const o of i.list()) n.push(Rf(o, e, t));
          return (n.push(l), M(n));
        })
        .catch((e) => (Fu(e, Iu.NAVIGATION_CANCELLED) ? e : Promise.reject(e)))
    );
  }
  function E(e, t, n) {
    a.list().forEach((o) => b(() => o(e, t, n)));
  }
  function S(e, t, n, o, s) {
    const i = m(e, t);
    if (i) return i;
    const a = t === mf,
      c = ku ? history.state : {};
    (n &&
      (o || a
        ? r.replace(e.fullPath, Ou({ scroll: a && c && c.scroll }, s))
        : r.push(e.fullPath, s)),
      (l.value = e),
      I(e, t, n, a),
      R());
  }
  let k;
  function x() {
    k ||
      (k = r.listen((e, t, n) => {
        if (!L.listening) return;
        const o = p(e),
          s = v(o, L.currentRoute.value);
        if (s) return void _(Ou(s, { replace: !0, force: !0 }), o).catch(Au);
        c = o;
        const i = l.value;
        var a, u;
        (ku && ((a = Sf(i.fullPath, n.delta)), (u = wf()), kf.set(a, u)),
          w(o, i)
            .catch((e) =>
              Fu(e, Iu.NAVIGATION_ABORTED | Iu.NAVIGATION_CANCELLED)
                ? e
                : Fu(e, Iu.NAVIGATION_GUARD_REDIRECT)
                  ? (_(Ou(h(e.to), { force: !0 }), o)
                      .then((e) => {
                        Fu(e, Iu.NAVIGATION_ABORTED | Iu.NAVIGATION_DUPLICATED) &&
                          !n.delta &&
                          n.type === gf.pop &&
                          r.go(-1, !1);
                      })
                      .catch(Au),
                    Promise.reject())
                  : (n.delta && r.go(-n.delta, !1), C(e, o, i))
            )
            .then((e) => {
              ((e = e || S(o, i, !1)) &&
                (n.delta && !Fu(e, Iu.NAVIGATION_CANCELLED)
                  ? r.go(-n.delta, !1)
                  : n.type === gf.pop &&
                    Fu(e, Iu.NAVIGATION_ABORTED | Iu.NAVIGATION_DUPLICATED) &&
                    r.go(-1, !1)),
                E(o, i, e));
            })
            .catch(Au));
      }));
  }
  let O,
    T = Cf(),
    A = Cf();
  function C(e, t, n) {
    R(e);
    const o = A.list();
    return (o.length && o.forEach((o) => o(e, t, n)), Promise.reject(e));
  }
  function R(e) {
    return (O || ((O = !e), x(), T.list().forEach(([t, n]) => (e ? n(e) : t())), T.reset()), e);
  }
  function I(t, n, o, r) {
    const { scrollBehavior: s } = e;
    if (!ku || !s) return Promise.resolve();
    const i =
      (!o &&
        (function (e) {
          const t = kf.get(e);
          return (kf.delete(e), t);
        })(Sf(t.fullPath, 0))) ||
      ((r || !o) && history.state && history.state.scroll) ||
      null;
    return so()
      .then(() => s(t, n, i))
      .then((e) => e && Ef(e))
      .catch((e) => C(e, t, n));
  }
  const N = (e) => r.go(e);
  let P;
  const F = new Set(),
    L = {
      currentRoute: l,
      listening: !0,
      addRoute: function (e, n) {
        let o, r;
        return (xf(e) ? ((o = t.getRecordMatcher(e)), (r = n)) : (r = e), t.addRoute(r, o));
      },
      removeRoute: function (e) {
        const n = t.getRecordMatcher(e);
        n && t.removeRoute(n);
      },
      clearRoutes: t.clearRoutes,
      hasRoute: function (e) {
        return !!t.getRecordMatcher(e);
      },
      getRoutes: function () {
        return t.getRoutes().map((e) => e.record);
      },
      resolve: p,
      options: e,
      push: g,
      replace: function (e) {
        return g(Ou(h(e), { replace: !0 }));
      },
      go: N,
      back: () => N(-1),
      forward: () => N(1),
      beforeEach: s.add,
      beforeResolve: i.add,
      afterEach: a.add,
      onError: A.add,
      isReady: function () {
        return O && l.value !== mf
          ? Promise.resolve()
          : new Promise((e, t) => {
              T.add([e, t]);
            });
      },
      install(e) {
        (e.component("RouterLink", rd),
          e.component("RouterView", ld),
          (e.config.globalProperties.$router = L),
          Object.defineProperty(e.config.globalProperties, "$route", {
            enumerable: !0,
            get: () => Cn(l),
          }),
          ku && !P && l.value === mf && ((P = !0), g(r.location).catch((e) => {})));
        const t = {};
        for (const o in mf) Object.defineProperty(t, o, { get: () => l.value[o], enumerable: !0 });
        (e.provide(Du, L), e.provide(ju, fn(t)), e.provide($u, l));
        const n = e.unmount;
        (F.add(e),
          (e.unmount = function () {
            (F.delete(e),
              F.size < 1 && ((c = mf), k && k(), (k = null), (l.value = mf), (P = !1), (O = !1)),
              n());
          }));
      },
    };
  function M(e) {
    return e.reduce((e, t) => e.then(() => b(t)), Promise.resolve());
  }
  return L;
}
function ud(e) {
  return !!Xe() && (Ze(e), !0);
}
const fd = new WeakMap(),
  dd = /* @__NO_SIDE_EFFECTS__ */ (...e) => {
    var t;
    const n = e[0],
      o = null == (t = Zi()) ? void 0 : t.proxy;
    if (null == o && !ko()) throw new Error("injectLocal must be called in setup");
    return o && fd.has(o) && n in fd.get(o) ? fd.get(o)[n] : So(...e);
  },
  pd = "undefined" != typeof window && "undefined" != typeof document;
"undefined" != typeof WorkerGlobalScope && (globalThis, WorkerGlobalScope);
const hd = Object.prototype.toString,
  md = () => {},
  gd = vd();
function vd() {
  var e, t;
  return (
    pd &&
    (null == (e = null == window ? void 0 : window.navigator) ? void 0 : e.userAgent) &&
    (/iP(?:ad|hone|od)/.test(window.navigator.userAgent) ||
      ((null == (t = null == window ? void 0 : window.navigator) ? void 0 : t.maxTouchPoints) > 2 &&
        /iPad|Macintosh/.test(null == window ? void 0 : window.navigator.userAgent)))
  );
}
function _d(e, t) {
  return function (...n) {
    return new Promise((o, r) => {
      Promise.resolve(e(() => t.apply(this, n), { fn: t, thisArg: this, args: n }))
        .then(o)
        .catch(r);
    });
  };
}
const yd = (e) => e();
function bd(e = yd, t = {}) {
  const { initialState: n = "active" } = t,
    o = (function (...e) {
      if (1 !== e.length) return jn(...e);
      const t = e[0];
      return "function" == typeof t ? dn(Fn(() => ({ get: t, set: md }))) : kn(t);
    })("active" === n);
  return {
    isActive: dn(o),
    pause: function () {
      o.value = !1;
    },
    resume: function () {
      o.value = !0;
    },
    eventFilter: (...t) => {
      o.value && e(...t);
    },
  };
}
function wd(e) {
  return e;
}
function Ed(e) {
  return e.endsWith("rem") ? 16 * Number.parseFloat(e) : Number.parseFloat(e);
}
function Sd(e) {
  return Array.isArray(e) ? e : [e];
}
function kd(e) {
  return Zi();
}
// @__NO_SIDE_EFFECTS__
function xd(e, t = 200, n = !1, o = !0, r = !1) {
  return _d(
    (function (...e) {
      let t,
        n,
        o,
        r,
        s,
        i,
        a = 0,
        l = !0,
        c = md;
      Sn(e[0]) || "object" != typeof e[0]
        ? ([o, r = !0, s = !0, i = !1] = e)
        : ({ delay: o, trailing: r = !0, leading: s = !0, rejectOnCancel: i = !1 } = e[0]);
      const u = () => {
        t && (clearTimeout(t), (t = void 0), c(), (c = md));
      };
      return (e) => {
        const f = Rn(o),
          d = Date.now() - a,
          p = () => (n = e());
        return (
          u(),
          f <= 0
            ? ((a = Date.now()), p())
            : (d > f && (s || !l)
                ? ((a = Date.now()), p())
                : r &&
                  (n = new Promise((e, n) => {
                    ((c = i ? n : e),
                      (t = setTimeout(
                        () => {
                          ((a = Date.now()), (l = !0), e(p()), u());
                        },
                        Math.max(0, f - d)
                      )));
                  })),
              s || t || (t = setTimeout(() => (l = !0), f)),
              (l = !1),
              n)
        );
      };
    })(t, n, o, r),
    e
  );
}
function Od(e, t, n = {}) {
  const { eventFilter: o, initialState: r = "active", ...s } = n,
    { eventFilter: i, pause: a, resume: l, isActive: c } = bd(o, { initialState: r }),
    u = (function (e, t, n = {}) {
      const { eventFilter: o = yd, ...r } = n;
      return Co(e, _d(o, t), r);
    })(e, t, { ...s, eventFilter: i });
  return { stop: u, pause: a, resume: l, isActive: c };
}
function Td(e, t = !0, n) {
  kd() ? Mr(e, n) : t ? e() : so(e);
}
function Ad(e, t) {
  kd() && Vr(e, t);
}
const Cd =
    /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[T\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/i,
  Rd =
    /[YMDHhms]o|\[([^\]]+)\]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a{1,2}|A{1,2}|m{1,2}|s{1,2}|Z{1,2}|z{1,4}|SSS/g;
function Id(e, t, n, o) {
  let r = e < 12 ? "AM" : "PM";
  return (o && (r = r.split("").reduce((e, t) => e + `${t}.`, "")), n ? r.toLowerCase() : r);
}
function Nd(e) {
  const t = ["th", "st", "nd", "rd"],
    n = e % 100;
  return e + (t[(n - 20) % 10] || t[n] || t[0]);
}
// @__NO_SIDE_EFFECTS__
function Pd(e, t = "HH:mm:ss", n = {}) {
  return ma(() =>
    (function (e, t, n = {}) {
      var o;
      const r = e.getFullYear(),
        s = e.getMonth(),
        i = e.getDate(),
        a = e.getHours(),
        l = e.getMinutes(),
        c = e.getSeconds(),
        u = e.getMilliseconds(),
        f = e.getDay(),
        d = null != (o = n.customMeridiem) ? o : Id,
        p = (e) => {
          var t;
          return null != (t = e.split(" ")[1]) ? t : "";
        },
        h = {
          Yo: () => Nd(r),
          YY: () => String(r).slice(-2),
          YYYY: () => r,
          M: () => s + 1,
          Mo: () => Nd(s + 1),
          MM: () => `${s + 1}`.padStart(2, "0"),
          MMM: () => e.toLocaleDateString(Rn(n.locales), { month: "short" }),
          MMMM: () => e.toLocaleDateString(Rn(n.locales), { month: "long" }),
          D: () => String(i),
          Do: () => Nd(i),
          DD: () => `${i}`.padStart(2, "0"),
          H: () => String(a),
          Ho: () => Nd(a),
          HH: () => `${a}`.padStart(2, "0"),
          h: () => `${a % 12 || 12}`.padStart(1, "0"),
          ho: () => Nd(a % 12 || 12),
          hh: () => `${a % 12 || 12}`.padStart(2, "0"),
          m: () => String(l),
          mo: () => Nd(l),
          mm: () => `${l}`.padStart(2, "0"),
          s: () => String(c),
          so: () => Nd(c),
          ss: () => `${c}`.padStart(2, "0"),
          SSS: () => `${u}`.padStart(3, "0"),
          d: () => f,
          dd: () => e.toLocaleDateString(Rn(n.locales), { weekday: "narrow" }),
          ddd: () => e.toLocaleDateString(Rn(n.locales), { weekday: "short" }),
          dddd: () => e.toLocaleDateString(Rn(n.locales), { weekday: "long" }),
          A: () => d(a, l),
          AA: () => d(a, l, !1, !0),
          a: () => d(a, l, !0),
          aa: () => d(a, l, !0, !0),
          z: () => p(e.toLocaleDateString(Rn(n.locales), { timeZoneName: "shortOffset" })),
          zz: () => p(e.toLocaleDateString(Rn(n.locales), { timeZoneName: "shortOffset" })),
          zzz: () => p(e.toLocaleDateString(Rn(n.locales), { timeZoneName: "shortOffset" })),
          zzzz: () => p(e.toLocaleDateString(Rn(n.locales), { timeZoneName: "longOffset" })),
        };
      return t.replace(Rd, (e, t) => {
        var n, o;
        return null != (o = null != t ? t : null == (n = h[e]) ? void 0 : n.call(h)) ? o : e;
      });
    })(
      (function (e) {
        if (null === e) return new Date(Number.NaN);
        if (void 0 === e) return new Date();
        if (e instanceof Date) return new Date(e);
        if ("string" == typeof e && !/Z$/i.test(e)) {
          const t = e.match(Cd);
          if (t) {
            const e = t[2] - 1 || 0,
              n = (t[7] || "0").substring(0, 3);
            return new Date(t[1], e, t[3] || 1, t[4] || 0, t[5] || 0, t[6] || 0, n);
          }
        }
        return new Date(e);
      })(Rn(e)),
      Rn(t),
      n
    )
  );
}
function Fd(e, t = 1e3, n = {}) {
  const { immediate: o = !0, immediateCallback: r = !1 } = n;
  let s = null;
  const i = xn(!1);
  function a() {
    s && (clearInterval(s), (s = null));
  }
  function l() {
    ((i.value = !1), a());
  }
  function c() {
    const n = Rn(t);
    n <= 0 || ((i.value = !0), r && e(), a(), i.value && (s = setInterval(e, n)));
  }
  if ((o && pd && c(), Sn(t) || "function" == typeof t)) {
    ud(
      Co(t, () => {
        i.value && pd && c();
      })
    );
  }
  return (ud(l), { isActive: pn(i), pause: l, resume: c });
}
function Ld(e, t, n = {}) {
  const { immediate: o = !0, immediateCallback: r = !1 } = n,
    s = xn(!1);
  let i;
  function a() {
    i && (clearTimeout(i), (i = void 0));
  }
  function l() {
    ((s.value = !1), a());
  }
  function c(...n) {
    (r && e(),
      a(),
      (s.value = !0),
      (i = setTimeout(() => {
        ((s.value = !1), (i = void 0), e(...n));
      }, Rn(t))));
  }
  return (o && ((s.value = !0), pd && c()), ud(l), { isPending: pn(s), start: c, stop: l });
}
const Md = pd ? window : void 0,
  Dd = pd ? window.document : void 0;
function jd(e) {
  var t;
  const n = Rn(e);
  return null != (t = null == n ? void 0 : n.$el) ? t : n;
}
function $d(...e) {
  const t = [],
    n = () => {
      (t.forEach((e) => e()), (t.length = 0));
    },
    o = ma(() => {
      const t = Sd(Rn(e[0])).filter((e) => null != e);
      return t.every((e) => "string" != typeof e) ? t : void 0;
    }),
    r =
      ((s = ([e, o, r, s]) => {
        if (
          (n(),
          !(null == e ? void 0 : e.length) ||
            !(null == o ? void 0 : o.length) ||
            !(null == r ? void 0 : r.length))
        )
          return;
        const i = ((a = s), "[object Object]" === hd.call(a) ? { ...s } : s);
        var a;
        t.push(
          ...e.flatMap((e) =>
            o.flatMap((t) =>
              r.map((n) =>
                ((e, t, n, o) => (
                  e.addEventListener(t, n, o),
                  () => e.removeEventListener(t, n, o)
                ))(e, t, n, i)
              )
            )
          )
        );
      }),
      (i = { flush: "post" }),
      Co(
        () => {
          var t, n;
          return [
            null != (n = null == (t = o.value) ? void 0 : t.map((e) => jd(e)))
              ? n
              : [Md].filter((e) => null != e),
            Sd(Rn(o.value ? e[1] : e[0])),
            Sd(Cn(o.value ? e[2] : e[1])),
            // @ts-expect-error - TypeScript gets the correct types, but somehow still complains
            Rn(o.value ? e[3] : e[2]),
          ];
        },
        s,
        { ...i, immediate: !0 }
      ));
  var s, i;
  return (
    ud(n),
    () => {
      (r(), n());
    }
  );
}
let Vd = !1;
function Ud(e, t, n = {}) {
  const {
    window: o = Md,
    ignore: r = [],
    capture: s = !0,
    detectIframe: i = !1,
    controls: a = !1,
  } = n;
  if (!o) return a ? { stop: md, cancel: md, trigger: md } : md;
  if (gd && !Vd) {
    Vd = !0;
    const e = { passive: !0 };
    (Array.from(o.document.body.children).forEach((t) => t.addEventListener("click", md, e)),
      o.document.documentElement.addEventListener("click", md, e));
  }
  let l = !0;
  const c = (e) =>
    Rn(r).some((t) => {
      if ("string" == typeof t)
        return Array.from(o.document.querySelectorAll(t)).some(
          (t) => t === e.target || e.composedPath().includes(t)
        );
      {
        const n = jd(t);
        return n && (e.target === n || e.composedPath().includes(n));
      }
    });
  const u = (n) => {
    const o = jd(e);
    null != n.target &&
      (o instanceof Element ||
        !(function (e) {
          const t = Rn(e);
          return t && 16 === t.$.subTree.shapeFlag;
        })(e) ||
        !(function (e, t) {
          const n = Rn(e),
            o = n.$.subTree && n.$.subTree.children;
          return (
            !(null == o || !Array.isArray(o)) &&
            o.some((e) => e.el === t.target || t.composedPath().includes(e.el))
          );
        })(e, n)) &&
      o &&
      o !== n.target &&
      !n.composedPath().includes(o) &&
      ("detail" in n && 0 === n.detail && (l = !c(n)), l ? t(n) : (l = !0));
  };
  let f = !1;
  const d = [
      $d(
        o,
        "click",
        (e) => {
          f ||
            ((f = !0),
            setTimeout(() => {
              f = !1;
            }, 0),
            u(e));
        },
        { passive: !0, capture: s }
      ),
      $d(
        o,
        "pointerdown",
        (t) => {
          const n = jd(e);
          l = !c(t) && !(!n || t.composedPath().includes(n));
        },
        { passive: !0 }
      ),
      i &&
        $d(
          o,
          "blur",
          (n) => {
            setTimeout(() => {
              var r;
              const s = jd(e);
              "IFRAME" !== (null == (r = o.document.activeElement) ? void 0 : r.tagName) ||
                (null == s ? void 0 : s.contains(o.document.activeElement)) ||
                t(n);
            }, 0);
          },
          { passive: !0 }
        ),
    ].filter(Boolean),
    p = () => d.forEach((e) => e());
  return a
    ? {
        stop: p,
        cancel: () => {
          l = !1;
        },
        trigger: (e) => {
          ((l = !0), u(e), (l = !1));
        },
      }
    : p;
}
// @__NO_SIDE_EFFECTS__
function Bd() {
  const e = xn(!1),
    t = Zi();
  return (
    t &&
      Mr(() => {
        e.value = !0;
      }, t),
    e
  );
}
// @__NO_SIDE_EFFECTS__
function Hd(e) {
  const t = Bd();
  return ma(() => (t.value, Boolean(e())));
}
const Wd = Symbol("vueuse-ssr-width");
// @__NO_SIDE_EFFECTS__
function zd() {
  const e = ko() ? dd(Wd, null) : null;
  return "number" == typeof e ? e : void 0;
}
function Gd(e, t = {}) {
  const { window: n = Md, ssrWidth: o = zd() } = t,
    r = Hd(() => n && "matchMedia" in n && "function" == typeof n.matchMedia),
    s = xn("number" == typeof o),
    i = xn(),
    a = xn(!1);
  return (
    To(() => {
      if (s.value) {
        s.value = !r.value;
        const t = Rn(e).split(",");
        return void (a.value = t.some((e) => {
          const t = e.includes("not all"),
            n = e.match(/\(\s*min-width:\s*(-?\d+(?:\.\d*)?[a-z]+\s*)\)/),
            r = e.match(/\(\s*max-width:\s*(-?\d+(?:\.\d*)?[a-z]+\s*)\)/);
          let s = Boolean(n || r);
          return (n && s && (s = o >= Ed(n[1])), r && s && (s = o <= Ed(r[1])), t ? !s : s);
        }));
      }
      r.value && ((i.value = n.matchMedia(Rn(e))), (a.value = i.value.matches));
    }),
    $d(
      i,
      "change",
      (e) => {
        a.value = e.matches;
      },
      { passive: !0 }
    ),
    ma(() => a.value)
  );
}
// @__NO_SIDE_EFFECTS__
function qd(e, t = {}) {
  function n(t, n) {
    let o = Rn(e[Rn(t)]);
    return (
      null != n &&
        (o = (function (e, t) {
          var n;
          if ("number" == typeof e) return e + t;
          const o = (null == (n = e.match(/^-?\d+\.?\d*/)) ? void 0 : n[0]) || "",
            r = e.slice(o.length),
            s = Number.parseFloat(o) + t;
          return Number.isNaN(s) ? e : s + r;
        })(o, n)),
      "number" == typeof o && (o = `${o}px`),
      o
    );
  }
  const { window: o = Md, strategy: r = "min-width", ssrWidth: s = zd() } = t,
    i = "number" == typeof s,
    a = i ? xn(!1) : { value: !0 };
  function l(e, t) {
    return !a.value && i
      ? "min" === e
        ? s >= Ed(t)
        : s <= Ed(t)
      : !!o && o.matchMedia(`(${e}-width: ${t})`).matches;
  }
  i && Td(() => (a.value = !!o));
  const c = (e) => Gd(() => `(min-width: ${n(e)})`, t),
    u = (e) => Gd(() => `(max-width: ${n(e)})`, t),
    f = Object.keys(e).reduce(
      (e, t) => (
        Object.defineProperty(e, t, {
          get: () => ("min-width" === r ? c(t) : u(t)),
          enumerable: !0,
          configurable: !0,
        }),
        e
      ),
      {}
    );
  function d() {
    const t = Object.keys(e)
      .map((e) => [e, f[e], Ed(n(e))])
      .sort((e, t) => e[2] - t[2]);
    return ma(() => t.filter(([, e]) => e.value).map(([e]) => e));
  }
  return Object.assign(f, {
    greaterOrEqual: c,
    smallerOrEqual: u,
    greater: (e) => Gd(() => `(min-width: ${n(e, 0.1)})`, t),
    smaller: (e) => Gd(() => `(max-width: ${n(e, -0.1)})`, t),
    between: (e, o) => Gd(() => `(min-width: ${n(e)}) and (max-width: ${n(o, -0.1)})`, t),
    isGreater: (e) => l("min", n(e, 0.1)),
    isGreaterOrEqual: (e) => l("min", n(e)),
    isSmaller: (e) => l("max", n(e, -0.1)),
    isSmallerOrEqual: (e) => l("max", n(e)),
    isInBetween: (e, t) => l("min", n(e)) && l("max", n(t, -0.1)),
    current: d,
    active() {
      const e = d();
      return ma(() => (0 === e.value.length ? "" : e.value.at("min-width" === r ? -1 : 0)));
    },
  });
}
const Yd =
    "undefined" != typeof globalThis
      ? globalThis
      : "undefined" != typeof window
        ? window
        : "undefined" != typeof global
          ? global
          : "undefined" != typeof self
            ? self
            : {},
  Kd = "__vueuse_ssr_handlers__",
  Jd = Qd();
function Qd() {
  return (Kd in Yd || (Yd[Kd] = Yd[Kd] || {}), Yd[Kd]);
}
// @__NO_SIDE_EFFECTS__
function Xd(e) {
  return Gd("(prefers-color-scheme: dark)", e);
}
const Zd = {
    boolean: { read: (e) => "true" === e, write: (e) => String(e) },
    object: { read: (e) => JSON.parse(e), write: (e) => JSON.stringify(e) },
    number: { read: (e) => Number.parseFloat(e), write: (e) => String(e) },
    any: { read: (e) => e, write: (e) => String(e) },
    string: { read: (e) => e, write: (e) => String(e) },
    map: {
      read: (e) => new Map(JSON.parse(e)),
      write: (e) => JSON.stringify(Array.from(e.entries())),
    },
    set: { read: (e) => new Set(JSON.parse(e)), write: (e) => JSON.stringify(Array.from(e)) },
    date: { read: (e) => new Date(e), write: (e) => e.toISOString() },
  },
  ep = "vueuse-storage";
function tp(e, t, n, o = {}) {
  var r;
  const {
      flush: s = "pre",
      deep: i = !0,
      listenToStorageChanges: a = !0,
      writeDefaults: l = !0,
      mergeDefaults: c = !1,
      shallow: u,
      window: f = Md,
      eventFilter: d,
      onError: p = (e) => {},
      initOnMounted: h,
    } = o,
    m = (u ? xn : kn)("function" == typeof t ? t() : t),
    g = ma(() => Rn(e));
  if (!n)
    try {
      n = (function (e, t) {
        return Jd[e] || t;
      })("getDefaultStorage", () => {
        var e;
        return null == (e = Md) ? void 0 : e.localStorage;
      })();
    } catch (um) {
      p(um);
    }
  if (!n) return m;
  const v = Rn(t),
    _ = (function (e) {
      return null == e
        ? "any"
        : e instanceof Set
          ? "set"
          : e instanceof Map
            ? "map"
            : e instanceof Date
              ? "date"
              : "boolean" == typeof e
                ? "boolean"
                : "string" == typeof e
                  ? "string"
                  : "object" == typeof e
                    ? "object"
                    : Number.isNaN(e)
                      ? "any"
                      : "number";
    })(v),
    y = null != (r = o.serializer) ? r : Zd[_],
    { pause: b, resume: w } = Od(
      m,
      (e) =>
        (function (e) {
          try {
            const t = n.getItem(g.value);
            if (null == e) (k(t, null), n.removeItem(g.value));
            else {
              const o = y.write(e);
              t !== o && (n.setItem(g.value, o), k(t, o));
            }
          } catch (um) {
            p(um);
          }
        })(e),
      { flush: s, deep: i, eventFilter: d }
    );
  Co(g, () => x(), { flush: s });
  let E = !1;
  const S = (e) => {
    (h && !E) || x(e.detail);
  };
  function k(e, t) {
    if (f) {
      const o = { key: g.value, oldValue: e, newValue: t, storageArea: n };
      f.dispatchEvent(
        n instanceof Storage ? new StorageEvent("storage", o) : new CustomEvent(ep, { detail: o })
      );
    }
  }
  function x(e) {
    if (!e || e.storageArea === n)
      if (e && null == e.key) m.value = v;
      else if (!e || e.key === g.value) {
        b();
        try {
          const t = y.write(m.value);
          (void 0 !== e && (null == e ? void 0 : e.newValue) === t) ||
            (m.value = (function (e) {
              const t = e ? e.newValue : n.getItem(g.value);
              if (null == t) return (l && null != v && n.setItem(g.value, y.write(v)), v);
              if (!e && c) {
                const e = y.read(t);
                return "function" == typeof c
                  ? c(e, v)
                  : "object" !== _ || Array.isArray(e)
                    ? e
                    : { ...v, ...e };
              }
              return "string" != typeof t ? t : y.read(t);
            })(e));
        } catch (um) {
          p(um);
        } finally {
          e ? so(w) : w();
        }
      }
  }
  return (
    f &&
      a &&
      (n instanceof Storage
        ? $d(
            f,
            "storage",
            (e) => {
              (h && !E) || x(e);
            },
            { passive: !0 }
          )
        : $d(f, ep, S)),
    h
      ? Td(() => {
          ((E = !0), x());
        })
      : x(),
    m
  );
}
function np(e, t, n = {}) {
  const { window: o = Md, ...r } = n;
  let s;
  const i = Hd(() => o && "ResizeObserver" in o),
    a = () => {
      s && (s.disconnect(), (s = void 0));
    },
    l = Co(
      ma(() => {
        const t = Rn(e);
        return Array.isArray(t) ? t.map((e) => jd(e)) : [jd(t)];
      }),
      (e) => {
        if ((a(), i.value && o)) {
          s = new ResizeObserver(t);
          for (const t of e) t && s.observe(t, r);
        }
      },
      { immediate: !0, flush: "post" }
    ),
    c = () => {
      (a(), l());
    };
  return (ud(c), { isSupported: i, stop: c });
}
const op = [
  "fullscreenchange",
  "webkitfullscreenchange",
  "webkitendfullscreen",
  "mozfullscreenchange",
  "MSFullscreenChange",
];
function rp(e, t = {}) {
  const { document: n = Dd, autoExit: o = !1 } = t,
    r = ma(() => {
      var t;
      return null != (t = jd(e)) ? t : null == n ? void 0 : n.documentElement;
    }),
    s = xn(!1),
    i = ma(() =>
      [
        "requestFullscreen",
        "webkitRequestFullscreen",
        "webkitEnterFullscreen",
        "webkitEnterFullScreen",
        "webkitRequestFullScreen",
        "mozRequestFullScreen",
        "msRequestFullscreen",
      ].find((e) => (n && e in n) || (r.value && e in r.value))
    ),
    a = ma(() =>
      [
        "exitFullscreen",
        "webkitExitFullscreen",
        "webkitExitFullScreen",
        "webkitCancelFullScreen",
        "mozCancelFullScreen",
        "msExitFullscreen",
      ].find((e) => (n && e in n) || (r.value && e in r.value))
    ),
    l = ma(() =>
      [
        "fullScreen",
        "webkitIsFullScreen",
        "webkitDisplayingFullscreen",
        "mozFullScreen",
        "msFullscreenElement",
      ].find((e) => (n && e in n) || (r.value && e in r.value))
    ),
    c = [
      "fullscreenElement",
      "webkitFullscreenElement",
      "mozFullScreenElement",
      "msFullscreenElement",
    ].find((e) => n && e in n),
    u = Hd(() => r.value && n && void 0 !== i.value && void 0 !== a.value && void 0 !== l.value),
    f = () => {
      if (l.value) {
        if (n && null != n[l.value]) return n[l.value];
        {
          const e = r.value;
          if (null != (null == e ? void 0 : e[l.value])) return Boolean(e[l.value]);
        }
      }
      return !1;
    };
  async function d() {
    if (u.value && s.value) {
      if (a.value)
        if (null != (null == n ? void 0 : n[a.value])) await n[a.value]();
        else {
          const e = r.value;
          null != (null == e ? void 0 : e[a.value]) && (await e[a.value]());
        }
      s.value = !1;
    }
  }
  async function p() {
    if (!u.value || s.value) return;
    f() && (await d());
    const e = r.value;
    i.value && null != (null == e ? void 0 : e[i.value]) && (await e[i.value](), (s.value = !0));
  }
  const h = () => {
      const e = f();
      (!e || (e && c && (null == n ? void 0 : n[c]) === r.value)) && (s.value = e);
    },
    m = { capture: !1, passive: !0 };
  return (
    $d(n, op, h, m),
    $d(() => jd(r), op, h, m),
    Td(h, !1),
    o && ud(d),
    {
      isSupported: u,
      isFullscreen: s,
      enter: p,
      exit: d,
      toggle: async function () {
        await (s.value ? d() : p());
      },
    }
  );
}
const sp = {
    easeInSine: [0.12, 0, 0.39, 0],
    easeOutSine: [0.61, 1, 0.88, 1],
    easeInOutSine: [0.37, 0, 0.63, 1],
    easeInQuad: [0.11, 0, 0.5, 0],
    easeOutQuad: [0.5, 1, 0.89, 1],
    easeInOutQuad: [0.45, 0, 0.55, 1],
    easeInCubic: [0.32, 0, 0.67, 0],
    easeOutCubic: [0.33, 1, 0.68, 1],
    easeInOutCubic: [0.65, 0, 0.35, 1],
    easeInQuart: [0.5, 0, 0.75, 0],
    easeOutQuart: [0.25, 1, 0.5, 1],
    easeInOutQuart: [0.76, 0, 0.24, 1],
    easeInQuint: [0.64, 0, 0.78, 0],
    easeOutQuint: [0.22, 1, 0.36, 1],
    easeInOutQuint: [0.83, 0, 0.17, 1],
    easeInExpo: [0.7, 0, 0.84, 0],
    easeOutExpo: [0.16, 1, 0.3, 1],
    easeInOutExpo: [0.87, 0, 0.13, 1],
    easeInCirc: [0.55, 0, 1, 0.45],
    easeOutCirc: [0, 0.55, 0.45, 1],
    easeInOutCirc: [0.85, 0, 0.15, 1],
    easeInBack: [0.36, 0, 0.66, -0.56],
    easeOutBack: [0.34, 1.56, 0.64, 1],
    easeInOutBack: [0.68, -0.6, 0.32, 1.6],
  },
  ip = Object.assign({}, { linear: wd }, sp);
function ap([e, t, n, o]) {
  const r = (e, t) => 1 - 3 * t + 3 * e,
    s = (e, t) => 3 * t - 6 * e,
    i = (e) => 3 * e,
    a = (e, t, n) => ((r(t, n) * e + s(t, n)) * e + i(t)) * e,
    l = (e, t, n) => 3 * r(t, n) * e * e + 2 * s(t, n) * e + i(t);
  return (r) =>
    e === t && n === o
      ? r
      : a(
          ((t) => {
            let o = t;
            for (let r = 0; r < 4; ++r) {
              const r = l(o, e, n);
              if (0 === r) return o;
              o -= (a(o, e, n) - t) / r;
            }
            return o;
          })(r),
          t,
          o
        );
}
function lp(e, t, n) {
  return e + n * (t - e);
}
function cp(e) {
  return ("number" == typeof e ? [e] : e) || [];
}
function up(e, t = {}) {
  let n = 0;
  const o = () => {
      const t = Rn(e);
      return "number" == typeof t ? t : t.map(Rn);
    },
    r = kn(o());
  return (
    Co(
      o,
      async (e) => {
        var o, s;
        if (Rn(t.disabled)) return;
        const i = ++n;
        if (
          (t.delay &&
            (await (function (e, t = !1, n = "Timeout") {
              return new Promise((o, r) => {
                t ? setTimeout(() => r(n), e) : setTimeout(o, e);
              });
            })(Rn(t.delay))),
          i !== n)
        )
          return;
        const a = Array.isArray(e) ? e.map(Rn) : Rn(e);
        (null == (o = t.onStarted) || o.call(t),
          await (function (e, t, n, o = {}) {
            var r, s;
            const { window: i = Md } = o,
              a = Rn(t),
              l = Rn(n),
              c = cp(a),
              u = cp(l),
              f = null != (r = Rn(o.duration)) ? r : 1e3,
              d = Date.now(),
              p = Date.now() + f,
              h =
                "function" == typeof o.transition
                  ? o.transition
                  : null != (s = Rn(o.transition))
                    ? s
                    : wd,
              m = "function" == typeof h ? h : ap(h);
            return new Promise((t) => {
              e.value = a;
              const n = () => {
                var r;
                if (null == (r = o.abort) ? void 0 : r.call(o)) return void t();
                const s = Date.now(),
                  a = m((s - d) / f),
                  h = cp(e.value).map((e, t) => lp(c[t], u[t], a));
                (Array.isArray(e.value)
                  ? (e.value = h.map((e, t) => {
                      var n, o;
                      return lp(null != (n = c[t]) ? n : 0, null != (o = u[t]) ? o : 0, a);
                    }))
                  : "number" == typeof e.value && (e.value = h[0]),
                  s < p ? null == i || i.requestAnimationFrame(n) : ((e.value = l), t()));
              };
              n();
            });
          })(r, r.value, a, {
            ...t,
            abort: () => {
              var e;
              return i !== n || (null == (e = t.abort) ? void 0 : e.call(t));
            },
          }),
          null == (s = t.onFinished) || s.call(t));
      },
      { deep: !0 }
    ),
    Co(
      () => Rn(t.disabled),
      (e) => {
        e && (n++, (r.value = o()));
      }
    ),
    ud(() => {
      n++;
    }),
    ma(() => (Rn(t.disabled) ? o() : r.value))
  );
}
// @__NO_SIDE_EFFECTS__
function fp(e, t, n, o = {}) {
  var r, s, i;
  const {
      clone: a = !1,
      passive: l = !1,
      eventName: c,
      deep: u = !1,
      defaultValue: f,
      shouldEmit: d,
    } = o,
    p = Zi(),
    h =
      n ||
      (null == p ? void 0 : p.emit) ||
      (null == (r = null == p ? void 0 : p.$emit) ? void 0 : r.bind(p)) ||
      (null == (i = null == (s = null == p ? void 0 : p.proxy) ? void 0 : s.$emit)
        ? void 0
        : i.bind(null == p ? void 0 : p.proxy));
  let m = c;
  m = m || `update:${t.toString()}`;
  const g = (e) => {
      return a ? ("function" == typeof a ? a(e) : ((t = e), JSON.parse(JSON.stringify(t)))) : e;
      var t;
    },
    v = () => (void 0 !== e[t] ? g(e[t]) : f),
    _ = (e) => {
      d ? d(e) && h(m, e) : h(m, e);
    };
  if (l) {
    const n = kn(v());
    let o = !1;
    return (
      Co(
        () => e[t],
        (e) => {
          o || ((o = !0), (n.value = g(e)), so(() => (o = !1)));
        }
      ),
      Co(
        n,
        (n) => {
          o || (n === e[t] && !u) || _(n);
        },
        { deep: u }
      ),
      n
    );
  }
  return ma({
    get: () => v(),
    set(e) {
      _(e);
    },
  });
}
// @__NO_SIDE_EFFECTS__
function dp(e = {}) {
  const {
      window: t = Md,
      initialWidth: n = Number.POSITIVE_INFINITY,
      initialHeight: o = Number.POSITIVE_INFINITY,
      listenOrientation: r = !0,
      includeScrollbar: s = !0,
      type: i = "inner",
    } = e,
    a = xn(n),
    l = xn(o),
    c = () => {
      if (t)
        if ("outer" === i) ((a.value = t.outerWidth), (l.value = t.outerHeight));
        else if ("visual" === i && t.visualViewport) {
          const { width: e, height: n, scale: o } = t.visualViewport;
          ((a.value = Math.round(e * o)), (l.value = Math.round(n * o)));
        } else
          s
            ? ((a.value = t.innerWidth), (l.value = t.innerHeight))
            : ((a.value = t.document.documentElement.clientWidth),
              (l.value = t.document.documentElement.clientHeight));
    };
  (c(), Td(c));
  const u = { passive: !0 };
  if (
    ($d("resize", c, u),
    t && "visual" === i && t.visualViewport && $d(t.visualViewport, "resize", c, u),
    r)
  ) {
    Co(Gd("(orientation: portrait)"), () => c());
  }
  return { width: a, height: l };
}
const pp = {
  // composer module errors
  UNEXPECTED_RETURN_TYPE: A,
  // 24
  // legacy module errors
  INVALID_ARGUMENT: 25,
  // i18n module errors
  MUST_BE_CALL_SETUP_TOP: 26,
  NOT_INSTALLED: 27,
  // directive module errors
  REQUIRED_VALUE: 28,
  INVALID_VALUE: 29,
  NOT_INSTALLED_WITH_PROVIDE: 31,
  // unexpected error
  UNEXPECTED_ERROR: 32,
  // Not available Compostion API in Legacy API mode. Please make sure that the legacy API mode is working properly
  NOT_AVAILABLE_COMPOSITION_IN_LEGACY: 34,
};
function hp(e, ...t) {
  return c(e, null, void 0);
}
const mp = u("__translateVNode"),
  gp = u("__datetimeParts"),
  vp = u("__numberParts"),
  _p = u("__setPluralRules"),
  yp = u("__injectWithOption"),
  bp = u("__dispose");
function wp(e) {
  if (!g(e)) return e;
  if (b(e)) return e;
  for (const t in e)
    if (h(e, t))
      if (t.includes(".")) {
        const n = t.split("."),
          o = n.length - 1;
        let r = e,
          s = !1;
        for (let e = 0; e < o; e++) {
          if ("__proto__" === n[e]) throw new Error(`unsafe key: ${n[e]}`);
          if ((n[e] in r || (r[n[e]] = d()), !g(r[n[e]]))) {
            s = !0;
            break;
          }
          r = r[n[e]];
        }
        if (
          (s || (b(r) ? w.includes(n[o]) || delete e[t] : ((r[n[o]] = e[t]), delete e[t])), !b(r))
        ) {
          const e = r[n[o]];
          g(e) && wp(e);
        }
      } else g(e[t]) && wp(e[t]);
  return e;
}
function Ep(e, o) {
  const { messages: s, __i18n: i, messageResolver: a, flatJson: l } = o,
    c = t(s) ? s : r(i) ? d() : { [e]: d() };
  if (
    (r(i) &&
      i.forEach((e) => {
        if ("locale" in e && "resource" in e) {
          const { locale: t, resource: n } = e;
          t ? ((c[t] = c[t] || d()), p(n, c[t])) : p(n, c);
        } else n(e) && p(JSON.parse(e), c);
      }),
    null == a && l)
  )
    for (const t in c) h(c, t) && wp(c[t]);
  return c;
}
function Sp(e) {
  return e.type;
}
function kp(e, t, n) {
  let o = g(t.messages) ? t.messages : d();
  "__i18nGlobal" in n && (o = Ep(e.locale.value, { messages: o, __i18n: n.__i18nGlobal }));
  const r = Object.keys(o);
  if (
    (r.length &&
      r.forEach((t) => {
        e.mergeLocaleMessage(t, o[t]);
      }),
    g(t.datetimeFormats))
  ) {
    const n = Object.keys(t.datetimeFormats);
    n.length &&
      n.forEach((n) => {
        e.mergeDateTimeFormat(n, t.datetimeFormats[n]);
      });
  }
  if (g(t.numberFormats)) {
    const n = Object.keys(t.numberFormats);
    n.length &&
      n.forEach((n) => {
        e.mergeNumberFormat(n, t.numberFormats[n]);
      });
  }
}
function xp(e) {
  return ji(wi, null, e, 0);
}
function Op() {
  return Zi();
}
const Tp = "__INTLIFY_META__",
  Ap = () => [],
  Cp = () => !1;
let Rp = 0;
function Ip(e) {
  return (t, n, o, r) => e(n, o, Op() || void 0, r);
}
const Np = /* @__NO_SIDE_EFFECTS__ */ () => {
  const e = Op();
  let t = null;
  return e && (t = Sp(e)[Tp]) ? { [Tp]: t } : null;
};
function Pp(c = {}) {
  const { __root: u, __injectWithOption: d } = c,
    w = void 0 === u,
    O = c.flatJson,
    A = l ? kn : xn;
  let D = !e(c.inheritLocale) || c.inheritLocale;
  const j = A(
      // prettier-ignore
      u&&D?u.locale.value:n(c.locale)?c.locale:o
    ),
    $ = A(
      // prettier-ignore
      u&&D?u.fallbackLocale.value:n(c.fallbackLocale)||r(c.fallbackLocale)||t(c.fallbackLocale)||!1===c.fallbackLocale?c.fallbackLocale:j.value
    ),
    V = A(Ep(j.value, c)),
    U = A(t(c.datetimeFormats) ? c.datetimeFormats : { [j.value]: {} }),
    B = A(t(c.numberFormats) ? c.numberFormats : { [j.value]: {} });
  let H = u ? u.missingWarn : (!e(c.missingWarn) && !s(c.missingWarn)) || c.missingWarn,
    W = u ? u.fallbackWarn : (!e(c.fallbackWarn) && !s(c.fallbackWarn)) || c.fallbackWarn,
    z = u ? u.fallbackRoot : !e(c.fallbackRoot) || c.fallbackRoot,
    G = !!c.fallbackFormat,
    q = i(c.missing) ? c.missing : null,
    Y = i(c.missing) ? Ip(c.missing) : null,
    K = i(c.postTranslation) ? c.postTranslation : null,
    J = u ? u.warnHtmlMessage : !e(c.warnHtmlMessage) || c.warnHtmlMessage,
    Q = !!c.escapeParameter;
  const X = u ? u.modifiers : t(c.modifiers) ? c.modifiers : {};
  let Z,
    ee = c.pluralRules || (u && u.pluralRules);
  ((Z = (() => {
    w && T(null);
    const e = {
      version: "11.4.2",
      locale: j.value,
      fallbackLocale: $.value,
      messages: V.value,
      modifiers: X,
      pluralRules: ee,
      missing: null === Y ? void 0 : Y,
      missingWarn: H,
      fallbackWarn: W,
      fallbackFormat: G,
      unresolving: !0,
      postTranslation: null === K ? void 0 : K,
      warnHtmlMessage: J,
      escapeParameter: Q,
      messageResolver: c.messageResolver,
      messageCompiler: c.messageCompiler,
      __meta: { framework: "vue" },
    };
    ((e.datetimeFormats = U.value),
      (e.numberFormats = B.value),
      (e.__datetimeFormatters = t(Z) ? Z.__datetimeFormatters : void 0),
      (e.__numberFormatters = t(Z) ? Z.__numberFormatters : void 0));
    const n = m(e);
    return (w && T(n), n);
  })()),
    a(Z, j.value, $.value));
  const te = ma({
      get: () => j.value,
      set: (e) => {
        ((Z.locale = e), (j.value = e));
      },
    }),
    ne = ma({
      get: () => $.value,
      set: (e) => {
        ((Z.fallbackLocale = e), ($.value = e), a(Z, j.value, e));
      },
    }),
    oe = ma(() => V.value),
    re = ma(() => U.value),
    se = ma(() => B.value);
  const ie = (e, t, n, o, r, s) => {
    let i;
    (j.value, $.value, V.value, U.value, B.value);
    try {
      (__INTLIFY_PROD_DEVTOOLS__ && E(Np()),
        w || (Z.fallbackContext = u ? S() : void 0),
        (i = e(Z)));
    } finally {
      (__INTLIFY_PROD_DEVTOOLS__, w || (Z.fallbackContext = void 0));
    }
    if (
      ("translate exists" !== n && // for not `te` (e.g `t`)
        y(i) &&
        i === k) ||
      ("translate exists" === n && !i)
    ) {
      const [e, n] = t();
      return u && z ? o(u) : r(e);
    }
    if (s(i)) return i;
    throw hp(pp.UNEXPECTED_RETURN_TYPE);
  };
  function ae(...e) {
    return ie(
      (t) => Reflect.apply(R, null, [t, ...e]),
      () => C(...e),
      "translate",
      (t) => Reflect.apply(t.t, t, [...e]),
      (e) => e,
      (e) => n(e)
    );
  }
  const le = {
    normalize: function (t) {
      return t.map((t) => (n(t) || y(t) || e(t) ? xp(String(t)) : t));
    },
    interpolate: (e) => e,
    type: "vnode",
  };
  function ce(e) {
    return V.value[e] || {};
  }
  (Rp++,
    u &&
      l &&
      (Co(u.locale, (e) => {
        D && ((j.value = e), (Z.locale = e), a(Z, j.value, $.value));
      }),
      Co(u.fallbackLocale, (e) => {
        D && (($.value = e), (Z.fallbackLocale = e), a(Z, j.value, $.value));
      })));
  const ue = {
    id: Rp,
    locale: te,
    fallbackLocale: ne,
    get inheritLocale() {
      return D;
    },
    set inheritLocale(e) {
      ((D = e),
        e &&
          u &&
          ((j.value = u.locale.value), ($.value = u.fallbackLocale.value), a(Z, j.value, $.value)));
    },
    get availableLocales() {
      return Object.keys(V.value).sort();
    },
    messages: oe,
    get modifiers() {
      return X;
    },
    get pluralRules() {
      return ee || {};
    },
    get isGlobal() {
      return w;
    },
    get missingWarn() {
      return H;
    },
    set missingWarn(e) {
      ((H = e), (Z.missingWarn = H));
    },
    get fallbackWarn() {
      return W;
    },
    set fallbackWarn(e) {
      ((W = e), (Z.fallbackWarn = W));
    },
    get fallbackRoot() {
      return z;
    },
    set fallbackRoot(e) {
      z = e;
    },
    get fallbackFormat() {
      return G;
    },
    set fallbackFormat(e) {
      ((G = e), (Z.fallbackFormat = G));
    },
    get warnHtmlMessage() {
      return J;
    },
    set warnHtmlMessage(e) {
      ((J = e), (Z.warnHtmlMessage = e));
    },
    get escapeParameter() {
      return Q;
    },
    set escapeParameter(e) {
      ((Q = e), (Z.escapeParameter = e));
    },
    t: ae,
    getLocaleMessage: ce,
    setLocaleMessage: function (e, t) {
      if (O) {
        const n = { [e]: t };
        for (const e in n) h(n, e) && wp(n[e]);
        t = n[e];
      }
      ((V.value[e] = t), (Z.messages = V.value));
    },
    mergeLocaleMessage: function (e, t) {
      V.value[e] = V.value[e] || {};
      const n = { [e]: t };
      if (O) for (const o in n) h(n, o) && wp(n[o]);
      (p((t = n[e]), V.value[e]), (Z.messages = V.value));
    },
    getPostTranslationHandler: function () {
      return i(K) ? K : null;
    },
    setPostTranslationHandler: function (e) {
      ((K = e), (Z.postTranslation = e));
    },
    getMissingHandler: function () {
      return q;
    },
    setMissingHandler: function (e) {
      (null !== e && (Y = Ip(e)), (q = e), (Z.missing = Y));
    },
    [_p]: function (e) {
      ((ee = e), (Z.pluralRules = ee));
    },
  };
  return (
    (ue.datetimeFormats = re),
    (ue.numberFormats = se),
    (ue.rt = function (...e) {
      const [t, n, o] = e;
      if (o && !g(o)) throw hp(pp.INVALID_ARGUMENT);
      return ae(t, n, f({ resolvedMessage: !0 }, o || {}));
    }),
    (ue.te = function (t, o) {
      return ie(
        () => {
          if (!t) return !1;
          const e = n(o) ? o : j.value,
            r = n(o) ? [e] : x(Z, $.value, e);
          for (let o = 0; o < r.length; o++) {
            const e = ce(r[o]);
            let s = Z.messageResolver(e, t);
            if ((null === s && (s = e[t]), b(s) || M(s) || n(s))) return !0;
          }
          return !1;
        },
        () => [t],
        "translate exists",
        (e) => Reflect.apply(e.te, e, [t, o]),
        Cp,
        (t) => e(t)
      );
    }),
    (ue.tm = function (e) {
      const t = (function (e) {
        let t = null;
        const n = x(Z, $.value, j.value);
        for (let o = 0; o < n.length; o++) {
          const r = V.value[n[o]] || {},
            s = Z.messageResolver(r, e);
          if (null != s) {
            t = s;
            break;
          }
        }
        return t;
      })(e);
      return null != t ? t : (u && u.tm(e)) || {};
    }),
    (ue.d = function (...e) {
      return ie(
        (t) => Reflect.apply(P, null, [t, ...e]),
        () => N(...e),
        "datetime format",
        (t) => Reflect.apply(t.d, t, [...e]),
        () => I,
        (e) => n(e) || r(e)
      );
    }),
    (ue.n = function (...e) {
      return ie(
        (t) => Reflect.apply(L, null, [t, ...e]),
        () => F(...e),
        "number format",
        (t) => Reflect.apply(t.n, t, [...e]),
        () => I,
        (e) => n(e) || r(e)
      );
    }),
    (ue.getDateTimeFormat = function (e) {
      return U.value[e] || {};
    }),
    (ue.setDateTimeFormat = function (e, t) {
      ((U.value[e] = t), (Z.datetimeFormats = U.value), v(Z, e, t));
    }),
    (ue.mergeDateTimeFormat = function (e, t) {
      ((U.value[e] = f(U.value[e] || {}, t)), (Z.datetimeFormats = U.value), v(Z, e, t));
    }),
    (ue.getNumberFormat = function (e) {
      return B.value[e] || {};
    }),
    (ue.setNumberFormat = function (e, t) {
      ((B.value[e] = t), (Z.numberFormats = B.value), _(Z, e, t));
    }),
    (ue.mergeNumberFormat = function (e, t) {
      ((B.value[e] = f(B.value[e] || {}, t)), (Z.numberFormats = B.value), _(Z, e, t));
    }),
    (ue[yp] = d),
    (ue[mp] = function (...e) {
      return ie(
        (t) => {
          let n;
          const o = t;
          try {
            ((o.processor = le), (n = Reflect.apply(R, null, [o, ...e])));
          } finally {
            o.processor = null;
          }
          return n;
        },
        () => C(...e),
        "translate",
        (t) => t[mp](...e),
        (e) => [xp(e)],
        (e) => r(e)
      );
    }),
    (ue[gp] = function (...e) {
      return ie(
        (t) => Reflect.apply(P, null, [t, ...e]),
        () => N(...e),
        "datetime format",
        (t) => t[gp](...e),
        Ap,
        (e) => n(e) || r(e)
      );
    }),
    (ue[vp] = function (...e) {
      return ie(
        (t) => Reflect.apply(L, null, [t, ...e]),
        () => F(...e),
        "number format",
        (t) => t[vp](...e),
        Ap,
        (e) => n(e) || r(e)
      );
    }),
    ue
  );
}
function Fp(a = {}) {
  const l = Pp(
      (function (a) {
        const l = n(a.locale) ? a.locale : o,
          c =
            n(a.fallbackLocale) ||
            r(a.fallbackLocale) ||
            t(a.fallbackLocale) ||
            !1 === a.fallbackLocale
              ? a.fallbackLocale
              : l,
          u = i(a.missing) ? a.missing : void 0,
          d =
            (!e(a.silentTranslationWarn) && !s(a.silentTranslationWarn)) ||
            !a.silentTranslationWarn,
          p = (!e(a.silentFallbackWarn) && !s(a.silentFallbackWarn)) || !a.silentFallbackWarn,
          h = !e(a.fallbackRoot) || a.fallbackRoot,
          m = !!a.formatFallbackMessages,
          g = t(a.modifiers) ? a.modifiers : {},
          v = a.pluralizationRules,
          _ = i(a.postTranslation) ? a.postTranslation : void 0,
          y = !n(a.warnHtmlInMessage) || "off" !== a.warnHtmlInMessage,
          b = !!a.escapeParameterHtml,
          w = !e(a.sync) || a.sync;
        let E = a.messages;
        if (t(a.sharedMessages)) {
          const e = a.sharedMessages;
          E = Object.keys(e).reduce((t, n) => {
            const o = t[n] || (t[n] = {});
            return (f(o, e[n]), t);
          }, E || {});
        }
        const { __i18n: S, __root: k, __injectWithOption: x } = a,
          O = a.datetimeFormats,
          T = a.numberFormats;
        return {
          locale: l,
          fallbackLocale: c,
          messages: E,
          flatJson: a.flatJson,
          datetimeFormats: O,
          numberFormats: T,
          missing: u,
          missingWarn: d,
          fallbackWarn: p,
          fallbackRoot: h,
          fallbackFormat: m,
          modifiers: g,
          pluralRules: v,
          postTranslation: _,
          warnHtmlMessage: y,
          escapeParameter: b,
          messageResolver: a.messageResolver,
          inheritLocale: w,
          __i18n: S,
          __root: k,
          __injectWithOption: x,
        };
      })(a)
    ),
    { __extender: c } = a,
    u = {
      // id
      id: l.id,
      // locale
      get locale() {
        return l.locale.value;
      },
      set locale(e) {
        l.locale.value = e;
      },
      // fallbackLocale
      get fallbackLocale() {
        return l.fallbackLocale.value;
      },
      set fallbackLocale(e) {
        l.fallbackLocale.value = e;
      },
      // messages
      get messages() {
        return l.messages.value;
      },
      // datetimeFormats
      get datetimeFormats() {
        return l.datetimeFormats.value;
      },
      // numberFormats
      get numberFormats() {
        return l.numberFormats.value;
      },
      // availableLocales
      get availableLocales() {
        return l.availableLocales;
      },
      // missing
      get missing() {
        return l.getMissingHandler();
      },
      set missing(e) {
        l.setMissingHandler(e);
      },
      // silentTranslationWarn
      get silentTranslationWarn() {
        return e(l.missingWarn) ? !l.missingWarn : l.missingWarn;
      },
      set silentTranslationWarn(t) {
        l.missingWarn = e(t) ? !t : t;
      },
      // silentFallbackWarn
      get silentFallbackWarn() {
        return e(l.fallbackWarn) ? !l.fallbackWarn : l.fallbackWarn;
      },
      set silentFallbackWarn(t) {
        l.fallbackWarn = e(t) ? !t : t;
      },
      // modifiers
      get modifiers() {
        return l.modifiers;
      },
      // formatFallbackMessages
      get formatFallbackMessages() {
        return l.fallbackFormat;
      },
      set formatFallbackMessages(e) {
        l.fallbackFormat = e;
      },
      // postTranslation
      get postTranslation() {
        return l.getPostTranslationHandler();
      },
      set postTranslation(e) {
        l.setPostTranslationHandler(e);
      },
      // sync
      get sync() {
        return l.inheritLocale;
      },
      set sync(e) {
        l.inheritLocale = e;
      },
      // warnInHtmlMessage
      get warnHtmlInMessage() {
        return l.warnHtmlMessage ? "warn" : "off";
      },
      set warnHtmlInMessage(e) {
        l.warnHtmlMessage = "off" !== e;
      },
      // escapeParameterHtml
      get escapeParameterHtml() {
        return l.escapeParameter;
      },
      set escapeParameterHtml(e) {
        l.escapeParameter = e;
      },
      // pluralizationRules
      get pluralizationRules() {
        return l.pluralRules || {};
      },
      // for internal
      __composer: l,
      // t
      t: (...e) => Reflect.apply(l.t, l, [...e]),
      // rt
      rt: (...e) => Reflect.apply(l.rt, l, [...e]),
      // te
      te: (e, t) => l.te(e, t),
      // tm
      tm: (e) => l.tm(e),
      // getLocaleMessage
      getLocaleMessage: (e) => l.getLocaleMessage(e),
      // setLocaleMessage
      setLocaleMessage(e, t) {
        l.setLocaleMessage(e, t);
      },
      // mergeLocaleMessage
      mergeLocaleMessage(e, t) {
        l.mergeLocaleMessage(e, t);
      },
      // d
      d: (...e) => Reflect.apply(l.d, l, [...e]),
      // getDateTimeFormat
      getDateTimeFormat: (e) => l.getDateTimeFormat(e),
      // setDateTimeFormat
      setDateTimeFormat(e, t) {
        l.setDateTimeFormat(e, t);
      },
      // mergeDateTimeFormat
      mergeDateTimeFormat(e, t) {
        l.mergeDateTimeFormat(e, t);
      },
      // n
      n: (...e) => Reflect.apply(l.n, l, [...e]),
      // getNumberFormat
      getNumberFormat: (e) => l.getNumberFormat(e),
      // setNumberFormat
      setNumberFormat(e, t) {
        l.setNumberFormat(e, t);
      },
      // mergeNumberFormat
      mergeNumberFormat(e, t) {
        l.mergeNumberFormat(e, t);
      },
    };
  return ((u.__extender = c), u);
}
function Lp(e, t) {
  ((e.locale = t.locale || e.locale),
    (e.fallbackLocale = t.fallbackLocale || e.fallbackLocale),
    (e.missing = t.missing || e.missing),
    (e.silentTranslationWarn = t.silentTranslationWarn || e.silentFallbackWarn),
    (e.silentFallbackWarn = t.silentFallbackWarn || e.silentFallbackWarn),
    (e.formatFallbackMessages = t.formatFallbackMessages || e.formatFallbackMessages),
    (e.postTranslation = t.postTranslation || e.postTranslation),
    (e.warnHtmlInMessage = t.warnHtmlInMessage || e.warnHtmlInMessage),
    (e.escapeParameterHtml = t.escapeParameterHtml || e.escapeParameterHtml),
    (e.sync = t.sync || e.sync),
    e.__composer[_p](t.pluralizationRules || e.pluralizationRules));
  const n = Ep(e.locale, { messages: t.messages, __i18n: t.__i18n });
  return (
    Object.keys(n).forEach((t) => e.mergeLocaleMessage(t, n[t])),
    t.datetimeFormats &&
      Object.keys(t.datetimeFormats).forEach((n) => e.mergeDateTimeFormat(n, t.datetimeFormats[n])),
    t.numberFormats &&
      Object.keys(t.numberFormats).forEach((n) => e.mergeNumberFormat(n, t.numberFormats[n])),
    e
  );
}
const Mp = {
  tag: { type: [String, Object] },
  locale: { type: String },
  scope: {
    type: String,
    // NOTE: avoid https://github.com/microsoft/rushstack/issues/1050
    validator: (e) => "parent" === e || "global" === e,
    default: "parent",
    /* ComponentI18nScope */
  },
  i18n: { type: Object },
};
function Dp() {
  return bi;
}
const jp = rr({
  /* eslint-disable */
  name: "i18n-t",
  props: f(
    {
      keypath: { type: String, required: !0 },
      plural: { type: [Number, String], validator: (e) => y(e) || !isNaN(e) },
    },
    Mp
  ),
  /* eslint-enable */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(e, t) {
    const { slots: o, attrs: r } = t,
      s = e.i18n || Gp({ useScope: e.scope, __useComponent: !0 });
    return () => {
      const i = () => {
          const r = Object.keys(o).filter((e) => "_" !== e[0]),
            i = d();
          (e.locale && (i.locale = e.locale),
            void 0 !== e.plural && (i.plural = n(e.plural) ? +e.plural : e.plural));
          const a = (function ({ slots: e }, t) {
            if (1 === t.length && "default" === t[0])
              return (e.default ? e.default() : []).reduce(
                (e, t) => [
                  ...e,
                  // prettier-ignore
                  ...t.type===bi?t.children:[t],
                ],
                []
              );
            return t.reduce((t, n) => {
              const o = e[n];
              return (o && (t[n] = o()), t);
            }, d());
          })(t, r);
          return s[mp](e.keypath, a, i);
        },
        a = f(d(), r),
        l = n(e.tag) || g(e.tag) ? e.tag : Dp();
      return g(l) ? ga(l, a, { default: i }) : ga(l, a, i());
    };
  },
});
function $p(e, t, o, s) {
  const { slots: i, attrs: a } = t;
  return () => {
    const t = () => {
        const t = { part: !0 };
        let a = d();
        (e.locale && (t.locale = e.locale),
          n(e.format)
            ? (t.key = e.format)
            : g(e.format) &&
              (n(e.format.key) && (t.key = e.format.key),
              (a = Object.keys(e.format).reduce(
                (t, n) => (o.includes(n) ? f(d(), t, { [n]: e.format[n] }) : t),
                d()
              ))));
        const l = s(e.value, t, a);
        let c = [t.key];
        return (
          r(l)
            ? (c = l.map((e, t) => {
                const o = i[e.type],
                  s = o ? o({ [e.type]: e.value, index: t, parts: l }) : [e.value];
                var a;
                return (r((a = s)) && !n(a[0]) && (s[0].key = `${e.type}-${t}`), s);
              }))
            : n(l) && (c = [l]),
          c
        );
      },
      l = f(d(), a),
      c = n(e.tag) || g(e.tag) ? e.tag : Dp();
    return g(c) ? ga(c, l, { default: t }) : ga(c, l, t());
  };
}
const Vp = rr({
  /* eslint-disable */
  name: "i18n-n",
  props: f({ value: { type: Number, required: !0 }, format: { type: [String, Object] } }, Mp),
  /* eslint-enable */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(e, t) {
    const n = e.i18n || Gp({ useScope: e.scope, __useComponent: !0 });
    return $p(e, t, B, (...e) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      n[vp](...e)
    );
  },
});
function Up(e) {
  if (n(e)) return { path: e };
  if (t(e)) {
    if (!("path" in e)) throw hp(pp.REQUIRED_VALUE);
    return e;
  }
  throw hp(pp.INVALID_VALUE);
}
function Bp(e) {
  const { path: t, locale: o, args: r, choice: s, plural: i } = e,
    a = {},
    l = r || {};
  return (n(o) && (a.locale = o), y(s) && (a.plural = s), y(i) && (a.plural = i), [t, l, a]);
}
function Hp(n, o, ...r) {
  const s = t(r[0]) ? r[0] : {};
  ((!e(s.globalInstall) || s.globalInstall) &&
    ([jp.name, "I18nT"].forEach((e) => n.component(e, jp)),
    [Vp.name, "I18nN"].forEach((e) => n.component(e, Vp)),
    [Jp.name, "I18nD"].forEach((e) => n.component(e, Jp))),
    n.directive(
      "t",
      (function (e) {
        const t = (t) => {
          const { instance: n, value: o } = t;
          if (!n || !n.$) throw hp(pp.UNEXPECTED_ERROR);
          const r = (function (e, t) {
              const n = e;
              if ("composition" === e.mode) return n.__getInstance(t) || e.global;
              {
                const o = n.__getInstance(t);
                return null != o ? o.__composer : e.global.__composer;
              }
            })(e, n.$),
            s = Up(o);
          return [Reflect.apply(r.t, r, [...Bp(s)]), r];
        };
        return {
          created: (e, n) => {
            const [o, r] = t(n);
            (l &&
              (e.__i18nWatcher = Co(r.locale, () => {
                n.instance && n.instance.$forceUpdate();
              })),
              (e.__composer = r),
              (e.textContent = o));
          },
          unmounted: (e) => {
            (l &&
              e.__i18nWatcher &&
              (e.__i18nWatcher(), (e.__i18nWatcher = void 0), delete e.__i18nWatcher),
              e.__composer && ((e.__composer = void 0), delete e.__composer));
          },
          beforeUpdate: (e, { value: t }) => {
            if (e.__composer) {
              const n = e.__composer,
                o = Up(t);
              e.textContent = Reflect.apply(n.t, n, [...Bp(o)]);
            }
          },
          getSSRProps: (e) => {
            const [n] = t(e);
            return { textContent: n };
          },
        };
      })(o)
    ));
}
const Wp = u("global-vue-i18n");
function zp(n = {}) {
  const o = __VUE_I18N_LEGACY_API__ && e(n.legacy) ? n.legacy : __VUE_I18N_LEGACY_API__,
    r = !e(n.globalInjection) || n.globalInjection,
    s = new Map(),
    [i, a] = (function (e, t) {
      const n = Qe(),
        o = __VUE_I18N_LEGACY_API__ && t ? n.run(() => Fp(e)) : n.run(() => Pp(e));
      if (null == o) throw hp(pp.UNEXPECTED_ERROR);
      return [n, o];
    })(n, o),
    l = u("");
  const c = {
    // mode
    get mode() {
      return __VUE_I18N_LEGACY_API__ && o ? "legacy" : "composition";
    },
    // install plugin
    async install(e, ...n) {
      if (((e.__VUE_I18N_SYMBOL__ = l), e.provide(e.__VUE_I18N_SYMBOL__, c), t(n[0]))) {
        const e = n[0];
        ((c.__composerExtend = e.__composerExtend), (c.__vueI18nExtend = e.__vueI18nExtend));
      }
      let s = null;
      (!o &&
        r &&
        (s = (function (e, t) {
          const n = Object.create(null);
          (Yp.forEach((e) => {
            const o = Object.getOwnPropertyDescriptor(t, e);
            if (!o) throw hp(pp.UNEXPECTED_ERROR);
            const r = Sn(o.value)
              ? {
                  get: () => o.value.value,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  set(e) {
                    o.value.value = e;
                  },
                }
              : { get: () => o.get && o.get() };
            Object.defineProperty(n, e, r);
          }),
            (e.config.globalProperties.$i18n = n),
            Kp.forEach((n) => {
              const o = Object.getOwnPropertyDescriptor(t, n);
              if (!o || !o.value) throw hp(pp.UNEXPECTED_ERROR);
              Object.defineProperty(e.config.globalProperties, `$${n}`, o);
            }));
          const o = () => {
            (delete e.config.globalProperties.$i18n,
              Kp.forEach((t) => {
                delete e.config.globalProperties[`$${t}`];
              }));
          };
          return o;
        })(e, c.global)),
        __VUE_I18N_FULL_INSTALL__ && Hp(e, c, ...n),
        __VUE_I18N_LEGACY_API__ &&
          o &&
          e.mixin(
            (function (e, t, n) {
              return {
                beforeCreate() {
                  const o = Op();
                  if (!o) throw hp(pp.UNEXPECTED_ERROR);
                  const r = this.$options;
                  if (r.i18n) {
                    const o = r.i18n;
                    if ((r.__i18n && (o.__i18n = r.__i18n), (o.__root = t), this === this.$root))
                      this.$i18n = Lp(e, o);
                    else {
                      ((o.__injectWithOption = !0),
                        (o.__extender = n.__vueI18nExtend),
                        (this.$i18n = Fp(o)));
                      const e = this.$i18n;
                      e.__extender && (e.__disposer = e.__extender(this.$i18n));
                    }
                  } else if (r.__i18n)
                    if (this === this.$root) this.$i18n = Lp(e, r);
                    else {
                      this.$i18n = Fp({
                        __i18n: r.__i18n,
                        __injectWithOption: !0,
                        __extender: n.__vueI18nExtend,
                        __root: t,
                      });
                      const e = this.$i18n;
                      e.__extender && (e.__disposer = e.__extender(this.$i18n));
                    }
                  else this.$i18n = e;
                  (r.__i18nGlobal && kp(t, r, r),
                    (this.$t = (...e) => this.$i18n.t(...e)),
                    (this.$rt = (...e) => this.$i18n.rt(...e)),
                    (this.$te = (e, t) => this.$i18n.te(e, t)),
                    (this.$d = (...e) => this.$i18n.d(...e)),
                    (this.$n = (...e) => this.$i18n.n(...e)),
                    (this.$tm = (e) => this.$i18n.tm(e)),
                    n.__setInstance(o, this.$i18n));
                },
                mounted() {},
                unmounted() {
                  const e = Op();
                  if (!e) throw hp(pp.UNEXPECTED_ERROR);
                  const t = this.$i18n;
                  (delete this.$t,
                    delete this.$rt,
                    delete this.$te,
                    delete this.$d,
                    delete this.$n,
                    delete this.$tm,
                    t.__disposer && (t.__disposer(), delete t.__disposer, delete t.__extender),
                    n.__deleteInstance(e),
                    delete this.$i18n);
                },
              };
            })(a, a.__composer, c)
          ));
      const i = e.unmount;
      e.unmount = () => {
        (s && s(), c.dispose(), i());
      };
    },
    // global accessor
    get global() {
      return a;
    },
    dispose() {
      i.stop();
    },
    // @internal
    __instances: s,
    // @internal
    __getInstance: function (e) {
      return s.get(e) || null;
    },
    // @internal
    __setInstance: function (e, t) {
      s.set(e, t);
    },
    // @internal
    __deleteInstance: function (e) {
      s.delete(e);
    },
  };
  return c;
}
function Gp(e = {}) {
  const t = Op();
  if (null == t) throw hp(pp.MUST_BE_CALL_SETUP_TOP);
  if (!t.isCE && null != t.appContext.app && !t.appContext.app.__VUE_I18N_SYMBOL__)
    throw hp(pp.NOT_INSTALLED);
  const n = (function (e) {
      const t = So(e.isCE ? Wp : e.appContext.app.__VUE_I18N_SYMBOL__);
      if (!t) throw hp(e.isCE ? pp.NOT_INSTALLED_WITH_PROVIDE : pp.UNEXPECTED_ERROR);
      return t;
    })(t),
    o = (function (e) {
      return "composition" === e.mode ? e.global : e.global.__composer;
    })(n),
    r = Sp(t),
    s = (function (e, t) {
      return O(e) ? ("__i18n" in t ? "local" : "global") : e.useScope ? e.useScope : "local";
    })(e, r);
  if ("global" === s) return (kp(o, e, r), o);
  if ("parent" === s) {
    let r = qp(n, t, e.__useComponent);
    return (null == r && (r = o), r);
  }
  if ("isolated" === s) {
    if ("composition" !== n.mode) throw hp(pp.NOT_AVAILABLE_COMPOSITION_IN_LEGACY);
    const r = n,
      s = f({}, e),
      i = qp(n, t);
    s.__root = i || o;
    const a = Pp(s);
    r.__composerExtend && (a[bp] = r.__composerExtend(a));
    return (
      Xe() &&
        Ze(() => {
          const e = a[bp];
          e && (e(), delete a[bp]);
        }),
      a
    );
  }
  const i = n;
  let a = i.__getInstance(t);
  if (null == a) {
    const n = f({}, e);
    ("__i18n" in r && (n.__i18n = r.__i18n),
      o && (n.__root = o),
      (a = Pp(n)),
      i.__composerExtend && (a[bp] = i.__composerExtend(a)),
      (function (e, t, n) {
        (Mr(() => {}, t),
          Vr(() => {
            const o = n;
            e.__deleteInstance(t);
            const r = o[bp];
            r && (r(), delete o[bp]);
          }, t));
      })(i, t, a),
      i.__setInstance(t, a));
  }
  return a;
}
function qp(e, t, n = !1) {
  let o = null;
  const r = t.root;
  let s = (function (e, t = !1) {
    if (null == e) return null;
    return (t && e.vnode.ctx) || e.parent;
  })(t, n);
  for (; null != s; ) {
    const t = e;
    if ("composition" === e.mode) o = t.__getInstance(s);
    else if (__VUE_I18N_LEGACY_API__) {
      const e = t.__getInstance(s);
      null != e && ((o = e.__composer), n && o && !o[yp] && (o = null));
    }
    if (null != o) break;
    if (r === s) break;
    s = s.parent;
  }
  return o;
}
const Yp = ["locale", "fallbackLocale", "availableLocales"],
  Kp = ["t", "rt", "d", "n", "tm", "te"];
const Jp = rr({
  /* eslint-disable */
  name: "i18n-d",
  props: f(
    { value: { type: [Number, Date], required: !0 }, format: { type: [String, Object] } },
    Mp
  ),
  /* eslint-enable */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(e, t) {
    const n = e.i18n || Gp({ useScope: e.scope, __useComponent: !0 });
    return $p(e, t, H, (...e) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      n[gp](...e)
    );
  },
});
if (
  ("boolean" != typeof __VUE_I18N_FULL_INSTALL__ && (V().__VUE_I18N_FULL_INSTALL__ = !0),
  "boolean" != typeof __VUE_I18N_LEGACY_API__ && (V().__VUE_I18N_LEGACY_API__ = !0),
  "boolean" != typeof __INTLIFY_DROP_MESSAGE_COMPILER__ &&
    (V().__INTLIFY_DROP_MESSAGE_COMPILER__ = !1),
  "boolean" != typeof __INTLIFY_PROD_DEVTOOLS__ && (V().__INTLIFY_PROD_DEVTOOLS__ = !1),
  D(W),
  j(z),
  $(x),
  __INTLIFY_PROD_DEVTOOLS__)
) {
  const e = V();
  ((e.__INTLIFY__ = !0), U(e.__INTLIFY_DEVTOOLS_GLOBAL_HOOK__));
}
const Qp = /^[a-z0-9]+(-[a-z0-9]+)*$/,
  Xp = (e, t, n, o = "") => {
    const r = e.split(":");
    if ("@" === e.slice(0, 1)) {
      if (r.length < 2 || r.length > 3) return null;
      o = r.shift().slice(1);
    }
    if (r.length > 3 || !r.length) return null;
    if (r.length > 1) {
      const e = r.pop(),
        n = r.pop(),
        s = { provider: r.length > 0 ? r[0] : o, prefix: n, name: e };
      return t && !Zp(s) ? null : s;
    }
    const s = r[0],
      i = s.split("-");
    if (i.length > 1) {
      const e = { provider: o, prefix: i.shift(), name: i.join("-") };
      return t && !Zp(e) ? null : e;
    }
    if (n && "" === o) {
      const e = { provider: o, prefix: "", name: s };
      return t && !Zp(e, n) ? null : e;
    }
    return null;
  },
  Zp = (e, t) => !!e && !(!((t && "" === e.prefix) || e.prefix) || !e.name);
const eh = Object.freeze({ left: 0, top: 0, width: 16, height: 16 }),
  th = Object.freeze({ rotate: 0, vFlip: !1, hFlip: !1 }),
  nh = Object.freeze({ ...eh, ...th }),
  oh = Object.freeze({ ...nh, body: "", hidden: !1 });
function rh(e, t) {
  const n = (function (e, t) {
    const n = {};
    (!e.hFlip != !t.hFlip && (n.hFlip = !0), !e.vFlip != !t.vFlip && (n.vFlip = !0));
    const o = ((e.rotate || 0) + (t.rotate || 0)) % 4;
    return (o && (n.rotate = o), n);
  })(e, t);
  for (const o in oh)
    o in th
      ? o in e && !(o in n) && (n[o] = th[o])
      : o in t
        ? (n[o] = t[o])
        : o in e && (n[o] = e[o]);
  return n;
}
function sh(e, t, n) {
  const o = e.icons,
    r = e.aliases || Object.create(null);
  let s = {};
  function i(e) {
    s = rh(o[e] || r[e], s);
  }
  return (i(t), n.forEach(i), rh(e, s));
}
function ih(e, t) {
  const n = [];
  if ("object" != typeof e || "object" != typeof e.icons) return n;
  e.not_found instanceof Array &&
    e.not_found.forEach((e) => {
      (t(e, null), n.push(e));
    });
  const o = (function (e) {
    const t = e.icons,
      n = e.aliases || Object.create(null),
      o = Object.create(null);
    return (
      Object.keys(t)
        .concat(Object.keys(n))
        .forEach(function e(r) {
          if (t[r]) return (o[r] = []);
          if (!(r in o)) {
            o[r] = null;
            const t = n[r] && n[r].parent,
              s = t && e(t);
            s && (o[r] = [t].concat(s));
          }
          return o[r];
        }),
      o
    );
  })(e);
  for (const r in o) {
    const s = o[r];
    s && (t(r, sh(e, r, s)), n.push(r));
  }
  return n;
}
const ah = { provider: "", aliases: {}, not_found: {}, ...eh };
function lh(e, t) {
  for (const n in t) if (n in e && typeof e[n] != typeof t[n]) return !1;
  return !0;
}
function ch(e) {
  if ("object" != typeof e || null === e) return null;
  const t = e;
  if ("string" != typeof t.prefix || !e.icons || "object" != typeof e.icons) return null;
  if (!lh(e, ah)) return null;
  const n = t.icons;
  for (const r in n) {
    const e = n[r];
    if (!r || "string" != typeof e.body || !lh(e, oh)) return null;
  }
  const o = t.aliases || Object.create(null);
  for (const r in o) {
    const e = o[r],
      t = e.parent;
    if (!r || "string" != typeof t || (!n[t] && !o[t]) || !lh(e, oh)) return null;
  }
  return t;
}
const uh = Object.create(null);
function fh(e, t) {
  const n = uh[e] || (uh[e] = Object.create(null));
  return (
    n[t] ||
    (n[t] = (function (e, t) {
      return { provider: e, prefix: t, icons: Object.create(null), missing: new Set() };
    })(e, t))
  );
}
function dh(e, t) {
  return ch(t)
    ? ih(t, (t, n) => {
        n ? (e.icons[t] = n) : e.missing.add(t);
      })
    : [];
}
let ph = !1;
function hh(e) {
  return ("boolean" == typeof e && (ph = e), ph);
}
function mh(e, t) {
  if ("object" != typeof e) return !1;
  if (("string" != typeof t && (t = e.provider || ""), ph && !t && !e.prefix)) {
    let t = !1;
    return (
      ch(e) &&
        ((e.prefix = ""),
        ih(e, (e, n) => {
          (function (e, t) {
            const n = Xp(e, !0, ph);
            if (!n) return !1;
            const o = fh(n.provider, n.prefix);
            return t
              ? (function (e, t, n) {
                  try {
                    if ("string" == typeof n.body) return ((e.icons[t] = { ...n }), !0);
                  } catch (o) {}
                  return !1;
                })(o, n.name, t)
              : (o.missing.add(n.name), !0);
          })(e, n) && (t = !0);
        })),
      t
    );
  }
  const n = e.prefix;
  return !!Zp({ prefix: n, name: "a" }) && !!dh(fh(t, n), e);
}
const gh = Object.freeze({ width: null, height: null }),
  vh = Object.freeze({ ...gh, ...th }),
  _h = /(-?[0-9.]*[0-9]+[0-9.]*)/g,
  yh = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function bh(e, t, n) {
  if (1 === t) return e;
  if (((n = n || 100), "number" == typeof e)) return Math.ceil(e * t * n) / n;
  if ("string" != typeof e) return e;
  const o = e.split(_h);
  if (null === o || !o.length) return e;
  const r = [];
  let s = o.shift(),
    i = yh.test(s);
  for (;;) {
    if (i) {
      const e = parseFloat(s);
      isNaN(e) ? r.push(s) : r.push(Math.ceil(e * t * n) / n);
    } else r.push(s);
    if (((s = o.shift()), void 0 === s)) return r.join("");
    i = !i;
  }
}
const wh = /\sid="(\S+)"/g,
  Eh = new Map();
function Sh(e) {
  const t = [];
  let n;
  for (; (n = wh.exec(e)); ) t.push(n[1]);
  if (!t.length) return e;
  const o = "suffix" + ((16777216 * Math.random()) | Date.now()).toString(16);
  return (
    t.forEach((t) => {
      const n = (function (e) {
          e = e.replace(/[0-9]+$/, "") || "a";
          const t = Eh.get(e) || 0;
          return (Eh.set(e, t + 1), t ? `${e}${t}` : e);
        })(t),
        r = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      e = e.replace(new RegExp('([#;"])(' + r + ')([")]|\\.[a-z])', "g"), "$1" + n + o + "$3");
    }),
    (e = e.replace(new RegExp(o, "g"), ""))
  );
}
const kh = Object.create(null);
function xh(e) {
  return kh[e] || kh[""];
}
function Oh(e) {
  let t;
  if ("string" == typeof e.resources) t = [e.resources];
  else if (((t = e.resources), !(t instanceof Array && t.length))) return null;
  return {
    resources: t,
    path: e.path || "/",
    maxURL: e.maxURL || 500,
    rotate: e.rotate || 750,
    timeout: e.timeout || 5e3,
    random: !0 === e.random,
    index: e.index || 0,
    dataAfterTimeout: !1 !== e.dataAfterTimeout,
  };
}
const Th = Object.create(null),
  Ah = ["https://api.simplesvg.com", "https://api.unisvg.com"],
  Ch = [];
for (; Ah.length > 0; )
  1 === Ah.length || Math.random() > 0.5 ? Ch.push(Ah.shift()) : Ch.push(Ah.pop());
function Rh(e, t) {
  const n = Oh(t);
  return null !== n && ((Th[e] = n), !0);
}
function Ih(e) {
  return Th[e];
}
Th[""] = Oh({ resources: ["https://api.iconify.design"].concat(Ch) });
let Nh = (() => {
  let e;
  try {
    if (((e = fetch), "function" == typeof e)) return e;
  } catch (t) {}
})();
const Ph = {
  prepare: (e, t, n) => {
    const o = [],
      r = (function (e, t) {
        const n = Ih(e);
        if (!n) return 0;
        let o;
        if (n.maxURL) {
          let e = 0;
          n.resources.forEach((t) => {
            e = Math.max(e, t.length);
          });
          const r = t + ".json?icons=";
          o = n.maxURL - e - n.path.length - r.length;
        } else o = 0;
        return o;
      })(e, t),
      s = "icons";
    let i = { type: s, provider: e, prefix: t, icons: [] },
      a = 0;
    return (
      n.forEach((n, l) => {
        ((a += n.length + 1),
          a >= r &&
            l > 0 &&
            (o.push(i), (i = { type: s, provider: e, prefix: t, icons: [] }), (a = n.length)),
          i.icons.push(n));
      }),
      o.push(i),
      o
    );
  },
  send: (e, t, n) => {
    if (!Nh) return void n("abort", 424);
    let o = (function (e) {
      if ("string" == typeof e) {
        const t = Ih(e);
        if (t) return t.path;
      }
      return "/";
    })(t.provider);
    switch (t.type) {
      case "icons": {
        const e = t.prefix,
          n = t.icons.join(",");
        o += e + ".json?" + new URLSearchParams({ icons: n }).toString();
        break;
      }
      case "custom": {
        const e = t.uri;
        o += "/" === e.slice(0, 1) ? e.slice(1) : e;
        break;
      }
      default:
        return void n("abort", 400);
    }
    let r = 503;
    Nh(e + o)
      .then((e) => {
        const t = e.status;
        if (200 === t) return ((r = 501), e.json());
        setTimeout(() => {
          n(
            (function (e) {
              return 404 === e;
            })(t)
              ? "abort"
              : "next",
            t
          );
        });
      })
      .then((e) => {
        "object" == typeof e && null !== e
          ? setTimeout(() => {
              n("success", e);
            })
          : setTimeout(() => {
              404 === e ? n("abort", e) : n("next", r);
            });
      })
      .catch(() => {
        n("next", r);
      });
  },
};
function Fh(e, t) {
  e.forEach((e) => {
    const n = e.loaderCallbacks;
    n && (e.loaderCallbacks = n.filter((e) => e.id !== t));
  });
}
let Lh = 0;
const Mh = { resources: [], index: 0, timeout: 2e3, rotate: 750, random: !1, dataAfterTimeout: !1 };
function Dh(e, t, n, o) {
  const r = e.resources.length,
    s = e.random ? Math.floor(Math.random() * r) : e.index;
  let i;
  if (e.random) {
    let t = e.resources.slice(0);
    for (i = []; t.length > 1; ) {
      const e = Math.floor(Math.random() * t.length);
      (i.push(t[e]), (t = t.slice(0, e).concat(t.slice(e + 1))));
    }
    i = i.concat(t);
  } else i = e.resources.slice(s).concat(e.resources.slice(0, s));
  const a = Date.now();
  let l,
    c = "pending",
    u = 0,
    f = null,
    d = [],
    p = [];
  function h() {
    f && (clearTimeout(f), (f = null));
  }
  function m() {
    ("pending" === c && (c = "aborted"),
      h(),
      d.forEach((e) => {
        "pending" === e.status && (e.status = "aborted");
      }),
      (d = []));
  }
  function g(e, t) {
    (t && (p = []), "function" == typeof e && p.push(e));
  }
  function v() {
    ((c = "failed"),
      p.forEach((e) => {
        e(void 0, l);
      }));
  }
  function _() {
    (d.forEach((e) => {
      "pending" === e.status && (e.status = "aborted");
    }),
      (d = []));
  }
  function y() {
    if ("pending" !== c) return;
    h();
    const o = i.shift();
    if (void 0 === o)
      return d.length
        ? void (f = setTimeout(() => {
            (h(), "pending" === c && (_(), v()));
          }, e.timeout))
        : void v();
    const r = {
      status: "pending",
      resource: o,
      callback: (t, n) => {
        !(function (t, n, o) {
          const r = "success" !== n;
          switch (((d = d.filter((e) => e !== t)), c)) {
            case "pending":
              break;
            case "failed":
              if (r || !e.dataAfterTimeout) return;
              break;
            default:
              return;
          }
          if ("abort" === n) return ((l = o), void v());
          if (r) return ((l = o), void (d.length || (i.length ? y() : v())));
          if ((h(), _(), !e.random)) {
            const n = e.resources.indexOf(t.resource);
            -1 !== n && n !== e.index && (e.index = n);
          }
          ((c = "completed"),
            p.forEach((e) => {
              e(o);
            }));
        })(r, t, n);
      },
    };
    (d.push(r), u++, (f = setTimeout(y, e.rotate)), n(o, t, r.callback));
  }
  return (
    "function" == typeof o && p.push(o),
    setTimeout(y),
    function () {
      return {
        startTime: a,
        payload: t,
        status: c,
        queriesSent: u,
        queriesPending: d.length,
        subscribe: g,
        abort: m,
      };
    }
  );
}
function jh(e) {
  const t = { ...Mh, ...e };
  let n = [];
  function o() {
    n = n.filter((e) => "pending" === e().status);
  }
  return {
    query: function (e, r, s) {
      const i = Dh(t, e, r, (e, t) => {
        (o(), s && s(e, t));
      });
      return (n.push(i), i);
    },
    find: function (e) {
      return n.find((t) => e(t)) || null;
    },
    setIndex: (e) => {
      t.index = e;
    },
    getIndex: () => t.index,
    cleanup: o,
  };
}
function $h() {}
const Vh = Object.create(null);
function Uh(e, t, n) {
  let o, r;
  if ("string" == typeof e) {
    const t = xh(e);
    if (!t) return (n(void 0, 424), $h);
    r = t.send;
    const s = (function (e) {
      if (!Vh[e]) {
        const t = Ih(e);
        if (!t) return;
        Vh[e] = { config: t, redundancy: jh(t) };
      }
      return Vh[e];
    })(e);
    s && (o = s.redundancy);
  } else {
    const t = Oh(e);
    if (t) {
      o = jh(t);
      const n = xh(e.resources ? e.resources[0] : "");
      n && (r = n.send);
    }
  }
  return o && r ? o.query(t, r, n)().abort : (n(void 0, 424), $h);
}
function Bh() {}
function Hh(e) {
  e.iconsLoaderFlag ||
    ((e.iconsLoaderFlag = !0),
    setTimeout(() => {
      ((e.iconsLoaderFlag = !1),
        (function (e) {
          e.pendingCallbacksFlag ||
            ((e.pendingCallbacksFlag = !0),
            setTimeout(() => {
              e.pendingCallbacksFlag = !1;
              const t = e.loaderCallbacks ? e.loaderCallbacks.slice(0) : [];
              if (!t.length) return;
              let n = !1;
              const o = e.provider,
                r = e.prefix;
              t.forEach((t) => {
                const s = t.icons,
                  i = s.pending.length;
                ((s.pending = s.pending.filter((t) => {
                  if (t.prefix !== r) return !0;
                  const i = t.name;
                  if (e.icons[i]) s.loaded.push({ provider: o, prefix: r, name: i });
                  else {
                    if (!e.missing.has(i)) return ((n = !0), !0);
                    s.missing.push({ provider: o, prefix: r, name: i });
                  }
                  return !1;
                })),
                  s.pending.length !== i &&
                    (n || Fh([e], t.id),
                    t.callback(
                      s.loaded.slice(0),
                      s.missing.slice(0),
                      s.pending.slice(0),
                      t.abort
                    )));
              });
            }));
        })(e));
    }));
}
function Wh(e, t, n) {
  function o() {
    const n = e.pendingIcons;
    t.forEach((t) => {
      (n && n.delete(t), e.icons[t] || e.missing.add(t));
    });
  }
  if (n && "object" == typeof n)
    try {
      if (!dh(e, n).length) return void o();
    } catch (r) {}
  (o(), Hh(e));
}
function zh(e, t) {
  e instanceof Promise
    ? e
        .then((e) => {
          t(e);
        })
        .catch(() => {
          t(null);
        })
    : t(e);
}
function Gh(e, t) {
  (e.iconsToLoad ? (e.iconsToLoad = e.iconsToLoad.concat(t).sort()) : (e.iconsToLoad = t),
    e.iconsQueueFlag ||
      ((e.iconsQueueFlag = !0),
      setTimeout(() => {
        e.iconsQueueFlag = !1;
        const { provider: t, prefix: n } = e,
          o = e.iconsToLoad;
        if ((delete e.iconsToLoad, !o || !o.length)) return;
        const r = e.loadIcon;
        if (e.loadIcons && (o.length > 1 || !r))
          return void zh(e.loadIcons(o, n, t), (t) => {
            Wh(e, o, t);
          });
        if (r)
          return void o.forEach((o) => {
            zh(r(o, n, t), (t) => {
              Wh(e, [o], t ? { prefix: n, icons: { [o]: t } } : null);
            });
          });
        const { valid: s, invalid: i } = (function (e) {
          const t = [],
            n = [];
          return (
            e.forEach((e) => {
              (e.match(Qp) ? t : n).push(e);
            }),
            { valid: t, invalid: n }
          );
        })(o);
        if ((i.length && Wh(e, i, null), !s.length)) return;
        const a = n.match(Qp) ? xh(t) : null;
        a
          ? a.prepare(t, n, s).forEach((n) => {
              Uh(t, n, (t) => {
                Wh(e, n.icons, t);
              });
            })
          : Wh(e, s, null);
      })));
}
const qh = (e, t) => {
  const n = (function (e) {
    const t = { loaded: [], missing: [], pending: [] },
      n = Object.create(null);
    e.sort((e, t) =>
      e.provider !== t.provider
        ? e.provider.localeCompare(t.provider)
        : e.prefix !== t.prefix
          ? e.prefix.localeCompare(t.prefix)
          : e.name.localeCompare(t.name)
    );
    let o = { provider: "", prefix: "", name: "" };
    return (
      e.forEach((e) => {
        if (o.name === e.name && o.prefix === e.prefix && o.provider === e.provider) return;
        o = e;
        const r = e.provider,
          s = e.prefix,
          i = e.name,
          a = n[r] || (n[r] = Object.create(null)),
          l = a[s] || (a[s] = fh(r, s));
        let c;
        c = i in l.icons ? t.loaded : "" === s || l.missing.has(i) ? t.missing : t.pending;
        const u = { provider: r, prefix: s, name: i };
        c.push(u);
      }),
      t
    );
  })(
    (function (e, t = !0, n = !1) {
      const o = [];
      return (
        e.forEach((e) => {
          const r = "string" == typeof e ? Xp(e, t, n) : e;
          r && o.push(r);
        }),
        o
      );
    })(e, !0, hh())
  );
  if (!n.pending.length) {
    let e = !0;
    return (
      t &&
        setTimeout(() => {
          e && t(n.loaded, n.missing, n.pending, Bh);
        }),
      () => {
        e = !1;
      }
    );
  }
  const o = Object.create(null),
    r = [];
  let s, i;
  return (
    n.pending.forEach((e) => {
      const { provider: t, prefix: n } = e;
      if (n === i && t === s) return;
      ((s = t), (i = n), r.push(fh(t, n)));
      const a = o[t] || (o[t] = Object.create(null));
      a[n] || (a[n] = []);
    }),
    n.pending.forEach((e) => {
      const { provider: t, prefix: n, name: r } = e,
        s = fh(t, n),
        i = s.pendingIcons || (s.pendingIcons = new Set());
      i.has(r) || (i.add(r), o[t][n].push(r));
    }),
    r.forEach((e) => {
      const t = o[e.provider][e.prefix];
      t.length && Gh(e, t);
    }),
    t
      ? (function (e, t, n) {
          const o = Lh++,
            r = Fh.bind(null, n, o);
          if (!t.pending.length) return r;
          const s = { id: o, icons: t, callback: e, abort: r };
          return (
            n.forEach((e) => {
              (e.loaderCallbacks || (e.loaderCallbacks = [])).push(s);
            }),
            r
          );
        })(t, n, r)
      : Bh
  );
};
const Yh = /[\s,]+/;
function Kh(e, t) {
  t.split(Yh).forEach((t) => {
    switch (t.trim()) {
      case "horizontal":
        e.hFlip = !0;
        break;
      case "vertical":
        e.vFlip = !0;
    }
  });
}
function Jh(e, t = 0) {
  const n = e.replace(/^-?[0-9.]*/, "");
  function o(e) {
    for (; e < 0; ) e += 4;
    return e % 4;
  }
  if ("" === n) {
    const t = parseInt(e);
    return isNaN(t) ? 0 : o(t);
  }
  if (n !== e) {
    let t = 0;
    switch (n) {
      case "%":
        t = 25;
        break;
      case "deg":
        t = 90;
    }
    if (t) {
      let r = parseFloat(e.slice(0, e.length - n.length));
      return isNaN(r) ? 0 : ((r /= t), r % 1 == 0 ? o(r) : 0);
    }
  }
  return t;
}
const Qh = { ...vh, inline: !1 },
  Xh = {
    xmlns: "http://www.w3.org/2000/svg",
    "xmlns:xlink": "http://www.w3.org/1999/xlink",
    "aria-hidden": !0,
    role: "img",
  },
  Zh = { display: "inline-block" },
  em = { backgroundColor: "currentColor" },
  tm = { backgroundColor: "transparent" },
  nm = { Image: "var(--svg)", Repeat: "no-repeat", Size: "100% 100%" },
  om = { webkitMask: em, mask: em, background: tm };
for (const fm in om) {
  const e = om[fm];
  for (const t in nm) e[fm + t] = nm[t];
}
const rm = {};
function sm(e) {
  return e + (e.match(/^[-0-9.]+$/) ? "px" : "");
}
["horizontal", "vertical"].forEach((e) => {
  const t = e.slice(0, 1) + "Flip";
  ((rm[e + "-flip"] = t), (rm[e.slice(0, 1) + "-flip"] = t), (rm[e + "Flip"] = t));
});
const im = (e, t) => {
  const n = (function (e, t) {
      const n = { ...e };
      for (const o in t) {
        const e = t[o],
          r = typeof e;
        o in gh
          ? (null === e || (e && ("string" === r || "number" === r))) && (n[o] = e)
          : r === typeof n[o] && (n[o] = "rotate" === o ? e % 4 : e);
      }
      return n;
    })(Qh, t),
    o = { ...Xh },
    r = t.mode || "svg",
    s = {},
    i = t.style,
    a = "object" != typeof i || i instanceof Array ? {} : i;
  for (let g in t) {
    const e = t[g];
    if (void 0 !== e)
      switch (g) {
        // Properties to ignore
        case "icon":
        case "style":
        case "onLoad":
        case "mode":
        case "ssr":
        case "customise":
          break;
        // Boolean attributes
        case "inline":
        case "hFlip":
        case "vFlip":
          n[g] = !0 === e || "true" === e || 1 === e;
          break;
        // Flip as string: 'horizontal,vertical'
        case "flip":
          "string" == typeof e && Kh(n, e);
          break;
        // Color: override style
        case "color":
          s.color = e;
          break;
        // Rotation as string
        case "rotate":
          "string" == typeof e ? (n[g] = Jh(e)) : "number" == typeof e && (n[g] = e);
          break;
        // Remove aria-hidden
        case "ariaHidden":
        case "aria-hidden":
          !0 !== e && "true" !== e && delete o["aria-hidden"];
          break;
        default: {
          const t = rm[g];
          t ? (!0 !== e && "true" !== e && 1 !== e) || (n[t] = !0) : void 0 === Qh[g] && (o[g] = e);
        }
      }
  }
  const l = (function (e, t) {
      const n = { ...nh, ...e },
        o = { ...vh, ...t },
        r = { left: n.left, top: n.top, width: n.width, height: n.height };
      let s = n.body;
      [n, o].forEach((e) => {
        const t = [],
          n = e.hFlip,
          o = e.vFlip;
        let i,
          a = e.rotate;
        switch (
          (n
            ? o
              ? (a += 2)
              : (t.push(
                  "translate(" + (r.width + r.left).toString() + " " + (0 - r.top).toString() + ")"
                ),
                t.push("scale(-1 1)"),
                (r.top = r.left = 0))
            : o &&
              (t.push(
                "translate(" + (0 - r.left).toString() + " " + (r.height + r.top).toString() + ")"
              ),
              t.push("scale(1 -1)"),
              (r.top = r.left = 0)),
          a < 0 && (a -= 4 * Math.floor(a / 4)),
          (a %= 4),
          a)
        ) {
          case 1:
            ((i = r.height / 2 + r.top),
              t.unshift("rotate(90 " + i.toString() + " " + i.toString() + ")"));
            break;
          case 2:
            t.unshift(
              "rotate(180 " +
                (r.width / 2 + r.left).toString() +
                " " +
                (r.height / 2 + r.top).toString() +
                ")"
            );
            break;
          case 3:
            ((i = r.width / 2 + r.left),
              t.unshift("rotate(-90 " + i.toString() + " " + i.toString() + ")"));
        }
        (a % 2 == 1 &&
          (r.left !== r.top && ((i = r.left), (r.left = r.top), (r.top = i)),
          r.width !== r.height && ((i = r.width), (r.width = r.height), (r.height = i))),
          t.length &&
            (s = (function (e, t, n) {
              const o = (function (e, t = "defs") {
                let n = "";
                const o = e.indexOf("<" + t);
                for (; o >= 0; ) {
                  const r = e.indexOf(">", o),
                    s = e.indexOf("</" + t);
                  if (-1 === r || -1 === s) break;
                  const i = e.indexOf(">", s);
                  if (-1 === i) break;
                  ((n += e.slice(r + 1, s).trim()), (e = e.slice(0, o).trim() + e.slice(i + 1)));
                }
                return { defs: n, content: e };
              })(e);
              return ((r = o.defs), (s = t + o.content + n), r ? "<defs>" + r + "</defs>" + s : s);
              var r, s;
            })(s, '<g transform="' + t.join(" ") + '">', "</g>")));
      });
      const i = o.width,
        a = o.height,
        l = r.width,
        c = r.height;
      let u, f;
      null === i
        ? ((f = null === a ? "1em" : "auto" === a ? c : a), (u = bh(f, l / c)))
        : ((u = "auto" === i ? l : i), (f = null === a ? bh(u, c / l) : "auto" === a ? c : a));
      const d = {},
        p = (e, t) => {
          ((e) => "unset" === e || "undefined" === e || "none" === e)(t) || (d[e] = t.toString());
        };
      (p("width", u), p("height", f));
      const h = [r.left, r.top, l, c];
      return ((d.viewBox = h.join(" ")), { attributes: d, viewBox: h, body: s });
    })(e, n),
    c = l.attributes;
  if ((n.inline && (s.verticalAlign = "-0.125em"), "svg" === r))
    return (
      (o.style = { ...s, ...a }),
      Object.assign(o, c),
      (o.innerHTML = Sh(l.body)),
      ga("svg", o)
    );
  const { body: u, width: f, height: d } = e,
    p = "mask" === r || ("bg" !== r && -1 !== u.indexOf("currentColor")),
    h = (function (e, t) {
      let n = -1 === e.indexOf("xlink:") ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
      for (const o in t) n += " " + o + '="' + t[o] + '"';
      return '<svg xmlns="http://www.w3.org/2000/svg"' + n + ">" + e + "</svg>";
    })(u, { ...c, width: f + "", height: d + "" });
  var m;
  return (
    (o.style = {
      ...s,
      "--svg":
        ((m = h),
        'url("' +
          (function (e) {
            return (
              "data:image/svg+xml," +
              (function (e) {
                return e
                  .replace(/"/g, "'")
                  .replace(/%/g, "%25")
                  .replace(/#/g, "%23")
                  .replace(/</g, "%3C")
                  .replace(/>/g, "%3E")
                  .replace(/\s+/g, " ");
              })(e)
            );
          })(m) +
          '")'),
      width: sm(c.width),
      height: sm(c.height),
      ...Zh,
      ...(p ? em : tm),
      ...a,
    }),
    ga("span", o)
  );
};
var am;
if (
  (hh(!0), (am = Ph), (kh[""] = am), "undefined" != typeof document && "undefined" != typeof window)
) {
  const e = window;
  if (void 0 !== e.IconifyPreload) {
    const t = e.IconifyPreload;
    "object" == typeof t &&
      null !== t &&
      (t instanceof Array ? t : [t]).forEach((e) => {
        try {
          // Check if item is an object and not null/array
          "object" != typeof e ||
            null === e ||
            e instanceof Array || // Check for 'icons' and 'prefix'
            "object" != typeof e.icons ||
            "string" != typeof e.prefix ||
            mh(e);
        } catch (um) {}
      });
  }
  if (void 0 !== e.IconifyProviders) {
    const t = e.IconifyProviders;
    if ("object" == typeof t && null !== t)
      for (let e in t) {
        try {
          const n = t[e];
          if ("object" != typeof n || !n || void 0 === n.resources) continue;
          Rh(e, n);
        } catch (um) {}
      }
  }
}
const lm = { ...nh, body: "" },
  cm = rr(
    (e, { emit: t }) => {
      const n = kn(null);
      function o() {
        n.value && (n.value.abort?.(), (n.value = null));
      }
      const r = kn(!!e.ssr),
        s = kn(""),
        i = xn(null);
      function a() {
        const r = e.icon;
        if ("object" == typeof r && null !== r && "string" == typeof r.body)
          return ((s.value = ""), { data: r });
        let i;
        if ("string" != typeof r || null === (i = Xp(r, !1, !0))) return null;
        let a = (function (e) {
          const t = "string" == typeof e ? Xp(e, !0, ph) : e;
          if (t) {
            const e = fh(t.provider, t.prefix),
              n = t.name;
            return e.icons[n] || (e.missing.has(n) ? null : void 0);
          }
        })(i);
        if (!a) {
          const e = n.value;
          return (
            (e && e.name === r) ||
              (n.value = null === a ? { name: r } : { name: r, abort: qh([i], l) }),
            null
          );
        }
        (o(),
          s.value !== r &&
            ((s.value = r),
            so(() => {
              t("load", r);
            })));
        const c = e.customise;
        if (c) {
          a = Object.assign({}, a);
          const e = c(a.body, i.name, i.prefix, i.provider);
          "string" == typeof e && (a.body = e);
        }
        const u = ["iconify"];
        return (
          "" !== i.prefix && u.push("iconify--" + i.prefix),
          "" !== i.provider && u.push("iconify--" + i.provider),
          { data: a, classes: u }
        );
      }
      function l() {
        const e = a();
        e ? e.data !== i.value?.data && (i.value = e) : (i.value = null);
      }
      return (
        r.value
          ? l()
          : Mr(() => {
              ((r.value = !0), l());
            }),
        Co(() => e.icon, l),
        Vr(o),
        () => {
          const t = i.value;
          if (!t) return im(lm, e);
          let n = e;
          return (
            t.classes && (n = { ...e, class: t.classes.join(" ") }),
            im({ ...nh, ...t.data }, n)
          );
        }
      );
    },
    {
      props: [
        // Icon and render mode
        "icon",
        "mode",
        "ssr",
        // Layout and style
        "width",
        "height",
        "style",
        "color",
        "inline",
        // Transformations
        "rotate",
        "hFlip",
        "horizontalFlip",
        "vFlip",
        "verticalFlip",
        "flip",
        // Misc
        "id",
        "ariaHidden",
        "customise",
        "title",
      ],
      emits: ["load"],
    }
  );
export {
  ds as $,
  hu as A,
  Qe as B,
  Ei as C,
  Zi as D,
  $i as E,
  bi as F,
  ga as G,
  ne as H,
  cm as I,
  we as J,
  xr as K,
  So as L,
  oe as M,
  K as N,
  _c as O,
  ie as P,
  ae as Q,
  ld as R,
  Sc as S,
  Uo as T,
  ue as U,
  he as V,
  fe as W,
  Sn as X,
  le as Y,
  Pi as Z,
  bn as _,
  wi as a,
  Cs as a$,
  qi as a0,
  so as a1,
  De as a2,
  je as a3,
  Ne as a4,
  Tr as a5,
  Lr as a6,
  $r as a7,
  Dr as a8,
  Dc as a9,
  yn as aA,
  jn as aB,
  Ln as aC,
  Rn as aD,
  An as aE,
  Td as aF,
  mc as aG,
  Ad as aH,
  Cn as aI,
  Pc as aJ,
  Vc as aK,
  cs as aL,
  qd as aM,
  Uc as aN,
  el as aO,
  Pd as aP,
  Oc as aQ,
  Bc as aR,
  Wc as aS,
  zc as aT,
  Fc as aU,
  $d as aV,
  rp as aW,
  Gp as aX,
  Gc as aY,
  Fd as aZ,
  Gd as a_,
  Ud as aa,
  Ar as ab,
  Mr as ac,
  Ze as ad,
  Vr as ae,
  jr as af,
  Oi as ag,
  Eo as ah,
  un as ai,
  vc as aj,
  dn as ak,
  kn as al,
  Tc as am,
  ac as an,
  Xr as ao,
  es as ap,
  Gr as aq,
  Kr as ar,
  Yr as as,
  fn as at,
  xn as au,
  Su as av,
  mu as aw,
  We as ax,
  Se as ay,
  ns as az,
  La as b,
  $c as b0,
  Xd as b1,
  Hc as b2,
  np as b3,
  Uu as b4,
  Vu as b5,
  ls as b6,
  tp as b7,
  ir as b8,
  Ac as b9,
  xd as ba,
  Rc as bb,
  Ld as bc,
  up as bd,
  qc as be,
  fp as bf,
  Yc as bg,
  Kc as bh,
  dp as bi,
  Ul as bj,
  Yl as bk,
  Hl as bl,
  Wl as bm,
  Vl as bn,
  Qa as bo,
  pc as bp,
  ya as bq,
  Co as br,
  To as bs,
  yo as bt,
  bo as bu,
  tc as bv,
  Zl as bw,
  Rl as c,
  ip as d,
  mh as e,
  ye as f,
  Ee as g,
  wc as h,
  Vi as i,
  ma as j,
  hc as k,
  lc as l,
  Di as m,
  Ni as n,
  Hi as o,
  Ii as p,
  zp as q,
  tu as r,
  cd as s,
  Zr as t,
  Bi as u,
  Ui as v,
  ji as w,
  Mf as x,
  Er as y,
  rr as z,
};
