import {
  ai as e,
  a5 as a,
  ab as t,
  ac as r,
  ae as n,
  ak as l,
  j as s,
  al as c,
  a1 as o,
  aA as u,
  bi as i,
} from "./vue-vendor.Dwx3gfQr.js";
import {
  d as m,
  t as C,
  f,
  T as g,
  C as d,
  a as h,
  u as v,
  e as p,
  c as y,
} from "./useTableColumns.BKMFwI8S.js";
import "./index.CJ_YH8gZ.js";
import "./element-plus.BPg5EhXK.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
const E = new Map();
function A(A) {
  return (function (A) {
    const {
        core: {
          apiFn: b,
          apiParams: R = {},
          excludeParams: w = [],
          immediate: L = !0,
          columnsFactory: z,
          paginationKey: j,
        },
        transform: { dataTransformer: T, responseAdapter: _ = m } = {},
        performance: {
          enableCache: k = !1,
          cacheTime: N = 3e5,
          debounceTime: O = 300,
          maxCacheSize: P = 50,
        } = {},
        hooks: { onSuccess: S, onError: U, onCacheHit: x, resetFormCallback: D } = {},
        debug: { enableLog: I = !1 } = {},
      } = A,
      $ = j?.current || C.paginationKey.current,
      K = j?.size || C.paginationKey.size,
      F = c(0),
      G = { log: (e, ...a) => {}, warn: (e, ...a) => {}, error: (e, ...a) => {} },
      H = k ? new g(N, P, I) : null,
      M = c("idle"),
      q = s(() => "loading" === M.value),
      B = c(null),
      J = c([]);
    let Q = null,
      V = null,
      W = null,
      X = !0;
    function Y(e) {
      const a = (e) => {
        if (null === e || "object" != typeof e) return e;
        if (Array.isArray(e)) return e.map(a);
        const t = e,
          r = Object.keys(t).sort(),
          n = {};
        for (const l of r) {
          const e = t[l];
          void 0 !== e && (n[l] = a(e));
        }
        return n;
      };
      return JSON.stringify(a(u(e)));
    }
    let Z = null;
    const ee = e(Object.assign({ [$]: 1, [K]: 10 }, R || {})),
      ae = e({ current: ee[$] || 1, size: ee[K] || 10, total: 0 }),
      { width: te } = i(),
      re = s(() => ({ ...ae, small: te.value < 768 })),
      ne = z ? f(z) : null,
      le = ne?.columns,
      se = ne?.columnChecks,
      ce = s(() => J.value.length > 0),
      oe = s(() => (F.value, H ? H.getStats() : { total: 0, size: "0KB", hitRate: "0 avg hits" })),
      ue = y(U, I),
      ie = (e, a) => {
        if (!H) return;
        let t;
        switch (e) {
          case d.CLEAR_ALL:
            (H.clear(), G.log(`清空所有缓存 - ${a || ""}`));
            break;
          case d.CLEAR_CURRENT:
            ((t = H.clearCurrentSearch(ee)), G.log(`清空当前搜索缓存 ${t} 条 - ${a || ""}`));
            break;
          case d.CLEAR_PAGINATION:
            ((t = H.clearPagination()), G.log(`清空分页缓存 ${t} 条 - ${a || ""}`));
            break;
          case d.KEEP_ALL:
          default:
            G.log(`保持缓存不变 - ${a || ""}`);
        }
        F.value++;
      };
    function me(e, a, t) {
      let r = p(e);
      (T && (r = T(r)), (J.value = r), v(ae, e));
      const n = ee;
      (n[$] !== ae.current && (n[$] = ae.current),
        n[K] !== ae.size && (n[K] = ae.size),
        t && H && (H.set(a, r, e), F.value++, G.log("数据已缓存")),
        (M.value = "success"),
        S && S(r, e));
    }
    const Ce = async (e, a = k) => {
      let t = Object.assign({}, ee, { [$]: ae.current, [K]: ae.size }, e || {});
      if (w.length > 0) {
        const e = { ...t };
        (w.forEach((a) => {
          delete e[a];
        }),
          (t = e));
      }
      const r = Y(t);
      if (null !== W && V === r) return (G.log("合并同参进行中的列表请求"), W);
      const n = E.get(r);
      if (n) {
        ((M.value = "loading"), (B.value = null));
        try {
          const e = await n;
          return (me(e, t, a), e);
        } catch (s) {
          if (s instanceof Error && "请求已取消" === s.message)
            return ((M.value = "idle"), { records: [], total: 0, current: 1, size: 10 });
          ((M.value = "error"), (J.value = []));
          throw ue(s, "获取表格数据失败");
        }
      }
      if (!X) return { records: [...J.value], total: ae.total, current: ae.current, size: ae.size };
      Q && Q.abort();
      const l = new AbortController();
      ((Q = l), (M.value = "loading"), (B.value = null));
      try {
        if (a && H) {
          const e = H.get(t);
          if (e) {
            ((J.value = e.data), v(ae, e.response));
            const a = ee;
            return (
              a[$] !== ae.current && (a[$] = ae.current),
              a[K] !== ae.size && (a[K] = ae.size),
              (M.value = "success"),
              x && x(e.data, e.response),
              G.log("缓存命中"),
              e.response
            );
          }
        }
        V = r;
        const e = (async () => {
          try {
            G.log("HTTP 请求", r);
            const e = await b(t);
            if (l.signal.aborted) throw new Error("请求已取消");
            return _(e);
          } finally {
            (V === r && ((V = null), (W = null)), Q === l && (Q = null));
          }
        })();
        (E.set(r, e),
          e
            .finally(() => {
              E.delete(r);
            })
            .catch(() => {}),
          (W = e));
        try {
          const r = await e;
          return (me(r, t, a), r);
        } catch (s) {
          if (s instanceof Error && "请求已取消" === s.message)
            return ((M.value = "idle"), { records: [], total: 0, current: 1, size: 10 });
          ((M.value = "error"), (J.value = []));
          throw ue(s, "获取表格数据失败");
        }
      } finally {
        Q === l && (Q = null);
      }
    };
    async function fe(e, a = k) {
      try {
        return await Ce(e, a);
      } catch {
        return;
      }
    }
    const ge = (e) => fe(e),
      de = async (e) => ((ae.current = 1), (ee[$] = 1), ie(d.CLEAR_CURRENT, "搜索数据"), fe(e, !1)),
      he = h(de, O),
      ve = async () => {
        he.cancel();
        const e = ee,
          a = { [$]: 1, [K]: e[K] || 10 };
        (Object.keys(ee).forEach((a) => {
          delete e[a];
        }),
          Object.assign(ee, R || {}, a),
          (ae.current = 1),
          (ae.size = a[K]),
          (B.value = null),
          ie(d.CLEAR_ALL, "重置搜索"),
          await ge(),
          D && (await o(), D()));
      },
      pe = (e) => {
        const a = ee,
          t = ae.size || (a[K] ?? 10);
        (Object.keys(ee).forEach((e) => {
          e !== $ && e !== K && delete a[e];
        }),
          Object.assign(ee, { [$]: 1, [K]: t }, e || {}),
          (ae.current = 1),
          (ae.size = t));
      };
    let ye = !1;
    const Ee = async (e) => {
        if (e <= 0) return;
        he.cancel();
        const a = ee;
        ((ae.size = e),
          (ae.current = 1),
          (a[K] = e),
          (a[$] = 1),
          ie(d.CLEAR_CURRENT, "分页大小变化"),
          await ge());
      },
      Ae = async (e) => {
        if (!(e <= 0 || ye))
          if (ae.current !== e)
            try {
              ye = !0;
              const a = ee;
              ((ae.current = e), a[$] !== e && (a[$] = e), await ge());
            } finally {
              ye = !1;
            }
          else G.log("分页页码未变化，跳过请求");
      },
      be = async () => {
        (he.cancel(),
          (ae.current = 1),
          (ee[$] = 1),
          ie(d.CLEAR_PAGINATION, "新增数据"),
          await ge());
      },
      Re = async () => {
        (ie(d.CLEAR_CURRENT, "编辑数据"), await ge());
      },
      we = async () => {
        const { current: e } = ae;
        (ie(d.CLEAR_CURRENT, "删除数据"),
          await ge(),
          0 === J.value.length && e > 1 && ((ae.current = e - 1), (ee[$] = e - 1), await ge()));
      },
      Le = async () => {
        (he.cancel(), ie(d.CLEAR_ALL, "手动刷新"), await ge());
      },
      ze = async () => {
        (ie(d.CLEAR_CURRENT, "软刷新"), await ge());
      },
      je = () => {
        (Q && Q.abort(), he.cancel());
      };
    (a(() => {
      X = !0;
    }),
      t(() => {
        ((X = !1), je());
      }));
    const Te = () => {
        ((J.value = []), (B.value = null), ie(d.CLEAR_ALL, "清空数据"));
      },
      _e = () => {
        if (!H) return 0;
        const e = H.cleanupExpired();
        return (e > 0 && F.value++, e);
      };
    k &&
      H &&
      (Z = setInterval(() => {
        const e = H.cleanupExpired();
        e > 0 && (G.log(`自动清理 ${e} 条过期缓存`), F.value++);
      }, N / 2));
    L &&
      r(async () => {
        await ge();
      });
    return (
      n(() => {
        (je(), H && H.clear(), Z && clearInterval(Z));
      }),
      {
        // --- 数据 ---
        /** 表格数据 */
        data: J,
        /** 数据加载状态 */
        loading: l(q),
        /** 错误状态 */
        error: l(B),
        /** 数据是否为空 */
        isEmpty: s(() => 0 === J.value.length),
        /** 是否有数据 */
        hasData: ce,
        // --- 分页 ---
        /** 分页状态信息 */
        pagination: l(ae),
        /** 移动端分页配置 */
        paginationMobile: re,
        /** 页面大小变化处理 */
        handleSizeChange: Ee,
        /** 当前页变化处理 */
        handleCurrentChange: Ae,
        // --- 查询条件 ---
        /** 搜索参数 */
        searchParams: ee,
        /** 替换搜索参数（适用于表单查询，避免旧字段残留） */
        replaceSearchParams: pe,
        /** 重置搜索参数 */
        resetSearchParams: ve,
        /** 当前页加载（错误已内部处理） */
        fetchData: ge,
        /** 回到第一页并查询（搜索 / 重置页码场景） */
        getData: de,
        /** 获取数据（防抖） */
        getDataDebounced: he,
        /** 清空数据 */
        clearData: Te,
        // --- 刷新 ---
        /** 全量刷新：清空所有缓存，重新获取数据（适用于手动刷新按钮） */
        refreshData: Le,
        /** 轻量刷新：仅清空当前搜索条件的缓存，保持分页状态（适用于定时刷新） */
        refreshSoft: ze,
        /** 新增后刷新：回到第一页并清空分页缓存（适用于新增数据后） */
        refreshCreate: be,
        /** 更新后刷新：保持当前页，仅清空当前搜索缓存（适用于更新数据后） */
        refreshUpdate: Re,
        /** 删除后刷新：智能处理页码，避免空页面（适用于删除数据后） */
        refreshRemove: we,
        // --- 缓存（策略见 CacheInvalidationStrategy） ---
        cacheInfo: oe,
        clearCache: ie,
        /** 清理已过期的缓存条目，释放内存空间 */
        clearExpiredCache: _e,
        // --- 请求 ---
        /** 取消当前请求 */
        cancelRequest: je,
        // --- 列配置（仅传入 columnsFactory 时展开） ---
        ...(ne && {
          /** 表格列配置 */
          columns: le,
          /** 列显示控制 */
          columnChecks: se,
          /** 新增列 */
          addColumn: ne.addColumn,
          /** 删除列 */
          removeColumn: ne.removeColumn,
          /** 切换列显示状态 */
          toggleColumn: ne.toggleColumn,
          /** 更新列配置 */
          updateColumn: ne.updateColumn,
          /** 批量更新列配置 */
          batchUpdateColumns: ne.batchUpdateColumns,
          /** 重新排序列 */
          reorderColumns: ne.reorderColumns,
          /** 获取指定列配置 */
          getColumnConfig: ne.getColumnConfig,
          /** 获取所有列配置 */
          getAllColumns: ne.getAllColumns,
          /** 重置所有列配置到默认状态 */
          resetColumns: ne.resetColumns,
        }),
      }
    );
  })(A);
}
export { A as u };
