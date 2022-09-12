<template>
  <v-card v-if="item">
    <v-card-actions>
      <v-spacer></v-spacer>

      <v-btn icon @click="changeFullScreen()">
        <v-icon>mdi-{{ fullscreen ? 'fullscreen-exit' : 'fullscreen' }}</v-icon>
      </v-btn>

      <v-btn icon :color="liked ? 'green' : ''" @click="addHeart()">
        <v-icon>mdi-heart</v-icon>
      </v-btn>

      <v-btn icon :color="getTweetFoundColor()" @click="openTwitter()">
        <v-icon>mdi-twitter</v-icon>
      </v-btn>

      <v-btn icon @click="openApp(item)">
        <pixiv-icon />
      </v-btn>

      <v-btn icon @click="openPage(item)">
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>

      <v-btn icon @click="close()">
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
        <img
          :src="getImage(item)"
          style="overflow: scroll"
          @click="clickImage"
        />
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>

      <v-btn icon :color="liked ? 'green' : ''" @click="addHeart()">
        <v-icon>mdi-heart</v-icon>
      </v-btn>

      <v-btn icon :color="getTweetFoundColor()" @click="openTwitter()">
        <v-icon>mdi-twitter</v-icon>
      </v-btn>

      <v-btn icon @click="openApp(item)">
        <PixivIcon />
      </v-btn>

      <v-btn icon @click="openPage(item)">
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>

      <v-btn icon @click="close()">
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
    fullscreen: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data(): {
    liked: boolean
    page: number
    isTweetOpened: boolean
    isTweetFound: boolean | null
    tweets: TweetPopupProp | null
  } {
    return {
      liked: false,
      page: 1,
      isTweetOpened: false,
      isTweetFound: null,
      tweets: null,
    }
  },
  watch: {
    item() {
      if (!this.item) {
        return
      }
      this.liked = this.item.is_bookmarked
      this.page = 1

      this.getTweets()
    },
  },
  mounted() {
    if (!this.item) {
      return
    }
    this.liked = this.item.is_bookmarked
    this.page = 1

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
    openApp(item: PixivItem) {
      if (!window) {
        return
      }
      this.$emit('close-popup')
      location.href = `pixiv://illusts/${item.id}`
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
    addHeart() {
      if (this.item == null) {
        return
      }
      this.$axios
        .get<TweetPopupProp>(`/api/like/illust/${this.item.id}`)
        .then(() => {
          this.liked = true
        })
        .catch((error) => {
          alert('Likeに失敗: ' + error)
        })
    },
    clickImage(e: MouseEvent) {
      if (this.item == null) {
        return
      }
      if (this.item.meta_pages.length === 0) {
        // 画像数が1個（meta_pagesは0）ならクリックしても何もおきない
        return
      }
      const isRight =
        e.offsetX > (e.target as HTMLImageElement).naturalWidth / 2
      if (isRight && this.page < this.item.meta_pages.length) {
        this.page++
      } else if (!isRight && this.page > 1) {
        this.page--
      }
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
    changeFullScreen() {
      this.$emit('change-fullscreen')
    },
  },
})
</script>
