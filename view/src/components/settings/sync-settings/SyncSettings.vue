<template>
  <div>
    <p>
      他の端末と設定を同期する際は以下の手順で行います。<br />
      設定を同期した場合、同期<b>される</b>端末にある設定はすべてリセットされることに注意してください。
    </p>

    <ol>
      <li>同期<b>される</b>端末で、「同期待ち受け開始」ボタンを押下します。</li>
      <li>同期<b>する</b>端末で、「同期開始」ボタンを押下します。</li>
      <li>
        双方の端末で同期が行われたことを示すアラートが表示されれば成功です。
      </li>
    </ol>

    <div class="my-5">
      <v-btn color="error" :disabled="isDisabled" @click="toggleConnect()">{{
        isConnected ? '同期待ち受け停止' : '同期待ち受け開始'
      }}</v-btn>
      <v-btn
        color="error"
        :disabled="isConnected || isDisabled"
        @click="startSync()"
        >同期開始</v-btn
      >
    </div>

    <p>
      設定データはWebSocket経由でサーバに送信され、サーバから待ち受けしているすべての端末に送信されます。
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data(): {
    client: WebSocket | null
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
      this.client = new WebSocket(`${protocol}://${domain}api/settings-sync`)
      this.client.onopen = () => {
        this.isConnected = true
      }
      this.client.onclose = () => {
        this.isConnected = false
      }
      this.client.onerror = () => {
        this.isConnected = false
      }
      this.client.onmessage = (e) => {
        const data = JSON.parse(e.data.toString())
        if (data.action === undefined) {
          return // actionがない場合は無視
        }
        if (data.action !== 'sync') {
          return
        }
        this.$accessor.settings.setAllSettings(data.data)
        this.$nextTick(() => {
          this.$nuxt.$emit('snackbar', {
            message: `他の端末から設定データを受信しました。3秒後にリロードします。`,
            color: 'success',
          })
          setTimeout(() => {
            location.reload()
          }, 3000)
        })
      }
    },
    startSync() {
      const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
      const domain =
        this.$config.baseURL === '/'
          ? `${location.host}/`
          : this.$config.baseURL.replace(/https?:\/\//, '')
      this.isDisabled = true
      this.client = new WebSocket(`${protocol}://${domain}api/settings-sync`)
      this.client.onopen = () => {
        this.client?.send(
          JSON.stringify({
            action: 'sync',
            data: this.$accessor.settings.settings,
          })
        )
      }
      this.client.onclose = () => {
        this.isDisabled = false
      }
      this.client.onerror = () => {
        this.isDisabled = false
      }
      this.client.onmessage = (e) => {
        const data = JSON.parse(e.data.toString())
        if (data.action === undefined) {
          return // actionがない場合は無視
        }
        if (data.action !== 'synced') {
          return
        }
        this.$nuxt.$emit('snackbar', {
          message: `設定データを送信し、${data.data} 件の端末に同期しました。`,
          color: 'success',
        })
        this.client?.close(1000)
      }
    },
  },
})
</script>
