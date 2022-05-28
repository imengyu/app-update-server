<template>
  <a-checkbox-group :value="values" @update:value="onValuesUpdate" :options="options" />
</template>

<script lang="js">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      values: [],
    };
  },
  props: {
    value: {
      type: String,
    },
    list: {
      type: Object,
    },
  },
  emits: [ 'update:value' ],
  computed: {
    options() {
      const arr = [{
        label: '主渠道（无渠道参数时使用）',
        value: 'main',
      }];
      arr.push(...this.list);
      return arr;
    },
  },
  methods: {
    onValuesUpdate(v) {
      this.values = v;
      this.$emit('update:value', JSON.stringify(this.values));
    },
  },
  watch: {
    value() {
    this.values = this.value ? JSON.parse(this.value) : [];
    },
  },
  mounted() {
    this.values = this.value ? JSON.parse(this.value) : [];
  },
});
</script>