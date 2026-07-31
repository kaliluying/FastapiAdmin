/**
 * 组件加载器 —— 菜单字符串路径 → views 懒加载。
 * 菜单组件路径必须与实际视图目录一致，避免历史回退掩盖配置错误。
 */
import { defineComponent, h, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  IframeRouteManager,
  NestedRouterParent,
  ROUTE_COMPONENT_LAYOUT,
  ROUTE_COMPONENT_NESTED_PARENT,
} from "../staticRoutes";

export class ComponentLoader {
  private modules: Record<string, () => Promise<any>>;

  constructor() {
    this.modules = import.meta.glob("../../views/**/*.vue");
  }

  load(componentPath: string): () => Promise<any> {
    if (!componentPath) {
      return this.createEmptyComponent();
    }
    if (componentPath === ROUTE_COMPONENT_LAYOUT || componentPath === "/layouts/index") {
      return this.loadLayout();
    }
    if (componentPath === ROUTE_COMPONENT_NESTED_PARENT) {
      return this.loadNestedParent();
    }

    const normalized = componentPath.startsWith("/")
      ? componentPath
      : `/${componentPath.replace(/^\/+/, "")}`;
    const fullPath = `../../views${normalized}.vue`;
    const fullPathWithIndex = `../../views${normalized}/index.vue`;
    let module = this.modules[fullPath] || this.modules[fullPathWithIndex];

    if (!module) {
      console.error(
        `[ComponentLoader] 未找到组件: ${componentPath}，尝试过的路径: ${fullPath} 和 ${fullPathWithIndex}`
      );
      return this.createErrorComponent(componentPath);
    }
    return module;
  }

  loadLayout(): () => Promise<any> {
    return () => import("@/components/layouts/index.vue");
  }

  loadIframe(): () => Promise<any> {
    return () =>
      Promise.resolve(
        defineComponent({
          name: "IframeView",
          setup() {
            const route = useRoute();
            const isLoading = ref(true);
            const iframeUrl = ref("");

            onMounted(() => {
              const iframeRoute = IframeRouteManager.getInstance().findByPath(route.path);
              if (iframeRoute?.meta) {
                iframeUrl.value = iframeRoute.meta.link || "";
              }
            });

            const handleIframeLoad = () => {
              isLoading.value = false;
            };

            return () =>
              h("div", { class: "box-border w-full h-full", "v-loading": isLoading.value }, [
                h("iframe", {
                  src: iframeUrl.value,
                  frameborder: "0",
                  sandbox: "allow-forms allow-popups allow-scripts",
                  referrerpolicy: "no-referrer",
                  class: "w-full h-full min-h-[calc(100vh-120px)] border-none",
                  onLoad: handleIframeLoad,
                }),
              ]);
          },
        })
      );
  }

  loadNestedParent(): () => Promise<any> {
    return () => Promise.resolve(NestedRouterParent);
  }

  private createEmptyComponent(): () => Promise<any> {
    return () =>
      Promise.resolve({
        render() {
          return h("div", {});
        },
      });
  }

  private createErrorComponent(componentPath: string): () => Promise<any> {
    return () =>
      Promise.resolve({
        render() {
          return h("div", { class: "route-error" }, `组件未找到: ${componentPath}`);
        },
      });
  }
}
