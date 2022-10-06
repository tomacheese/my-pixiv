<template>
  <div>
    <ul>
      <li>イラスト既読数: {{ viewed.illusts }}件</li>
      <li>小説既読数: {{ viewed.novels }}件</li>
    </ul>

    <v-textarea
      v-model="viewedsText"
      :disabled="isAutoSyncVieweds"
    ></v-textarea>
    <v-btn color="success" @click="copyToClipboard(viewedsText)"
      >クリップボードにコピー</v-btn
    >
    <v-btn color="success" @click="downloadData(viewedsText, 'vieweds.json')"
      >ダウンロード</v-btn
    >
    <v-btn
      color="warning"
      :disabled="isAutoSyncVieweds"
      @click="importVieweds()"
      >インポート</v-btn
    >
    <v-btn
      color="warning"
      :disabled="isAutoSyncVieweds"
      @click="importViewedsFile()"
      >ファイルからインポート</v-btn
    >

    <v-switch
      v-model="isAutoSyncVieweds"
      label="WebSocketを使用したリアルタイム既読更新"
      @change="onAutoSyncViewedsChange"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'ViewedSettings',
  data() {
    return {
      dataText: '',
      viewedsText: '',
      viewed: {
        illusts: 0,
        novels: 0,
      },
      isAutoSyncVieweds: false,
    }
  },
  mounted() {
    this.exportVieweds()

    this.isAutoSyncVieweds = this.$accessor.settings.isAutoSyncVieweds

    setInterval(() => {
      if (
        !this.isAutoSyncVieweds ||
        !this.$accessor.settings.isAutoSyncVieweds
      ) {
        return
      }
      this.exportVieweds()
    }, 1000)
  },
  methods: {
    onAutoSyncViewedsChange(val: boolean) {
      if (
        !confirm(
          `リアルタイム既読更新を${
            val ? '有効' : '無効'
          }にしますか？\n「はい」をクリックすると、ページが再読み込みされます。`
        )
      ) {
        this.$nextTick(() => {
          this.isAutoSyncVieweds = !val
        })
        return
      }
      this.$accessor.settings.setAutoSyncVieweds(val)
      this.$nextTick(() => {
        location.reload()
      })
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
    downloadData(text: string, filename: string) {
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    exportVieweds() {
      if (
        this.viewedsText === JSON.stringify(this.$accessor.viewed.allVieweds)
      ) {
        return
      }
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
    importViewedsFile() {
      if (!window) {
        return
      }
      const input = document.createElement('input')
      input.type = 'file'
      input.onchange = () => {
        if (!input.files || !input.files[0]) {
          return
        }
        const file = input.files[0]
        const reader = new FileReader()
        reader.onload = () => {
          this.viewedsText = reader.result as string
          this.importVieweds()
        }
        reader.readAsText(file)
      }
      input.click()
    },
  },
})
</script>
