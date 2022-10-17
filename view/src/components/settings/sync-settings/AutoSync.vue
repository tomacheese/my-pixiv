<template>
  <div>
    <h2>自動同期</h2>
    <v-switch
      v-model="isGlobalSync"
      :label="
        isGlobalSync
          ? 'すべての設定をサーバに保存し、他の端末と自動同期します。'
          : '設定をローカルストレージに保存し、他の端末と自動同期しません。'
      "
    ></v-switch>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data(): {
    isGlobalSync: boolean
  } {
    return {
      isGlobalSync: false,
    }
  },
  watch: {
    isGlobalSync() {
      this.$accessor.settings.setGlobalSync(this.isGlobalSync)
    },
  },
  mounted() {
    this.isGlobalSync = this.$accessor.settings.isGlobalSync
  },
})
</script>
