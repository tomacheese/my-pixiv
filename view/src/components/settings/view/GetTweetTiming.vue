<template>
  <v-container>
    <h2>イラストポップアップ表示時のツイート取得タイミング</h2>
    <p></p>
    <v-select v-model="tweetTiming" :items="tweetTimingItems"></v-select>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { GetTweetTiming } from '@/store/settings'

export default Vue.extend({
  name: 'ActionsPositionSetting',
  data(): {
    tweetTiming: GetTweetTiming
    tweetTimingItems: { text: string; value: GetTweetTiming }[]
  } {
    return {
      tweetTiming: 'POPUP_OPEN',
      tweetTimingItems: [
        { text: 'ポップアップの表示時', value: 'POPUP_OPEN' },
        { text: '画像のロード後', value: 'IMAGE_LOADED' },
      ],
    }
  },
  watch: {
    tweetTiming() {
      this.$accessor.settings.setGetTweetTiming(this.tweetTiming)
    },
  },
  mounted() {
    this.tweetTiming = this.$accessor.settings.getTweetTiming
  },
})
</script>
