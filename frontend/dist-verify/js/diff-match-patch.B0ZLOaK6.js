import { f as t } from "./dayjs.BHSg66Ch.js";
var e,
  n,
  i,
  r,
  s = { exports: {} };
const h = t(
  (e ||
    ((e = 1),
    (n = s),
    (r = -1),
    ((i = function () {
      ((this.Diff_Timeout = 1),
        (this.Diff_EditCost = 4),
        (this.Match_Threshold = 0.5),
        (this.Match_Distance = 1e3),
        (this.Patch_DeleteThreshold = 0.5),
        (this.Patch_Margin = 4),
        (this.Match_MaxBits = 32));
    }).Diff = function (t, e) {
      return [t, e];
    }),
    (i.prototype.diff_main = function (t, e, n, r) {
      void 0 === r &&
        (r =
          this.Diff_Timeout <= 0
            ? Number.MAX_VALUE
            : new Date().getTime() + 1e3 * this.Diff_Timeout);
      var s = r;
      if (null == t || null == e) throw new Error("Null input. (diff_main)");
      if (t == e) return t ? [new i.Diff(0, t)] : [];
      void 0 === n && (n = !0);
      var h = n,
        f = this.diff_commonPrefix(t, e),
        a = t.substring(0, f);
      ((t = t.substring(f)), (e = e.substring(f)), (f = this.diff_commonSuffix(t, e)));
      var l = t.substring(t.length - f);
      ((t = t.substring(0, t.length - f)), (e = e.substring(0, e.length - f)));
      var g = this.diff_compute_(t, e, h, s);
      return (
        a && g.unshift(new i.Diff(0, a)),
        l && g.push(new i.Diff(0, l)),
        this.diff_cleanupMerge(g),
        g
      );
    }),
    (i.prototype.diff_compute_ = function (t, e, n, s) {
      var h;
      if (!t) return [new i.Diff(1, e)];
      if (!e) return [new i.Diff(r, t)];
      var f = t.length > e.length ? t : e,
        a = t.length > e.length ? e : t,
        l = f.indexOf(a);
      if (-1 != l)
        return (
          (h = [
            new i.Diff(1, f.substring(0, l)),
            new i.Diff(0, a),
            new i.Diff(1, f.substring(l + a.length)),
          ]),
          t.length > e.length && (h[0][0] = h[2][0] = r),
          h
        );
      if (1 == a.length) return [new i.Diff(r, t), new i.Diff(1, e)];
      var g = this.diff_halfMatch_(t, e);
      if (g) {
        var o = g[0],
          c = g[1],
          u = g[2],
          p = g[3],
          d = g[4],
          _ = this.diff_main(o, u, n, s),
          b = this.diff_main(c, p, n, s);
        return _.concat([new i.Diff(0, d)], b);
      }
      return n && t.length > 100 && e.length > 100
        ? this.diff_lineMode_(t, e, s)
        : this.diff_bisect_(t, e, s);
    }),
    (i.prototype.diff_lineMode_ = function (t, e, n) {
      var s = this.diff_linesToChars_(t, e);
      ((t = s.chars1), (e = s.chars2));
      var h = s.lineArray,
        f = this.diff_main(t, e, !1, n);
      (this.diff_charsToLines_(f, h), this.diff_cleanupSemantic(f), f.push(new i.Diff(0, "")));
      for (var a = 0, l = 0, g = 0, o = "", c = ""; a < f.length; ) {
        switch (f[a][0]) {
          case 1:
            (g++, (c += f[a][1]));
            break;
          case r:
            (l++, (o += f[a][1]));
            break;
          case 0:
            if (l >= 1 && g >= 1) {
              (f.splice(a - l - g, l + g), (a = a - l - g));
              for (var u = this.diff_main(o, c, !1, n), p = u.length - 1; p >= 0; p--)
                f.splice(a, 0, u[p]);
              a += u.length;
            }
            ((g = 0), (l = 0), (o = ""), (c = ""));
        }
        a++;
      }
      return (f.pop(), f);
    }),
    (i.prototype.diff_bisect_ = function (t, e, n) {
      for (
        var s = t.length,
          h = e.length,
          f = Math.ceil((s + h) / 2),
          a = f,
          l = 2 * f,
          g = new Array(l),
          o = new Array(l),
          c = 0;
        c < l;
        c++
      )
        ((g[c] = -1), (o[c] = -1));
      ((g[a + 1] = 0), (o[a + 1] = 0));
      for (
        var u = s - h, p = u % 2 != 0, d = 0, _ = 0, b = 0, v = 0, m = 0;
        m < f && !(new Date().getTime() > n);
        m++
      ) {
        for (var w = -m + d; w <= m - _; w += 2) {
          for (
            var x = a + w,
              M = (E = w == -m || (w != m && g[x - 1] < g[x + 1]) ? g[x + 1] : g[x - 1] + 1) - w;
            E < s && M < h && t.charAt(E) == e.charAt(M);
          )
            (E++, M++);
          if (((g[x] = E), E > s)) _ += 2;
          else if (M > h) d += 2;
          else if (p && (A = a + u - w) >= 0 && A < l && -1 != o[A] && E >= (y = s - o[A]))
            return this.diff_bisectSplit_(t, e, E, M, n);
        }
        for (var D = -m + b; D <= m - v; D += 2) {
          for (
            var y,
              A = a + D,
              k = (y = D == -m || (D != m && o[A - 1] < o[A + 1]) ? o[A + 1] : o[A - 1] + 1) - D;
            y < s && k < h && t.charAt(s - y - 1) == e.charAt(h - k - 1);
          )
            (y++, k++);
          if (((o[A] = y), y > s)) v += 2;
          else if (k > h) b += 2;
          else if (!p) {
            var E;
            if (
              (x = a + u - D) >= 0 &&
              x < l &&
              -1 != g[x] &&
              ((M = a + (E = g[x]) - x), E >= (y = s - y))
            )
              return this.diff_bisectSplit_(t, e, E, M, n);
          }
        }
      }
      return [new i.Diff(r, t), new i.Diff(1, e)];
    }),
    (i.prototype.diff_bisectSplit_ = function (t, e, n, i, r) {
      var s = t.substring(0, n),
        h = e.substring(0, i),
        f = t.substring(n),
        a = e.substring(i),
        l = this.diff_main(s, h, !1, r),
        g = this.diff_main(f, a, !1, r);
      return l.concat(g);
    }),
    (i.prototype.diff_linesToChars_ = function (t, e) {
      var n = [],
        i = {};
      function r(t) {
        for (var e = "", r = 0, h = -1, f = n.length; h < t.length - 1; ) {
          -1 == (h = t.indexOf("\n", r)) && (h = t.length - 1);
          var a = t.substring(r, h + 1);
          ((i.hasOwnProperty ? i.hasOwnProperty(a) : void 0 !== i[a])
            ? (e += String.fromCharCode(i[a]))
            : (f == s && ((a = t.substring(r)), (h = t.length)),
              (e += String.fromCharCode(f)),
              (i[a] = f),
              (n[f++] = a)),
            (r = h + 1));
        }
        return e;
      }
      n[0] = "";
      var s = 4e4,
        h = r(t);
      return ((s = 65535), { chars1: h, chars2: r(e), lineArray: n });
    }),
    (i.prototype.diff_charsToLines_ = function (t, e) {
      for (var n = 0; n < t.length; n++) {
        for (var i = t[n][1], r = [], s = 0; s < i.length; s++) r[s] = e[i.charCodeAt(s)];
        t[n][1] = r.join("");
      }
    }),
    (i.prototype.diff_commonPrefix = function (t, e) {
      if (!t || !e || t.charAt(0) != e.charAt(0)) return 0;
      for (var n = 0, i = Math.min(t.length, e.length), r = i, s = 0; n < r; )
        (t.substring(s, r) == e.substring(s, r) ? (s = n = r) : (i = r),
          (r = Math.floor((i - n) / 2 + n)));
      return r;
    }),
    (i.prototype.diff_commonSuffix = function (t, e) {
      if (!t || !e || t.charAt(t.length - 1) != e.charAt(e.length - 1)) return 0;
      for (var n = 0, i = Math.min(t.length, e.length), r = i, s = 0; n < r; )
        (t.substring(t.length - r, t.length - s) == e.substring(e.length - r, e.length - s)
          ? (s = n = r)
          : (i = r),
          (r = Math.floor((i - n) / 2 + n)));
      return r;
    }),
    (i.prototype.diff_commonOverlap_ = function (t, e) {
      var n = t.length,
        i = e.length;
      if (0 == n || 0 == i) return 0;
      n > i ? (t = t.substring(n - i)) : n < i && (e = e.substring(0, n));
      var r = Math.min(n, i);
      if (t == e) return r;
      for (var s = 0, h = 1; ; ) {
        var f = t.substring(r - h),
          a = e.indexOf(f);
        if (-1 == a) return s;
        ((h += a), (0 != a && t.substring(r - h) != e.substring(0, h)) || ((s = h), h++));
      }
    }),
    (i.prototype.diff_halfMatch_ = function (t, e) {
      if (this.Diff_Timeout <= 0) return null;
      var n = t.length > e.length ? t : e,
        i = t.length > e.length ? e : t;
      if (n.length < 4 || 2 * i.length < n.length) return null;
      var r = this;
      function s(t, e, n) {
        for (
          var i, s, h, f, a = t.substring(n, n + Math.floor(t.length / 4)), l = -1, g = "";
          -1 != (l = e.indexOf(a, l + 1));
        ) {
          var o = r.diff_commonPrefix(t.substring(n), e.substring(l)),
            c = r.diff_commonSuffix(t.substring(0, n), e.substring(0, l));
          g.length < c + o &&
            ((g = e.substring(l - c, l) + e.substring(l, l + o)),
            (i = t.substring(0, n - c)),
            (s = t.substring(n + o)),
            (h = e.substring(0, l - c)),
            (f = e.substring(l + o)));
        }
        return 2 * g.length >= t.length ? [i, s, h, f, g] : null;
      }
      var h,
        f,
        a,
        l,
        g,
        o = s(n, i, Math.ceil(n.length / 4)),
        c = s(n, i, Math.ceil(n.length / 2));
      return o || c
        ? ((h = c ? (o && o[4].length > c[4].length ? o : c) : o),
          t.length > e.length
            ? ((f = h[0]), (a = h[1]), (l = h[2]), (g = h[3]))
            : ((l = h[0]), (g = h[1]), (f = h[2]), (a = h[3])),
          [f, a, l, g, h[4]])
        : null;
    }),
    (i.prototype.diff_cleanupSemantic = function (t) {
      for (var e = !1, n = [], s = 0, h = null, f = 0, a = 0, l = 0, g = 0, o = 0; f < t.length; )
        (0 == t[f][0]
          ? ((n[s++] = f), (a = g), (l = o), (g = 0), (o = 0), (h = t[f][1]))
          : (1 == t[f][0] ? (g += t[f][1].length) : (o += t[f][1].length),
            h &&
              h.length <= Math.max(a, l) &&
              h.length <= Math.max(g, o) &&
              (t.splice(n[s - 1], 0, new i.Diff(r, h)),
              (t[n[s - 1] + 1][0] = 1),
              s--,
              (f = --s > 0 ? n[s - 1] : -1),
              (a = 0),
              (l = 0),
              (g = 0),
              (o = 0),
              (h = null),
              (e = !0))),
          f++);
      for (
        e && this.diff_cleanupMerge(t), this.diff_cleanupSemanticLossless(t), f = 1;
        f < t.length;
      ) {
        if (t[f - 1][0] == r && 1 == t[f][0]) {
          var c = t[f - 1][1],
            u = t[f][1],
            p = this.diff_commonOverlap_(c, u),
            d = this.diff_commonOverlap_(u, c);
          (p >= d
            ? (p >= c.length / 2 || p >= u.length / 2) &&
              (t.splice(f, 0, new i.Diff(0, u.substring(0, p))),
              (t[f - 1][1] = c.substring(0, c.length - p)),
              (t[f + 1][1] = u.substring(p)),
              f++)
            : (d >= c.length / 2 || d >= u.length / 2) &&
              (t.splice(f, 0, new i.Diff(0, c.substring(0, d))),
              (t[f - 1][0] = 1),
              (t[f - 1][1] = u.substring(0, u.length - d)),
              (t[f + 1][0] = r),
              (t[f + 1][1] = c.substring(d)),
              f++),
            f++);
        }
        f++;
      }
    }),
    (i.prototype.diff_cleanupSemanticLossless = function (t) {
      function e(t, e) {
        if (!t || !e) return 6;
        var n = t.charAt(t.length - 1),
          r = e.charAt(0),
          s = n.match(i.nonAlphaNumericRegex_),
          h = r.match(i.nonAlphaNumericRegex_),
          f = s && n.match(i.whitespaceRegex_),
          a = h && r.match(i.whitespaceRegex_),
          l = f && n.match(i.linebreakRegex_),
          g = a && r.match(i.linebreakRegex_),
          o = l && t.match(i.blanklineEndRegex_),
          c = g && e.match(i.blanklineStartRegex_);
        return o || c ? 5 : l || g ? 4 : s && !f && a ? 3 : f || a ? 2 : s || h ? 1 : 0;
      }
      for (var n = 1; n < t.length - 1; ) {
        if (0 == t[n - 1][0] && 0 == t[n + 1][0]) {
          var r = t[n - 1][1],
            s = t[n][1],
            h = t[n + 1][1],
            f = this.diff_commonSuffix(r, s);
          if (f) {
            var a = s.substring(s.length - f);
            ((r = r.substring(0, r.length - f)),
              (s = a + s.substring(0, s.length - f)),
              (h = a + h));
          }
          for (var l = r, g = s, o = h, c = e(r, s) + e(s, h); s.charAt(0) === h.charAt(0); ) {
            ((r += s.charAt(0)), (s = s.substring(1) + h.charAt(0)), (h = h.substring(1)));
            var u = e(r, s) + e(s, h);
            u >= c && ((c = u), (l = r), (g = s), (o = h));
          }
          t[n - 1][1] != l &&
            (l ? (t[n - 1][1] = l) : (t.splice(n - 1, 1), n--),
            (t[n][1] = g),
            o ? (t[n + 1][1] = o) : (t.splice(n + 1, 1), n--));
        }
        n++;
      }
    }),
    (i.nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/),
    (i.whitespaceRegex_ = /\s/),
    (i.linebreakRegex_ = /[\r\n]/),
    (i.blanklineEndRegex_ = /\n\r?\n$/),
    (i.blanklineStartRegex_ = /^\r?\n\r?\n/),
    (i.prototype.diff_cleanupEfficiency = function (t) {
      for (
        var e = !1, n = [], s = 0, h = null, f = 0, a = !1, l = !1, g = !1, o = !1;
        f < t.length;
      )
        (0 == t[f][0]
          ? (t[f][1].length < this.Diff_EditCost && (g || o)
              ? ((n[s++] = f), (a = g), (l = o), (h = t[f][1]))
              : ((s = 0), (h = null)),
            (g = o = !1))
          : (t[f][0] == r ? (o = !0) : (g = !0),
            h &&
              ((a && l && g && o) || (h.length < this.Diff_EditCost / 2 && a + l + g + o == 3)) &&
              (t.splice(n[s - 1], 0, new i.Diff(r, h)),
              (t[n[s - 1] + 1][0] = 1),
              s--,
              (h = null),
              a && l ? ((g = o = !0), (s = 0)) : ((f = --s > 0 ? n[s - 1] : -1), (g = o = !1)),
              (e = !0))),
          f++);
      e && this.diff_cleanupMerge(t);
    }),
    (i.prototype.diff_cleanupMerge = function (t) {
      t.push(new i.Diff(0, ""));
      for (var e, n = 0, s = 0, h = 0, f = "", a = ""; n < t.length; )
        switch (t[n][0]) {
          case 1:
            (h++, (a += t[n][1]), n++);
            break;
          case r:
            (s++, (f += t[n][1]), n++);
            break;
          case 0:
            (s + h > 1
              ? (0 !== s &&
                  0 !== h &&
                  (0 !== (e = this.diff_commonPrefix(a, f)) &&
                    (n - s - h > 0 && 0 == t[n - s - h - 1][0]
                      ? (t[n - s - h - 1][1] += a.substring(0, e))
                      : (t.splice(0, 0, new i.Diff(0, a.substring(0, e))), n++),
                    (a = a.substring(e)),
                    (f = f.substring(e))),
                  0 !== (e = this.diff_commonSuffix(a, f)) &&
                    ((t[n][1] = a.substring(a.length - e) + t[n][1]),
                    (a = a.substring(0, a.length - e)),
                    (f = f.substring(0, f.length - e)))),
                (n -= s + h),
                t.splice(n, s + h),
                f.length && (t.splice(n, 0, new i.Diff(r, f)), n++),
                a.length && (t.splice(n, 0, new i.Diff(1, a)), n++),
                n++)
              : 0 !== n && 0 == t[n - 1][0]
                ? ((t[n - 1][1] += t[n][1]), t.splice(n, 1))
                : n++,
              (h = 0),
              (s = 0),
              (f = ""),
              (a = ""));
        }
      "" === t[t.length - 1][1] && t.pop();
      var l = !1;
      for (n = 1; n < t.length - 1; )
        (0 == t[n - 1][0] &&
          0 == t[n + 1][0] &&
          (t[n][1].substring(t[n][1].length - t[n - 1][1].length) == t[n - 1][1]
            ? ((t[n][1] = t[n - 1][1] + t[n][1].substring(0, t[n][1].length - t[n - 1][1].length)),
              (t[n + 1][1] = t[n - 1][1] + t[n + 1][1]),
              t.splice(n - 1, 1),
              (l = !0))
            : t[n][1].substring(0, t[n + 1][1].length) == t[n + 1][1] &&
              ((t[n - 1][1] += t[n + 1][1]),
              (t[n][1] = t[n][1].substring(t[n + 1][1].length) + t[n + 1][1]),
              t.splice(n + 1, 1),
              (l = !0))),
          n++);
      l && this.diff_cleanupMerge(t);
    }),
    (i.prototype.diff_xIndex = function (t, e) {
      var n,
        i = 0,
        s = 0,
        h = 0,
        f = 0;
      for (
        n = 0;
        n < t.length &&
        (1 !== t[n][0] && (i += t[n][1].length), t[n][0] !== r && (s += t[n][1].length), !(i > e));
        n++
      )
        ((h = i), (f = s));
      return t.length != n && t[n][0] === r ? f : f + (e - h);
    }),
    (i.prototype.diff_prettyHtml = function (t) {
      for (var e = [], n = /&/g, i = /</g, s = />/g, h = /\n/g, f = 0; f < t.length; f++) {
        var a = t[f][0],
          l = t[f][1]
            .replace(n, "&amp;")
            .replace(i, "&lt;")
            .replace(s, "&gt;")
            .replace(h, "&para;<br>");
        switch (a) {
          case 1:
            e[f] = '<ins style="background:#e6ffe6;">' + l + "</ins>";
            break;
          case r:
            e[f] = '<del style="background:#ffe6e6;">' + l + "</del>";
            break;
          case 0:
            e[f] = "<span>" + l + "</span>";
        }
      }
      return e.join("");
    }),
    (i.prototype.diff_text1 = function (t) {
      for (var e = [], n = 0; n < t.length; n++) 1 !== t[n][0] && (e[n] = t[n][1]);
      return e.join("");
    }),
    (i.prototype.diff_text2 = function (t) {
      for (var e = [], n = 0; n < t.length; n++) t[n][0] !== r && (e[n] = t[n][1]);
      return e.join("");
    }),
    (i.prototype.diff_levenshtein = function (t) {
      for (var e = 0, n = 0, i = 0, s = 0; s < t.length; s++) {
        var h = t[s][0],
          f = t[s][1];
        switch (h) {
          case 1:
            n += f.length;
            break;
          case r:
            i += f.length;
            break;
          case 0:
            ((e += Math.max(n, i)), (n = 0), (i = 0));
        }
      }
      return (e += Math.max(n, i));
    }),
    (i.prototype.diff_toDelta = function (t) {
      for (var e = [], n = 0; n < t.length; n++)
        switch (t[n][0]) {
          case 1:
            e[n] = "+" + encodeURI(t[n][1]);
            break;
          case r:
            e[n] = "-" + t[n][1].length;
            break;
          case 0:
            e[n] = "=" + t[n][1].length;
        }
      return e.join("\t").replace(/%20/g, " ");
    }),
    (i.prototype.diff_fromDelta = function (t, e) {
      for (var n = [], s = 0, h = 0, f = e.split(/\t/g), a = 0; a < f.length; a++) {
        var l = f[a].substring(1);
        switch (f[a].charAt(0)) {
          case "+":
            try {
              n[s++] = new i.Diff(1, decodeURI(l));
            } catch (c) {
              throw new Error("Illegal escape in diff_fromDelta: " + l);
            }
            break;
          case "-":
          // Fall through.
          case "=":
            var g = parseInt(l, 10);
            if (isNaN(g) || g < 0) throw new Error("Invalid number in diff_fromDelta: " + l);
            var o = t.substring(h, (h += g));
            "=" == f[a].charAt(0) ? (n[s++] = new i.Diff(0, o)) : (n[s++] = new i.Diff(r, o));
            break;
          default:
            if (f[a]) throw new Error("Invalid diff operation in diff_fromDelta: " + f[a]);
        }
      }
      if (h != t.length)
        throw new Error(
          "Delta length (" + h + ") does not equal source text length (" + t.length + ")."
        );
      return n;
    }),
    (i.prototype.match_main = function (t, e, n) {
      if (null == t || null == e || null == n) throw new Error("Null input. (match_main)");
      return (
        (n = Math.max(0, Math.min(n, t.length))),
        t == e
          ? 0
          : t.length
            ? t.substring(n, n + e.length) == e
              ? n
              : this.match_bitap_(t, e, n)
            : -1
      );
    }),
    (i.prototype.match_bitap_ = function (t, e, n) {
      if (e.length > this.Match_MaxBits) throw new Error("Pattern too long for this browser.");
      var i = this.match_alphabet_(e),
        r = this;
      function s(t, i) {
        var s = t / e.length,
          h = Math.abs(n - i);
        return r.Match_Distance ? s + h / r.Match_Distance : h ? 1 : s;
      }
      var h = this.Match_Threshold,
        f = t.indexOf(e, n);
      -1 != f &&
        ((h = Math.min(s(0, f), h)),
        -1 != (f = t.lastIndexOf(e, n + e.length)) && (h = Math.min(s(0, f), h)));
      var a,
        l,
        g = 1 << (e.length - 1);
      f = -1;
      for (var o, c = e.length + t.length, u = 0; u < e.length; u++) {
        for (a = 0, l = c; a < l; )
          (s(u, n + l) <= h ? (a = l) : (c = l), (l = Math.floor((c - a) / 2 + a)));
        c = l;
        var p = Math.max(1, n - l + 1),
          d = Math.min(n + l, t.length) + e.length,
          _ = Array(d + 2);
        _[d + 1] = (1 << u) - 1;
        for (var b = d; b >= p; b--) {
          var v = i[t.charAt(b - 1)];
          if (
            ((_[b] =
              0 === u
                ? ((_[b + 1] << 1) | 1) & v
                : (((_[b + 1] << 1) | 1) & v) | ((o[b + 1] | o[b]) << 1) | 1 | o[b + 1]),
            _[b] & g)
          ) {
            var m = s(u, b - 1);
            if (m <= h) {
              if (((h = m), !((f = b - 1) > n))) break;
              p = Math.max(1, 2 * n - f);
            }
          }
        }
        if (s(u + 1, n) > h) break;
        o = _;
      }
      return f;
    }),
    (i.prototype.match_alphabet_ = function (t) {
      for (var e = {}, n = 0; n < t.length; n++) e[t.charAt(n)] = 0;
      for (n = 0; n < t.length; n++) e[t.charAt(n)] |= 1 << (t.length - n - 1);
      return e;
    }),
    (i.prototype.patch_addContext_ = function (t, e) {
      if (0 != e.length) {
        if (null === t.start2) throw Error("patch not initialized");
        for (
          var n = e.substring(t.start2, t.start2 + t.length1), r = 0;
          e.indexOf(n) != e.lastIndexOf(n) &&
          n.length < this.Match_MaxBits - this.Patch_Margin - this.Patch_Margin;
        )
          ((r += this.Patch_Margin), (n = e.substring(t.start2 - r, t.start2 + t.length1 + r)));
        r += this.Patch_Margin;
        var s = e.substring(t.start2 - r, t.start2);
        s && t.diffs.unshift(new i.Diff(0, s));
        var h = e.substring(t.start2 + t.length1, t.start2 + t.length1 + r);
        (h && t.diffs.push(new i.Diff(0, h)),
          (t.start1 -= s.length),
          (t.start2 -= s.length),
          (t.length1 += s.length + h.length),
          (t.length2 += s.length + h.length));
      }
    }),
    (i.prototype.patch_make = function (t, e, n) {
      var s, h;
      if ("string" == typeof t && "string" == typeof e && void 0 === n)
        ((s = /** @type {string} */ t),
          (h = this.diff_main(
            s,
            /** @type {string} */
            e,
            !0
          )).length > 2 && (this.diff_cleanupSemantic(h), this.diff_cleanupEfficiency(h)));
      else if (t && "object" == typeof t && void 0 === e && void 0 === n)
        ((h = /** @type {!Array.<!diff_match_patch.Diff>} */ t), (s = this.diff_text1(h)));
      else if ("string" == typeof t && e && "object" == typeof e && void 0 === n)
        ((s = /** @type {string} */ t), (h = /** @type {!Array.<!diff_match_patch.Diff>} */ e));
      else {
        if ("string" != typeof t || "string" != typeof e || !n || "object" != typeof n)
          throw new Error("Unknown call format to patch_make.");
        ((s = /** @type {string} */ t), (h = /** @type {!Array.<!diff_match_patch.Diff>} */ n));
      }
      if (0 === h.length) return [];
      for (
        var f = [], a = new i.patch_obj(), l = 0, g = 0, o = 0, c = s, u = s, p = 0;
        p < h.length;
        p++
      ) {
        var d = h[p][0],
          _ = h[p][1];
        switch ((l || 0 === d || ((a.start1 = g), (a.start2 = o)), d)) {
          case 1:
            ((a.diffs[l++] = h[p]),
              (a.length2 += _.length),
              (u = u.substring(0, o) + _ + u.substring(o)));
            break;
          case r:
            ((a.length1 += _.length),
              (a.diffs[l++] = h[p]),
              (u = u.substring(0, o) + u.substring(o + _.length)));
            break;
          case 0:
            _.length <= 2 * this.Patch_Margin && l && h.length != p + 1
              ? ((a.diffs[l++] = h[p]), (a.length1 += _.length), (a.length2 += _.length))
              : _.length >= 2 * this.Patch_Margin &&
                l &&
                (this.patch_addContext_(a, c),
                f.push(a),
                (a = new i.patch_obj()),
                (l = 0),
                (c = u),
                (g = o));
        }
        (1 !== d && (g += _.length), d !== r && (o += _.length));
      }
      return (l && (this.patch_addContext_(a, c), f.push(a)), f);
    }),
    (i.prototype.patch_deepCopy = function (t) {
      for (var e = [], n = 0; n < t.length; n++) {
        var r = t[n],
          s = new i.patch_obj();
        s.diffs = [];
        for (var h = 0; h < r.diffs.length; h++)
          s.diffs[h] = new i.Diff(r.diffs[h][0], r.diffs[h][1]);
        ((s.start1 = r.start1),
          (s.start2 = r.start2),
          (s.length1 = r.length1),
          (s.length2 = r.length2),
          (e[n] = s));
      }
      return e;
    }),
    (i.prototype.patch_apply = function (t, e) {
      if (0 == t.length) return [e, []];
      t = this.patch_deepCopy(t);
      var n = this.patch_addPadding(t);
      ((e = n + e + n), this.patch_splitMax(t));
      for (var i = 0, s = [], h = 0; h < t.length; h++) {
        var f,
          a,
          l = t[h].start2 + i,
          g = this.diff_text1(t[h].diffs),
          o = -1;
        if (
          (g.length > this.Match_MaxBits
            ? -1 != (f = this.match_main(e, g.substring(0, this.Match_MaxBits), l)) &&
              (-1 ==
                (o = this.match_main(
                  e,
                  g.substring(g.length - this.Match_MaxBits),
                  l + g.length - this.Match_MaxBits
                )) ||
                f >= o) &&
              (f = -1)
            : (f = this.match_main(e, g, l)),
          -1 == f)
        )
          ((s[h] = !1), (i -= t[h].length2 - t[h].length1));
        else if (
          ((s[h] = !0),
          (i = f - l),
          g ==
            (a = -1 == o ? e.substring(f, f + g.length) : e.substring(f, o + this.Match_MaxBits)))
        )
          e = e.substring(0, f) + this.diff_text2(t[h].diffs) + e.substring(f + g.length);
        else {
          var c = this.diff_main(g, a, !1);
          if (
            g.length > this.Match_MaxBits &&
            this.diff_levenshtein(c) / g.length > this.Patch_DeleteThreshold
          )
            s[h] = !1;
          else {
            this.diff_cleanupSemanticLossless(c);
            for (var u, p = 0, d = 0; d < t[h].diffs.length; d++) {
              var _ = t[h].diffs[d];
              (0 !== _[0] && (u = this.diff_xIndex(c, p)),
                1 === _[0]
                  ? (e = e.substring(0, f + u) + _[1] + e.substring(f + u))
                  : _[0] === r &&
                    (e =
                      e.substring(0, f + u) +
                      e.substring(f + this.diff_xIndex(c, p + _[1].length))),
                _[0] !== r && (p += _[1].length));
            }
          }
        }
      }
      return [(e = e.substring(n.length, e.length - n.length)), s];
    }),
    (i.prototype.patch_addPadding = function (t) {
      for (var e = this.Patch_Margin, n = "", r = 1; r <= e; r++) n += String.fromCharCode(r);
      for (r = 0; r < t.length; r++) ((t[r].start1 += e), (t[r].start2 += e));
      var s = t[0],
        h = s.diffs;
      if (0 == h.length || 0 != h[0][0])
        (h.unshift(new i.Diff(0, n)),
          (s.start1 -= e),
          (s.start2 -= e),
          (s.length1 += e),
          (s.length2 += e));
      else if (e > h[0][1].length) {
        var f = e - h[0][1].length;
        ((h[0][1] = n.substring(h[0][1].length) + h[0][1]),
          (s.start1 -= f),
          (s.start2 -= f),
          (s.length1 += f),
          (s.length2 += f));
      }
      return (
        0 == (h = (s = t[t.length - 1]).diffs).length || 0 != h[h.length - 1][0]
          ? (h.push(new i.Diff(0, n)), (s.length1 += e), (s.length2 += e))
          : e > h[h.length - 1][1].length &&
            ((f = e - h[h.length - 1][1].length),
            (h[h.length - 1][1] += n.substring(0, f)),
            (s.length1 += f),
            (s.length2 += f)),
        n
      );
    }),
    (i.prototype.patch_splitMax = function (t) {
      for (var e = this.Match_MaxBits, n = 0; n < t.length; n++)
        if (!(t[n].length1 <= e)) {
          var s = t[n];
          t.splice(n--, 1);
          for (var h = s.start1, f = s.start2, a = ""; 0 !== s.diffs.length; ) {
            var l = new i.patch_obj(),
              g = !0;
            for (
              l.start1 = h - a.length,
                l.start2 = f - a.length,
                "" !== a && ((l.length1 = l.length2 = a.length), l.diffs.push(new i.Diff(0, a)));
              0 !== s.diffs.length && l.length1 < e - this.Patch_Margin;
            ) {
              var o = s.diffs[0][0],
                c = s.diffs[0][1];
              1 === o
                ? ((l.length2 += c.length),
                  (f += c.length),
                  l.diffs.push(s.diffs.shift()),
                  (g = !1))
                : o === r && 1 == l.diffs.length && 0 == l.diffs[0][0] && c.length > 2 * e
                  ? ((l.length1 += c.length),
                    (h += c.length),
                    (g = !1),
                    l.diffs.push(new i.Diff(o, c)),
                    s.diffs.shift())
                  : ((c = c.substring(0, e - l.length1 - this.Patch_Margin)),
                    (l.length1 += c.length),
                    (h += c.length),
                    0 === o ? ((l.length2 += c.length), (f += c.length)) : (g = !1),
                    l.diffs.push(new i.Diff(o, c)),
                    c == s.diffs[0][1]
                      ? s.diffs.shift()
                      : (s.diffs[0][1] = s.diffs[0][1].substring(c.length)));
            }
            a = (a = this.diff_text2(l.diffs)).substring(a.length - this.Patch_Margin);
            var u = this.diff_text1(s.diffs).substring(0, this.Patch_Margin);
            ("" !== u &&
              ((l.length1 += u.length),
              (l.length2 += u.length),
              0 !== l.diffs.length && 0 === l.diffs[l.diffs.length - 1][0]
                ? (l.diffs[l.diffs.length - 1][1] += u)
                : l.diffs.push(new i.Diff(0, u))),
              g || t.splice(++n, 0, l));
          }
        }
    }),
    (i.prototype.patch_toText = function (t) {
      for (var e = [], n = 0; n < t.length; n++) e[n] = t[n];
      return e.join("");
    }),
    (i.prototype.patch_fromText = function (t) {
      var e = [];
      if (!t) return e;
      for (
        var n = t.split("\n"), s = 0, h = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;
        s < n.length;
      ) {
        var f = n[s].match(h);
        if (!f) throw new Error("Invalid patch string: " + n[s]);
        var a = new i.patch_obj();
        for (
          e.push(a),
            a.start1 = parseInt(f[1], 10),
            "" === f[2]
              ? (a.start1--, (a.length1 = 1))
              : "0" == f[2]
                ? (a.length1 = 0)
                : (a.start1--, (a.length1 = parseInt(f[2], 10))),
            a.start2 = parseInt(f[3], 10),
            "" === f[4]
              ? (a.start2--, (a.length2 = 1))
              : "0" == f[4]
                ? (a.length2 = 0)
                : (a.start2--, (a.length2 = parseInt(f[4], 10))),
            s++;
          s < n.length;
        ) {
          var l = n[s].charAt(0);
          try {
            var g = decodeURI(n[s].substring(1));
          } catch (o) {
            throw new Error("Illegal escape in patch_fromText: " + g);
          }
          if ("-" == l) a.diffs.push(new i.Diff(r, g));
          else if ("+" == l) a.diffs.push(new i.Diff(1, g));
          else if (" " == l) a.diffs.push(new i.Diff(0, g));
          else {
            if ("@" == l) break;
            if ("" !== l) throw new Error('Invalid patch mode "' + l + '" in: ' + g);
          }
          s++;
        }
      }
      return e;
    }),
    ((i.patch_obj = function () {
      ((this.diffs = []),
        (this.start1 = null),
        (this.start2 = null),
        (this.length1 = 0),
        (this.length2 = 0));
    }).prototype.toString = function () {
      for (
        var t,
          e = [
            "@@ -" +
              (0 === this.length1
                ? this.start1 + ",0"
                : 1 == this.length1
                  ? this.start1 + 1
                  : this.start1 + 1 + "," + this.length1) +
              " +" +
              (0 === this.length2
                ? this.start2 + ",0"
                : 1 == this.length2
                  ? this.start2 + 1
                  : this.start2 + 1 + "," + this.length2) +
              " @@\n",
          ],
          n = 0;
        n < this.diffs.length;
        n++
      ) {
        switch (this.diffs[n][0]) {
          case 1:
            t = "+";
            break;
          case r:
            t = "-";
            break;
          case 0:
            t = " ";
        }
        e[n + 1] = t + encodeURI(this.diffs[n][1]) + "\n";
      }
      return e.join("").replace(/%20/g, " ");
    }),
    (n.exports = i),
    (n.exports.diff_match_patch = i),
    (n.exports.DIFF_DELETE = r),
    (n.exports.DIFF_INSERT = 1),
    (n.exports.DIFF_EQUAL = 0)),
  s.exports)
);
export { h as s };
