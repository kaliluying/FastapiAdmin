function e(e, t) {
  (null == t || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function t(t, n) {
  return (
    (function (e) {
      if (Array.isArray(e)) return e;
    })(t) ||
    (function (e, t) {
      var n =
        null == e ? null : ("undefined" != typeof Symbol && e[Symbol.iterator]) || e["@@iterator"];
      if (null != n) {
        var o,
          r,
          i,
          a,
          l = [],
          c = !0,
          s = !1;
        try {
          if (((i = (n = n.call(e)).next), 0 === t));
          else for (; !(c = (o = i.call(n)).done) && (l.push(o.value), l.length !== t); c = !0);
        } catch (u) {
          ((s = !0), (r = u));
        } finally {
          try {
            if (!c && null != n.return && ((a = n.return()), Object(a) !== a)) return;
          } finally {
            if (s) throw r;
          }
        }
        return l;
      }
    })(t, n) ||
    (function (t, n) {
      if (t) {
        if ("string" == typeof t) return e(t, n);
        var o = {}.toString.call(t).slice(8, -1);
        return (
          "Object" === o && t.constructor && (o = t.constructor.name),
          "Map" === o || "Set" === o
            ? Array.from(t)
            : "Arguments" === o || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)
              ? e(t, n)
              : void 0
        );
      }
    })(t, n) ||
    (function () {
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
      );
    })()
  );
}
const n = Object.entries,
  o = Object.setPrototypeOf,
  r = Object.isFrozen,
  i = Object.getPrototypeOf,
  a = Object.getOwnPropertyDescriptor;
let l = Object.freeze,
  c = Object.seal,
  s = Object.create,
  u = "undefined" != typeof Reflect && Reflect,
  m = u.apply,
  f = u.construct;
(l ||
  (l = function (e) {
    return e;
  }),
  c ||
    (c = function (e) {
      return e;
    }),
  m ||
    (m = function (e, t) {
      for (var n = arguments.length, o = new Array(n > 2 ? n - 2 : 0), r = 2; r < n; r++)
        o[r - 2] = arguments[r];
      return e.apply(t, o);
    }),
  f ||
    (f = function (e) {
      for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), o = 1; o < t; o++)
        n[o - 1] = arguments[o];
      return new e(...n);
    }));
const p = L(Array.prototype.forEach),
  d = L(Array.prototype.lastIndexOf),
  h = L(Array.prototype.pop),
  g = L(Array.prototype.push),
  y = L(Array.prototype.splice),
  T = Array.isArray,
  b = L(String.prototype.toLowerCase),
  A = L(String.prototype.toString),
  S = L(String.prototype.match),
  E = L(String.prototype.replace),
  N = L(String.prototype.indexOf),
  _ = L(String.prototype.trim),
  O = L(Number.prototype.toString),
  D = L(Boolean.prototype.toString),
  R = "undefined" == typeof BigInt ? null : L(BigInt.prototype.toString),
  w = "undefined" == typeof Symbol ? null : L(Symbol.prototype.toString),
  v = L(Object.prototype.hasOwnProperty),
  I = L(Object.prototype.toString),
  k = L(RegExp.prototype.test),
  x =
    ((C = TypeError),
    function () {
      for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
      return f(C, t);
    });
var C;
function L(e) {
  return function (t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      o[r - 1] = arguments[r];
    return m(e, t, o);
  };
}
function M(e, t) {
  let n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : b;
  if ((o && o(e, null), !T(t))) return e;
  let i = t.length;
  for (; i--; ) {
    let o = t[i];
    if ("string" == typeof o) {
      const e = n(o);
      e !== o && (r(t) || (t[i] = e), (o = e));
    }
    e[o] = !0;
  }
  return e;
}
function F(e) {
  for (let t = 0; t < e.length; t++) {
    v(e, t) || (e[t] = null);
  }
  return e;
}
function z(e) {
  const o = s(null);
  for (const i of n(e)) {
    var r = t(i, 2);
    const n = r[0],
      a = r[1];
    v(e, n) &&
      (T(a)
        ? (o[n] = F(a))
        : a && "object" == typeof a && a.constructor === Object
          ? (o[n] = z(a))
          : (o[n] = a));
  }
  return o;
}
function U(e, t) {
  for (; null !== e; ) {
    const n = a(e, t);
    if (n) {
      if (n.get) return L(n.get);
      if ("function" == typeof n.value) return L(n.value);
    }
    e = i(e);
  }
  return function () {
    return null;
  };
}
const P = l([
    "a",
    "abbr",
    "acronym",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "bdi",
    "bdo",
    "big",
    "blink",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "center",
    "cite",
    "code",
    "col",
    "colgroup",
    "content",
    "data",
    "datalist",
    "dd",
    "decorator",
    "del",
    "details",
    "dfn",
    "dialog",
    "dir",
    "div",
    "dl",
    "dt",
    "element",
    "em",
    "fieldset",
    "figcaption",
    "figure",
    "font",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "img",
    "input",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "main",
    "map",
    "mark",
    "marquee",
    "menu",
    "menuitem",
    "meter",
    "nav",
    "nobr",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "search",
    "section",
    "select",
    "shadow",
    "slot",
    "small",
    "source",
    "spacer",
    "span",
    "strike",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "tr",
    "track",
    "tt",
    "u",
    "ul",
    "var",
    "video",
    "wbr",
  ]),
  H = l([
    "svg",
    "a",
    "altglyph",
    "altglyphdef",
    "altglyphitem",
    "animatecolor",
    "animatemotion",
    "animatetransform",
    "circle",
    "clippath",
    "defs",
    "desc",
    "ellipse",
    "enterkeyhint",
    "exportparts",
    "filter",
    "font",
    "g",
    "glyph",
    "glyphref",
    "hkern",
    "image",
    "inputmode",
    "line",
    "lineargradient",
    "marker",
    "mask",
    "metadata",
    "mpath",
    "part",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialgradient",
    "rect",
    "stop",
    "style",
    "switch",
    "symbol",
    "text",
    "textpath",
    "title",
    "tref",
    "tspan",
    "view",
    "vkern",
  ]),
  B = l([
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
  ]),
  G = l([
    "animate",
    "color-profile",
    "cursor",
    "discard",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "foreignobject",
    "hatch",
    "hatchpath",
    "mesh",
    "meshgradient",
    "meshpatch",
    "meshrow",
    "missing-glyph",
    "script",
    "set",
    "solidcolor",
    "unknown",
    "use",
  ]),
  j = l([
    "math",
    "menclose",
    "merror",
    "mfenced",
    "mfrac",
    "mglyph",
    "mi",
    "mlabeledtr",
    "mmultiscripts",
    "mn",
    "mo",
    "mover",
    "mpadded",
    "mphantom",
    "mroot",
    "mrow",
    "ms",
    "mspace",
    "msqrt",
    "mstyle",
    "msub",
    "msup",
    "msubsup",
    "mtable",
    "mtd",
    "mtext",
    "mtr",
    "munder",
    "munderover",
    "mprescripts",
  ]),
  W = l([
    "maction",
    "maligngroup",
    "malignmark",
    "mlongdiv",
    "mscarries",
    "mscarry",
    "msgroup",
    "mstack",
    "msline",
    "msrow",
    "semantics",
    "annotation",
    "annotation-xml",
    "mprescripts",
    "none",
  ]),
  Y = l(["#text"]),
  q = l([
    "accept",
    "action",
    "align",
    "alt",
    "autocapitalize",
    "autocomplete",
    "autopictureinpicture",
    "autoplay",
    "background",
    "bgcolor",
    "border",
    "capture",
    "cellpadding",
    "cellspacing",
    "checked",
    "cite",
    "class",
    "clear",
    "color",
    "cols",
    "colspan",
    "controls",
    "controlslist",
    "coords",
    "crossorigin",
    "datetime",
    "decoding",
    "default",
    "dir",
    "disabled",
    "disablepictureinpicture",
    "disableremoteplayback",
    "download",
    "draggable",
    "enctype",
    "enterkeyhint",
    "exportparts",
    "face",
    "for",
    "headers",
    "height",
    "hidden",
    "high",
    "href",
    "hreflang",
    "id",
    "inert",
    "inputmode",
    "integrity",
    "ismap",
    "kind",
    "label",
    "lang",
    "list",
    "loading",
    "loop",
    "low",
    "max",
    "maxlength",
    "media",
    "method",
    "min",
    "minlength",
    "multiple",
    "muted",
    "name",
    "nonce",
    "noshade",
    "novalidate",
    "nowrap",
    "open",
    "optimum",
    "part",
    "pattern",
    "placeholder",
    "playsinline",
    "popover",
    "popovertarget",
    "popovertargetaction",
    "poster",
    "preload",
    "pubdate",
    "radiogroup",
    "readonly",
    "rel",
    "required",
    "rev",
    "reversed",
    "role",
    "rows",
    "rowspan",
    "spellcheck",
    "scope",
    "selected",
    "shape",
    "size",
    "sizes",
    "slot",
    "span",
    "srclang",
    "start",
    "src",
    "srcset",
    "step",
    "style",
    "summary",
    "tabindex",
    "title",
    "translate",
    "type",
    "usemap",
    "valign",
    "value",
    "width",
    "wrap",
    "xmlns",
  ]),
  X = l([
    "accent-height",
    "accumulate",
    "additive",
    "alignment-baseline",
    "amplitude",
    "ascent",
    "attributename",
    "attributetype",
    "azimuth",
    "basefrequency",
    "baseline-shift",
    "begin",
    "bias",
    "by",
    "class",
    "clip",
    "clippathunits",
    "clip-path",
    "clip-rule",
    "color",
    "color-interpolation",
    "color-interpolation-filters",
    "color-profile",
    "color-rendering",
    "cx",
    "cy",
    "d",
    "dx",
    "dy",
    "diffuseconstant",
    "direction",
    "display",
    "divisor",
    "dur",
    "edgemode",
    "elevation",
    "end",
    "exponent",
    "fill",
    "fill-opacity",
    "fill-rule",
    "filter",
    "filterunits",
    "flood-color",
    "flood-opacity",
    "font-family",
    "font-size",
    "font-size-adjust",
    "font-stretch",
    "font-style",
    "font-variant",
    "font-weight",
    "fx",
    "fy",
    "g1",
    "g2",
    "glyph-name",
    "glyphref",
    "gradientunits",
    "gradienttransform",
    "height",
    "href",
    "id",
    "image-rendering",
    "in",
    "in2",
    "intercept",
    "k",
    "k1",
    "k2",
    "k3",
    "k4",
    "kerning",
    "keypoints",
    "keysplines",
    "keytimes",
    "lang",
    "lengthadjust",
    "letter-spacing",
    "kernelmatrix",
    "kernelunitlength",
    "lighting-color",
    "local",
    "marker-end",
    "marker-mid",
    "marker-start",
    "markerheight",
    "markerunits",
    "markerwidth",
    "maskcontentunits",
    "maskunits",
    "max",
    "mask",
    "mask-type",
    "media",
    "method",
    "mode",
    "min",
    "name",
    "numoctaves",
    "offset",
    "operator",
    "opacity",
    "order",
    "orient",
    "orientation",
    "origin",
    "overflow",
    "paint-order",
    "path",
    "pathlength",
    "patterncontentunits",
    "patterntransform",
    "patternunits",
    "points",
    "preservealpha",
    "preserveaspectratio",
    "primitiveunits",
    "r",
    "rx",
    "ry",
    "radius",
    "refx",
    "refy",
    "repeatcount",
    "repeatdur",
    "restart",
    "result",
    "rotate",
    "scale",
    "seed",
    "shape-rendering",
    "slope",
    "specularconstant",
    "specularexponent",
    "spreadmethod",
    "startoffset",
    "stddeviation",
    "stitchtiles",
    "stop-color",
    "stop-opacity",
    "stroke-dasharray",
    "stroke-dashoffset",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-miterlimit",
    "stroke-opacity",
    "stroke",
    "stroke-width",
    "style",
    "surfacescale",
    "systemlanguage",
    "tabindex",
    "tablevalues",
    "targetx",
    "targety",
    "transform",
    "transform-origin",
    "text-anchor",
    "text-decoration",
    "text-rendering",
    "textlength",
    "type",
    "u1",
    "u2",
    "unicode",
    "values",
    "viewbox",
    "visibility",
    "version",
    "vert-adv-y",
    "vert-origin-x",
    "vert-origin-y",
    "width",
    "word-spacing",
    "wrap",
    "writing-mode",
    "xchannelselector",
    "ychannelselector",
    "x",
    "x1",
    "x2",
    "xmlns",
    "y",
    "y1",
    "y2",
    "z",
    "zoomandpan",
  ]),
  $ = l([
    "accent",
    "accentunder",
    "align",
    "bevelled",
    "close",
    "columnalign",
    "columnlines",
    "columnspacing",
    "columnspan",
    "denomalign",
    "depth",
    "dir",
    "display",
    "displaystyle",
    "encoding",
    "fence",
    "frame",
    "height",
    "href",
    "id",
    "largeop",
    "length",
    "linethickness",
    "lquote",
    "lspace",
    "mathbackground",
    "mathcolor",
    "mathsize",
    "mathvariant",
    "maxsize",
    "minsize",
    "movablelimits",
    "notation",
    "numalign",
    "open",
    "rowalign",
    "rowlines",
    "rowspacing",
    "rowspan",
    "rspace",
    "rquote",
    "scriptlevel",
    "scriptminsize",
    "scriptsizemultiplier",
    "selection",
    "separator",
    "separators",
    "stretchy",
    "subscriptshift",
    "supscriptshift",
    "symmetric",
    "voffset",
    "width",
    "xmlns",
  ]),
  K = l(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]),
  V = c(/{{[\w\W]*|^[\w\W]*}}/g),
  Z = c(/<%[\w\W]*|^[\w\W]*%>/g),
  J = c(/\${[\w\W]*/g),
  Q = c(/^data-[\-\w.\u00B7-\uFFFF]+$/),
  ee = c(/^aria-[\-\w]+$/),
  te = c(
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  ),
  ne = c(/^(?:\w+script|data):/i),
  oe = c(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),
  re = c(/^html$/i),
  ie = c(/^[a-z][.\w]*(-[.\w]+)+$/i),
  ae = 1,
  le = 3,
  ce = 7,
  se = 8,
  ue = 9;
var me = (function e() {
  let t =
    arguments.length > 0 && void 0 !== arguments[0]
      ? arguments[0]
      : "undefined" == typeof window
        ? null
        : window;
  const o = (t) => e(t);
  if (
    ((o.version = "3.4.3"),
    (o.removed = []),
    !t || !t.document || t.document.nodeType !== ue || !t.Element)
  )
    return ((o.isSupported = !1), o);
  let r = t.document;
  const i = r,
    a = i.currentScript,
    c = t.DocumentFragment,
    u = t.HTMLTemplateElement,
    m = t.Node,
    f = t.Element,
    C = t.NodeFilter,
    L = t.NamedNodeMap,
    F = void 0 === L ? t.NamedNodeMap || t.MozNamedAttrMap : L,
    me = t.HTMLFormElement,
    fe = t.DOMParser,
    pe = t.trustedTypes,
    de = f.prototype,
    he = U(de, "cloneNode"),
    ge = U(de, "remove"),
    ye = U(de, "nextSibling"),
    Te = U(de, "childNodes"),
    be = U(de, "parentNode");
  if ("function" == typeof u) {
    const e = r.createElement("template");
    e.content && e.content.ownerDocument && (r = e.content.ownerDocument);
  }
  let Ae,
    Se = "";
  const Ee = r,
    Ne = Ee.implementation,
    _e = Ee.createNodeIterator,
    Oe = Ee.createDocumentFragment,
    De = Ee.getElementsByTagName,
    Re = i.importNode;
  let we = {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: [],
  };
  o.isSupported =
    "function" == typeof n && "function" == typeof be && Ne && void 0 !== Ne.createHTMLDocument;
  const ve = V,
    Ie = Z,
    ke = J,
    xe = Q,
    Ce = ee,
    Le = ne,
    Me = oe,
    Fe = ie;
  let ze = te,
    Ue = null;
  const Pe = M({}, [...P, ...H, ...B, ...j, ...Y]);
  let He = null;
  const Be = M({}, [...q, ...X, ...$, ...K]);
  let Ge = Object.seal(
      s(null, {
        tagNameCheck: { writable: !0, configurable: !1, enumerable: !0, value: null },
        attributeNameCheck: { writable: !0, configurable: !1, enumerable: !0, value: null },
        allowCustomizedBuiltInElements: {
          writable: !0,
          configurable: !1,
          enumerable: !0,
          value: !1,
        },
      })
    ),
    je = null,
    We = null;
  const Ye = Object.seal(
    s(null, {
      tagCheck: { writable: !0, configurable: !1, enumerable: !0, value: null },
      attributeCheck: { writable: !0, configurable: !1, enumerable: !0, value: null },
    })
  );
  let qe = !0,
    Xe = !0,
    $e = !1,
    Ke = !0,
    Ve = !1,
    Ze = !0,
    Je = !1,
    Qe = !1,
    et = !1,
    tt = !1,
    nt = !1,
    ot = !1,
    rt = !0,
    it = !1;
  const at = "user-content-";
  let lt = !0,
    ct = !1,
    st = {},
    ut = null;
  const mt = M({}, [
    "annotation-xml",
    "audio",
    "colgroup",
    "desc",
    "foreignobject",
    "head",
    "iframe",
    "math",
    "mi",
    "mn",
    "mo",
    "ms",
    "mtext",
    "noembed",
    "noframes",
    "noscript",
    "plaintext",
    "script",
    "style",
    "svg",
    "template",
    "thead",
    "title",
    "video",
    "xmp",
  ]);
  let ft = null;
  const pt = M({}, ["audio", "video", "img", "source", "image", "track"]);
  let dt = null;
  const ht = M({}, [
      "alt",
      "class",
      "for",
      "id",
      "label",
      "name",
      "pattern",
      "placeholder",
      "role",
      "summary",
      "title",
      "value",
      "style",
      "xmlns",
    ]),
    gt = "http://www.w3.org/1998/Math/MathML",
    yt = "http://www.w3.org/2000/svg",
    Tt = "http://www.w3.org/1999/xhtml";
  let bt = Tt,
    At = !1,
    St = null;
  const Et = M({}, [gt, yt, Tt], A);
  let Nt = M({}, ["mi", "mo", "mn", "ms", "mtext"]),
    _t = M({}, ["annotation-xml"]);
  const Ot = M({}, ["title", "style", "font", "a", "script"]);
  let Dt = null;
  const Rt = ["application/xhtml+xml", "text/html"];
  let wt = null,
    vt = null;
  const It = r.createElement("form"),
    kt = function (e) {
      return e instanceof RegExp || e instanceof Function;
    },
    xt = function () {
      let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      if (vt && vt === e) return;
      ((e && "object" == typeof e) || (e = {}),
        (e = z(e)),
        (Dt = -1 === Rt.indexOf(e.PARSER_MEDIA_TYPE) ? "text/html" : e.PARSER_MEDIA_TYPE), // eslint-disable-next-line unicorn/prefer-includes
        (wt = "application/xhtml+xml" === Dt ? A : b),
        (Ue = v(e, "ALLOWED_TAGS") && T(e.ALLOWED_TAGS) ? M({}, e.ALLOWED_TAGS, wt) : Pe),
        (He = v(e, "ALLOWED_ATTR") && T(e.ALLOWED_ATTR) ? M({}, e.ALLOWED_ATTR, wt) : Be),
        (St =
          v(e, "ALLOWED_NAMESPACES") && T(e.ALLOWED_NAMESPACES)
            ? M({}, e.ALLOWED_NAMESPACES, A)
            : Et),
        (dt =
          v(e, "ADD_URI_SAFE_ATTR") && T(e.ADD_URI_SAFE_ATTR)
            ? M(z(ht), e.ADD_URI_SAFE_ATTR, wt)
            : ht),
        (ft =
          v(e, "ADD_DATA_URI_TAGS") && T(e.ADD_DATA_URI_TAGS)
            ? M(z(pt), e.ADD_DATA_URI_TAGS, wt)
            : pt),
        (ut = v(e, "FORBID_CONTENTS") && T(e.FORBID_CONTENTS) ? M({}, e.FORBID_CONTENTS, wt) : mt),
        (je = v(e, "FORBID_TAGS") && T(e.FORBID_TAGS) ? M({}, e.FORBID_TAGS, wt) : z({})),
        (We = v(e, "FORBID_ATTR") && T(e.FORBID_ATTR) ? M({}, e.FORBID_ATTR, wt) : z({})),
        (st =
          !!v(e, "USE_PROFILES") &&
          (e.USE_PROFILES && "object" == typeof e.USE_PROFILES
            ? z(e.USE_PROFILES)
            : e.USE_PROFILES)),
        (qe = !1 !== e.ALLOW_ARIA_ATTR),
        (Xe = !1 !== e.ALLOW_DATA_ATTR),
        ($e = e.ALLOW_UNKNOWN_PROTOCOLS || !1),
        (Ke = !1 !== e.ALLOW_SELF_CLOSE_IN_ATTR),
        (Ve = e.SAFE_FOR_TEMPLATES || !1),
        (Ze = !1 !== e.SAFE_FOR_XML),
        (Je = e.WHOLE_DOCUMENT || !1),
        (tt = e.RETURN_DOM || !1),
        (nt = e.RETURN_DOM_FRAGMENT || !1),
        (ot = e.RETURN_TRUSTED_TYPE || !1),
        (et = e.FORCE_BODY || !1),
        (rt = !1 !== e.SANITIZE_DOM),
        (it = e.SANITIZE_NAMED_PROPS || !1),
        (lt = !1 !== e.KEEP_CONTENT),
        (ct = e.IN_PLACE || !1),
        (ze = (function (e) {
          try {
            return (k(e, ""), !0);
          } catch (t) {
            return !1;
          }
        })(e.ALLOWED_URI_REGEXP)
          ? e.ALLOWED_URI_REGEXP
          : te),
        (bt = "string" == typeof e.NAMESPACE ? e.NAMESPACE : Tt),
        (Nt =
          v(e, "MATHML_TEXT_INTEGRATION_POINTS") &&
          e.MATHML_TEXT_INTEGRATION_POINTS &&
          "object" == typeof e.MATHML_TEXT_INTEGRATION_POINTS
            ? z(e.MATHML_TEXT_INTEGRATION_POINTS)
            : M({}, ["mi", "mo", "mn", "ms", "mtext"])),
        (_t =
          v(e, "HTML_INTEGRATION_POINTS") &&
          e.HTML_INTEGRATION_POINTS &&
          "object" == typeof e.HTML_INTEGRATION_POINTS
            ? z(e.HTML_INTEGRATION_POINTS)
            : M({}, ["annotation-xml"])));
      const t =
        v(e, "CUSTOM_ELEMENT_HANDLING") &&
        e.CUSTOM_ELEMENT_HANDLING &&
        "object" == typeof e.CUSTOM_ELEMENT_HANDLING
          ? z(e.CUSTOM_ELEMENT_HANDLING)
          : s(null);
      if (
        ((Ge = s(null)),
        v(t, "tagNameCheck") && kt(t.tagNameCheck) && (Ge.tagNameCheck = t.tagNameCheck),
        v(t, "attributeNameCheck") &&
          kt(t.attributeNameCheck) &&
          (Ge.attributeNameCheck = t.attributeNameCheck),
        v(t, "allowCustomizedBuiltInElements") &&
          "boolean" == typeof t.allowCustomizedBuiltInElements &&
          (Ge.allowCustomizedBuiltInElements = t.allowCustomizedBuiltInElements),
        Ve && (Xe = !1),
        nt && (tt = !0),
        st &&
          ((Ue = M({}, Y)),
          (He = s(null)),
          !0 === st.html && (M(Ue, P), M(He, q)),
          !0 === st.svg && (M(Ue, H), M(He, X), M(He, K)),
          !0 === st.svgFilters && (M(Ue, B), M(He, X), M(He, K)),
          !0 === st.mathMl && (M(Ue, j), M(He, $), M(He, K))),
        (Ye.tagCheck = null),
        (Ye.attributeCheck = null),
        v(e, "ADD_TAGS") &&
          ("function" == typeof e.ADD_TAGS
            ? (Ye.tagCheck = e.ADD_TAGS)
            : T(e.ADD_TAGS) && (Ue === Pe && (Ue = z(Ue)), M(Ue, e.ADD_TAGS, wt))),
        v(e, "ADD_ATTR") &&
          ("function" == typeof e.ADD_ATTR
            ? (Ye.attributeCheck = e.ADD_ATTR)
            : T(e.ADD_ATTR) && (He === Be && (He = z(He)), M(He, e.ADD_ATTR, wt))),
        v(e, "ADD_URI_SAFE_ATTR") && T(e.ADD_URI_SAFE_ATTR) && M(dt, e.ADD_URI_SAFE_ATTR, wt),
        v(e, "FORBID_CONTENTS") &&
          T(e.FORBID_CONTENTS) &&
          (ut === mt && (ut = z(ut)), M(ut, e.FORBID_CONTENTS, wt)),
        v(e, "ADD_FORBID_CONTENTS") &&
          T(e.ADD_FORBID_CONTENTS) &&
          (ut === mt && (ut = z(ut)), M(ut, e.ADD_FORBID_CONTENTS, wt)),
        lt && (Ue["#text"] = !0),
        Je && M(Ue, ["html", "head", "body"]),
        Ue.table && (M(Ue, ["tbody"]), delete je.tbody),
        e.TRUSTED_TYPES_POLICY)
      ) {
        if ("function" != typeof e.TRUSTED_TYPES_POLICY.createHTML)
          throw x('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if ("function" != typeof e.TRUSTED_TYPES_POLICY.createScriptURL)
          throw x(
            'TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.'
          );
        ((Ae = e.TRUSTED_TYPES_POLICY), (Se = Ae.createHTML("")));
      } else
        (void 0 === Ae &&
          (Ae = (function (e, t) {
            if ("object" != typeof e || "function" != typeof e.createPolicy) return null;
            let n = null;
            const o = "data-tt-policy-suffix";
            t && t.hasAttribute(o) && (n = t.getAttribute(o));
            const r = "dompurify" + (n ? "#" + n : "");
            try {
              return e.createPolicy(r, { createHTML: (e) => e, createScriptURL: (e) => e });
            } catch (i) {
              return null;
            }
          })(pe, a)),
          null !== Ae && "string" == typeof Se && (Se = Ae.createHTML("")));
      (l && l(e), (vt = e));
    },
    Ct = M({}, [...H, ...B, ...G]),
    Lt = M({}, [...j, ...W]),
    Mt = function (e) {
      g(o.removed, { element: e });
      try {
        be(e).removeChild(e);
      } catch (t) {
        ge(e);
      }
    },
    Ft = function (e, t) {
      try {
        g(o.removed, { attribute: t.getAttributeNode(e), from: t });
      } catch (n) {
        g(o.removed, { attribute: null, from: t });
      }
      if ((t.removeAttribute(e), "is" === e))
        if (tt || nt)
          try {
            Mt(t);
          } catch (n) {}
        else
          try {
            t.setAttribute(e, "");
          } catch (n) {}
    },
    zt = function (e) {
      let t = null,
        n = null;
      if (et) e = "<remove></remove>" + e;
      else {
        const t = S(e, /^[\r\n\t ]+/);
        n = t && t[0];
      }
      "application/xhtml+xml" === Dt &&
        bt === Tt &&
        (e =
          '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + e + "</body></html>");
      const o = Ae ? Ae.createHTML(e) : e;
      if (bt === Tt)
        try {
          t = new fe().parseFromString(o, Dt);
        } catch (a) {}
      if (!t || !t.documentElement) {
        t = Ne.createDocument(bt, "template", null);
        try {
          t.documentElement.innerHTML = At ? Se : o;
        } catch (a) {}
      }
      const i = t.body || t.documentElement;
      return (
        e && n && i.insertBefore(r.createTextNode(n), i.childNodes[0] || null),
        bt === Tt ? De.call(t, Je ? "html" : "body")[0] : Je ? t.documentElement : i
      );
    },
    Ut = function (e) {
      return _e.call(
        e.ownerDocument || e,
        e,
        // eslint-disable-next-line no-bitwise
        C.SHOW_ELEMENT |
          C.SHOW_COMMENT |
          C.SHOW_TEXT |
          C.SHOW_PROCESSING_INSTRUCTION |
          C.SHOW_CDATA_SECTION,
        null
      );
    },
    Pt = function (e) {
      return (
        e instanceof me &&
        ("string" != typeof e.nodeName ||
          "string" != typeof e.textContent ||
          "function" != typeof e.removeChild ||
          !(e.attributes instanceof F) ||
          "function" != typeof e.removeAttribute ||
          "function" != typeof e.setAttribute ||
          "string" != typeof e.namespaceURI ||
          "function" != typeof e.insertBefore ||
          "function" != typeof e.hasChildNodes)
      );
    },
    Ht = function (e) {
      return "function" == typeof m && e instanceof m;
    };
  function Bt(e, t, n) {
    p(e, (e) => {
      e.call(o, t, n, vt);
    });
  }
  const Gt = function (e) {
      let t = null;
      if ((Bt(we.beforeSanitizeElements, e, null), Pt(e))) return (Mt(e), !0);
      const n = wt(e.nodeName);
      if (
        (Bt(we.uponSanitizeElement, e, { tagName: n, allowedTags: Ue }),
        Ze &&
          e.hasChildNodes() &&
          !Ht(e.firstElementChild) &&
          k(/<[/\w!]/g, e.innerHTML) &&
          k(/<[/\w!]/g, e.textContent))
      )
        return (Mt(e), !0);
      if (Ze && e.namespaceURI === Tt && "style" === n && Ht(e.firstElementChild))
        return (Mt(e), !0);
      if (e.nodeType === ce) return (Mt(e), !0);
      if (Ze && e.nodeType === se && k(/<[/\w]/g, e.data)) return (Mt(e), !0);
      if (je[n] || (!(Ye.tagCheck instanceof Function && Ye.tagCheck(n)) && !Ue[n])) {
        if (!je[n] && Yt(n)) {
          if (Ge.tagNameCheck instanceof RegExp && k(Ge.tagNameCheck, n)) return !1;
          if (Ge.tagNameCheck instanceof Function && Ge.tagNameCheck(n)) return !1;
        }
        if (lt && !ut[n]) {
          const t = be(e) || e.parentNode,
            n = Te(e) || e.childNodes;
          if (n && t) {
            for (let o = n.length - 1; o >= 0; --o) {
              const r = he(n[o], !0);
              t.insertBefore(r, ye(e));
            }
          }
        }
        return (Mt(e), !0);
      }
      return e instanceof f &&
        !(function (e) {
          let t = be(e);
          (t && t.tagName) || (t = { namespaceURI: bt, tagName: "template" });
          const n = b(e.tagName),
            o = b(t.tagName);
          return (
            !!St[e.namespaceURI] &&
            (e.namespaceURI === yt
              ? t.namespaceURI === Tt
                ? "svg" === n
                : t.namespaceURI === gt
                  ? "svg" === n && ("annotation-xml" === o || Nt[o])
                  : Boolean(Ct[n])
              : e.namespaceURI === gt
                ? t.namespaceURI === Tt
                  ? "math" === n
                  : t.namespaceURI === yt
                    ? "math" === n && _t[o]
                    : Boolean(Lt[n])
                : e.namespaceURI === Tt
                  ? !(t.namespaceURI === yt && !_t[o]) &&
                    !(t.namespaceURI === gt && !Nt[o]) &&
                    !Lt[n] &&
                    (Ot[n] || !Ct[n])
                  : !("application/xhtml+xml" !== Dt || !St[e.namespaceURI]))
          );
        })(e)
        ? (Mt(e), !0)
        : ("noscript" !== n && "noembed" !== n && "noframes" !== n) ||
            !k(/<\/no(script|embed|frames)/i, e.innerHTML)
          ? (Ve &&
              e.nodeType === le &&
              ((t = e.textContent),
              p([ve, Ie, ke], (e) => {
                t = E(t, e, " ");
              }),
              e.textContent !== t &&
                (g(o.removed, { element: e.cloneNode() }), (e.textContent = t))),
            Bt(we.afterSanitizeElements, e, null),
            !1)
          : (Mt(e), !0);
    },
    jt = function (e, t, n) {
      if (We[t]) return !1;
      if (rt && ("id" === t || "name" === t) && (n in r || n in It)) return !1;
      const o = He[t] || (Ye.attributeCheck instanceof Function && Ye.attributeCheck(t, e));
      if (Xe && !We[t] && k(xe, t));
      else if (qe && k(Ce, t));
      else if (!o || We[t]) {
        if (
          // First condition does a very basic check if a) it's basically a valid custom element tagname AND
          // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
          // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
          !(
            (Yt(e) &&
              ((Ge.tagNameCheck instanceof RegExp && k(Ge.tagNameCheck, e)) ||
                (Ge.tagNameCheck instanceof Function && Ge.tagNameCheck(e))) &&
              ((Ge.attributeNameCheck instanceof RegExp && k(Ge.attributeNameCheck, t)) ||
                (Ge.attributeNameCheck instanceof Function && Ge.attributeNameCheck(t, e)))) || // Alternative, second condition checks if it's an `is`-attribute, AND
            // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
            ("is" === t &&
              Ge.allowCustomizedBuiltInElements &&
              ((Ge.tagNameCheck instanceof RegExp && k(Ge.tagNameCheck, n)) ||
                (Ge.tagNameCheck instanceof Function && Ge.tagNameCheck(n))))
          )
        )
          return !1;
      } else if (dt[t]);
      else if (k(ze, E(n, Me, "")));
      else if (
        ("src" !== t && "xlink:href" !== t && "href" !== t) ||
        "script" === e ||
        0 !== N(n, "data:") ||
        !ft[e]
      ) {
        if ($e && !k(Le, E(n, Me, "")));
        else if (n) return !1;
      } else;
      return !0;
    },
    Wt = M({}, [
      "annotation-xml",
      "color-profile",
      "font-face",
      "font-face-format",
      "font-face-name",
      "font-face-src",
      "font-face-uri",
      "missing-glyph",
    ]),
    Yt = function (e) {
      return !Wt[b(e)] && k(Fe, e);
    },
    qt = function (e) {
      Bt(we.beforeSanitizeAttributes, e, null);
      const t = e.attributes;
      if (!t || Pt(e)) return;
      const n = {
        attrName: "",
        attrValue: "",
        keepAttr: !0,
        allowedAttributes: He,
        forceKeepAttr: void 0,
      };
      let r = t.length;
      for (; r--; ) {
        const a = t[r],
          l = a.name,
          c = a.namespaceURI,
          s = a.value,
          u = wt(l),
          m = s;
        let f = "value" === l ? m : _(m);
        if (
          ((n.attrName = u),
          (n.attrValue = f),
          (n.keepAttr = !0),
          (n.forceKeepAttr = void 0),
          Bt(we.uponSanitizeAttribute, e, n),
          (f = n.attrValue),
          !it || ("id" !== u && "name" !== u) || 0 === N(f, at) || (Ft(l, e), (f = at + f)),
          Ze &&
            k(
              /((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,
              f
            ))
        ) {
          Ft(l, e);
          continue;
        }
        if ("attributename" === u && S(f, "href")) {
          Ft(l, e);
          continue;
        }
        if (n.forceKeepAttr) continue;
        if (!n.keepAttr) {
          Ft(l, e);
          continue;
        }
        if (!Ke && k(/\/>/i, f)) {
          Ft(l, e);
          continue;
        }
        Ve &&
          p([ve, Ie, ke], (e) => {
            f = E(f, e, " ");
          });
        const d = wt(e.nodeName);
        if (jt(d, u, f)) {
          if (Ae && "object" == typeof pe && "function" == typeof pe.getAttributeType)
            if (c);
            else
              switch (pe.getAttributeType(d, u)) {
                case "TrustedHTML":
                  f = Ae.createHTML(f);
                  break;
                case "TrustedScriptURL":
                  f = Ae.createScriptURL(f);
              }
          if (f !== m)
            try {
              (c ? e.setAttributeNS(c, l, f) : e.setAttribute(l, f), Pt(e) ? Mt(e) : h(o.removed));
            } catch (i) {
              Ft(l, e);
            }
        } else Ft(l, e);
      }
      Bt(we.afterSanitizeAttributes, e, null);
    },
    Xt = function (e) {
      let t = null;
      const n = Ut(e);
      for (Bt(we.beforeSanitizeShadowDOM, e, null); (t = n.nextNode()); )
        (Bt(we.uponSanitizeShadowNode, t, null),
          Gt(t),
          qt(t),
          t.content instanceof c && Xt(t.content));
      Bt(we.afterSanitizeShadowDOM, e, null);
    },
    $t = function (e) {
      if (e.nodeType === ae && e.shadowRoot instanceof c) {
        const t = e.shadowRoot;
        ($t(t), Xt(t));
      }
      const t = e.childNodes;
      if (!t) return;
      const n = [];
      p(t, (e) => {
        g(n, e);
      });
      for (const o of n) $t(o);
    };
  return (
    (o.sanitize = function (e) {
      let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
        n = null,
        r = null,
        a = null,
        l = null;
      if (
        ((At = !e),
        At && (e = "\x3c!--\x3e"),
        "string" != typeof e &&
          !Ht(e) &&
          "string" !=
            typeof (e = (function (e) {
              switch (typeof e) {
                case "string":
                  return e;
                case "number":
                  return O(e);
                case "boolean":
                  return D(e);
                case "bigint":
                  return R ? R(e) : "0";
                case "symbol":
                  return w ? w(e) : "Symbol()";
                case "undefined":
                default:
                  return I(e);
                case "function":
                case "object": {
                  if (null === e) return I(e);
                  const t = e,
                    n = U(t, "toString");
                  if ("function" == typeof n) {
                    const e = n(t);
                    return "string" == typeof e ? e : I(e);
                  }
                  return I(e);
                }
              }
            })(e)))
      )
        throw x("dirty is not a string, aborting");
      if (!o.isSupported) return e;
      if ((Qe || xt(t), (o.removed = []), "string" == typeof e && (ct = !1), ct)) {
        const t = e.nodeName;
        if ("string" == typeof t) {
          const e = wt(t);
          if (!Ue[e] || je[e]) throw x("root node is forbidden and cannot be sanitized in-place");
        }
        $t(e);
      } else if (e instanceof m)
        ((n = zt("\x3c!----\x3e")),
          (r = n.ownerDocument.importNode(e, !0)),
          (r.nodeType === ae && "BODY" === r.nodeName) || "HTML" === r.nodeName
            ? (n = r)
            : n.appendChild(r),
          $t(r));
      else {
        if (
          !tt &&
          !Ve &&
          !Je && // eslint-disable-next-line unicorn/prefer-includes
          -1 === e.indexOf("<")
        )
          return Ae && ot ? Ae.createHTML(e) : e;
        if (((n = zt(e)), !n)) return tt ? null : ot ? Se : "";
      }
      n && et && Mt(n.firstChild);
      const s = Ut(ct ? e : n);
      for (; (a = s.nextNode()); ) (Gt(a), qt(a), a.content instanceof c && Xt(a.content));
      if (ct) return e;
      if (tt) {
        if (Ve) {
          n.normalize();
          let e = n.innerHTML;
          (p([ve, Ie, ke], (t) => {
            e = E(e, t, " ");
          }),
            (n.innerHTML = e));
        }
        if (nt) for (l = Oe.call(n.ownerDocument); n.firstChild; ) l.appendChild(n.firstChild);
        else l = n;
        return ((He.shadowroot || He.shadowrootmode) && (l = Re.call(i, l, !0)), l);
      }
      let u = Je ? n.outerHTML : n.innerHTML;
      return (
        Je &&
          Ue["!doctype"] &&
          n.ownerDocument &&
          n.ownerDocument.doctype &&
          n.ownerDocument.doctype.name &&
          k(re, n.ownerDocument.doctype.name) &&
          (u = "<!DOCTYPE " + n.ownerDocument.doctype.name + ">\n" + u),
        Ve &&
          p([ve, Ie, ke], (e) => {
            u = E(u, e, " ");
          }),
        Ae && ot ? Ae.createHTML(u) : u
      );
    }),
    (o.setConfig = function () {
      (xt(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}), (Qe = !0));
    }),
    (o.clearConfig = function () {
      ((vt = null), (Qe = !1));
    }),
    (o.isValidAttribute = function (e, t, n) {
      vt || xt({});
      const o = wt(e),
        r = wt(t);
      return jt(o, r, n);
    }),
    (o.addHook = function (e, t) {
      "function" == typeof t && g(we[e], t);
    }),
    (o.removeHook = function (e, t) {
      if (void 0 !== t) {
        const n = d(we[e], t);
        return -1 === n ? void 0 : y(we[e], n, 1)[0];
      }
      return h(we[e]);
    }),
    (o.removeHooks = function (e) {
      we[e] = [];
    }),
    (o.removeAllHooks = function () {
      we = {
        afterSanitizeAttributes: [],
        afterSanitizeElements: [],
        afterSanitizeShadowDOM: [],
        beforeSanitizeAttributes: [],
        beforeSanitizeElements: [],
        beforeSanitizeShadowDOM: [],
        uponSanitizeAttribute: [],
        uponSanitizeElement: [],
        uponSanitizeShadowNode: [],
      };
    }),
    o
  );
})();
export { me as p };
