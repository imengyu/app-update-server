<template>
  <div class="vc-host">
    <a-layout class="vc-root">
      <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible class="vc-side-menu">
        <div :class="'vc-logo'+(collapsed?' collapsed':'')">
          App更新服务
        </div>
        <c-scrollbar style="height:auto">
          <a-menu
            class="vc-side-menu"
            mode="inline"
            theme="dark"
            :inline-collapsed="collapsed"
            v-model:openKeys="openKeys"
            v-model:selectedKeys="selectedKeys"
            @click="onMenuClick">
            <a-menu-item key="Home">
              <UserOutlined />
              <span>首页</span>
            </a-menu-item>
            <a-sub-menu key="ManageApp">
              <template #title>
                <span>
                  <AppstoreOutlined />
                  <span>App管理</span>
                </span>
              </template>
              <a-menu-item key="ManageApp">
                <AndroidOutlined />
                <span>App管理</span>
              </a-menu-item>
              <a-menu-item key="ManageChannel">
                <ApartmentOutlined />
                <span>渠道管理</span>
              </a-menu-item>
              <a-menu-item key="ManageUpdate">
                <UploadOutlined />
                <span>更新管理</span>
              </a-menu-item>
              <a-menu-item key="ManageStorage">
                <CodeSandboxOutlined />
                <span>本地存储管理</span>
              </a-menu-item>
              <a-menu-item key="DataView">
                <AreaChartOutlined />
                <span>数据查看</span>
              </a-menu-item>
            </a-sub-menu>
            <a-menu-item key="ConfigSystem">
              <ToolOutlined />
              <span>系统管理</span>
            </a-menu-item>
            <a-menu-item key="Quit">
              <LogoutOutlined />
              <span>退出系统</span>
            </a-menu-item>
          </a-menu>
        </c-scrollbar>
      </a-layout-sider>
      <a-layout>
        <a-layout-header class="vc-header">
          <MenuUnfoldOutlined
            v-if="collapsed"
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          <MenuFoldOutlined v-else class="trigger" @click="() => (collapsed = !collapsed)" />
          <a-dropdown v-if="userInfo">
            <a class="vc-usr-ctl" @click.prevent>
              <img :src="getUserHead()" />
              <span>{{userInfo.name}}</span>
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu @click="handleUserMenuClick">
                <a-menu-item key="user">个人信息</a-menu-item>
                <a-menu-item key="exit">退出登录</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-layout-header>
        <a-layout-content class="vc-main-area">
          <c-scrollbar style="height:auto">
            <div class="vc-content">
              <router-view/>
            </div>
          </c-scrollbar>
        </a-layout-content>
        <a-layout-footer class="vc-footer">
          <span>&copy; 2021 快乐的梦鱼 版权所有</span>
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </div>
</template>

<script lang="ts">
import { computed, createVNode, defineComponent, ref } from "vue";
import router from "./router";
import {
  UserOutlined,
  ToolOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DownOutlined,
  AreaChartOutlined,
  AppstoreOutlined,
  ApartmentOutlined,
  AndroidOutlined,
  UploadOutlined,
  CodeSandboxOutlined,
} from '@ant-design/icons-vue';
import { Modal } from "ant-design-vue";
import { useStore } from "vuex";
import { apiRoot } from "./api";


export default defineComponent({
  components: {
    UserOutlined,
    ToolOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DownOutlined,
    AreaChartOutlined,
    AppstoreOutlined,
    ApartmentOutlined,
    AndroidOutlined,
    UploadOutlined,
    CodeSandboxOutlined,
  },
  setup() {

    const uploadHeadBaseUrl = apiRoot.substring(0, apiRoot.length - 1);
    const collapsed = ref(false);
    const selectedKeys = ref<string[]>(['Home']);
    const openKeys = ref<string[]>([]);
    const store = useStore();
    const userInfo = computed(() => store.getters.userInfo);

    function quitLogin() {
      Modal.confirm({
        title: '希望退出系统的登录?',
        icon: createVNode(ExclamationCircleOutlined),
        content: '您的登录状态将会被注销',
        onOk() { router.push({ name: 'Logout' }) }
      });
    }
    function onMenuClick(menu: { key: string }) {
      if(menu.key === 'Quit') quitLogin();
      else router.push({ name: menu.key })
    }
    function handleUserMenuClick(menu: { key: string }) {
      if(menu.key === 'user') router.push({ name: 'UserProfile' })
      else if(menu.key === 'exit') quitLogin();
    }
    function getUserHead() {
      return (userInfo.value.head && userInfo.value.head != '') ? (uploadHeadBaseUrl + userInfo.value.head) : require('./assets/images/user.png');
    }
    
    return {
      uploadHeadBaseUrl,
      collapsed,
      selectedKeys,
      openKeys,
      onMenuClick,
      getUserHead,
      handleUserMenuClick,
      userInfo,
    }
  }
})
</script>

<style lang="scss">
</style>
