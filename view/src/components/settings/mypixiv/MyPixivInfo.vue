<template>
  <ul>
    <li>
      my-pixiv: <code v-text="appVersion" /> (<code v-text="environment" />)
    </li>
    <li>OS: <code v-text="server.os" /></li>
    <li>Node.js: <code v-text="server.node" /></li>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'MyPixivInfo',
  data() {
    return {
      appVersion: '',
      environment: '',
      server: {
        os: '',
        node: '',
      },
    }
  },
  mounted() {
    this.appVersion = this.$config.appVersion
    this.environment = this.$config.environment

    this.server.os = this.$config.os
    this.server.node = this.$config.nodeVersion
  },
})
</script>
