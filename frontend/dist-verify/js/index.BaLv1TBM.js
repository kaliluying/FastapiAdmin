import {
  z as e,
  ac as a,
  aV as t,
  ae as i,
  ag as r,
  p as s,
  al as o,
} from "./vue-vendor.Dwx3gfQr.js";
import { Z as l, G as n, m as c, j as h, i as m, Q as p, a9 as v } from "./index.CJ_YH8gZ.js";
import "./element-plus.BPg5EhXK.js";
import "./dayjs.BHSg66Ch.js";
import "./file-saver.CjVB4eGa.js";
import "./@intlify.CbtlSmdZ.js";
/* empty css                    */ import "./axios.Da-QW0H8.js";
import "./qs.USnEJzjK.js";
import "./side-channel.DybIsWO5.js";
import "./es-errors.DK26Ybqf.js";
import "./object-inspect.Ju1NJVd1.js";
import "./side-channel-list.BNQ44_ba.js";
import "./side-channel-map.ulHsYLML.js";
import "./get-intrinsic.BMeuD2ey.js";
import "./es-object-atoms.CyiuHMUS.js";
import "./math-intrinsics.BOBeVm3z.js";
import "./gopd.BudZp56J.js";
import "./es-define-property.F0aoeP8o.js";
import "./has-symbols.BcO-SUVM.js";
import "./get-proto.CBibeOPY.js";
import "./dunder-proto.CgDtQ3qe.js";
import "./call-bind-apply-helpers.ubnPuw6U.js";
import "./function-bind.DrnB-baK.js";
import "./hasown.BXcyoiLU.js";
import "./call-bound.Dizy2Qs1.js";
import "./side-channel-weakmap.CxmbhinV.js";
import "./mitt.BHPWSuhB.js";
import "./nprogress.E6tsCBSO.js";
import "./echarts.r3cQDZl7.js";
import "./highlight.Cxq3ZXHl.js";
import "./codemirror.CwY4WcCn.js";
import "./diff-match-patch.B0ZLOaK6.js";
import "./iconify-icons.PLu8Rxye.js";
import "./vue-web-terminal.B__atI2c.js";
import "./lodash-es.Yxq608wb.js";
import "./async-validator.j0i5Y79Y.js";
import "./@sxzz.DxtSUbXb.js";
import "./@ctrl.BEgk5vdO.js";
import "./memoize-one.BAtLgO95.js";
import "./normalize-wheel-es.BhHBPXsK.js";
import "./@floating-ui.DIiyYkmY.js";
const g = e({
  name: "FaFireworksEffect",
  __name: "index",
  setup(e) {
    const { currentFestivalData: g } = l(),
      u = {
        // 性能相关配置
        POOL_SIZE: 600,
        // 对象池大小，影响同时存在的最大粒子数
        PARTICLES_PER_BURST: 200,
        // 每次爆炸的粒子数量，影响视觉效果密度
        // 粒子尺寸配置
        SIZES: {
          RECTANGLE: { WIDTH: 24, HEIGHT: 12 },
          // 矩形粒子尺寸
          SQUARE: { SIZE: 12 },
          // 正方形粒子尺寸
          CIRCLE: { SIZE: 12 },
          // 圆形粒子尺寸
          TRIANGLE: { SIZE: 10 },
          // 三角形粒子尺寸
          OVAL: { WIDTH: 24, HEIGHT: 12 },
          // 椭圆粒子尺寸
          IMAGE: { WIDTH: 30, HEIGHT: 30 },
        },
        // 旋转动画配置
        ROTATION: {
          BASE_SPEED: 2,
          // 基础旋转速度
          RANDOM_SPEED: 3,
          // 额外随机旋转速度范围
          DECAY: 0.98,
        },
        // 物理效果配置
        PHYSICS: {
          GRAVITY: 0.525,
          // 重力加速度，影响粒子下落速度
          VELOCITY_THRESHOLD: 10,
          // 速度阈值，超过时开始透明度衰减
          OPACITY_DECAY: 0.02,
        },
        // 粒子颜色配置 - 使用RGBA格式支持透明度
        COLORS: [
          "rgba(255, 68, 68, 1)",
          // 红色系
          "rgba(255, 68, 68, 0.9)",
          "rgba(255, 68, 68, 0.8)",
          "rgba(255, 116, 188, 1)",
          // 粉色系
          "rgba(255, 116, 188, 0.9)",
          "rgba(255, 116, 188, 0.8)",
          "rgba(68, 68, 255, 0.8)",
          // 蓝色系
          "rgba(92, 202, 56, 0.7)",
          // 绿色系
          "rgba(255, 68, 255, 0.8)",
          // 紫色系
          "rgba(68, 255, 255, 0.7)",
          // 青色系
          "rgba(255, 136, 68, 0.7)",
          // 橙色系
          "rgba(68, 136, 255, 1)",
          // 蓝色系
          "rgba(250, 198, 122, 0.8)",
        ],
        // 粒子形状配置 - 矩形出现概率更高，营造更丰富的视觉效果
        SHAPES: [
          "rectangle",
          "rectangle",
          "rectangle",
          "rectangle",
          "rectangle",
          "rectangle",
          "rectangle",
          "circle",
          "triangle",
          "oval",
        ],
      },
      d = o(),
      I = o(null);
    const E = new (class {
        constructor() {
          ((this.particlePool = []),
            (this.activeParticles = []),
            (this.poolIndex = 0),
            (this.imageCache = {}),
            (this.animationId = 0),
            (this.canvasWidth = 0),
            (this.canvasHeight = 0),
            (this.animate = () => {
              (this.updateParticles(),
                this.render(),
                (this.animationId = requestAnimationFrame(this.animate)));
            }),
            this.initializePool());
        }
        /**
         * 初始化对象池
         * 预先创建指定数量的粒子对象，避免运行时频繁创建
         */ initializePool() {
          for (let e = 0; e < u.POOL_SIZE; e++) this.particlePool.push(this.createParticle());
        }
        /**
         * 创建一个新的粒子对象
         * 返回初始化状态的粒子
         */ createParticle() {
          return {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            color: "",
            rotation: 0,
            rotationSpeed: 0,
            scale: 1,
            shape: "circle",
            opacity: 1,
            active: !1,
          };
        }
        /**
         * 从对象池获取可用粒子 (性能优化版本)
         * 使用循环索引而非Array.find()，时间复杂度从O(n)降至O(1)
         * @returns 可用的粒子对象或null
         */ getAvailableParticle() {
          for (let e = 0; e < u.POOL_SIZE; e++) {
            const a = (this.poolIndex + e) % u.POOL_SIZE,
              t = this.particlePool[a];
            if (!t.active) return ((this.poolIndex = (a + 1) % u.POOL_SIZE), (t.active = !0), t);
          }
          return null;
        }
        /**
         * 预加载单个图片资源
         * @param url 图片URL
         * @returns Promise<HTMLImageElement>
         */ async preloadImage(e) {
          return this.imageCache[e]
            ? this.imageCache[e]
            : new Promise((a, t) => {
                const i = new Image();
                ((i.crossOrigin = "anonymous"),
                  (i.onload = () => {
                    ((this.imageCache[e] = i), a(i));
                  }),
                  (i.onerror = t),
                  (i.src = e));
              });
        }
        /**
         * 预加载所有需要的图片资源
         * 在组件初始化时调用，确保图片ready
         */ async preloadAllImages() {
          const e = new Date().getFullYear(),
            a = [...c, ...h(e)]
              .map((e) => e.image)
              .filter((e) => "string" == typeof e && e.length > 0),
            t = [...new Set([m, p, v, ...a])];
          try {
            await Promise.all(t.map((e) => this.preloadImage(e)));
          } catch (i) {}
        }
        /**
         * 创建烟花爆炸效果
         * @param imageUrl 可选的图片URL，如果提供则使用图片粒子
         */ createFirework(e) {
          const a = Math.random() * this.canvasWidth,
            t = this.canvasHeight,
            i = e && this.imageCache[e] ? ["image"] : u.SHAPES,
            r = [];
          for (let s = 0; s < u.PARTICLES_PER_BURST; s++) {
            const o = this.getAvailableParticle();
            if (!o) continue;
            const l = (Math.PI * s) / (u.PARTICLES_PER_BURST / 2),
              n = 1.5 * (12 + 6 * Math.random()),
              c = Math.random() * Math.PI * 2;
            ((o.x = a),
              (o.y = t),
              (o.vx = Math.cos(l) * Math.cos(c) * n * (0.5 * Math.random() + 0.5)),
              (o.vy = Math.sin(l) * n - 15));
            const h = u.COLORS,
              m = i;
            ((o.color = h[Math.floor(Math.random() * h.length)] ?? h[0]),
              (o.rotation = 360 * Math.random()),
              (o.rotationSpeed =
                (Math.random() * u.ROTATION.RANDOM_SPEED + u.ROTATION.BASE_SPEED) *
                (Math.random() > 0.5 ? 1 : -1)),
              (o.scale = 0.8 + 0.4 * Math.random()),
              (o.shape = m[Math.floor(Math.random() * m.length)] ?? m[0]),
              (o.opacity = 1),
              (o.imageUrl = e && this.imageCache[e] ? e : void 0),
              r.push(o));
          }
          this.activeParticles.push(...r);
        }
        /**
         * 更新所有粒子的物理状态 (性能优化版本)
         * 包括位置、速度、旋转、透明度等
         */ updateParticles() {
          const { GRAVITY: e, VELOCITY_THRESHOLD: a, OPACITY_DECAY: t } = u.PHYSICS,
            { DECAY: i } = u.ROTATION;
          for (let r = this.activeParticles.length - 1; r >= 0; r--) {
            const s = this.activeParticles[r];
            ((s.x += s.vx),
              (s.y += s.vy),
              (s.vy += e),
              (s.rotation += s.rotationSpeed),
              (s.rotationSpeed *= i),
              s.vy > a && ((s.opacity -= t), s.opacity <= 0)
                ? this.recycleParticle(r)
                : this.isOutOfBounds(s) && this.recycleParticle(r));
          }
        }
        /**
         * 回收粒子到对象池
         * @param index 要回收的粒子在活动数组中的索引
         */ recycleParticle(e) {
          ((this.activeParticles[e].active = !1), this.activeParticles.splice(e, 1));
        }
        /**
         * 检查粒子是否超出屏幕边界
         * @param particle 要检查的粒子
         * @returns 是否超出边界
         */ isOutOfBounds(e) {
          const a = 100;
          return (
            e.x < -100 || e.x > this.canvasWidth + a || e.y < -100 || e.y > this.canvasHeight + a
          );
        }
        /**
         * 绘制单个粒子
         * @param particle 要绘制的粒子对象
         */ drawParticle(e) {
          I.value &&
            (I.value.save(),
            (I.value.globalAlpha = e.opacity),
            I.value.translate(e.x, e.y),
            I.value.rotate((e.rotation * Math.PI) / 180),
            I.value.scale(e.scale, e.scale),
            this.renderShape(e),
            I.value.restore());
        }
        /**
         * 根据粒子类型渲染对应的形状
         * @param particle 要渲染的粒子
         */ renderShape(e) {
          if (!I.value) return;
          const { SIZES: a } = u;
          switch (((I.value.fillStyle = e.color), e.shape)) {
            case "rectangle":
              I.value.fillRect(-12, -6, a.RECTANGLE.WIDTH, a.RECTANGLE.HEIGHT);
              break;
            case "square":
              I.value.fillRect(-6, -6, a.SQUARE.SIZE, a.SQUARE.SIZE);
              break;
            case "circle":
              (I.value.beginPath(),
                I.value.arc(0, 0, a.CIRCLE.SIZE / 2, 0, 2 * Math.PI),
                I.value.fill());
              break;
            case "triangle":
              (I.value.beginPath(),
                I.value.moveTo(0, -10),
                I.value.lineTo(a.TRIANGLE.SIZE, a.TRIANGLE.SIZE),
                I.value.lineTo(-10, a.TRIANGLE.SIZE),
                I.value.closePath(),
                I.value.fill());
              break;
            case "oval":
              (I.value.beginPath(),
                I.value.ellipse(0, 0, a.OVAL.WIDTH / 2, a.OVAL.HEIGHT / 2, 0, 0, 2 * Math.PI),
                I.value.fill());
              break;
            case "image":
              this.renderImage(e);
          }
        }
        /**
         * 渲染图片类型的粒子
         * @param particle 包含图片URL的粒子对象
         */ renderImage(e) {
          if (!I.value || !e.imageUrl) return;
          const a = this.imageCache[e.imageUrl];
          if (a?.complete) {
            const { WIDTH: e, HEIGHT: t } = u.SIZES.IMAGE;
            I.value.drawImage(a, -e / 2, -t / 2, e, t);
          }
        }
        /**
         * 渲染所有活动粒子到画布
         * 清除画布并重新绘制所有粒子
         */ render() {
          if (I.value && d.value) {
            (I.value.clearRect(0, 0, this.canvasWidth, this.canvasHeight),
              (I.value.globalCompositeOperation = "lighter"));
            for (const e of this.activeParticles) this.drawParticle(e);
          }
        }
        /**
         * 更新画布尺寸缓存
         * 在窗口大小改变时调用
         * @param width 新的画布宽度
         * @param height 新的画布高度
         */ updateCanvasSize(e, a) {
          ((this.canvasWidth = e), (this.canvasHeight = a));
        }
        /**
         * 启动动画循环
         */ start() {
          this.animate();
        }
        /**
         * 停止动画循环
         * 在组件卸载时调用，避免内存泄漏
         */ stop() {
          this.animationId && (cancelAnimationFrame(this.animationId), (this.animationId = 0));
        }
        /**
         * 获取当前活动粒子数量
         * 用于调试和性能监控
         * @returns 活动粒子数量
         */ getActiveParticleCount() {
          return this.activeParticles.length;
        }
      })(),
      P = (e) => {
        ((e.ctrlKey && e.shiftKey && "p" === e.key.toLowerCase()) ||
          (e.metaKey && e.shiftKey && "p" === e.key.toLowerCase())) &&
          (e.preventDefault(),
          E.createFirework(
            (() => {
              const e = g.value;
              if (!e || e.skipFireworks) return;
              const a = e.image;
              return "string" == typeof a && a.trim() ? a : void 0;
            })()
          ));
      },
      S = () => {
        if (!d.value) return;
        const { innerWidth: e, innerHeight: a } = window;
        ((d.value.width = e), (d.value.height = a), E.updateCanvasSize(e, a));
      },
      f = (e) => {
        const a = e;
        E.createFirework(a);
      };
    return (
      a(async () => {
        d.value &&
          ((I.value = d.value.getContext("2d")),
          I.value &&
            (S(),
            await E.preloadAllImages(),
            E.start(),
            t(window, "keydown", P),
            t(window, "resize", S),
            n.on("triggerFireworks", f)));
      }),
      i(() => {
        (E.stop(), n.off("triggerFireworks", f));
      }),
      (e, a) => (
        r(),
        s(
          "canvas",
          {
            ref_key: "canvasRef",
            ref: d,
            class: "fixed top-0 left-0 z-9999 w-full h-full pointer-events-none",
          },
          null,
          512
        )
      )
    );
  },
});
export { g as default };
