<template>
  <div class="vc-login">
    <div class="vc-box text-center">
      <span v-if="authFailed" class="text-danger">退出登录失败{{authError}}</span>
      <span v-else-if="authSuccess" class="text-white">退出登录成功</span>
      <span v-else>请稍后...</span>

      <div class="mt-4">
        <a-button class="mr-3" v-if="authFailed" shape="round" @click="onRetryClicked">重试</a-button>
        <a-button type="primary" shape="round" @click="onBackClicked">返回</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import api from "@/api";
import router from "@/router";
import store from "@/store";
import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({
  setup() {
    const authFailed = ref(false);
    const authSuccess = ref(false);
    const authError = ref('');

    onMounted(() => {
      setTimeout(() => doLogout(), 1000);
    });

    function onRetryClicked() {
      authFailed.value = false;
      doLogout();
    }
    function onBackClicked() {
      router.push({ name: 'Login' });
    }
    function doLogout() {
      api.login.doLogout().then(() => {
        authSuccess.value = true;
        store.dispatch('clearAuthKey')
      }).catch((e) => {
        authFailed.value = true;
        authError.value = e;
      })
    }

    return {
      authFailed,
      authError,
      authSuccess,
      onBackClicked,
      onRetryClicked,
      doLogout
    }
  }
});
</script>
