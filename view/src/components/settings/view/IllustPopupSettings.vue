<template>
  <v-container>
    <h2>イラストポップアップ</h2>

    <v-row align="center">
      <v-col cols="6">
        <v-subheader> 画像の最大高 </v-subheader>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="illustPopupMaxHeight"
          type="number"
          min="1"
          max="100"
        >
          <template #append> vh </template>
        </v-text-field>
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col cols="6">
        <v-subheader> ボタン位置 </v-subheader>
      </v-col>
      <v-col cols="6">
        <v-select
          v-model="actionsPosition"
          :items="actionsPositionItems"
        ></v-select>
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col cols="6">
        <v-subheader> ツイート取得タイミング </v-subheader>
      </v-col>
      <v-col cols="6">
        <v-select v-model="tweetTiming" :items="tweetTimingItems"></v-select>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { ActionPosition, GetTweetTiming } from '@/store/settings'

export default Vue.extend({
  name: 'IllustPopupMaxHeightSettings',
  data(): {
    illustPopupMaxHeight: number
    actionsPosition: ActionPosition
    actionsPositionItems: { text: string; value: ActionPosition }[]
    tweetTiming: GetTweetTiming
    tweetTimingItems: { text: string; value: GetTweetTiming }[]
  } {
    return {
      illustPopupMaxHeight: 100,
      actionsPosition: 'RIGHT',
      actionsPositionItems: [
        { text: '左側', value: 'LEFT' },
        { text: '右側', value: 'RIGHT' },
      ],
      tweetTiming: 'POPUP_OPEN',
      tweetTimingItems: [
        { text: 'ポップアップの表示時', value: 'POPUP_OPEN' },
        { text: '画像のロード後', value: 'IMAGE_LOADED' },
      ],
    }
  },
  watch: {
    actionsPosition() {
      this.$accessor.settings.setActionPosition(this.actionsPosition)
    },
    tweetTiming() {
      this.$accessor.settings.setGetTweetTiming(this.tweetTiming)
    },
    illustPopupMaxHeight() {
      this.$accessor.settings.setIllustPopupMaxHeight(this.illustPopupMaxHeight)
    },
  },
  mounted() {
    this.illustPopupMaxHeight = this.$accessor.settings.illustPopupMaxHeight
    this.actionsPosition = this.$accessor.settings.actionPosition
    this.tweetTiming = this.$accessor.settings.getTweetTiming
  },
})
</script>
