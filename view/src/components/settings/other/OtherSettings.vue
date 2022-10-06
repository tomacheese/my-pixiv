<template>
  <AppCheckTimeout />
</template>

<script lang="ts">
import Vue from 'vue'
import AppCheckTimeout from '@/components/settings/other/AppCheckTimeout.vue'

export default Vue.extend({
  name: 'OtherSettings',
  components: {
    AppCheckTimeout,
  },
})
</script>
