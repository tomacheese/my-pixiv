<template>
  <div>
    <h2>クライアントサイド</h2>
    <ul>
      <li>ユーザーエージェント: <code v-text="client.userAgent" /></li>
      <li>プラットフォーム: <code v-text="client.platform" /></li>
      <li>言語: <code v-text="client.language" /></li>
    </ul>

    <h2 class="mt-5">設定</h2>
    <v-textarea v-model="dataText" disabled></v-textarea>

    <h2 class="mt-5">既読情報</h2>
    <ul>
      <li>イラスト既読数: {{ viewed.illusts }}件</li>
      <li>小説既読数: {{ viewed.novels }}件</li>
    </ul>

    <v-textarea v-model="viewedsText" disabled></v-textarea>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'SettingsJson',
  data() {
    return {
      dataText: '',
      viewedsText: '',
      viewed: {
        illusts: 0,
        novels: 0,
      },
      client: {
        userAgent: '',
        platform: '',
        language: '',
      },
    }
  },
  mounted() {
    this.exportSettings()
    this.exportVieweds()

    this.client.userAgent = navigator.userAgent
    this.client.platform = navigator.platform
    this.client.language = navigator.language

    setInterval(() => {
      if (!this.$accessor.settings.isAutoSyncVieweds) {
        return
      }
      this.exportVieweds()
    }, 1000)
  },
  methods: {
    exportSettings() {
      this.dataText = JSON.stringify(this.$accessor.settings.settings)
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
  },
})
</script>
