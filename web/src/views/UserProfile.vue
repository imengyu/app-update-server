<template>
  <a-card :bordered="false" class="vc-settings-card margin">   
    <a-tabs
      tab-position="left"
      v-model:activeKey="activeKey"
      class="vc-settings-tab"
    >
      <a-tab-pane key="profile" tab="账号设置" class="vc-settings">
        <a-row>
          <a-col :span="16">
            <h3>账号设置</h3>
            <a-form layout="vertical" :model="formProfileState" v-bind="formItemLayout">
              <a-form-item label="名字">
                <a-input v-model:value="formProfileState.name" placeholder="用户名"></a-input>
              </a-form-item>
              <a-form-item label="性别">
                <a-radio-group :options="sexOptions" v-model:value="formProfileState.sex" />
              </a-form-item>
              <a-form-item label="联系电话">
                <a-input v-model:value="formProfileState.phone" placeholder="联系电话"></a-input>
              </a-form-item>
              <a-form-item label="座右铭">
                <a-textarea v-model:value="formProfileState.moto" placeholder="写一句座右铭激励自己吧"></a-textarea>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="updateUserProfile">更新个人信息</a-button>
              </a-form-item>
            </a-form>
          </a-col>
          <a-col :span="6">
            <a-upload
              v-model:file-list="uploadHeadFileList"
              name="avatar"
              list-type="picture-card"
              class="avatar-uploader"
              :show-upload-list="false"
              :action="uploadHeadUrl"
              :data="getUploadHeadData"
              :before-upload="beforeHeadUpload"
              @change="handleUploadHeadChange"
            >
              <img v-if="uploadHeadImageUrl" :src="uploadHeadBaseUrl+uploadHeadImageUrl" alt="avatar" title="点击可更改头像" />
              <div v-else title="点击上传头像">
                <loading-outlined v-if="uploadHeadLoading"></loading-outlined>
                <plus-outlined v-else></plus-outlined>
                <div class="ant-upload-text">上传头像</div>
              </div>
            </a-upload>
          </a-col>
        </a-row>
      </a-tab-pane>
      <a-tab-pane key="security" tab="安全设置" class="vc-settings">
        <h3>安全设置</h3>
        <a-list
          class="demo-loadmore-list"
          item-layout="horizontal"
          :data-source="securitySettingsData"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <template #actions>
                <a>{{ item.action }}</a>
              </template>
              <a-list-item-meta
                :description="item.desp"
              >
                <template #title>
                  <a>{{ item.name }}</a>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </a-tab-pane>
      <a-tab-pane key="custom" tab="自定义设置" class="vc-settings">
        <h3>自定义设置</h3>
        <a-empty />
      </a-tab-pane>
      <a-tab-pane key="binding" tab="账号绑定" class="vc-settings">
        <h3>账号绑定</h3>
        <a-empty />
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script lang="ts">
import { IUserInfo } from '@/api/user';
import { useStore } from 'vuex';
import { computed, defineComponent, onMounted, reactive, ref, UnwrapRef } from 'vue'
import api, { apiRoot, IEmpty } from '@/api';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { FileInfo, FileItem } from '../models/FileUpload';
import { ApiError } from '@/api/common';

interface FormProfileState {
  name: string;
  sex: number;
  phone: string;
  moto: string;
}

export default defineComponent({
  components: {
    PlusOutlined,
    LoadingOutlined
  },
  name: 'UserProfile',
  setup() {
    const uploadHeadBaseUrl = apiRoot.substring(0, apiRoot.length - 1);
    const uploadHeadUrl = apiRoot + 'user-head'; 
    const uploadHeadFileList = ref([]);
    const uploadHeadLoading = ref(false);
    const uploadHeadImageUrl = ref('');
    let uploadHeadKey = '';

    const handleUploadHeadChange = (info: FileInfo) => {
      if (info.file.status === 'uploading') {
        uploadHeadLoading.value = true;
        return;
      }
      if (info.file.status === 'done') {
        if(info.file.response && (info.file.response as any).data)
          uploadHeadImageUrl.value = (info.file.response as any).data.path;
        uploadHeadLoading.value = false;
      }
      if (info.file.status === 'error') {
        uploadHeadLoading.value = false;
        message.error('上传头像失败');
      }
    };
    const beforeHeadUpload = (file: FileItem) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng)
        message.error('请上传 jpg 或 png 格式图片 !');
      const isLt2M = file.size / 1024 / 1024 < 5;
      if (!isLt2M) 
        message.error('图像必须小于 5MB!');
      return new Promise<void>((resolve, reject) => {
        if(isJpgOrPng && isLt2M) {
          api.user.getUserUploadKey().then((key) => {
            if(key.data)
              uploadHeadKey = key.data.key;
            resolve();
          }).catch(reject);
        }else reject();
      });  
    };
    const getUploadHeadData = () => {
      return {
        key: uploadHeadKey
      }
    };

    const updateProfileSubmiting = ref(false);
    const activeKey = ref('profile');
    const store = useStore();
    const userInfo = computed(() => store.getters.userInfo);
    const formProfileState: UnwrapRef<FormProfileState> = reactive({
      name: '',
      sex: 0,
      phone: '',
      moto: '',
    });
    const formItemLayout = {};
    const securitySettingsData = [
      {
        name: '登录密码',
        desp: '当前密码强度：中',
        action: '更改',
      },
      {
        name: '安全手机',
        desp: '当前账号已设置安全手机：176****1376',
        action: '更改',
      },
      {
        name: '登录密钥',
        desp: '登录密钥是更安全的登录方式，可自定义登录设备、登录次数等',
        action: '设置',
      },
    ];

    const updateUserProfile = () => {
      updateProfileSubmiting.value = true;
      api.user.updateUserInfo(formProfileState as IUserInfo, userInfo.value.id).then(() => {
        message.success('更新个人信息成功！');
        updateProfileSubmiting.value = false;
      }).catch((e: ApiError<IEmpty>) => {
        message.error('更新个人信息失败！' + e);
        updateProfileSubmiting.value = false;
      });
    };

    const sexOptions = [
      { label: '男 ♂', value: 1 },
      { label: '女 ♀', value: 2 },
      { label: '其他或者不透露', value: 0 },
    ];

    onMounted(() => {
      setTimeout(() => {
        const val = userInfo.value as IUserInfo;
        if(val) {
          formProfileState.name = val.name;
          formProfileState.sex = val.sex;
          formProfileState.phone = val.phone;
          formProfileState.moto = val.moto;
          uploadHeadImageUrl.value = val.head;
        }
      }, 500);
    });

    return {
      securitySettingsData,
      updateUserProfile,
      uploadHeadBaseUrl,
      uploadHeadUrl,
      uploadHeadFileList,
      uploadHeadLoading,
      uploadHeadImageUrl,
      beforeHeadUpload,
      handleUploadHeadChange,
      activeKey,
      sexOptions,
      formItemLayout,
      formProfileState,
      getUploadHeadData,
    }
  }
})
</script>

