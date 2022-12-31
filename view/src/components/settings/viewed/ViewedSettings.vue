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
    onAutoSyncViewedsChange(value: boolean) {
      if (
        !confirm(
          `リアルタイム既読更新を${
            value ? '有効' : '無効'
          }にしますか？\n「はい」をクリックすると、ページが再読み込みされます。`
        )
      ) {
        this.$nextTick(() => {
          this.isAutoSyncVieweds = !value
        })
        return
      }
      this.$accessor.settings.setAutoSyncVieweds(value)
      this.$nextTick(() => {
        location.reload()
      })
    },
    copyToClipboard(text: string) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.append(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
      this.$nuxt.$emit('snackbar', {
        message: `コピーしました。`,
        color: 'success',
      })
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
      this.viewed.illusts = this.$accessor.viewed.items.filter(
        (v) => v.type === 'illust'
      ).length
      this.viewed.novels = this.$accessor.viewed.items.filter(
        (v) => v.type === 'novel'
      ).length
    },
    importVieweds() {
      if (!window) {
        return
      }
      try {
        this.$accessor.viewed.setAllVieweds(JSON.parse(this.viewedsText))
        this.$nuxt.$emit('snackbar', {
          message: `既読情報をインポートしました。3秒後にリロードします。`,
          color: 'success',
        })
        setTimeout(() => {
          location.reload()
        }, 3000)
      } catch {
        this.$nuxt.$emit('snackbar', {
          message: `既読情報のインポートに失敗しました`,
          color: 'error',
        })
      }
    },
    importViewedsFile() {
      if (!window) {
        return
      }
      const input = document.createElement('input')
      input.type = 'file'
      input.addEventListener('change', () => {
        if (!input.files || !input.files[0]) {
          return
        }
        const file = input.files[0]
        const reader = new FileReader()
        reader.addEventListener('load', () => {
          this.viewedsText = reader.result as string
          this.importVieweds()
        })
        reader.readAsText(file)
      })
      input.click()
    },
  },
})
</script>
