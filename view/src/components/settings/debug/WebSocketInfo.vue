<template>
  <div>
    <h2>WebSocket</h2>
    <ul>
      <li>ステータス: <code v-text="readyState" /></li>
      <li>接続先URL: <code v-text="url" /></li>
    </ul>
    <v-btn class="ma-3" block color="primary" @click="reconnect">再接続</v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'WebSocketInfo',
  data() {
    return {
      readyState: '',
      url: '',
    }
  },
  mounted() {
    setInterval(() => {
      this.loadStatus()
    }, 1000)
    this.loadStatus()
  },
  methods: {
    loadStatus() {
      switch (this.$api.getReadyState()) {
        case WebSocket.OPEN: {
          this.readyState = 'OPEN'
          break
        }
        case WebSocket.CONNECTING: {
          this.readyState = 'CONNECTING'
          break
        }
        case WebSocket.CLOSING: {
          this.readyState = 'CLOSING'
          break
        }
        case WebSocket.CLOSED: {
          this.readyState = 'CLOSED'
          break
        }
      }

      this.url = this.$api.getWS().url
    },
    reconnect() {
      this.$api.reconnect()
    },
  },
})
</script>
