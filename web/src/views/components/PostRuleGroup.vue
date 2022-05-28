<template>
  <div v-if="groupT" class="rule-group">
    <div v-for="(item, key) in group.children" :key="key" class="box">
      <PostRule v-if="item.type === 'rule'" :item="item" @delete="groupT.children.splice(key, 1)" />
      <PostRuleGroup v-else-if="item.type === 'group'" :group="item" @delete="groupT.children.splice(key, 1)" />

      <a-radio-group v-if="key != group.children.length - 1" class="rule-op" size="small" button-style="solid" v-model:value="item.op">
        <a-radio-button value="and">并且</a-radio-button>
        <a-radio-button value="or">或者</a-radio-button>
      </a-radio-group>
    </div>
    <div class="rule-bar">
      <a-checkbox size="small" v-model:checked="groupT.enabled" style="width: 70px">启用</a-checkbox>
      <a-popconfirm title="确认删除此组以及它的所有子条件？" ok-text="是" cancel-text="否" @confirm="$emit('delete')">
        <a-button size="small"><template #icon><CloseOutlined /></template></a-button>
      </a-popconfirm>
      <a-button class="ml-3" type="primary" size="small" @click="newRule">
        <template #icon><PlusOutlined /></template>
        添加条件
      </a-button>
      <a-button type="dashed" class="ml-3" size="small" @click="newGroup">
        <template #icon><PlusOutlined /></template>
        添加条件组
      </a-button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { PlusOutlined, CloseOutlined } from '@ant-design/icons-vue'
import PostRule from './PostRule.vue'

export default defineComponent({
  components: {
    PlusOutlined,
    PostRule,
    CloseOutlined,
  },
  name: 'PostRuleGroup',
  emits: [ 'delete' ],
  props: {
    group: {
      type: Object,
    },
  },
  methods: {
    newGroup() {
      const a = this.group.children;
      a.push({
        enabled: true,
        op: 'and',
        type: 'group',
        children: [],
      });
    },
    newRule() {
      const a = this.group.children;
      a.push({
        type: 'rule',
        op: 'and',
        enabled: true,
        param: '',
        operator: '',
        value: '',
      });
    },
  },
  watch: {
    item() { this.groupT = this.group; },
  },
  data() {
    return {
      groupT: null,
    };
  },
  mounted() {
    this.groupT = this.group;
  },
});
</script>

<style lang="scss">
.rule-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.rule-group {
  position: relative;
  padding: 10px;
  border: 1px dashed #616161;
  border-radius: 8px;

  .box {
    position: relative;
  }

  .rule-op {
    position: absolute;
    left: 50%;
    margin-left: -30px;
    bottom: - 10px;
    background-color: #fff;
    z-index: 10;
  }
}
</style>