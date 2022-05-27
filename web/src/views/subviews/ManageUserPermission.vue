<template>
  <div>
    <a-row v-if="setType=='user'">
      <a-col>
        <b class="m-0 display-block">用户特殊赋予权限</b>
        <span class="text-secondary">您可以将权限添加到右边的方框以向用户添加特殊权限</span>
        <a-transfer
          class="mt-3"
          :data-source="permissionNames"
          show-search
          @change="handleGrantPermissionChange"
          :target-keys="targetGrantPermissionNames"
          :filter-option="filterOption"
          :list-style="{
            width: '300px',
            height: '300px',
          }"
        >
          <template #render="item">
            <b :title="'内部权限名称：'+item.key">{{ item.title }}</b>
          </template>
        </a-transfer>
      </a-col>
    </a-row>
    <a-row v-if="setType=='user'" class="mt-3">
      <a-col>
        <b class="m-0 display-block">用户特殊禁止权限</b>
        <span class="text-secondary">特殊禁止权限可以禁止用户从组继承某些权限，这对于权限控制非常有用。您可以将权限添加到右边的方框以向用户添加特殊禁止权限</span>
        <a-transfer
          class="mt-3"
          :data-source="permissionNames"
          show-search
          :target-keys="targetRevokePermissionNames"
          :filter-option="filterOption"
          :list-style="{
            width: '300px',
            height: '300px',
          }"
          @change="handleRevokePermissionChange"
        >
          <template #render="item">
            <b :title="'内部权限名称：'+item.key">{{ item.title }}</b>
          </template>
        </a-transfer>
      </a-col>
    </a-row>
    <a-row v-else-if="setType=='group'" class="mt-3">
      <a-col>
        <span class="text-secondary display-block" style="line-height:16px">组权限将会授予到该组的所有用户上。您可以将权限添加到右边的方框以添加它。</span>
        <a-transfer
          class="mt-3"
          :data-source="permissionNames"
          show-search
          :target-keys="targetGroupPermissionNames"
          :filter-option="filterOption"
          :list-style="{
            height: '300px',
          }"
          @change="handleGroupPermissionChange"
        >
          <template #render="item">
            <b :title="'内部权限名称：'+item.key">{{ item.title }}</b>
          </template>
        </a-transfer>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import api from '@/api';
import common from '@/utils/common';
import { message } from 'ant-design-vue';
import { defineComponent } from 'vue'
import { TransferSource } from '../../models/TransferCommon';

export interface IManageUserPermission {
  setPermissionValue(grant: string, revoke?: string): void;
  getPermissionValue(): { grant: string; revoke: string };
}

export default defineComponent({
  props: {
    setType: {
      type: String,
      default: 'user'
    }
  },
  name: 'ManageUserPermission',
  data: () => {
    return {
      permissionNames: new Array<TransferSource>(),
      targetRevokePermissionNames: new Array<string>(),
      targetGrantPermissionNames: new Array<string>(),
      targetGroupPermissionNames: new Array<string>(),
    }
  },
  mounted() {
    this.loadPermissionNames();
  },
  methods: { 
    filterOption(inputValue: string, option: { explain: string }) {
      return option.explain.indexOf(inputValue) > -1;
    },
    setPermissionValue(grant: string, revoke?: string) {
      if(this.setType === 'user') {
        this.targetGrantPermissionNames = !common.isNullOrEmpty(grant) ? grant.split(';') : [];
        this.targetRevokePermissionNames = revoke && !common.isNullOrEmpty(revoke) ? revoke.split(';') : [];
      } 
      else if(this.setType === 'group')
        this.targetGroupPermissionNames = !common.isNullOrEmpty(grant) ? grant.split(';') : [];
    },
    getPermissionValue() {
      if(this.setType === 'user')
        return {
          grant: this.targetGrantPermissionNames.join(';'),
          revoke: this.targetRevokePermissionNames.join(';'),
        }
      else if(this.setType === 'group')
        return this.targetGroupPermissionNames.join(';');
    },
    loadPermissionNames() {
      api.permission.getList({ full: true })
        .then((data) => {
          if(data.data) {
            this.permissionNames = [];
            data.data.forEach((d) => this.permissionNames.push({
              key: d.name,
              title: d.explain
            }))
          }
        })
        .catch((e) => message.warn('获取组数据失败！' + e));
    },
    handleGroupPermissionChange(keys: string[]) { this.targetGroupPermissionNames = keys; },
    handleRevokePermissionChange(keys: string[]) { this.targetRevokePermissionNames = keys; },
    handleGrantPermissionChange(keys: string[]) { this.targetGrantPermissionNames = keys; },
  },
})
</script>

