const t = (function () {
    class t {
      #t = new Map();
      compare(t, e) {
        const s = typeof t,
          r = typeof e;
        return "string" === s && "string" === r
          ? t.localeCompare(e)
          : "number" === s && "number" === r
            ? t - e
            : String.prototype.localeCompare.call(this.serialize(t, !0), this.serialize(e, !0));
      }
      serialize(t, e) {
        if (null === t) return "null";
        switch (typeof t) {
          case "string":
            return e ? t : `'${t}'`;
          case "bigint":
            return `${t}n`;
          case "object":
            return this.$object(t);
          case "function":
            return this.$function(t);
        }
        return String(t);
      }
      serializeObject(t) {
        const e = Object.prototype.toString.call(t);
        if ("[object Object]" !== e)
          return this.serializeBuiltInType(e.length < 10 ? `unknown:${e}` : e.slice(8, -1), t);
        const s = t.constructor,
          r = s === Object || void 0 === s ? "" : s.name;
        if ("" !== r && globalThis[r] === s) return this.serializeBuiltInType(r, t);
        if ("function" == typeof t.toJSON) {
          const e = t.toJSON();
          return (
            r + (null !== e && "object" == typeof e ? this.$object(e) : `(${this.serialize(e)})`)
          );
        }
        return this.serializeObjectEntries(r, Object.entries(t));
      }
      serializeBuiltInType(t, e) {
        const s = this["$" + t];
        if (s) return s.call(this, e);
        if ("function" == typeof e?.entries) return this.serializeObjectEntries(t, e.entries());
        throw new Error(`Cannot serialize ${t}`);
      }
      serializeObjectEntries(t, e) {
        const s = Array.from(e).sort((t, e) => this.compare(t[0], e[0]));
        let r = `${t}{`;
        for (let i = 0; i < s.length; i++) {
          const [t, e] = s[i];
          ((r += `${this.serialize(t, !0)}:${this.serialize(e)}`), i < s.length - 1 && (r += ","));
        }
        return r + "}";
      }
      $object(t) {
        let e = this.#t.get(t);
        return (
          void 0 === e &&
            (this.#t.set(t, `#${this.#t.size}`), (e = this.serializeObject(t)), this.#t.set(t, e)),
          e
        );
      }
      $function(t) {
        const e = Function.prototype.toString.call(t);
        return "[native code] }" === e.slice(-15)
          ? `${t.name || ""}()[native]`
          : `${t.name}(${t.length})${e.replace(/\s*\n\s*/g, "")}`;
      }
      $Array(t) {
        let e = "[";
        for (let s = 0; s < t.length; s++)
          ((e += this.serialize(t[s])), s < t.length - 1 && (e += ","));
        return e + "]";
      }
      $Date(t) {
        try {
          return `Date(${t.toISOString()})`;
        } catch {
          return "Date(null)";
        }
      }
      $ArrayBuffer(t) {
        return `ArrayBuffer[${new Uint8Array(t).join(",")}]`;
      }
      $Set(t) {
        return `Set${this.$Array(Array.from(t).sort((t, e) => this.compare(t, e)))}`;
      }
      $Map(t) {
        return this.serializeObjectEntries("Map", t.entries());
      }
    }
    for (const e of ["Error", "RegExp", "URL"])
      t.prototype["$" + e] = function (t) {
        return `${e}(${t})`;
      };
    for (const e of [
      "Int8Array",
      "Uint8Array",
      "Uint8ClampedArray",
      "Int16Array",
      "Uint16Array",
      "Int32Array",
      "Uint32Array",
      "Float32Array",
      "Float64Array",
    ])
      t.prototype["$" + e] = function (t) {
        return `${e}[${t.join(",")}]`;
      };
    for (const e of ["BigInt64Array", "BigUint64Array"])
      t.prototype["$" + e] = function (t) {
        return `${e}[${t.join("n,")}${t.length > 0 ? "n" : ""}]`;
      };
    return t;
  })(),
  e = [
    1779033703, -1150833019, 1013904242, -1521486534, 1359893119, -1694144372, 528734635,
    1541459225,
  ],
  s = [
    1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993, -1841331548,
    -1424204075, -670586216, 310598401, 607225278, 1426881987, 1925078388, -2132889090, -1680079193,
    -1046744716, -459576895, -272742522, 264347078, 604807628, 770255983, 1249150122, 1555081692,
    1996064986, -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585,
    113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051,
    -2117940946, -1838011259, -1564481375, -1474664885, -1035236496, -949202525, -778901479,
    -694614492, -200395387, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571,
    1322822218, 1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872,
    -1866530822, -1538233109, -1090935817, -965641998,
  ],
  r = [];
class i {
  _data = new n();
  _hash = new n([...e]);
  _nDataBytes = 0;
  _minBufferSize = 0;
  finalize(t) {
    t && this._append(t);
    const e = 8 * this._nDataBytes,
      s = 8 * this._data.sigBytes;
    return (
      (this._data.words[s >>> 5] |= 128 << (24 - (s % 32))),
      (this._data.words[14 + (((s + 64) >>> 9) << 4)] = Math.floor(e / 4294967296)),
      (this._data.words[15 + (((s + 64) >>> 9) << 4)] = e),
      (this._data.sigBytes = 4 * this._data.words.length),
      this._process(),
      this._hash
    );
  }
  _doProcessBlock(t, e) {
    const i = this._hash.words;
    let n = i[0],
      o = i[1],
      a = i[2],
      c = i[3],
      h = i[4],
      l = i[5],
      u = i[6],
      y = i[7];
    for (let f = 0; f < 64; f++) {
      if (f < 16) r[f] = 0 | t[e + f];
      else {
        const t = r[f - 15],
          e = ((t << 25) | (t >>> 7)) ^ ((t << 14) | (t >>> 18)) ^ (t >>> 3),
          s = r[f - 2],
          i = ((s << 15) | (s >>> 17)) ^ ((s << 13) | (s >>> 19)) ^ (s >>> 10);
        r[f] = e + r[f - 7] + i + r[f - 16];
      }
      const i = (n & o) ^ (n & a) ^ (o & a),
        g = ((n << 30) | (n >>> 2)) ^ ((n << 19) | (n >>> 13)) ^ ((n << 10) | (n >>> 22)),
        p =
          y +
          (((h << 26) | (h >>> 6)) ^ ((h << 21) | (h >>> 11)) ^ ((h << 7) | (h >>> 25))) +
          ((h & l) ^ (~h & u)) +
          s[f] +
          r[f];
      ((y = u),
        (u = l),
        (l = h),
        (h = (c + p) | 0),
        (c = a),
        (a = o),
        (o = n),
        (n = (p + (g + i)) | 0));
    }
    ((i[0] = (i[0] + n) | 0),
      (i[1] = (i[1] + o) | 0),
      (i[2] = (i[2] + a) | 0),
      (i[3] = (i[3] + c) | 0),
      (i[4] = (i[4] + h) | 0),
      (i[5] = (i[5] + l) | 0),
      (i[6] = (i[6] + u) | 0),
      (i[7] = (i[7] + y) | 0));
  }
  _append(t) {
    ("string" == typeof t && (t = n.fromUtf8(t)),
      this._data.concat(t),
      (this._nDataBytes += t.sigBytes));
  }
  _process(t) {
    let e,
      s = this._data.sigBytes / 64;
    s = t ? Math.ceil(s) : Math.max((0 | s) - this._minBufferSize, 0);
    const r = 16 * s,
      i = Math.min(4 * r, this._data.sigBytes);
    if (r) {
      for (let t = 0; t < r; t += 16) this._doProcessBlock(this._data.words, t);
      ((e = this._data.words.splice(0, r)), (this._data.sigBytes -= i));
    }
    return new n(e, i);
  }
}
class n {
  words;
  sigBytes;
  constructor(t, e) {
    ((t = this.words = t || []), (this.sigBytes = void 0 === e ? 4 * t.length : e));
  }
  static fromUtf8(t) {
    const e = unescape(encodeURIComponent(t)),
      s = e.length,
      r = [];
    for (let i = 0; i < s; i++) r[i >>> 2] |= (255 & e.charCodeAt(i)) << (24 - (i % 4) * 8);
    return new n(r, s);
  }
  toBase64() {
    const t = [];
    for (let e = 0; e < this.sigBytes; e += 3) {
      const s =
        (((this.words[e >>> 2] >>> (24 - (e % 4) * 8)) & 255) << 16) |
        (((this.words[(e + 1) >>> 2] >>> (24 - ((e + 1) % 4) * 8)) & 255) << 8) |
        ((this.words[(e + 2) >>> 2] >>> (24 - ((e + 2) % 4) * 8)) & 255);
      for (let r = 0; r < 4 && 8 * e + 6 * r < 8 * this.sigBytes; r++)
        t.push(
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".charAt(
            (s >>> (6 * (3 - r))) & 63
          )
        );
    }
    return t.join("");
  }
  concat(t) {
    if (
      ((this.words[this.sigBytes >>> 2] &= 4294967295 << (32 - (this.sigBytes % 4) * 8)),
      (this.words.length = Math.ceil(this.sigBytes / 4)),
      this.sigBytes % 4)
    )
      for (let e = 0; e < t.sigBytes; e++) {
        const s = (t.words[e >>> 2] >>> (24 - (e % 4) * 8)) & 255;
        this.words[(this.sigBytes + e) >>> 2] |= s << (24 - ((this.sigBytes + e) % 4) * 8);
      }
    else
      for (let e = 0; e < t.sigBytes; e += 4)
        this.words[(this.sigBytes + e) >>> 2] = t.words[e >>> 2];
    this.sigBytes += t.sigBytes;
  }
}
function o(e) {
  return (
    (s = "string" == typeof (r = e) ? `'${r}'` : new t().serialize(r)),
    new i().finalize(s).toBase64()
  );
  var s, r;
}
export { o as h };
