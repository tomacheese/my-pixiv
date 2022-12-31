<template>
  <v-container fluid fill-height>
    <v-row justify="center">
      <v-card>
        <v-card-title v-if="error.statusCode == 404">
          お探しのページは見つかりませんでした。
        </v-card-title>
        <v-card-title v-else-if="error.statusCode == 401">
          認証が必要です。
        </v-card-title>
        <v-card-title v-else> 何らかのエラーが発生しました。 </v-card-title>

        <v-card-text v-if="error.statusCode != 401">
          <pre
            style="background-color: rgba(255 255 255 10%)"
            v-text="error"
          ></pre>
        </v-card-text>
        <v-card-text v-else>
          <p v-if="!isPasswordEntered">設定タブから認証を行ってください。</p>
          <p v-else>認証に失敗しました。認証用パスワードが不正です。</p>
          <v-btn block @click="openSettings">認証画面を開く</v-btn>
        </v-card-text>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'EmptyLayout',
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: undefined,
    },
  },
  computed: {
    isPasswordEntered() {
      return this.$accessor.auth.password !== ''
    },
  },
  methods: {
    openSettings() {
      this.$router.push({
        name: 'settings',
        query: {
          category: 'auth',
        },
      })
    },
  },
}
</script>
