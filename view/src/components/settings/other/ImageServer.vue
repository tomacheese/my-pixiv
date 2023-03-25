<template>
  <div>
    <h2>画像サーバの URL</h2>
    <v-text-field
      v-model="imageServerUrl"
      placeholder="http://..."
      :loading="isLoading"
      :error="isError"
      @change="changeImageServerUrl"
    />
    <v-snackbar v-model="isSuccess" color="success">
      画像サーバの URL を変更しました
    </v-snackbar>
    <v-snackbar v-model="isReset" color="success">
      画像サーバの URL をリセットしました
    </v-snackbar>
    <v-snackbar v-model="isErrorSnackbar" color="error">
      画像サーバの URL を変更できませんでした。サーバ URL
      が正しいか確認してください。
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'

export default Vue.extend({
  name: 'ImageServer',
  data(): {
    imageServerUrl: string
    isLoading: boolean
    isSuccess: boolean
    isReset: boolean
    isError: boolean
    isErrorSnackbar: boolean
  } {
    return {
      imageServerUrl: '',
      isLoading: false,
      isSuccess: false,
      isReset: false,
      isError: false,
      isErrorSnackbar: false,
    }
  },
  mounted() {
    this.imageServerUrl = this.$accessor.settings.imageServerUrl
  },
  methods: {
    changeImageServerUrl(): void {
      this.isLoading = true
      this.isError = false
      this.isSuccess = false
      this.isReset = false
      this.isErrorSnackbar = false

      if (this.imageServerUrl === '') {
        this.$accessor.settings.setImageServerUrl('')
        this.isReset = true
        this.isLoading = false
        return
      }
      if (this.imageServerUrl.slice(-1) === '/') {
        this.imageServerUrl = this.imageServerUrl.slice(0, -1)
      }
      axios
        .get(`${this.imageServerUrl}/api/`)
        .then((response) => {
          this.isLoading = false
          if (response.data.message !== 'my-pixiv api') {
            this.isError = true
            this.isErrorSnackbar = true
            return
          }
          this.isSuccess = true
          this.$accessor.settings.setImageServerUrl(this.imageServerUrl)
        })
        .catch(() => {
          this.isError = true
          this.isErrorSnackbar = true
          this.isLoading = false
        })
    },
  },
})
</script>
