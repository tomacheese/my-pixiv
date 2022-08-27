<template>
  <v-container>
    <h2>設定のインポート・エクスポート</h2>
    <v-textarea v-model="dataText"></v-textarea>
    <v-btn color="success" @click="copyToClipboard(dataText)"
      >クリップボードにコピー</v-btn
    >
    <v-btn color="success" @click="importSettings()">インポート</v-btn>

    <h2 class="mt-5">既読情報</h2>
    <ul>
      <li>イラスト既読数: {{ viewed.illusts }}件</li>
      <li>小説既読数: {{ viewed.novels }}件</li>
    </ul>

    <v-textarea v-model="viewedsText"></v-textarea>
    <v-btn color="success" @click="copyToClipboard(viewedsText)"
      >クリップボードにコピー</v-btn
    >
    <v-btn color="success" @click="importVieweds()">インポート</v-btn>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'ImportExportSetting',
  data() {
    return {
      dataText: '',
      viewedsText: '',
      viewed: {
        illusts: 0,
        novels: 0,
      },
    }
  },
  mounted() {
    this.exportSettings()
    this.exportVieweds()
  },
  methods: {
    exportSettings() {
      this.dataText = JSON.stringify(this.$accessor.settings.settings)
    },
    copyToClipboard(text: string) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
      alert('コピーしました。')
    },
    importSettings() {
      if (!window) {
        return
      }
      try {
        this.$accessor.settings.setAllSettings(JSON.parse(this.dataText))
        alert('設定をインポートしました。リロードします。')
        window.location.reload()
      } catch (e) {
        alert('設定のインポートに失敗しました')
      }
    },
    exportVieweds() {
      this.viewedsText = JSON.stringify(this.$accessor.viewed.allVieweds)
      this.viewed.illusts = this.$accessor.viewed.illusts.length
      this.viewed.novels = this.$accessor.viewed.novels.length
    },
    importVieweds() {
      if (!window) {
        return
      }
      try {
        this.$accessor.viewed.setAllVieweds(JSON.parse(this.viewedsText))
        alert('既読情報をインポートしました。リロードします。')
        window.location.reload()
      } catch (e) {
        alert('既読情報のインポートに失敗しました')
      }
    },
  },
})
</script>
