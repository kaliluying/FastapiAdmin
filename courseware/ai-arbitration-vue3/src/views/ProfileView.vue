<template>
  <div class="profile-page">
    <header class="profile-topbar">
      <router-link to="/" class="back-link">&larr; 返回主页</router-link>
      <h2>个人中心</h2>
    </header>

    <div class="profile-body" v-if="user">
      <form class="profile-form" @submit.prevent="handleSave">
        <!-- 基本信息 -->
        <fieldset>
          <legend>基本信息</legend>
          <div class="field-row">
            <label class="field">
              <span>账号</span>
              <input :value="user.username" disabled />
            </label>
            <label class="field">
              <span>昵称</span>
              <input v-model="form.name" type="text" placeholder="你的昵称" />
            </label>
          </div>
          <div class="field-row">
            <label class="field">
              <span>手机号</span>
              <input v-model="form.mobile" type="text" placeholder="手机号" />
            </label>
            <label class="field">
              <span>邮箱</span>
              <input v-model="form.email" type="email" placeholder="邮箱地址" />
            </label>
          </div>
        </fieldset>

        <!-- 仲裁信息 -->
        <fieldset>
          <legend>劳动仲裁信息</legend>
          <p class="fieldset-hint">这些信息将用于 AI 辅助咨询、证据分析和文书生成</p>
          <div class="field-row">
            <label class="field">
              <span>月工资（元）</span>
              <input v-model.number="form.monthly_salary" type="number" step="0.01" placeholder="例如 8000" />
            </label>
            <label class="field">
              <span>入职日期</span>
              <input v-model="form.hire_date" type="date" />
            </label>
          </div>
          <div class="field-row">
            <label class="field">
              <span>公司名称</span>
              <input v-model="form.company_name" type="text" placeholder="你所在的公司名称" />
            </label>
            <label class="field">
              <span>岗位名称</span>
              <input v-model="form.position_name" type="text" placeholder="你的岗位" />
            </label>
          </div>
          <div class="field-row">
            <label class="field">
              <span>合同类型</span>
              <select v-model="form.contract_type">
                <option value="">请选择</option>
                <option value="劳动合同">劳动合同</option>
                <option value="劳务合同">劳务合同</option>
                <option value="无合同">无合同</option>
              </select>
            </label>
            <label class="field checkbox-field">
              <span>是否缴纳社保</span>
              <label class="checkbox-label">
                <input v-model="form.social_insurance" type="checkbox" />
                <span>{{ form.social_insurance ? "已缴纳" : "未缴纳" }}</span>
              </label>
            </label>
          </div>
        </fieldset>

        <p v-if="saveMsg" class="save-msg" :class="{ error: saveError }">{{ saveMsg }}</p>

        <div class="form-actions">
          <button type="submit" class="btn primary" :disabled="saving">
            {{ saving ? "保存中..." : "保存修改" }}
          </button>
        </div>
      </form>

      <!-- 修改密码 -->
      <form class="profile-form password-section" @submit.prevent="handleChangePassword">
        <fieldset>
          <legend>修改密码</legend>
          <div class="field-row">
            <label class="field">
              <span>旧密码</span>
              <input v-model="pwdForm.oldPassword" type="password" placeholder="输入旧密码" />
            </label>
            <label class="field">
              <span>新密码</span>
              <input v-model="pwdForm.newPassword" type="password" placeholder="至少6位" />
            </label>
          </div>
          <p v-if="pwdMsg" class="save-msg" :class="{ error: pwdError }">{{ pwdMsg }}</p>
          <button type="submit" class="btn primary" :disabled="changingPwd">
            {{ changingPwd ? "修改中..." : "修改密码" }}
          </button>
        </fieldset>
      </form>

      <!-- 退出 -->
      <div class="logout-section">
        <button class="btn" @click="handleLogout">退出登录</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { logoutApi, type UserInfo } from "../api/authApi";
import { useAuth } from "../composables/useAuth";
import { updateCurrentUserApi, changePasswordApi } from "../api/userApi";

const router = useRouter();
const { currentUser, clearAuth, refreshUser } = useAuth();

const user = ref<UserInfo | null>(null);
const saving = ref(false);
const saveMsg = ref("");
const saveError = ref(false);

const form = reactive<Record<string, string | number | boolean | null>>({
  name: "",
  mobile: "",
  email: "",
  monthly_salary: null,
  hire_date: "",
  company_name: "",
  position_name: "",
  contract_type: "",
  social_insurance: null,
});

const pwdForm = reactive({ oldPassword: "", newPassword: "" });
const changingPwd = ref(false);
const pwdMsg = ref("");
const pwdError = ref(false);

onMounted(() => {
  if (currentUser.value) {
    user.value = currentUser.value;
    populateForm(currentUser.value);
  }
});

function populateForm(u: UserInfo) {
  form.name = u.name || "";
  form.mobile = u.mobile || "";
  form.email = u.email || "";
  form.monthly_salary = u.monthly_salary;
  form.hire_date = u.hire_date || "";
  form.company_name = u.company_name || "";
  form.position_name = u.position_name || "";
  form.contract_type = u.contract_type || "";
  form.social_insurance = u.social_insurance ?? null;
}

async function handleSave() {
  saveMsg.value = "";
  saveError.value = false;
  saving.value = true;
  try {
    const res = await updateCurrentUserApi({
      name: String(form.name || ""),
      mobile: String(form.mobile || ""),
      email: String(form.email || ""),
      monthly_salary: form.monthly_salary ? Number(form.monthly_salary) : (form.monthly_salary === "" ? null : form.monthly_salary as number | null),
      hire_date: String(form.hire_date || "") || null,
      company_name: String(form.company_name || "") || null,
      position_name: String(form.position_name || "") || null,
      contract_type: String(form.contract_type || "") || null,
      social_insurance: form.social_insurance as boolean | null,
    });
    await refreshUser();
    if (currentUser.value) populateForm(currentUser.value);
    saveMsg.value = "保存成功";
  } catch (e: unknown) {
    saveMsg.value = e instanceof Error ? e.message : "保存失败";
    saveError.value = true;
  } finally {
    saving.value = false;
  }
}

async function handleChangePassword() {
  pwdMsg.value = "";
  pwdError.value = false;
  if (!pwdForm.oldPassword || !pwdForm.newPassword) {
    pwdMsg.value = "请填写旧密码和新密码";
    pwdError.value = true;
    return;
  }
  if (pwdForm.newPassword.length < 6) {
    pwdMsg.value = "新密码长度不能少于 6 位";
    pwdError.value = true;
    return;
  }
  changingPwd.value = true;
  try {
    await changePasswordApi(pwdForm.oldPassword, pwdForm.newPassword);
    pwdMsg.value = "密码修改成功";
    pwdForm.oldPassword = "";
    pwdForm.newPassword = "";
  } catch (e: unknown) {
    pwdMsg.value = e instanceof Error ? e.message : "修改失败";
    pwdError.value = true;
  } finally {
    changingPwd.value = false;
  }
}

async function handleLogout() {
  await logoutApi();
  clearAuth();
  router.replace("/login");
}
</script>
