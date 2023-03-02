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
      <v-row
        v-if="isLoadingImage"
        class="fill-height ma-0"
        align="center"
        justify="center"
      >
        <v-progress-circular indeterminate class="my-10" color="grey lighten-5">
        </v-progress-circular>
      </v-row>
      <div class="text-center">
        <v-img
          ref="image"
          contain
          :max-height="illustPopupMaxHeight"
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
        :tweets="tweets"
        :screen-names="screenNames"
        :error="error"
        :shadow-bans="shadowBans"
        :is-loading-tweet="isLoadingTweet"
        :is-pixiv-liked="isLiked"
        @close-popup="close()"
      ></TweetPopup>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  PixivIllustItem,
  SearchTweetResponse,
  SearchTweetResult,
  ShadowBanResult,
} from 'my-pixiv-types'
import TweetPopup, {
  isCheckingShadowBan,
  isShadowBanned,
} from './TweetPopup.vue'
import IllustPopupActions, { TweetStatus } from './IllustPopupActions.vue'

export default Vue.extend({
  components: {
    IllustPopupActions,
    TweetPopup,
  },
  props: {
    item: {
      type: Object as () => PixivIllustItem | undefined,
      required: false,
      default: undefined,
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
    isLoadingTweet: boolean
    page: number
    isTweetOpened: boolean
    tweetStatus: TweetStatus
    screenNames: string[]
    tweets: SearchTweetResult[] | undefined
    error: string | undefined
    shadowBans: ShadowBanResult[]
  } {
    return {
      isLiked: false,
      isLoadingImage: true,
      isLoadingTweet: false,
      page: 1,
      isTweetOpened: false,
      tweetStatus: 'LOADING',
      screenNames: [],
      tweets: [],
      error: undefined,
      shadowBans: [],
    }
  },
  computed: {
    illustPopupMaxHeight(): string {
      return `${this.$accessor.settings.illustPopupMaxHeight}vh`
    },
  },
  watch: {
    item: {
      handler() {
        if (!this.item) {
          return
        }
        this.isLiked = this.item.is_bookmarked
        this.page = 1

        this.tweetStatus = 'LOADING'
        this.isLoadingImage = true
        setTimeout(() => {
          this.fetchTweets()
        }, 1000)

        // イラストポップアップアクセス中は #illust-popup をつける
        if (window.location.hash !== '#illust-popup') {
          // eslint-disable-next-line unicorn/no-null
          history.pushState(null, '', location.href)
          // eslint-disable-next-line unicorn/no-null
          history.replaceState(null, '', '#illust-popup')
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if (!this.item) {
      return
    }
    this.isLiked = this.item.is_bookmarked
    this.page = 1

    if (this.$accessor.settings.getTweetTiming === 'POPUP_OPEN') {
      this.fetchTweets()
    }

    // イラストポップアップアクセス中は #illust-popup をつける
    if (window.location.hash !== '#illust-popup') {
      // eslint-disable-next-line unicorn/no-null
      history.pushState(null, '', location.href)
      // eslint-disable-next-line unicorn/no-null
      history.replaceState(null, '', '#illust-popup')
    }

    window.addEventListener('popstate', () => {
      if (window.location.hash !== '#illust-popup') {
        this.close()
      }
    })
  },
  methods: {
    openTwitter() {
      this.isTweetOpened = true
    },
    getImage(item: PixivIllustItem): string {
      const size = this.$accessor.settings.imageSizes.illustPopup || 'large'
      if (item.meta_pages.length === 0) {
        return item.image_urls[size] || item.image_urls.large
      }
      return (
        item.meta_pages[this.page - 1].image_urls[size] ??
        item.meta_pages[this.page - 1].image_urls.large
      )
    },
    clickImage(event: MouseEvent) {
      const { naturalWidth } = this.$refs.image as HTMLImageElement
      if (!this.item) {
        return
      }
      if (this.item.meta_pages.length === 0) {
        // 画像数が1個（meta_pagesは0）ならクリックしても何もおきない
        return
      }
      const isRight = event.offsetX > naturalWidth / 2
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
      this.fetchTweets()
    },
    fetchTweets() {
      if (!this.item) {
        return
      }
      this.isLoadingTweet = true
      this.tweetStatus = 'LOADING'
      this.tweets = undefined
      if (this.$api.getReadyState() !== WebSocket.OPEN) {
        this.$api.reconnect()
      }
      this.screenNames = []
      this.tweets = []
      this.error = undefined
      this.$api.twitter.searchByIllust(
        this.item.id,
        this.searchCallback.bind(this),
        (error) => {
          this.tweetStatus = 'FAILED'
          this.screenNames = []
          this.tweets = []
          this.error = String(error)
          this.isLoadingTweet = false
        }
      )
    },
    searchCallback(response: SearchTweetResponse) {
      const data = response.data

      switch (data.responseType) {
        case 'screen_names': {
          this.screenNames = data.screen_names
          this.checkShadowBan()

          if (this.screenNames.length > 0) {
            this.tweetStatus = 'ACCOUNT_FOUND'
          }
          break
        }
        case 'tweet': {
          if (!this.tweets) {
            this.tweets = []
          }
          if (this.tweets.some((t) => t.tweet.id === data.tweet.tweet.id)) {
            // 重複ツイートは無視する
            return
          }
          this.tweets.push(data.tweet)

          if (this.tweets.some((t) => t.similarity >= 0.95)) {
            // 95%以上の類似度を持つツイートがあれば、合致ツイートとして扱う
            this.tweetStatus = 'EXACT_TWEET_FOUND'
            return
          }
          if (this.tweets.length > 0) {
            this.tweetStatus = 'TWEET_FOUND'
          }
          break
        }
        case 'error': {
          this.tweetStatus = 'FAILED'
          this.error = data.message
          this.isLoadingTweet = false
          break
        }
        case 'finish': {
          this.isLoadingTweet = false
          break
        }
        // No default
      }
    },
    checkShadowBan() {
      if (this.screenNames.length === 0) {
        return
      }
      for (const screenName of this.screenNames) {
        if (
          this.shadowBans.some(
            (result) => result.user.screen_name === screenName
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
            this.shadowBans.push(response.data.result)
          })
          .catch((error) => {
            console.error(error)
          })
      }
    },
    isShadowBanned(): boolean {
      if (this.screenNames.length === 0) {
        return false
      }
      return this.screenNames.some((screenName) => {
        return isShadowBanned(this.shadowBans, screenName)
      })
    },
    isCheckingShadowBanned(): boolean {
      if (this.screenNames.length === 0) {
        return false
      }
      return this.screenNames.some((screenName) => {
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
