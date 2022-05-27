<template>
  <a-spin :spinning="permissionState.requesting">
    <a-card :bordered="false" class="vc-settings-card margin" >   
      <a-result v-if="permissionState.requestFailed " status="500" title="请求权限信息失败" sub-title="请求权限信息失败，请检查你的网络连接是否正常，然后再试一次">
        <template #extra>
          <a-button type="primary" @click="requestPermissionInfo">重试</a-button>
        </template>
      </a-result>
      <a-tabs v-else
        tab-position="left"
        v-model:activeKey="activeKey"
        class="vc-settings-tab"
      >
        <a-tab-pane key="groups" tab="组控制" class="vc-settings">
          <h3>组控制</h3>
          <ManageGroups v-if="permissionState.manageGroups" />
          <a-result v-else status="403" title="403" sub-title="抱歉，您没有权限访问此页面"></a-result>
        </a-tab-pane>
        <a-tab-pane key="users" tab="用户控制" class="vc-settings">
          <h3>用户控制</h3>
          <ManageUsers v-if="permissionState.manageUsers" />
          <a-result v-else status="403" title="403" sub-title="抱歉，您没有权限访问此页面"></a-result>
        </a-tab-pane>
        <a-tab-pane key="system" tab="本系统设置" class="vc-settings">
          <h3>本系统设置</h3>
          <!-- <a-form
            ref="formRef"
            :model="formSettingsState"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-form-item label="允许子系统登录" name="delivery">
              <a-switch v-model:checked="formSettingsState.delivery" />
            </a-form-item>
            <a-form-item label="允许外网访问" name="outv">
              <a-switch v-model:checked="formSettingsState.outv" />
            </a-form-item>
            <a-form-item label="数据备份开关" name="dataBackup">
              <a-switch v-model:checked="formSettingsState.dataBackup" />
            </a-form-item>
            <a-form-item label="数据归并" name="dataMerge">
              <a-switch v-model:checked="formSettingsState.dataMerge" />
            </a-form-item>
          </a-form> -->
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </a-spin>
</template>

<script lang="ts">
import api from '@/api';
import { defineComponent, reactive, ref } from 'vue'
import ManageUsers from './subviews/ManageUsers.vue'
import ManageGroups from './subviews/ManageGroups.vue'
export default defineComponent({
  components: {
    ManageUsers, ManageGroups,
  },
  name: 'ConfigSystem',
  setup: () => {
    const activeKey = ref('groups');
    const formSettingsState = reactive({
      delivery: true,
      dataBackup: false,
      dataMerge: false,
      outv: true,
    });
    const permissionState = reactive({
      requesting: false,
      requestFailed: false,
      manageSubsys: false,
      manageUsers: false,
      manageGroups: false,
    });

    return {
      permissionState,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      formSettingsState,
      activeKey,
    }
  },
  methods: {
    requestPermissionInfo() {
      this.permissionState.requesting = true;
      this.permissionState.requestFailed = false;
      Promise.all([
        api.permission.checkUserPermission('manage-users'),
        api.permission.checkUserPermission('manage-gruops')
      ]).then((v) => {
        this.permissionState.requesting = false;
        this.permissionState.manageUsers = v[0].data?.grant || false;
        this.permissionState.manageGroups  = v[1].data?.grant || false;
      }).catch(() => {
        this.permissionState.requesting = false;
        this.permissionState.requestFailed = true;
      });
    }
  },
  mounted() {
    this.requestPermissionInfo();
  }
})
</script>

