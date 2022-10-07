<template>
  <div>
    <h2>Twitter / pixiv アプリがインストールされているかの確認タイムアウト</h2>
    <v-text-field
      v-model="appCheckTimeout"
      type="number"
      min="1"
      max="100000"
      @change="changeAppCheckTimeout"
    >
      <template #append>
        <span>ミリ秒</span>
      </template>
    </v-text-field>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'AppCheckTimeout',
  data(): {
    appCheckTimeout: number
  } {
    return {
      appCheckTimeout: 700,
    }
  },
  mounted() {
    if (!this.$accessor.settings.appCheckTimeout) {
      return
    }
    this.appCheckTimeout = this.$accessor.settings.appCheckTimeout
  },
  methods: {
    changeAppCheckTimeout(): void {
      if (!this.appCheckTimeout) {
        return
      }
      this.$accessor.settings.setAppCheckTimeout(this.appCheckTimeout)
    },
  },
})
</script>
