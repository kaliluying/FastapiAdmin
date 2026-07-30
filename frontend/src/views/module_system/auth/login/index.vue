<!-- 登录页：顶栏固定；仅插画列与表单区随布局切换 -->
<template>
  <div class="login-page-root flex h-screen w-full flex-col overflow-hidden">
    <FaLoginCenterBackdrop v-if="panelAlign === 'center'" viewport-fixed />
    <FaAuthTopBar v-model:panel-align="panelAlign" />

    <div
      class="login-auth-split relative z-1 flex min-h-0 flex-1 overflow-hidden"
      :class="`login-auth-split--${panelAlign}`"
    >
      <div
        v-if="panelAlign !== 'center'"
        class="login-auth-split__col login-auth-split__col--illustration"
      >
        <FaEnterpriseIntro />
      </div>

      <div
        class="login-auth-split__col login-auth-split__col--form login-page-panel relative flex min-h-0 min-w-0 flex-col"
        :class="panelAlign === 'center' ? 'bg-transparent' : 'bg-(--el-bg-color-page)'"
      >
        <div
          class="login-page-panel__main relative z-1 flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-2 pt-14 md:px-10 md:pt-18"
        >
          <ElScrollbar>
            <div
              class="login-page-panel__scroll pb-6"
              :class="panelAlign === 'center' && 'login-page-panel__scroll--centered'"
            >
              <div
                class="login-panel-align-row flex w-full items-center justify-center max-sm:min-h-0"
                :class="
                  panelAlign === 'center'
                    ? 'min-h-0 flex-1 py-4'
                    : 'min-h-[min(720px,calc(100vh-13rem))]'
                "
              >
                <div class="auth-right-wrap">
                  <div class="form">
                    <div class="form-intro">
                      <h3 class="title">{{ panelTitle }}</h3>
                      <p class="sub-title">{{ panelSubTitle }}</p>
                    </div>

                    <FaLoginAccountForm
                      ref="accountFormRef"
                      v-model:login-form="loginForm"
                      :rules="rules"
                      :form-key="formKey"
                      :loading="loading"
                      @submit="handleSubmit"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ElScrollbar>
        </div>

        <footer
          class="login-page-footer login-page-footer--pinned shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
          :class="panelAlign === 'center' && 'login-page-footer--floating-layout'"
        >
          <div class="login-footer-text text-sm">
            <div class="login-footer-row">
              <span>{{ footerCopyright }}</span>
            </div>
            <span class="login-page-footer__sep login-footer-sep-center">|</span>
            <div class="login-footer-row">
              <a
                :href="footerHelpDoc"
                target="_blank"
                rel="noopener noreferrer"
                class="login-page-footer__link"
              >
                帮助
              </a>
              <span class="login-page-footer__sep">|</span>
              <a
                :href="footerPrivacy"
                target="_blank"
                rel="noopener noreferrer"
                class="login-page-footer__link"
              >
                隐私
              </a>
              <span class="login-page-footer__sep">|</span>
              <a
                :href="footerClause"
                target="_blank"
                rel="noopener noreferrer"
                class="login-page-footer__link"
              >
                条款
              </a>
              <span v-if="footerKeepRecord" class="login-page-footer__sep">|</span>
              <span v-if="footerKeepRecord" class="login-page-footer__record">
                {{ footerKeepRecord }}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LocationQuery, RouteLocationRaw } from "vue-router";
import type { LoginFormData } from "@/api/module_system/auth";
import { useConfigStore, useAppStore, useSettingsStore, useUserStore } from "@stores";
import { getConfigValue, HttpError } from "@utils";
import { ElNotification, type FormRules } from "element-plus";
import FaLoginAccountForm from "@/components/views/fa-login/forms/FaLoginAccountForm.vue";
import FaAuthTopBar from "@/components/views/fa-login/widgets/FaAuthTopBar.vue";
import FaEnterpriseIntro from "@/components/views/fa-login/widgets/FaEnterpriseIntro.vue";
import { useLoginPanelAlign } from "@/components/views/fa-login/composables/useLoginPanelAlign";

defineOptions({ name: "Login" });

const configStore = useConfigStore();
const settingStore = useSettingsStore();
const appStore = useAppStore();
const { t, locale } = useI18n();

const { panelAlign } = useLoginPanelAlign();

const panelTitle = computed(() => t("login.title"));
const panelSubTitle = computed(() => t("login.subTitle"));

const footerCopyright = computed(() =>
  getConfigValue(configStore.configData, ["copyright", "sys_web_copyright"])
);
const footerHelpDoc = computed(() =>
  getConfigValue(configStore.configData, ["help_doc", "sys_help_doc"], "#")
);
const footerPrivacy = computed(() =>
  getConfigValue(configStore.configData, ["privacy", "sys_web_privacy"], "#")
);
const footerClause = computed(() =>
  getConfigValue(configStore.configData, ["clause", "sys_web_clause"], "#")
);
const footerKeepRecord = computed(() =>
  getConfigValue(configStore.configData, ["keep_record", "sys_keep_record"])
);
const formKey = ref(0);

watch(locale, () => {
  formKey.value++;
});

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const accountFormRef = ref<InstanceType<typeof FaLoginAccountForm> | null>(null);
const loading = ref(false);

const loginForm = reactive<LoginFormData>({
  username: "",
  password: "",
  remember: true,
  login_type: "PC",
});

const rules = computed<FormRules>(() => {
  return {
    username: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.username.required"),
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.password.required"),
      },
      {
        min: 6,
        message: t("login.message.password.min"),
        trigger: "blur",
      },
    ],
  };
});

function resolveRedirectTarget(query: LocationQuery): RouteLocationRaw {
  const defaultPath = "/";
  const rawRedirect = (query.redirect as string) || defaultPath;
  try {
    const resolved = router.resolve(rawRedirect);
    return {
      path: resolved.path,
      query: resolved.query,
    };
  } catch {
    return { path: defaultPath };
  }
}

onMounted(async () => {
  try {
    await configStore.getConfig(true);
  } catch (error) {
    console.warn("[Login] 获取系统配置失败，继续使用默认渲染", error);
  }
  if (userStore.isLogin) {
    await router.replace(resolveRedirectTarget(route.query));
    return;
  }
});

const handleSubmit = async () => {
  if (!accountFormRef.value) return;

  try {
    const valid = await accountFormRef.value.validate?.();
    if (!valid) return;

    loading.value = true;

    await userStore.login(loginForm);
    await router.replace(resolveRedirectTarget(route.query));

    if (settingStore.showGuide) {
      appStore.showGuide(true);
    }
  } catch (error) {
    if (!(error instanceof HttpError)) {
      console.error("[Login] Unexpected error:", error);
      ElNotification({
        title: "提示",
        message: error instanceof Error ? error.message : String(error),
        type: "error",
      });
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
@use "../../../../components/views/fa-login/fa-login";
</style>
