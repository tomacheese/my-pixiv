<template>
  <div>
    <h2>WebSocket 認証用パスワード</h2>
    <p>
      認証機能を利用するには、サーバサイドの
      <code>config.json</code> ファイルにて、<code>password</code>
      を設定する必要があります。
    </p>
    <v-text-field
      v-model="password"
      :type="isShowPassword ? 'text' : 'password'"
      @click:append="isShowPassword = !isShowPassword"
    >
      <template #append>
        <v-icon class="mx-3" @click="isShowPassword = !isShowPassword">
          {{ isShowPassword ? 'mdi-eye' : 'mdi-eye-off' }}
        </v-icon>
        <v-btn depressed color="primary" @click="savePassword"> 保存 </v-btn>
      </template>
    </v-text-field>
    <v-snackbar v-model="isSnackbar" :timeout="3000" color="success">
      認証用パスワードを保存しました。ページを再読み込みします。
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'AuthSettings',
  data(): {
    password: string
    isShowPassword: boolean
    isSnackbar: boolean
  } {
    return {
      password: '',
      isShowPassword: false,
      isSnackbar: false,
    }
  },
  mounted() {
    this.password = this.$accessor.auth.password
  },
  methods: {
    savePassword() {
      this.$accessor.auth.setPassword(this.password)
      this.isSnackbar = true
      setTimeout(() => {
        location.reload()
      }, 3000)
    },
  },
})
</script>
