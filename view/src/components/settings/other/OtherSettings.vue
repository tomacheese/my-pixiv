<template>
  <div>
    <AppCheckTimeout />
    <AutoTweetLike />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import AppCheckTimeout from '@/components/settings/other/AppCheckTimeout.vue'
import AutoTweetLike from '@/components/settings/other/AutoTweetLike.vue'

export default Vue.extend({
  name: 'OtherSettings',
  components: {
    AppCheckTimeout,
    AutoTweetLike,
  },
})
</script>
