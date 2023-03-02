<template>
  <div>
    <h2>自動で完全一致するツイートをいいねするか</h2>
    <p>
      この機能を有効にするとハートボタンでいいねした上で、ツイート結果一覧ポップアップを開いた際、結果で
      100% 合致するツイートを自動的にサブ垢でいいねします。
    </p>
    <v-switch
      v-model="isAutoTweetLike"
      :label="label"
      @change="changeAutoTweetLike"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'AutoTweetLike',
  data(): {
    isAutoTweetLike: boolean
  } {
    return {
      isAutoTweetLike: false,
    }
  },
  computed: {
    label(): string {
      return this.isAutoTweetLike ? '有効' : '無効'
    },
  },
  mounted() {
    this.isAutoTweetLike = this.$accessor.settings.isAutoTweetLike
  },
  methods: {
    changeAutoTweetLike(): void {
      this.$accessor.settings.setAutoTweetLike(this.isAutoTweetLike)
    },
  },
})
</script>
