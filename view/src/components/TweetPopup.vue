<template>
  <v-card>
    <v-card-title v-if="data.error != null" class="text-h5">{{
      data.error
    }}</v-card-title>
    <v-card-title>
      <v-chip
        v-for="screen_name of data.screen_names"
        :key="screen_name"
        class="ma-1"
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
                  <v-chip class="ma-1" :color="getSimilarityColor(tweet)">{{
                    tweet.similarity
                  }}</v-chip>
                </v-card-subtitle>

                <v-card-text style="height: 1.5em; overflow: hidden">{{
                  tweet.tweet.text
                }}</v-card-text>
              </div>

              <v-avatar class="ma-3" size="125" tile>
                <v-img :src="tweet.tweet.media_url" />
              </v-avatar>
            </div>

            <v-card-actions>
              <v-spacer />
              <v-btn
                icon
                elevation="5"
                :color="getHeartColor(tweet, 'main')"
                @click.stop="toggleLike(tweet, 'main')"
              >
                <v-icon>mdi-cards-heart</v-icon>
              </v-btn>
              <v-btn
                icon
                elevation="5"
                :color="getHeartColor(tweet, 'sub')"
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
</template>

<script lang="ts">
import Vue from 'vue'
import { PixivItem } from '@/types/pixivItem'

export interface User {
  id: string
  name: string
  screen_name: string
  profile_image_url: string
}

export interface TweetData {
  id: string
  text: string
  media_url: string
  user: User
}

export interface Tweet {
  tweet: TweetData
  similarity: number
}

export interface TweetPopupProp {
  screen_names: string[]
  tweets: Tweet[]
  error: string | null
}

type Accounts = 'main' | 'sub'

export interface TweetPopupData {
  loading: boolean
  liked: { [key in Accounts]: string[] }
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
  },
  data(): TweetPopupData {
    return {
      loading: true,
      liked: {
        main: [],
        sub: [],
      },
    }
  },

  methods: {
    getUserText(user: User): string {
      return `${user.name} (@${user.screen_name})`
    },
    open(tweet: Tweet) {
      if (!window) {
        return
      }
      this.$emit('close-popup')
      window.open(
        `https://twitter.com/${tweet.tweet.user.screen_name}/status/${tweet.tweet.id}`,
        '_blank'
      )
    },
    close() {
      this.$emit('close-popup')
    },
    getHeartColor(tweet: Tweet, account: Accounts): string {
      if (!this.item) {
        return 'grey'
      }
      if (this.liked[account].includes(tweet.tweet.id)) {
        return 'red'
      }
      return ''
    },
    getSimilarityColor(tweet: Tweet) {
      if (tweet.similarity === 0) {
        return 'green'
      }
      if (tweet.similarity <= 10) {
        return 'yellow'
      }
      return 'red'
    },
    toggleLike(tweet: Tweet, account: Accounts) {
      if (!this.item) {
        return
      }
      this.requestLike(
        tweet,
        account,
        !this.liked[account].includes(tweet.tweet.id)
      )
    },
    requestLike(tweet: Tweet, account: Accounts, isAdd: boolean) {
      const func = isAdd ? this.$axios.post : this.$axios.delete
      func(`/api/like/${account}/${tweet.tweet.id}`)
        .then(() => {
          if (isAdd) {
            this.liked[account] = [...this.liked[account], tweet.tweet.id]
          } else {
            this.liked[account] = this.liked[account]?.filter(
              (id) => id !== tweet.tweet.id
            )
          }
        })
        .catch((err) => {
          alert(
            'Likeに失敗: ' +
              err.message +
              '\n' +
              (err.response?.data.detail || '')
          )
        })
    },
  },
})
</script>
