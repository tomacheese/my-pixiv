<template>
  <div>
    <AppCheckTimeout />
    <ImageServer />
    <AutoTweetLike />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import AppCheckTimeout from '@/components/settings/other/AppCheckTimeout.vue'
import ImageServer from '@/components/settings/other/ImageServer.vue'
import AutoTweetLike from '@/components/settings/other/AutoTweetLike.vue'

export default Vue.extend({
  name: 'OtherSettings',
  components: {
    AppCheckTimeout,
    ImageServer,
    AutoTweetLike,
  },
})
</script>
