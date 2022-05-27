<template>
  <div class="home">
    <h1>正在跳转，请稍后</h1>
  </div>
</template>

<script lang="ts">
import router from "@/router";
import { defineComponent } from "vue";

export default defineComponent({
  mounted() {
    setTimeout(() => {
      router.push({ name: 'Home' })
    }, 200);
  }
})

</script>
