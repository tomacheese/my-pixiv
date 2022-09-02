<template>
  <v-container>
    <h2>設定の同期</h2>
    <v-btn
      color="error"
      :disabled="isDisabled"
      @click="toggleConnect()"
      v-text="isConnected ? '同期待ち受け停止' : '同期待ち受け開始'"
    ></v-btn>
    <v-btn
      color="error"
      :disabled="isConnected || isDisabled"
      @click="startSync()"
      >同期開始</v-btn
    >
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { Websocket, WebsocketBuilder } from 'websocket-ts'
export default Vue.extend({
  data(): {
    client: Websocket | null
    isDisabled: boolean
    isConnected: boolean
  } {
    return {
      client: null,
      isDisabled: false,
      isConnected: false,
    }
  },
  methods: {
    toggleConnect() {
      if (this.isConnected) {
        this.client?.close(1000)
        return
      }
      this.startConnect()
    },
    startConnect() {
      const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
      const domain =
        this.$config.baseURL === '/'
          ? `${location.host}/`
          : this.$config.baseURL.replace(/https?:\/\//, '')
      this.client = new WebsocketBuilder(
        `${protocol}://${domain}api/settings-sync`
      )
        .onOpen(() => {
          this.isConnected = true
        })
        .onClose(() => {
          this.isConnected = false
        })
        .onMessage((_: Websocket, message: MessageEvent<string>) => {
          const data = JSON.parse(message.data)
          if (data.action === undefined) {
            return // actionがない場合は無視
          }
          if (data.action !== 'sync') {
            return
          }
          this.$accessor.settings.setAllSettings(data.data)
          this.$nextTick(() => {
            alert('他の端末から設定データを受信しました。リロードします。')
            location.reload()
          })
        })
        .build()
    },
    startSync() {
      const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
      const domain =
        this.$config.baseURL === '/'
          ? `${location.host}/`
          : this.$config.baseURL.replace(/https?:\/\//, '')
      this.isDisabled = true
      this.client = new WebsocketBuilder(
        `${protocol}://${domain}api/settings-sync`
      )
        .onOpen(() => {
          this.client?.send(
            JSON.stringify({
              action: 'sync',
              data: this.$accessor.settings.settings,
            })
          )
        })
        .onMessage((_: Websocket, message: MessageEvent<string>) => {
          const data = JSON.parse(message.data)
          if (data.action === undefined) {
            return // actionがない場合は無視
          }
          if (data.action !== 'synced') {
            return
          }
          alert(`設定データを送信し、${data.data} 件の端末に同期しました。`)
          this.client?.close(1000)
        })
        .onClose(() => {
          this.isDisabled = false
        })
        .build()
    },
  },
})
</script>
