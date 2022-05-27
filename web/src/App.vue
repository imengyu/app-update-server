<template>
  <a-config-provider :locale="locate">
    <router-view v-show="!loginNotifyDialogVisible" />
    <a-modal v-model:visible="loginNotifyDialogVisible" title="提示">
      <div class="text-center">
        <img src="./assets/images/icon/authority.svg">
        <div class="mt-3">请验证您的身份后进入系统</div>
      </div>
      <template #footer>
        <a-button type="primary" @click="onCloseLoginNotifyDialog">确定</a-button>
      </template>
    </a-modal>
  </a-config-provider>
</template>

<script lang="ts">
import config from './config';
import router from './router';
import { ApiError } from './api/common';
import { IEmpty } from './api'; 
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue';
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { mapGetters, useStore } from 'vuex';
import zhCN from 'ant-design-vue/es/locale/zh_CN';

export default defineComponent({
  name: 'App',
  setup (props, context) {

    const route = useRoute()
    const locate = ref(zhCN);
    const store = useStore();
    const isAuthed = computed(() => store.getters.isAuthed); 

    const loginNotifyDialogVisible = ref(false);

    let isMounting = false;

    function loadAuthStatus() {
      let k = localStorage.getItem(config.consts.authKName) || '', v = localStorage.getItem(config.consts.authVName) || '';
      store.commit('updateAuthKName', k);
      store.commit('updateAuthKVal', v);
      return store.dispatch('requestAuthStatus');
    }
    function checkOrRedirectToLogin() {
      if(route.path.startsWith('/sys') && !isAuthed.value) {
        loginNotifyDialogVisible.value = true;
      }
    }

    onMounted(() => {
      isMounting = true;
      doLoadAuthStatus();
    });
    onBeforeUnmount(() => {

    });

    function doLoadAuthStatus() {
      loadAuthStatus().then(() => {
        setTimeout(() => {
          if(isAuthed.value) 
            store.dispatch('requestUserInfo')
          checkOrRedirectToLogin()
          isMounting = false;
        }, 500);
      }).catch((e : ApiError<IEmpty>) => {
        checkOrRedirectToLogin();       
        isMounting = false;
        if(e.networkError)
          message.error('登录状态获取失败：' + e.errorMessage)
      });
    }

    watch(() => route.path, () => {
      if(!isMounting)
        setTimeout(() => doLoadAuthStatus(), 200);
    });

    function onCloseLoginNotifyDialog() {
      loginNotifyDialogVisible.value = false;
      router.push({ name: 'Login', query: { redirectTo: location.href, showRelogin: 'true' } });
    }

    return {
      loadAuthStatus,
      checkOrRedirectToLogin,
      loginNotifyDialogVisible,
      onCloseLoginNotifyDialog,
      locate,
    }
  },
});
</script>