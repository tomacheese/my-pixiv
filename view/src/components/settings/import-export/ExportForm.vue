<template>
  <div>
    <h2>設定のエクスポート</h2>

    <div class="my-3">
      <v-btn color="success" @click="exportToFile()"
        >ファイルとしてエクスポート</v-btn
      >
      <v-btn color="success" @click="exportToClipboard()"
        >クリップボードにエクスポート</v-btn
      >
    </div>

    <v-snackbar v-model="isExportSuccess" color="success">
      エクスポートに成功しました。
    </v-snackbar>
    <v-snackbar v-model="isExportFailed" color="error">
      エクスポートに失敗しました。
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'ExportForm',
  data() {
    return {
      isExportSuccess: false,
      isExportFailed: false,
    }
  },
  methods: {
    exportToFile() {
      const data = this.$accessor.settings.settings
      const text = JSON.stringify(data)
      const blob = new Blob([text], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'settings.json'
      a.click()
      URL.revokeObjectURL(url)
      this.isExportSuccess = true
    },
    exportToClipboard() {
      const data = this.$accessor.settings.settings
      const text = JSON.stringify(data)
      if (!navigator.clipboard) {
        const textarea = document.createElement('textarea')
        textarea.value = text
        document.body.append(textarea)
        textarea.select()
        document.execCommand('copy')
        textarea.remove()
        this.isExportSuccess = true
        return
      }
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.isExportSuccess = true
        })
        .catch(() => {
          this.isExportFailed = true
        })
    },
  },
})
</script>
