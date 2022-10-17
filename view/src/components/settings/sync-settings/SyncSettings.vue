<template>
  <div>
    <AutoSync />
    <ManualSync />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import AutoSync from './AutoSync.vue'
import ManualSync from './ManualSync.vue'

export default Vue.extend({
  components: {
    AutoSync,
    ManualSync,
  },
})
</script>
