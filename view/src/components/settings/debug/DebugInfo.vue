<template>
  <div>
    <WebSocketInfo />
    <v-divider class="my-3" />
    <SettingsJson />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import WebSocketInfo from './WebSocketInfo.vue'
import SettingsJson from '@/components/settings/debug/SettingsJson.vue'

export default Vue.extend({
  name: 'DebugInfo',
  components: {
    SettingsJson,
    WebSocketInfo,
  },
})
</script>
