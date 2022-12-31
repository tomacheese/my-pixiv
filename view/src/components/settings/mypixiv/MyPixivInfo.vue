<template>
  <div>
    <h2>my-pixiv</h2>

    <v-alert v-if="!isWorkboxEnabled" type="warning" text prominent
      >Workboxが有効になっていません。</v-alert
    >
    <v-alert v-if="isUpdateAvailable" type="warning" text prominent>
      <div class="d-flex justify-space-between align-center">
        <div>新しいバージョンが利用可能です。</div>
        <div><v-btn color="primary" @click="reload">再読み込み</v-btn></div>
      </div>
    </v-alert>

    <ul>
      <li>
        Version: <code v-text="appVersion" /> (<code v-text="environment" />)
      </li>
      <li>Latest Version: <code v-text="appLatestVersion" /></li>
    </ul>

    <h2>サーバ情報</h2>
    <li>OS: <code v-text="server.os" /></li>
    <li>Node.js: <code v-text="server.node" /></li>

    <h2>ライセンス</h2>
    <Licenses />
  </div>
</template>

<script lang="ts">
import axios from 'axios'
import Vue from 'vue'
import Licenses from './MyPixivLicenses.vue'

export default Vue.extend({
  name: 'MyPixivInfo',
  components: {
    Licenses,
  },
  data() {
    return {
      appVersion: '',
      appLatestVersion: '',
      environment: '',
      server: {
        os: '',
        node: '',
      },
    }
  },
  computed: {
    isWorkboxEnabled() {
      console.log(this.$workboxStatus)
      return this.$workboxStatus !== undefined
    },
    isUpdateAvailable() {
      if (!this.$workboxStatus) {
        return false
      }
      return this.$workboxStatus.isUpdate
    },
  },
  mounted() {
    this.appVersion = this.$config.appVersion
    this.environment = this.$config.environment

    this.server.os = this.$config.os
    this.server.node = this.$config.nodeVersion

    this.fetchAppLatestVersion()
  },
  methods: {
    fetchAppLatestVersion() {
      axios
        .get('https://api.github.com/repos/tomacheese/my-pixiv/releases/latest')
        .then((response) => {
          this.appLatestVersion = response.data.tag_name
        })
    },
    reload() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(() => {
          navigator.serviceWorker
            .getRegistrations()
            .then(function (registrations) {
              for (const registration of registrations) {
                if (registration && registration.waiting) {
                  registration.waiting.postMessage({ type: 'SKIP_WAITING' })
                }
              }

              window.location.reload()
            })
        })
      } else {
        alert('ServiceWorker is not available.')
      }
    },
  },
})
</script>

<style>
h2 {
  margin-top: 1rem;
}
</style>
