<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-mark" aria-hidden="true">仲</div>
        <h2>创建账号</h2>
        <p>注册后即可使用案件材料整理室</p>
      </div>

      <form class="auth-form" @submit.prevent="handleRegister">
        <label class="field">
          <span>账号</span>
          <input v-model="username" type="text" placeholder="字母开头，3-32位" autocomplete="username" />
        </label>
        <label class="field">
          <span>密码</span>
          <input v-model="password" type="password" placeholder="至少6位" autocomplete="new-password" />
        </label>
        <label class="field">
          <span>确认密码</span>
          <input v-model="confirmPassword" type="password" placeholder="再次输入密码" autocomplete="new-password" />
        </label>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>

        <button type="submit" class="btn primary full-width" :disabled="submitting">
          {{ submitting ? "注册中..." : "注册" }}
        </button>
      </form>

      <p class="auth-footer">
        已有账号？<router-link to="/login">去登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { registerApi } from "../api/authApi";

const router = useRouter();

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const submitting = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

async function handleRegister() {
  errorMsg.value = "";
  successMsg.value = "";

  if (!username.value || !password.value) {
    errorMsg.value = "请填写账号和密码";
    return;
  }
  if (password.value.length < 6) {
    errorMsg.value = "密码长度不能少于 6 位";
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = "两次密码输入不一致";
    return;
  }

  submitting.value = true;
  try {
    await registerApi({
      username: username.value,
      password: password.value,
    });
    successMsg.value = "注册成功，即将跳转登录页...";
    setTimeout(() => {
      router.replace("/login");
    }, 1500);
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : "注册失败";
  } finally {
    submitting.value = false;
  }
}
</script>
