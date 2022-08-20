<template>
  <v-container>
    <h2>エクスポート</h2>
    <v-textarea v-model="exportText" readonly></v-textarea>
    <v-btn color="success" @click="copyToClipboard()"
      >クリップボードにコピー</v-btn
    >

    <h2>インポート</h2>
    <v-textarea v-model="importText"></v-textarea>
    <v-btn color="success" @click="importSettings()">インポート</v-btn>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'ImportExportSetting',
  data() {
    return {
      exportText: '',
      importText: '',
    }
  },
  mounted() {
    this.exportSettings()
  },
  methods: {
    exportSettings() {
      this.exportText = JSON.stringify(this.$accessor.settings.settings)
    },
    copyToClipboard() {
      const textarea = document.createElement('textarea')
      textarea.value = this.exportText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    },
    importSettings() {
      if (!window) {
        return
      }
      try {
        this.$accessor.settings.setAllSettings(JSON.parse(this.importText))
        alert('設定をインポートしました。リロードします。')
        window.location.reload()
      } catch (e) {
        alert('設定のインポートに失敗しました')
      }
    },
  },
})
</script>
