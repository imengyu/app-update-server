<template>
  <a-spin :spinning="loadStatus=='loading'">
    <div v-if="loadStatus=='loading'||loadStatus=='success'">
      <a-transfer
        class="mt-3"
        :data-source="dataUsers"
        show-search
        :target-keys="targetUserIds"
        :filter-option="filterOption"
        :list-style="{
          width: '200px',
          height: '300px',
        }"
        @change="handleUserChange"
      >
        <template #render="item">
          <b>{{ item.title }}</b>
        </template>
      </a-transfer>
    </div>
    <a-result v-if="loadStatus=='failed'" status="warning" title="获取用户数据失败">
      <template #extra>
        <a-button type="primary" @click="loadData">重试</a-button>
      </template>
    </a-result>
  </a-spin>
</template>

<script lang="ts">
import api, { LoadStatus } from '@/api';
import common from '@/utils/common';
import { defineComponent } from 'vue'
import { TransferSource } from '../../models/TransferCommon';

export default defineComponent({
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  name: 'UserTransfer',
  data: () => {
    return {
      loadStatus: 'notload' as LoadStatus,
      dataUsers: new Array<TransferSource>(),
      targetUserIds: new Array<string>(),
    }
  },
  watch: {
    value(newV: string) {
       this.targetUserIds = !common.isNullOrEmpty(newV) ? newV.split(';') : [];
    }
  },
  mounted() {
    this.loadData();
  },
  methods: { 
    filterOption(inputValue: string, option: { name: string }) {
      return option.name.indexOf(inputValue) > -1;
    },
    handleUserChange(keys: string[]) { 
      this.targetUserIds = keys; 
      this.$emit('update', keys.join(';'));
    },
    loadData() {
      this.loadStatus = 'loading';
      api.user.getList()
        .then((data) => {
          if(data.data) {
            this.loadStatus = 'success';
            this.dataUsers = [];
            data.data.forEach((d) => this.dataUsers.push({
              key: '' + d.id,
              title: d.name
            }))
          }
        })
        .catch(() => this.loadStatus = 'failed');
    }
  }
})
</script>

