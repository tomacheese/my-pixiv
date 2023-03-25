<template>
  <div>
    <h2>画像サーバの URL</h2>
    <v-text-field
      v-model="imageServerUrl"
      placeholder="http://..."
      @change="changeImageServerUrl"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ImageServer',
  data(): {
    imageServerUrl: string
  } {
    return {
      imageServerUrl: '',
    }
  },
  mounted() {
    if (!this.$accessor.settings.imageServerUrl) {
      return
    }
    this.imageServerUrl = this.$accessor.settings.imageServerUrl
  },
  methods: {
    changeImageServerUrl(): void {
      if (!this.imageServerUrl) {
        return
      }
      this.$accessor.settings.setImageServerUrl(this.imageServerUrl)
    },
  },
})
</script>
