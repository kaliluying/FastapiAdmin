<template>
  <div class="profile-page">
    <FaPageHeader title="个人中心" description="管理个人资料与登录密码" />

    <section class="account-surface" aria-label="账号设置" :aria-busy="loading">
      <header class="identity-header">
        <img
          v-if="avatar && !avatarFailed"
          :src="avatar"
          alt="当前用户头像"
          class="identity-avatar"
          @error="avatarFailed = true"
        />
        <div v-else class="identity-avatar identity-avatar--fallback" aria-hidden="true">
          <FaSvgIcon icon="ri:user-3-line" />
        </div>
        <div class="identity-copy">
          <span class="identity-kicker">当前账号</span>
          <h2>{{ currentUser?.name || currentUser?.username || "当前用户" }}</h2>
          <p class="identity-account">{{ currentUser?.username || "-" }}</p>
        </div>
        <span class="identity-role">{{ roleLabel }}</span>
      </header>

      <div class="detail-panel">
        <ElTabs v-model="activeTab" @tab-change="changeTab">
          <ElTabPane label="基本资料" name="info">
            <div class="panel-intro">
              <h3>基本资料</h3>
              <p>这些信息用于展示当前账号与联系您。</p>
            </div>
            <ElAlert
              v-if="loadError"
              :title="loadError"
              type="error"
              show-icon
              :closable="false"
              class="load-alert"
            >
              <template #default>
                <ElButton link type="primary" :loading="loading" @click="loadProfile"
                  >重新加载资料</ElButton
                >
              </template>
            </ElAlert>
            <ElForm
              v-else
              ref="profileFormRef"
              v-loading="loading"
              :model="profileForm"
              :rules="profileRules"
              :disabled="loading || saving"
              label-position="top"
              class="profile-form profile-form--info"
              @submit.prevent="saveProfile"
            >
              <ElFormItem label="登录账号">
                <ElInput :model-value="currentUser?.username || ''" disabled />
              </ElFormItem>
              <ElFormItem label="姓名" prop="name">
                <ElInput
                  v-model="profileForm.name"
                  maxlength="32"
                  show-word-limit
                  autocomplete="name"
                />
              </ElFormItem>
              <ElFormItem label="邮箱" prop="email">
                <ElInput
                  v-model="profileForm.email"
                  type="email"
                  autocomplete="email"
                  placeholder="选填"
                />
              </ElFormItem>
              <ElFormItem label="手机号" prop="mobile">
                <ElInput
                  v-model="profileForm.mobile"
                  autocomplete="tel"
                  inputmode="tel"
                  maxlength="11"
                  placeholder="选填"
                />
              </ElFormItem>
              <ElFormItem label="性别" prop="gender">
                <ElSelect v-model="profileForm.gender" class="full-width">
                  <ElOption label="男" value="0" />
                  <ElOption label="女" value="1" />
                  <ElOption label="未知" value="2" />
                </ElSelect>
              </ElFormItem>
              <ElAlert
                v-if="profileError"
                :title="profileError"
                type="error"
                show-icon
                :closable="false"
                class="form-feedback"
              />
              <div class="form-actions">
                <span class="save-state" role="status">{{
                  hasProfileChanges ? "有尚未保存的修改" : "资料已同步"
                }}</span>
                <ElButton
                  type="primary"
                  native-type="submit"
                  :loading="saving"
                  :disabled="loading || !currentUser || !hasProfileChanges"
                  >保存资料</ElButton
                >
              </div>
            </ElForm>
          </ElTabPane>

          <ElTabPane label="修改密码" name="password">
            <div class="panel-intro">
              <h3>账号安全</h3>
              <p>定期更新密码，保护您的账号。</p>
            </div>
            <p class="form-hint">
              <FaSvgIcon icon="ri:information-line" />修改后将退出当前登录，请使用新密码重新登录。
            </p>
            <ElForm
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              :disabled="changingPassword"
              label-position="top"
              class="profile-form profile-form--password"
              @submit.prevent="changePassword"
            >
              <ElFormItem label="当前密码" prop="old_password" class="password-current">
                <ElInput
                  v-model="passwordForm.old_password"
                  type="password"
                  show-password
                  autocomplete="current-password"
                />
              </ElFormItem>
              <ElFormItem label="新密码" prop="new_password">
                <ElInput
                  v-model="passwordForm.new_password"
                  type="password"
                  show-password
                  autocomplete="new-password"
                />
              </ElFormItem>
              <ElFormItem label="确认新密码" prop="confirm_password">
                <ElInput
                  v-model="passwordForm.confirm_password"
                  type="password"
                  show-password
                  autocomplete="new-password"
                />
              </ElFormItem>
              <ElAlert
                v-if="passwordError"
                :title="passwordError"
                type="error"
                show-icon
                :closable="false"
                class="form-feedback"
              />
              <div class="form-actions">
                <ElButton type="primary" native-type="submit" :loading="changingPassword"
                  >修改密码并重新登录</ElButton
                >
              </div>
            </ElForm>
          </ElTabPane>
        </ElTabs>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { useUserStore } from "@stores";
import UserAPI, { type UserInfo } from "@/api/module_system/user";
import FaPageHeader from "@/components/layouts/fa-page-header/index.vue";

defineOptions({ name: "Profile" });

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const activeTab = ref("info");
const loading = ref(false);
const saving = ref(false);
const changingPassword = ref(false);
const loadError = ref("");
const profileError = ref("");
const passwordError = ref("");
const avatarFailed = ref(false);
const currentUser = ref<UserInfo>();
const profileFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();
const profileForm = reactive({ name: "", email: "", mobile: "", gender: "2" });
const passwordForm = reactive({ old_password: "", new_password: "", confirm_password: "" });
const avatar = computed(() => currentUser.value?.avatar || "");
const roleLabel = computed(
  () =>
    currentUser.value?.roles
      ?.map((role) => role.name)
      .filter(Boolean)
      .join("、") || (userStore.info.is_superuser ? "超级管理员" : "用户")
);
const hasProfileChanges = computed(
  () =>
    Boolean(currentUser.value) &&
    (profileForm.name.trim() !== (currentUser.value?.name || "") ||
      profileForm.email.trim() !== (currentUser.value?.email || "") ||
      profileForm.mobile.trim() !== (currentUser.value?.mobile || "") ||
      profileForm.gender !== (currentUser.value?.gender || "2"))
);

const profileRules: FormRules = {
  name: [{ required: true, whitespace: true, message: "请输入姓名", trigger: "blur" }],
  email: [{ type: "email", message: "邮箱格式不正确", trigger: "blur" }],
  mobile: [{ pattern: /^1\d{10}$/, message: "手机号格式不正确", trigger: "blur" }],
};
const passwordRules: FormRules = {
  old_password: [
    { required: true, min: 6, max: 128, message: "当前密码需为 6–128 位", trigger: "blur" },
  ],
  new_password: [
    { required: true, min: 6, max: 128, message: "新密码需为 6–128 位", trigger: "blur" },
  ],
  confirm_password: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (_rule, value, callback) =>
        callback(
          value === passwordForm.new_password ? undefined : new Error("两次输入的新密码不一致")
        ),
      trigger: "blur",
    },
  ],
};

watch(
  () => route.query.tab,
  (tab) => {
    activeTab.value = tab === "password" ? "password" : "info";
  },
  { immediate: true }
);

function changeTab(tab: string | number): void {
  void router.replace({ name: "Profile", query: tab === "password" ? { tab: "password" } : {} });
}

async function loadProfile(): Promise<void> {
  if (loading.value) return;
  loading.value = true;
  loadError.value = "";
  try {
    const response = await UserAPI.getCurrentUserInfo();
    const user = response.data.data;
    currentUser.value = user;
    profileForm.name = user.name || "";
    profileForm.email = user.email || "";
    profileForm.mobile = user.mobile || "";
    profileForm.gender = user.gender || "2";
    avatarFailed.value = false;
  } catch {
    loadError.value = "个人资料加载失败";
  } finally {
    loading.value = false;
  }
}

async function saveProfile(): Promise<void> {
  if (saving.value || loading.value || !currentUser.value) return;
  saving.value = true;
  profileError.value = "";
  let saved = false;
  try {
    if (!(await profileFormRef.value?.validate().catch(() => false))) return;
    const name = profileForm.name.trim();
    const email = profileForm.email.trim();
    const mobile = profileForm.mobile.trim();
    const changes: {
      name?: string;
      email?: string | null;
      mobile?: string | null;
      gender?: string;
    } = {};
    if (name !== (currentUser.value?.name || "")) changes.name = name;
    if (email !== (currentUser.value?.email || "")) changes.email = email || null;
    if (mobile !== (currentUser.value?.mobile || "")) changes.mobile = mobile || null;
    if (profileForm.gender !== (currentUser.value?.gender || "2"))
      changes.gender = profileForm.gender;
    if (Object.keys(changes).length === 0) {
      ElMessage.info("资料没有变化");
      return;
    }

    await UserAPI.updateCurrentUserInfo(changes);
    saved = true;
    await userStore.getUserInfo();
    await loadProfile();
    ElMessage.success("个人资料已保存");
  } catch {
    profileError.value = saved
      ? "资料已保存，但显示刷新失败。请重新加载资料。"
      : "保存失败，已保留您的修改，请重试。";
  } finally {
    saving.value = false;
  }
}

async function changePassword(): Promise<void> {
  if (changingPassword.value) return;
  changingPassword.value = true;
  passwordError.value = "";
  let changed = false;
  try {
    if (!(await passwordFormRef.value?.validate().catch(() => false))) return;
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      passwordError.value = "两次输入的新密码不一致";
      return;
    }
    if (passwordForm.new_password === passwordForm.old_password) {
      passwordError.value = "新密码不能与当前密码相同";
      return;
    }

    await UserAPI.changeCurrentUserPassword({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password,
    });
    changed = true;
    passwordForm.old_password = "";
    passwordForm.new_password = "";
    passwordForm.confirm_password = "";
    ElMessage.success("密码已修改，请重新登录");
    await userStore.logout();
  } catch {
    passwordError.value = changed
      ? "密码已修改，请退出当前账号后使用新密码登录。"
      : "密码修改失败，请检查当前密码后重试。";
  } finally {
    changingPassword.value = false;
  }
}

onMounted(loadProfile);
</script>

<style scoped>
.profile-page {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
}

.account-surface {
  overflow: hidden;
  background: var(--fa-color-surface, var(--el-bg-color));
  border: 1px solid var(--fa-color-border, var(--el-border-color));
  border-radius: var(--fa-radius-panel, 14px);
  box-shadow: var(--fa-soft-shadow);
}

.identity-header {
  display: flex;
  gap: 18px;
  align-items: center;
  min-height: 128px;
  padding: 24px 32px;
  border-bottom: 1px solid var(--fa-color-border, var(--el-border-color));
}

.identity-avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  overflow: hidden;
  font-size: 28px;
  color: var(--fa-color-accent, var(--el-color-primary));
  object-fit: cover;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--fa-color-border, var(--el-border-color));
  border-radius: 12px;
}

.identity-copy {
  flex: 1;
  min-width: 0;
}

.identity-kicker {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  color: var(--fa-color-text-muted, var(--el-text-color-secondary));
}

.identity-copy h2 {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 20px;
  font-weight: 680;
  color: var(--fa-color-text, var(--el-text-color-primary));
  white-space: nowrap;
}

.identity-account {
  margin: 5px 0 0;
  font-size: 13px;
  color: var(--fa-color-text-muted, var(--el-text-color-secondary));
}

.identity-role {
  flex: 0 1 auto;
  max-width: 40%;
  padding: 6px 10px;
  margin-left: auto;
  font-size: 12px;
  line-height: 1.6;
  color: var(--fa-color-text, var(--el-text-color-primary));
  overflow-wrap: anywhere;
  background: var(--el-fill-color-light);
  border: 1px solid var(--fa-color-border, var(--el-border-color));
  border-radius: var(--fa-radius-control, 10px);
}

.detail-panel {
  min-width: 0;
}

.detail-panel :deep(.el-tabs) {
  padding: 0;
  margin: 0;
  background: transparent;
  border: 0;
  border-radius: 0;
}

.detail-panel :deep(.el-tabs__header) {
  padding: 16px 32px 15px;
  border-bottom: 1px solid var(--fa-color-border, var(--el-border-color));
}

.detail-panel :deep(.el-tabs__content) {
  padding: 30px 32px 32px;
}

.panel-intro {
  margin-bottom: 25px;
}

.panel-intro h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 650;
  color: var(--fa-color-text, var(--el-text-color-primary));
}

.panel-intro p {
  margin: 7px 0 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--fa-color-text-muted, var(--el-text-color-secondary));
}

.profile-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 24px;
  max-width: 840px;
}

.profile-form--password {
  max-width: 680px;
}

.password-current {
  grid-column: 1 / -1;
  max-width: calc(50% - 12px);
}

.full-width {
  width: 100%;
}

.form-actions {
  display: flex;
  grid-column: 1 / -1;
  justify-content: flex-end;
  padding-top: 22px;
  margin-top: 4px;
  border-top: 1px solid var(--fa-color-border, var(--el-border-color));
}

.save-state {
  margin-right: auto;
  font-size: 12px;
  line-height: 1.5;
  color: var(--fa-color-text-muted, var(--el-text-color-secondary));
}

.form-feedback {
  grid-column: 1 / -1;
}

.profile-page :deep(button:focus-visible),
.profile-page :deep(.el-tabs__item:focus-visible) {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 3px;
}

.form-hint {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  max-width: 680px;
  padding: 12px 14px;
  margin: 0 0 22px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--fa-color-text-muted, var(--el-text-color-secondary));
  background: var(--el-fill-color-light);
  border-radius: 5px;
}

.form-hint :deep(.fa-svg-icon) {
  flex: none;
  margin-top: 2px;
}

.load-alert {
  margin-top: 16px;
}

@media (width <= 680px) {
  .identity-header {
    min-height: 108px;
    padding: 20px;
  }

  .identity-avatar {
    width: 56px;
    height: 56px;
    font-size: 23px;
  }

  .identity-copy h2 {
    font-size: 17px;
  }

  .detail-panel :deep(.el-tabs__header) {
    padding: 12px 20px;
  }

  .detail-panel :deep(.el-tabs__content) {
    padding: 24px 20px;
  }
}

@media (width <= 520px) {
  .identity-header {
    flex-wrap: wrap;
    gap: 12px;
  }

  .identity-role {
    max-width: 100%;
    margin-left: 0;
  }

  .profile-form {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .password-current {
    grid-column: auto;
    max-width: none;
  }

  .form-actions {
    flex-wrap: wrap;
    grid-column: auto;
  }

  .form-actions :deep(.el-button) {
    width: 100%;
    min-height: 44px;
  }
}
</style>
gap: 16px; align-items: center;
