<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-mark" aria-hidden="true">仲</div>
        <h2>案件材料整理室</h2>
        <p>登录你的账号</p>
      </div>

      <form class="auth-form" @submit.prevent="handleLogin">
        <label class="field">
          <span>账号</span>
          <input v-model="username" type="text" placeholder="请输入账号" autocomplete="username" />
        </label>
        <label class="field">
          <span>密码</span>
          <input v-model="password" type="password" placeholder="请输入密码" autocomplete="current-password" />
        </label>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="btn primary full-width" :disabled="submitting">
          {{ submitting ? "登录中..." : "登录" }}
        </button>
      </form>

      <p class="auth-footer">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { loginApi } from "../api/authApi";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const { setAuth } = useAuth();

const username = ref("");
const password = ref("");
const submitting = ref(false);
const errorMsg = ref("");

async function handleLogin() {
  errorMsg.value = "";
  if (!username.value || !password.value) {
    errorMsg.value = "请输入账号和密码";
    return;
  }
  if (submitting.value) return;

  submitting.value = true;
  try {
    console.log("[LoginView] 开始登录...", username.value);
    const res = await loginApi(username.value, password.value);
    console.log("[LoginView] 登录响应:", { code: res.code, hasData: !!res.data, hasToken: !!res.data?.access_token });
    if (!res.data || !res.data.access_token) {
      errorMsg.value = "登录响应异常，请联系管理员";
      return;
    }
    setAuth(res.data.access_token, res.data.user_info);
    console.log("[LoginView] token 已存储，准备跳转...");
    await router.push("/");
    console.log("[LoginView] push 完成，当前路径:", router.currentRoute.value.path);
  } catch (e: unknown) {
    console.error("[LoginView] 登录失败:", e);
    errorMsg.value = e instanceof Error ? e.message : "登录失败";
  } finally {
    submitting.value = false;
  }
}
</script>
