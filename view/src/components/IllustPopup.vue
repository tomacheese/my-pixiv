<template>
  <v-card v-if="item" :loading="loading">
    <IllustPopupActions
      :item="item"
      :fullscreen="fullscreen"
      :is-tweet-found="isTweetFound"
      :is-liked="isLiked"
      @change-fullscreen="changeFullScreen"
      @like="onLike"
      @open-twitter="openTwitter"
      @close-popup="close"
    />

    <v-card-text>
      <v-pagination
        v-model="page"
        :length="item.meta_pages.length === 0 ? 1 : item.meta_pages.length"
        class="mt-3"
      ></v-pagination>
      <div class="text-center">
        <v-img
          ref="image"
          contain
          max-height="100vh"
          :src="getImage(item)"
          @click="clickImage"
        />
      </div>
    </v-card-text>

    <IllustPopupActions
      :item="item"
      :fullscreen="fullscreen"
      :is-tweet-found="isTweetFound"
      :is-liked="isLiked"
      @change-fullscreen="changeFullScreen"
      @like="onLike"
      @open-twitter="openTwitter"
      @close-popup="close"
    />

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
import TweetPopup, { TweetPopupProp } from './TweetPopup.vue'
import IllustPopupActions from './IllustPopupActions.vue'
import { PixivItem } from '@/types/pixivItem'

export default Vue.extend({
  components: {
    IllustPopupActions,
    TweetPopup,
  },
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
    isLiked: boolean
    page: number
    isTweetOpened: boolean
    isTweetFound: boolean | null
    tweets: TweetPopupProp | null
    loading: boolean
  } {
    return {
      isLiked: false,
      page: 1,
      isTweetOpened: false,
      isTweetFound: null,
      tweets: null,
      loading: false,
    }
  },
  watch: {
    item() {
      if (!this.item) {
        return
      }
      this.isLiked = this.item.is_bookmarked
      this.page = 1

      this.getTweets()
    },
  },
  mounted() {
    if (!this.item) {
      return
    }
    this.isLiked = this.item.is_bookmarked
    this.page = 1

    this.getTweets()
  },
  methods: {
    openTwitter() {
      this.isTweetOpened = true
    },
    getImage(item: PixivItem): string {
      if (item.meta_pages.length === 0) {
        return item.image_urls.large
      }
      return item.meta_pages[this.page - 1].image_urls.large
    },
    clickImage(e: MouseEvent) {
      const { naturalWidth } = this.$refs.image as HTMLImageElement
      if (this.item == null) {
        return
      }
      if (this.item.meta_pages.length === 0) {
        // 画像数が1個（meta_pagesは0）ならクリックしても何もおきない
        return
      }
      const isRight = e.offsetX > naturalWidth / 2
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
    onLike(value: boolean) {
      this.isLiked = value
    },
  },
})
</script>
