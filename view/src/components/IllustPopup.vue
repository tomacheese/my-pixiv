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
        :data="tweets"
        @close-popup="close()"
      ></TweetPopup>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { TweetPopupProp } from './TweetPopup.vue'
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
    tweets: TweetPopupProp | null
  } {
    return {
      page: 1,
      isTweetOpened: false,
      isTweetFound: null,
      tweets: null,
    }
  },
  watch: {
    item() {
      this.getTweets()
    },
  },
  mounted() {
    this.getTweets()
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
      console.log(item.meta_pages[this.page - 1].image_urls.large)
      return item.meta_pages[this.page - 1].image_urls.large
    },
    getTweetFoundColor(): string {
      if (this.isTweetFound === null) {
        return ''
      }
      return this.isTweetFound ? 'primary' : 'error'
    },
    getTweets() {
      if (this.item == null) {
        return
      }
      this.isTweetFound = null
      this.$axios
        .get<TweetPopupProp>(`/api/tweet/${this.item.id}`)
        .then((response) => {
          this.tweets = {
            screen_names: response.data.screen_names,
            tweets: response.data.tweets.sort((a, b) => {
              return a.similarity - b.similarity
            }),
            error: null,
          }
          this.isTweetFound = true
        })
        .catch((error) => {
          this.isTweetFound = false
          if (error.response.status === 404) {
            this.tweets = {
              screen_names: [],
              tweets: [],
              error:
                'ツイートが見つかりませんでした (' +
                error.response.data.detail +
                ')',
            }
          } else {
            this.tweets = {
              screen_names: [],
              tweets: [],
              error: String(error),
            }
          }
        })
    },
    close() {
      this.isTweetOpened = false
      this.isTweetFound = null
      this.$emit('close-popup')
    },
  },
})
</script>
