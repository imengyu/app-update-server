<template>
  <a-date-picker :value="valueMoment" @update:value="onValueUpdate" placeholder="值" />
</template>

<script lang="js">
import { defineComponent } from 'vue'
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD';

export default defineComponent({
  data() {
    return {
      valueMoment: moment(new Date()),
    };
  },
  props: {
    value: {
      type: String,
    },
  },
  emits: [ 'update:value' ],
  methods: {
    onValueUpdate(v) {
      this.valueMoment = v;
      this.$emit('update:value', this.valueMoment.format(dateFormat));
    },
  },
  watch: {
    value() {
      this.valueMoment = moment(this.value, dateFormat);
    },
  },
  mounted() {
    if (this.value)
      this.valueMoment = moment(this.value, dateFormat);
  },
});
</script>