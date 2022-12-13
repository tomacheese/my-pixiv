<template>
  <div>
    <v-progress-linear v-if="data === null" indeterminate></v-progress-linear>
    <v-card v-if="data !== null" :loading="loading">
      <v-card-title v-if="data.error != null" class="text-h5">{{
        data.error
      }}</v-card-title>
      <v-card-title>
        <v-chip
          v-for="screen_name of data.screen_names"
          :key="screen_name"
          class="ma-1"
          :color="getAccountColor(screen_name)"
          @click="openTwitter(screen_name)"
          ><v-progress-circular
            v-if="isCheckingShadowBan(screen_name)"
            :size="20"
            indeterminate
            class="mr-2"
          ></v-progress-circular
          >@{{ screen_name }}</v-chip
        >
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col v-for="(tweet, i) in data.tweets" :key="i" cols="12">
            <v-card @click="open(tweet)">
              <div class="d-flex flex-no-wrap justify-space-between">
                <div>
                  <v-card-subtitle class="text-h5">{{
                    getUserText(tweet.tweet.user)
                  }}</v-card-subtitle>

                  <v-card-subtitle>
                    <v-chip>{{ tweet.identity }}</v-chip>
                    <v-chip class="ma-1" :color="getSimilarityColor(tweet)">{{
                      tweet.similarity
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

export interface TweetPopupProp {
  screen_names: string[]
  tweets: SearchTweetResult[]
  error: string | null
}

export interface TweetPopupData {
  loading: boolean
  likeLoading: boolean
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
  if (item == null) {
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
      type: Object as () => PixivItem,
      required: false,
      default: null,
    },
    data: {
      type: Object as () => TweetPopupProp,
      required: false,
      default: null,
    },
    shadowBans: {
      type: Array as () => ShadowBanResult[],
      required: false,
      default: () => [],
    },
  },
  data(): TweetPopupData {
    return {
      loading: false,
      likeLoading: false,
      liked: {
        main: [],
        sub: [],
      },
    }
  },
  watch: {
    data: {
      handler() {
        if (this.data == null) {
          return // loading
        }
        this.fetchTweetsLike()
      },
      immediate: true,
    },
  },
  methods: {
    fetchTweetsLike() {
      if (this.data == null) {
        return
      }
      const tweetIds = this.data.tweets.map((tweet) => tweet.tweet.id)
      if (tweetIds.length === 0) {
        return
      }
      this.$api.twitter.getTweetsLike('main', tweetIds).then((res) => {
        this.liked.main = res.data.tweets
          .filter((tweet) => tweet.liked)
          .map((tweet) => tweet.id)
      })
      this.$api.twitter.getTweetsLike('sub', tweetIds).then((res) => {
        this.liked.sub = res.data.tweets
          .filter((tweet) => tweet.liked)
          .map((tweet) => tweet.id)
      })
    },
    getUserText(user: SearchTweetResult['tweet']['user']): string {
      return `${user.name} (@${user.screen_name})`
    },
    open(tweet: SearchTweetResult) {
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
      if (tweet.similarity === 0) {
        return 'green'
      }
      if (tweet.similarity <= 10) {
        return 'blue'
      }
      return 'red'
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
          if (isAdd) {
            this.liked[account] = [...this.liked[account], tweet.tweet.id]
          } else {
            this.liked[account] = this.liked[account]?.filter(
              (id) => id !== tweet.tweet.id
            )
          }
          this.likeLoading = false
        })
        .catch((err) => {
          if (err instanceof WebSocketAPIError) {
            this.$nuxt.$emit('snackbar', {
              message: `Likeに失敗: ${err.data.error.message}`,
              color: 'error',
            })
            return
          }
          this.$nuxt.$emit('snackbar', {
            message: `Likeに失敗: ${err.message}\n${
              err.response?.data.detail || ''
            }`,
            color: 'error',
          })
          this.likeLoading = false
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
    openTwitter(screenName: string) {
      this.loading = true
      openTwitterUser(this.$accessor, screenName).then(() => {
        this.loading = false
        this.$emit('close-popup')
      })
    },
  },
})
</script>
