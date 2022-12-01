<template>
  <v-snackbar v-model="snackbar" :timeout="timeout" :color="color">
    <div :class="{ 'text-center': status === 1 }">{{ message }}</div>
    <template #action="{ attrs }">
      <v-btn v-if="status !== 1" text v-bind="attrs" @click="reconnect">
        再接続
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {
      snackbar: false,
      message: '',
      timeout: 3000,
      color: 'success',
      status: -1,
    }
  },
  mounted() {
    setInterval(() => {
      const state = this.$api.getReadyState()
      if (this.status === state) {
        return
      }
      this.status = state

      switch (state) {
        case WebSocket.CONNECTING:
          this.snackbar = true
          this.message =
            '接続しています…。(' + this.$api.lastCloseEvent?.code + ')'
          this.color = 'info'
          this.timeout = 0
          break
        case WebSocket.OPEN:
          this.snackbar = true
          this.message = '接続しました。'
          this.color = 'success'
          this.timeout = 3000
          break
        case WebSocket.CLOSING:
          this.snackbar = true
          this.message = '切断しています…。'
          this.color = 'warning'
          this.timeout = 0
          break
        case WebSocket.CLOSED:
          this.snackbar = true
          this.message =
            '切断しました。(' + this.$api.lastCloseEvent?.code + ')'
          this.color = 'error'
          this.timeout = 0
          break
      }
    }, 1000)
  },
  methods: {
    reconnect() {
      this.$api.reconnect()
    },
  },
})
</script>
