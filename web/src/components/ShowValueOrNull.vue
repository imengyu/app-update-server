<template>
  <span>
    <span v-if="value && value!=''">
      {{ value }}
    </span>
    <span v-else class="text-secondary"><i>{{ nullText }}</i></span>
  </span>
</template>

<script>
export default {
  name: "ShowValueOrNull",
  data() {
    return {
      result: ''
    }
  },
  props: {
    nullText: {
      default: '暂无',
      type: String
    },
    value: {
      default: null,
    }
  },
};
</script>