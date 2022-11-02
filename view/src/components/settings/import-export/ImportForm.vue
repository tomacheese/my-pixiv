<template>
  <div>
    <h2>設定のインポート</h2>

    <div class="my-3">
      <v-btn color="warning" @click="importFromFile()"
        >ファイルからインポート</v-btn
      >
      <v-btn color="warning" @click="importFromClipboard()"
        >クリップボードからインポート</v-btn
      >
    </div>

    <v-snackbar v-model="isImportSuccess" color="success">
      インポートに成功しました。3秒後にページをリロードします。
    </v-snackbar>
    <v-snackbar v-model="isImportFailed" color="error">
      インポートに失敗しました。
    </v-snackbar>

    <v-overlay :value="isLoading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'ImportForm',
  data() {
    return {
      isImportSuccess: false,
      isImportFailed: false,
      isLoading: false,
    }
  },
  methods: {
    importFromFile() {
      this.isLoading = true

      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = () => {
        const file = input.files?.item(0)
        if (file) {
          const reader = new FileReader()
          reader.onload = () => {
            const text = reader.result as string
            this.import(text)
          }
          reader.readAsText(file)
        }
      }
      document.body.onfocus = () => {
        document.body.onfocus = null
        setTimeout(() => {
          console.log(input.files?.length)
          if (input.files?.length !== 0) {
            return
          }
          this.isLoading = false
        }, 500)
      }
      input.click()
    },
    importFromClipboard() {
      this.isLoading = true

      if (!navigator.clipboard) {
        const textarea = document.createElement('textarea')
        document.body.appendChild(textarea)
        textarea.focus()
        document.execCommand('paste')
        const text = textarea.value
        document.body.removeChild(textarea)
        if (text.length === 0) {
          this.isImportFailed = true
          this.isLoading = false
          return
        }
        this.import(text)
        return
      }

      navigator.clipboard
        .readText()
        .then((text) => {
          this.import(text)
        })
        .catch(() => {
          this.isImportFailed = true
        })
    },
    import(text: string) {
      try {
        const data = JSON.parse(text)
        this.$accessor.settings.setAllSettings(data)

        this.isImportSuccess = true

        setTimeout(() => {
          location.reload()
        }, 3000)
      } catch (e) {
        this.isImportFailed = true
        this.isLoading = false
      }
    },
  },
})
</script>
