<template>
  <SettingsJson />
</template>

<script lang="ts">
import Vue from 'vue'
import SettingsJson from '@/components/settings/debug/SettingsJson.vue'

export default Vue.extend({
  name: 'DebugInfo',
  components: {
    SettingsJson,
  },
})
</script>
