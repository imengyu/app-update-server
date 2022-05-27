<template>
  <div class="vc-login">
    <div class="vc-box text-center">
      <a-spin :spinning="requesting">
        <h1>移动端设备认证</h1>
        <div v-if="isKeyGetError">
          <WarningOutlined :style="{ margin:'16px 0', fontSize: '4em' }" />
          <h3>请求错误</h3>
          <a-button 
            size="large" 
            shape="round"
            @click="onCancelButtonClicked">关闭</a-button>
        </div>
        <div v-else-if="isSuccess">
          <CheckCircleFilled :style="{ color:'rgb(76, 175, 80)', fontSize: '3em', marginBottom: '10px' }" /><br/>
          <h3>成功！</h3>
          <a-button 
            size="large" 
            type="primary"
            shape="round"
            @click="onCancelButtonClicked">关闭</a-button>
        </div>
        <div v-else-if="isAuthed">
          <WarningOutlined :style="{ margin:'16px 0', fontSize: '4em' }" />
          <h3>{{isError?'请求失败':'您希望在这台设备上登录吗？'}}</h3>
          <span v-if="isError" class="display-block text-daner">{{ requestError }}</span>
          <span v-else class="text-secondary">为确保您的账号安全，切勿扫描来源未知的二维码</span>
          <div class="mt-4">
            <a-button 
              size="large" 
              shape="round"
              type="primary"
              @click="onAuthButtonClicked">{{isError?'重试':'登录'}}</a-button>
            <a-button 
              class="ml-3 text-dark"
              size="large" 
              shape="round"
              @click="onCancelButtonClicked">取消</a-button>
          </div>
        </div>
        <div v-else>
          <WarningOutlined :style="{ margin:'16px 0', fontSize: '4em' }" />
          <h3 class="text-white">请先登录，然后才能进行快速认证</h3>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { defineComponent, watch, ref } from 'vue';
import { WarningOutlined } from '@ant-design/icons-vue';
import common from '@/utils/common';
import api from '@/api';

export default defineComponent({
  name: 'LoginQR',
  components: {
    WarningOutlined 
  },
  computed: {
    ...mapGetters([ 'isAuthed' ]),
  },
  setup() {

    const isKeyGetError = ref(false);
    const isSuccess = ref(false);
    const isError = ref(false);
    const requesting = ref(false);
    const requestError = ref('');
    const requestKey = ref('');

    function onAuthButtonClicked() {
      requesting.value = true;
      api.login.doLoginQR(requestKey.value).then(() => {
        isSuccess.value = true;
        isError.value = false;
        requesting.value = false;
      }).catch((e) => {
        requesting.value = false;
        isSuccess.value = false;
        isError.value = true;
        requestError.value = ''+e;
      })
    }
    function onCancelButtonClicked() {
      window.close();
    }

    return {
      requesting,
      requestKey,
      isKeyGetError,
      isSuccess,
      requestError,
      onAuthButtonClicked,
      onCancelButtonClicked,
    }
  },
  mounted() {
    if(common.isNullOrEmpty(this.$route.query.reuestUid)) this.isKeyGetError = true;
    else {
      this.requestKey = '' + this.$route.query.reuestUid;
      setTimeout(() => {
        if(this.isAuthed) api.login.notifyLoginQRScan(this.requestKey).catch((e) => console.warn('通知失败！' + e))
      }, 100);
    }
  },
});

</script>
