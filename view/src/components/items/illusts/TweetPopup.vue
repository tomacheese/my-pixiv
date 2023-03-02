<template>
  <div>
    <v-progress-linear v-if="isLoadingTweet" indeterminate></v-progress-linear>
    <v-card :loading="loading">
      <v-card-title v-if="error" class="text-h5">{{ error }}</v-card-title>
      <v-card-title>
        <v-chip
          v-for="screenName of screenNames"
          :key="screenName"
          class="ma-1"
          :color="getAccountColor(screenName)"
          @click="openTwitter(screenName)"
          ><v-progress-circular
            v-if="isCheckingShadowBan(screenName)"
            :size="20"
            indeterminate
            class="mr-2"
          ></v-progress-circular
          >@{{ screenName }}</v-chip
        >
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col
            v-if="tweets && tweets.length === 0 && !isLoadingTweet"
            cols="12"
          >
            <v-card>
              <v-card-text class="text-h5 text-center my-5"
                >No tweets found</v-card-text
              >
            </v-card>
          </v-col>
          <v-col v-for="(tweet, i) in sortedTweets()" :key="i" cols="12">
            <v-card @click="open(tweet)">
              <div class="d-flex flex-no-wrap justify-space-between">
                <div>
                  <v-card-subtitle class="text-h5">{{
                    getUserText(tweet.tweet.user)
                  }}</v-card-subtitle>

                  <v-card-subtitle>
                    <v-chip>{{ tweet.identity }}</v-chip>
                    <v-chip class="ma-1" :color="getSimilarityColor(tweet)">{{
                      getReadableSimilarity(tweet)
                    }}</v-chip>
                  </v-card-subtitle>

                  <v-card-text style="height: 1.5em; overflow: hidden">{{
                    tweet.tweet.text
                  }}</v-card-text>
                </div>

                <v-avatar class="ma-3" size="125" tile>
                  <v-img :src="tweet.tweet.media_url">
                    <template #placeholder>
                      <v-row
                        class="fill-height ma-0"
                        align="center"
                        justify="center"
                      >
                        <v-progress-circular
                          indeterminate
                          color="grey lighten-5"
                        ></v-progress-circular>
                      </v-row>
                    </template>
                  </v-img>
                </v-avatar>
              </div>

              <v-card-actions>
                <v-spacer />
                <v-btn
                  icon
                  elevation="5"
                  :color="getHeartColor(tweet, 'main')"
                  :loading="likeLoading"
                  @click.stop="toggleLike(tweet, 'main')"
                >
                  <v-icon>mdi-cards-heart</v-icon>
                </v-btn>
                <v-btn
                  icon
                  elevation="5"
                  :color="getHeartColor(tweet, 'sub')"
                  :loading="likeLoading"
                  @click.stop="toggleLike(tweet, 'sub')"
                >
                  <v-icon>mdi-tag-heart</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-snackbar v-model="isAutoLiked" timeout="3000" color="success">
      完全一致するツイートの自動いいねを行いました。3秒後に自動的に閉じます。
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  TwitterAccountType,
  ShadowBanResult,
  SearchTweetResult,
} from 'my-pixiv-types'
import { openTwitterTweet, openTwitterUser } from '@/utils/twitter'
import { WebSocketAPIError } from '@/plugins/websocket'
import { PixivItem } from '@/types/pixiv-item'

export interface TweetPopupProperty {
  screen_names: string[]
  tweets: SearchTweetResult[]
  error?: string
}

export interface TweetPopupData {
  loading: boolean
  likeLoading: boolean
  isAutoLiked: boolean
  liked: { [key in TwitterAccountType]: string[] }
}

export function isShadowBanned(
  shadowBans: ShadowBanResult[],
  screenName: string
) {
  const item = shadowBans.find(
    (result) =>
      result.user.screen_name.toLocaleLowerCase() ===
      screenName.toLocaleLowerCase()
  )
  if (!item) {
    return false
  }
  return (
    !item.not_found &&
    (item.ghost_ban ||
      item.reply_deboosting ||
      item.search_ban ||
      item.search_suggestion_ban)
  )
}

export function isCheckingShadowBan(
  shadowBans: ShadowBanResult[],
  screenName: string
) {
  return !shadowBans.some(
    (result) =>
      result.user.screen_name.toLocaleLowerCase() ===
      screenName.toLocaleLowerCase()
  )
}

export default Vue.extend({
  props: {
    item: {
      type: Object as () => PixivItem | undefined,
      required: false,
      default: undefined,
    },
    tweets: {
      type: Array as () => SearchTweetResult[] | undefined,
      required: false,
      default: undefined,
    },
    screenNames: {
      type: Array as () => string[],
      required: false,
      default: () => [],
    },
    error: {
      type: String as () => string | undefined,
      required: false,
      default: undefined,
    },
    shadowBans: {
      type: Array as () => ShadowBanResult[],
      required: false,
      default: () => [],
    },
    isLoadingTweet: {
      type: Boolean,
      required: false,
      default: false,
    },
    isPixivLiked: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data(): TweetPopupData {
    return {
      loading: false,
      likeLoading: false,
      isAutoLiked: false,
      liked: {
        main: [],
        sub: [],
      },
    }
  },
  watch: {
    isLoadingTweet: {
      handler() {
        if (this.isLoadingTweet) {
          return
        }
        this.fetchTweetsLike()
      },
      immediate: true,
    },
    isPixivLiked: {
      handler() {
        if (!this.isPixivLiked) {
          return
        }
        this.autoFirstLike()
      },
      immediate: true,
    },
    tweets: {
      handler() {
        this.autoFirstLike()
      },
      immediate: true,
    },
  },
  methods: {
    fetchTweetsLike() {
      if (!this.tweets) {
        return
      }
      const tweetIds = this.tweets.map((tweet) => tweet.tweet.id)
      if (tweetIds.length === 0) {
        return
      }
      const notCheckedTweetIds = tweetIds.filter(
        (tweetId) =>
          !this.liked.main.includes(tweetId) &&
          !this.liked.sub.includes(tweetId)
      )
      this.$api.twitter
        .getTweetsLike('main', notCheckedTweetIds)
        .then((response) => {
          this.liked.main = response.data.tweets
            .filter((tweet) => tweet.liked)
            .map((tweet) => tweet.id)
        })
      this.$api.twitter
        .getTweetsLike('sub', notCheckedTweetIds)
        .then((response) => {
          this.liked.sub = response.data.tweets
            .filter((tweet) => tweet.liked)
            .map((tweet) => tweet.id)
        })
    },
    sortedTweets(): SearchTweetResult[] {
      if (!this.tweets) {
        return []
      }
      const tweets = [...this.tweets]
      return tweets.sort((a, b) => {
        const similarity = b.similarity - a.similarity
        if (similarity !== 0) {
          return similarity
        }
        return Number(a.tweet.id) - Number(b.tweet.id)
      })
    },
    getUserText(user: SearchTweetResult['tweet']['user']): string {
      return `${user.name} (@${user.screen_name})`
    },
    open(tweet: SearchTweetResult) {
      if (!confirm('ツイートページを開きますか？')) {
        return
      }
      this.loading = true
      openTwitterTweet(
        this.$accessor,
        tweet.tweet.user.screen_name,
        tweet.tweet.id
      ).then(() => {
        this.loading = false
        this.$emit('close-popup')
      })
    },
    close() {
      this.$emit('close-popup')
    },
    getHeartColor(
      tweet: SearchTweetResult,
      account: TwitterAccountType
    ): string {
      if (!this.item) {
        return 'grey'
      }
      if (this.liked[account].includes(tweet.tweet.id)) {
        return 'red'
      }
      return ''
    },
    getSimilarityColor(tweet: SearchTweetResult) {
      // 大きい方が似ている
      if (tweet.similarity > 0.95) {
        return 'green' // 95%以上
      }
      if (tweet.similarity > 0.7) {
        return 'blue' // 70%以上
      }
      return 'red' // 70%未満
    },
    toggleLike(tweet: SearchTweetResult, account: TwitterAccountType) {
      if (!this.item) {
        return
      }
      const isLiked = this.liked[account].includes(tweet.tweet.id)
      if (isLiked && !confirm('いいねを取り消しますか？')) {
        return
      }
      this.requestLike(tweet, account, !isLiked)
    },
    requestLike(
      tweet: SearchTweetResult,
      account: TwitterAccountType,
      isAdd: boolean
    ) {
      this.likeLoading = true
      if (this.$api.getReadyState() !== WebSocket.OPEN) {
        this.$api.reconnect()
      }
      const promise = isAdd
        ? this.$api.twitter.addLike(account, tweet.tweet.id)
        : this.$api.twitter.removeLike(account, tweet.tweet.id)
      promise
        .then(() => {
          this.liked[account] = isAdd
            ? [...this.liked[account], tweet.tweet.id]
            : this.liked[account]?.filter((id) => id !== tweet.tweet.id)
          this.likeLoading = false
        })
        .catch((error) => {
          this.likeLoading = false
          if (error instanceof WebSocketAPIError) {
            this.$nuxt.$emit('snackbar', {
              message: `Likeに失敗: ${error.data.error.message}`,
              color: 'error',
            })
            return
          }
          this.$nuxt.$emit('snackbar', {
            message: `Likeに失敗: ${error.message}\n${
              error.response?.data.detail || ''
            }`,
            color: 'error',
          })
        })
    },
    isCheckingShadowBan(screenName: string) {
      return isCheckingShadowBan(this.shadowBans, screenName)
    },
    isShadowBanned(screenName: string) {
      return isShadowBanned(this.shadowBans, screenName)
    },
    getAccountColor(screenName: string) {
      if (
        !this.shadowBans.some(
          (result) =>
            result.user.screen_name.toLowerCase() === screenName.toLowerCase()
        )
      ) {
        return 'grey'
      }
      if (this.isShadowBanned(screenName)) {
        return 'red'
      }
      return 'green'
    },
    getReadableSimilarity(tweet: SearchTweetResult) {
      // e.g, 0.123456 -> 12.3%
      const similarity = Math.round(tweet.similarity * 1000) / 10
      return `${similarity}%`
    },
    openTwitter(screenName: string) {
      if (!confirm('Twitterのユーザーページを開きますか？')) {
        return
      }
      this.loading = true
      openTwitterUser(this.$accessor, screenName).then(() => {
        this.loading = false
        this.$emit('close-popup')
      })
    },
    autoFirstLike() {
      if (!this.tweets) {
        return
      }
      const exactMatches = this.tweets.filter((tweet) => tweet.similarity === 1)
      if (exactMatches.length === 0) {
        return
      }
      const firstTweetId = exactMatches[0].tweet.id
      if (this.liked.sub.includes(firstTweetId)) {
        return
      }

      this.likeLoading = true
      this.$api.twitter
        .addLike('sub', firstTweetId)
        .then(() => {
          this.liked.sub = [...this.liked.sub, firstTweetId]
          this.isAutoLiked = true

          setTimeout(() => {
            this.$emit('close-popup')
          }, 3000)
        })
        .catch((error) => {
          this.likeLoading = false
          if (error instanceof WebSocketAPIError) {
            this.$nuxt.$emit('snackbar', {
              message: `Likeに失敗: ${error.data.error.message}`,
              color: 'error',
            })
            return
          }
          this.$nuxt.$emit('snackbar', {
            message: `Likeに失敗: ${error.message}\n${
              error.response?.data.detail || ''
            }`,
            color: 'error',
          })
        })
    },
  },
})
</script>
