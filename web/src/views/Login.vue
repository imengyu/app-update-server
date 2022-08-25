<template>
  <div class="vc-login">
    <div class="vc-box mb-5">
      <h1>工作人员身份认证</h1>
      <div class="vc-login-cbox">
        <a-alert v-if="loginErr&&loginErr!=''" type="error" :message="loginErr" banner closable :after-close="() => loginErr=''" />
        <a-input 
          size="large" 
          type="password" 
          v-model:value="inputPass" 
          placeholder="密钥"
          :disabled="loginIsRequesting"
          @pressEnter="onAuthButtonClicked" />
        <a-checkbox v-model:checked="loginRember">记住我</a-checkbox>
        <a-button 
          size="large" 
          shape="round"
          :style="{marginTop:'30px'}" 
          :loading="loginIsRequesting"
          @click="onAuthButtonClicked">认证</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import QRCode from 'qrcode'
import { defineComponent, watch, ref } from 'vue';
import { message } from 'ant-design-vue';
import { CheckCircleFilled } from '@ant-design/icons-vue';
import api, { IEmpty } from '@/api';
import router from '@/router';
import store from '@/store';
import common from '@/utils/common';
import config from '@/config';
import StringUtils from '@/utils/string';
import { ResposeCode } from '@/api/respcodes';
import { ApiError } from '@/api/common';
import { mapGetters } from 'vuex';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'Login',
  components: {
    CheckCircleFilled
  }, 
  computed: {
    ...mapGetters([ 'isAuthed' ]),
  },
  setup() {
    
    const route = useRoute();

    const inputPass = ref('');
    const loginMode = ref<'qr'|'key'>('qr');
    const loginRember = ref(false);
    const loginQRKey = ref('');
    const loginQRVal = ref('');
        
    const loginQRScaned = ref(false);
    const loginQRExpired = ref(true);
    const loginQRIsRequesting = ref(false);
    const loginQRIsRequestFailed = ref(false);
    const loginIsRequesting = ref(false);

    const loginQRErr = ref('');
    const loginErr = ref('');

    var qrCheckTimer = 0;
    var qrCheckTicks = 56;

    watch(() => loginMode.value, (val) => {
      if(val === 'qr' && loginQRExpired && !loginQRIsRequesting) 
        onRequestQRKey();
    });

    function onRequestQRKey() {
      loginQRIsRequesting.value = true;
      api.login.getLoginQR().then((v) => {
        loginQRErr.value = '';
        loginQRIsRequesting.value = false;    
        loginQRIsRequestFailed.value = false;
        if(v.data) {
          loginQRKey.value = v.data.reuestUid;
          loginQRExpired.value = false;
          loginQRScaned.value = false;
          setTimeout(() => {
            loginQRVal.value = location.origin + process.env.BASE_URL + '#' + router.resolve({ name: 'LoginQR' }).fullPath + "?reuestUid=" + loginQRKey.value;
            QRCode.toCanvas(document.getElementById('vc-login-qr'), loginQRVal.value);
            window.clearInterval(qrCheckTimer);
            qrCheckTicks = 56;
            qrCheckTimer = window.setInterval(() => {
              if(loginMode.value === 'qr')
                onAuthButtonClicked();
              qrCheckTicks--;
              if(qrCheckTicks <= 0) {
                window.clearInterval(qrCheckTimer);
                loginQRExpired.value = true;
              }
            }, 2000);
          }, 300)
        }
      }).catch((e) => {
        message.error('请求二维码失败！' + e);
        loginQRIsRequestFailed.value = true;
        loginQRIsRequesting.value = false;
        loginQRExpired.value = true;
        loginQRScaned.value = false;
        loginQRErr.value = '' + e;
      });
    }
    function onAuthButtonClicked() {
      
      if(loginMode.value === 'key' && StringUtils.isNullOrEmpty(inputPass.value)) {
        loginErr.value = '请输入您的登录凭证！';
        return;
      }
      
      loginErr.value = '';
      loginIsRequesting.value = true;
      api.login.doLogin(loginMode.value, loginMode.value === 'qr' ? loginQRKey.value: inputPass.value, loginRember.value)
        .then((v) => {
          loginIsRequesting.value = false;
          loginErr.value = '';

          if(v.data) {
            store.commit('updateAuthStatus',  v.data.authStatus);
            store.commit('updateAuthKName', v.data.authName);
            store.commit('updateAuthKVal',  v.data.authKey);
            store.commit('updateAuthExpireAt', v.data.expireAt);

            localStorage.setItem(config.consts.authKName, v.data.authName)
            localStorage.setItem(config.consts.authVName, v.data.authKey)
          }


          router.push({ name: 'Home' });
        })
        .catch((e : ApiError<IEmpty>) => {
          if(loginMode.value === 'qr') {
            if(e.errorApiData?.code === ResposeCode.AUTH_WAITING_ACCEPT.code) {
              loginQRScaned.value = true;
            } else {
              loginQRScaned.value = false;
            }
            loginQRErr.value = '' + e;
          } else {
            loginErr.value = '' + e;
          }
          loginIsRequesting.value = false;        
        })
    }
    function returnBackOrGotoHome() {
      if(!common.isNullOrEmpty(route.query.redirectTo)) location.href = <string>route.query.redirectTo;
      else router.push({ name: 'Home' });
    }

    return {
      loginRember,
      inputPass,
      loginMode,
      loginQRKey,
      loginQRVal,
      loginIsRequesting,
      loginQRExpired,
      loginQRIsRequesting,
      loginErr,
      loginQRScaned,
      loginQRErr,
      loginQRIsRequestFailed,
      onRequestQRKey,
      onAuthButtonClicked,
      returnBackOrGotoHome,
    }
  },
  mounted() {
    setTimeout(() => {
      if(this.isAuthed) this.returnBackOrGotoHome();
      else this.onRequestQRKey();
    }, 1000);
  },
});

</script>
