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
      設定データはWebSocket経由でサーバに送信され、サーバから待ち受けしているすべての端末に送信されます。<br />
      認証機能を利用する場合は、サーバサイドの
      <code>config.json</code> ファイルにて、<code>password</code>
      を設定する必要があります。
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data(): {
    client?: WebSocket
    isDisabled: boolean
    isConnected: boolean
  } {
    return {
      client: undefined,
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
      const password =
        this.$accessor.auth.password === ''
          ? undefined
          : this.$accessor.auth.password
      this.client = new WebSocket(
        `${protocol}://${domain}api/settings-sync`,
        password
      )
      this.client.addEventListener('open', () => {
        this.isConnected = true
      })
      this.client.addEventListener('close', (event) => {
        this.isConnected = false
        if (event.code === 1002) {
          this.$nuxt.$emit('snackbar', {
            message:
              '同期待ち受けに失敗しました。認証用パスワードが正しいか確認してください。',
            color: 'error',
          })
        }
      })
      this.client.addEventListener('error', () => {
        this.isConnected = false
      })
      this.client.addEventListener('message', (event) => {
        const data = JSON.parse(event.data.toString())
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
      })
    },
    startSync() {
      const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
      const domain =
        this.$config.baseURL === '/'
          ? `${location.host}/`
          : this.$config.baseURL.replace(/https?:\/\//, '')
      this.isDisabled = true
      const password =
        this.$accessor.auth.password === ''
          ? undefined
          : this.$accessor.auth.password
      this.client = new WebSocket(
        `${protocol}://${domain}api/settings-sync`,
        password
      )
      this.client.addEventListener('open', () => {
        this.client?.send(
          JSON.stringify({
            action: 'sync',
            data: this.$accessor.settings.settings,
          })
        )
      })
      this.client.addEventListener('close', (event) => {
        this.isDisabled = false
        if (event.code === 1002) {
          this.$nuxt.$emit('snackbar', {
            message:
              '同期に失敗しました。認証用パスワードが正しいか確認してください。',
            color: 'error',
          })
        }
      })
      this.client.addEventListener('error', () => {
        this.isDisabled = false
      })
      this.client.addEventListener('message', (event) => {
        const data = JSON.parse(event.data.toString())
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
      })
    },
  },
})
</script>
