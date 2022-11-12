<template>
  <v-card v-if="item">
    <IllustPopupActions
      :item="item"
      :fullscreen="fullscreen"
      :tweet-status="tweetStatus"
      :is-liked="isLiked"
      :is-shadow-banned="isShadowBanned()"
      :is-checking-shadow-banned="isCheckingShadowBanned()"
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
      >
      </v-pagination>
      <v-progress-linear
        v-if="isLoadingImage"
        indeterminate
        class="my-5"
      ></v-progress-linear>
      <div class="text-center">
        <v-img
          ref="image"
          contain
          max-height="100vh"
          :src="getImage(item)"
          @click="clickImage"
          @load="loadedImage()"
        >
        </v-img>
      </div>
    </v-card-text>

    <IllustPopupActions
      :item="item"
      :fullscreen="fullscreen"
      :tweet-status="tweetStatus"
      :is-liked="isLiked"
      :is-shadow-banned="isShadowBanned()"
      :is-checking-shadow-banned="isCheckingShadowBanned()"
      @change-fullscreen="changeFullScreen"
      @like="onLike"
      @open-twitter="openTwitter"
      @close-popup="close"
    />

    <v-dialog v-model="isTweetOpened">
      <TweetPopup
        :item="item"
        :data="tweets"
        :shadow-bans="shadowBans"
        @close-popup="close()"
      ></TweetPopup>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import TweetPopup, {
  isCheckingShadowBan,
  isShadowBanned,
  TweetPopupProp,
} from './TweetPopup.vue'
import IllustPopupActions, { TweetStatus } from './IllustPopupActions.vue'
import { ShadowBanResult } from '@/plugins/websocket/twitter'
import { WebSocketAPIError } from '@/plugins/websocket'
import { PixivIllustItem } from '@/types/pixivIllust'

export default Vue.extend({
  components: {
    IllustPopupActions,
    TweetPopup,
  },
  props: {
    item: {
      type: Object as () => PixivIllustItem,
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
    isLoadingImage: boolean
    page: number
    isTweetOpened: boolean
    tweetStatus: TweetStatus
    tweets: TweetPopupProp | null
    shadowBans: ShadowBanResult[]
  } {
    return {
      isLiked: false,
      isLoadingImage: true,
      page: 1,
      isTweetOpened: false,
      tweetStatus: 'LOADING',
      tweets: null,
      shadowBans: [],
    }
  },
  watch: {
    item() {
      if (!this.item) {
        return
      }
      this.isLiked = this.item.is_bookmarked
      this.page = 1

      this.tweetStatus = 'LOADING'
      this.isLoadingImage = true
      setTimeout(() => {
        this.getTweets()
      }, 1000)
    },
  },
  mounted() {
    if (!this.item) {
      return
    }
    this.isLiked = this.item.is_bookmarked
    this.page = 1

    if (this.$accessor.settings.getTweetTiming === 'POPUP_OPEN') {
      this.getTweets()
    }
  },
  methods: {
    openTwitter() {
      this.isTweetOpened = true
    },
    getImage(item: PixivIllustItem): string {
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
    loadedImage() {
      this.isLoadingImage = false
      if (this.$accessor.settings.getTweetTiming !== 'IMAGE_LOADED') {
        return
      }
      this.getTweets()
    },
    getTweets() {
      if (this.item == null) {
        return
      }
      this.tweetStatus = 'LOADING'
      this.tweets = null
      if (this.$api.getReadyState() !== WebSocket.OPEN) {
        this.$api.reconnect()
      }
      this.$api.twitter
        .searchByIllust(this.item.id)
        .then((response) => {
          this.tweets = {
            screen_names: response.screen_names,
            tweets: response.tweets.sort((a, b) => {
              const similarity = a.similarity - b.similarity
              if (similarity !== 0) {
                return similarity
              }
              return Number(a.tweet.id) - Number(b.tweet.id)
            }),
            error: null,
          }
          this.checkShadowBan()
          if (this.tweets.tweets.some((t) => t.similarity <= 5)) {
            this.tweetStatus = 'EXACT_TWEET_FOUND'
            return
          }
          if (this.tweets.tweets.length > 0) {
            this.tweetStatus = 'TWEET_FOUND'
            return
          }
          if (this.tweets.screen_names.length > 0) {
            this.tweetStatus = 'ACCOUNT_FOUND'
            return
          }
          this.tweetStatus = 'FAILED'
        })
        .catch((error) => {
          this.tweetStatus = 'FAILED'
          if (error instanceof WebSocketAPIError && error.data.code === 404) {
            this.tweets = {
              screen_names: [],
              tweets: [],
              error:
                'ツイートが見つかりませんでした (' + error.data.message + ')',
            }
          } else {
            this.tweetStatus = 'FAILED'
            this.tweets = {
              screen_names: [],
              tweets: [],
              error: String(error),
            }
          }
        })
    },
    checkShadowBan() {
      if (this.tweets == null || this.tweets.screen_names.length === 0) {
        return
      }
      for (const screenName of this.tweets.screen_names) {
        if (
          this.shadowBans.some(
            (result) => result.profile.screen_name === screenName
          )
        ) {
          continue
        }
        if (this.$api.getReadyState() !== WebSocket.OPEN) {
          this.$api.reconnect()
        }
        this.$api.twitter
          .checkShadowBan(screenName)
          .then((response) => {
            this.shadowBans.push(response.result)
          })
          .catch((error) => {
            console.error(error)
          })
      }
    },
    isShadowBanned(): boolean {
      if (this.tweets == null) {
        return false
      }
      return this.tweets.screen_names.some((screenName) => {
        return isShadowBanned(this.shadowBans, screenName)
      })
    },
    isCheckingShadowBanned(): boolean {
      if (this.tweets == null) {
        return false
      }
      return this.tweets.screen_names.some((screenName) => {
        return isCheckingShadowBan(this.shadowBans, screenName)
      })
    },
    close() {
      this.isTweetOpened = false
      this.tweetStatus = 'FAILED'
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
