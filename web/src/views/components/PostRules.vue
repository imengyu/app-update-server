<template>
  <div>
    <PostRuleGroup v-if="values.length > 0" :group="values[0]" @delete="values = []" />
    <a-button v-if="values.length == 0" type="primary" @click="newGroup">
      <template #icon><PlusOutlined /></template>
      添加条件
    </a-button>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import PostRuleGroup from './PostRuleGroup.vue'

export default defineComponent({
  data() {
    return {
      values: [],
    };
  },
  components: {
    PlusOutlined,
    PostRuleGroup,
  },
  props: {
    value: {
      type: String,
    },
  },
  methods: {
    loadValueJson() {
      this.values = this.value ? JSON.parse(this.value) : [];
    },
    newGroup() {
      this.values.push({
        type: 'group',
        children: [],
        enabled: true,
      });
    },
    getValue() {
      return JSON.stringify(this.values);
    },
  },
  watch: {
    value() { this.loadValueJson(); },
  },
  mounted() {
    this.loadValueJson();
  },
});
</script>