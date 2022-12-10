<template>
  <v-container>
    <h2>画像サイズ(画質)設定</h2>
    <v-row align="center">
      <v-col cols="6">
        <v-subheader> イラスト一覧画面（グリッドリスト以外） </v-subheader>
      </v-col>
      <v-col cols="6">
        <v-select v-model="imageSize.illustList" :items="imageSizes"></v-select>
      </v-col>
      <v-col cols="6">
        <v-subheader> イラスト一覧画面（グリッドリストのみ） </v-subheader>
      </v-col>
      <v-col cols="6">
        <v-select
          v-model="imageSize.illustGridList"
          :items="imageSizes"
        ></v-select>
      </v-col>
      <v-col cols="6">
        <v-subheader> イラストポップアップ画面 </v-subheader>
      </v-col>
      <v-col cols="6">
        <v-select
          v-model="imageSize.illustPopup"
          :items="imageSizes"
        ></v-select>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { ImageUrls } from '@/types/pixivIllust'
import { ImageSizes } from '@/store/settings'

export default Vue.extend({
  name: 'ImageSizeSetting',
  data(): {
    imageSize: ImageSizes
    imageSizes: { text: string; value: keyof ImageUrls }[]
  } {
    return {
      imageSize: {
        illustList: 'square_medium',
        illustGridList: 'medium',
        illustPopup: 'original',
      },
      imageSizes: [
        { text: '正方形 (360x360)', value: 'square_medium' },
        { text: '中 (長辺が最大 540px)', value: 'medium' },
        { text: '大 (横幅が最大 600px, 縦幅が最大 1200px)', value: 'large' },
        { text: 'オリジナル', value: 'original' },
      ],
    }
  },
  watch: {
    imageSize: {
      handler() {
        this.$accessor.settings.setImageSizes(this.imageSize)
      },
      deep: true,
    },
  },
  mounted() {
    this.imageSize = this.$accessor.settings.imageSizes
  },
})
</script>
