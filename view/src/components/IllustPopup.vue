<template>
  <v-card v-if="item">
    <v-card-actions>
      <v-spacer></v-spacer>

      <v-btn icon @click="addHeart()">
        <v-icon>mdi-heart</v-icon>
      </v-btn>

      <v-btn icon :color="getTweetFoundColor()" @click="openTwitter()">
        <v-icon>mdi-twitter</v-icon>
      </v-btn>

      <v-btn icon @click="openPage(item)">
        <v-icon>mdi-details</v-icon>
      </v-btn>

      <v-btn icon @click="isOpened = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-actions>
    <v-card-text>
      <v-pagination
        v-model="page"
        :length="item.meta_pages.length === 0 ? 1 : item.meta_pages.length"
        class="mt-3"
      ></v-pagination>
      <div class="text-center">
        <img :src="getImage(item)" style="overflow: scroll" />
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>

      <v-btn icon @click="addHeart()">
        <v-icon>mdi-heart</v-icon>
      </v-btn>

      <v-btn icon :color="getTweetFoundColor()" @click="openTwitter()">
        <v-icon>mdi-twitter</v-icon>
      </v-btn>

      <v-btn icon @click="openPage(item)">
        <v-icon>mdi-details</v-icon>
      </v-btn>

      <v-btn icon @click="isOpened = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-actions>

    <v-dialog v-model="isTweetOpened">
      <TweetPopup
        :item="item"
        @tweet-found="isTweetFound = true"
        @tweet-not-found="isTweetFound = false"
        @close-popup="close()"
      ></TweetPopup>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { PixivItem } from '@/types/pixivItem'
export default Vue.extend({
  props: {
    item: {
      type: Object as () => PixivItem,
      required: false,
      default: null,
    },
  },
  data(): {
    page: number
    isTweetOpened: boolean
    isTweetFound: boolean | null
  } {
    return {
      page: 1,
      isTweetOpened: true,
      isTweetFound: null,
    }
  },
  watch: {
    item() {
      this.isTweetOpened = false
      this.isTweetFound = null
    },
  },
  methods: {
    openPage(item: PixivItem) {
      if (!window) {
        return
      }
      this.$emit('close-popup')
      window.open(`https://www.pixiv.net/artworks/${item.id}`, '_blank')
    },
    openTwitter() {
      this.isTweetOpened = true
    },
    getImage(item: PixivItem): string {
      if (item.meta_pages.length === 0) {
        return item.image_urls.large
      }
      return item.meta_pages[this.page - 1].image_urls.large
    },
    getTweetFoundColor(): string {
      if (this.isTweetFound === null) {
        return ''
      }
      return this.isTweetFound ? 'primary' : 'error'
    },
  },
})
</script>
