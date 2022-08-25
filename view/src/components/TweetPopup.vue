<template>
  <v-card>
    <v-card-title v-if="error != null" class="text-h5">{{
      error
    }}</v-card-title>
    <v-card-title>
      <v-chip
        v-for="screen_name of screen_names"
        :key="screen_name"
        class="ma-1"
        v-text="'@' + screen_name"
      ></v-chip>
    </v-card-title>
    <v-card-text>
      <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
      <v-row>
        <v-col v-for="(tweet, i) in tweets" :key="i" cols="12">
          <v-card @click="open(tweet)">
            <div class="d-flex flex-no-wrap justify-space-between">
              <div>
                <v-card-subtitle
                  class="text-h5"
                  v-text="getUserText(tweet.tweet.user)"
                ></v-card-subtitle>

                <v-card-text
                  style="height: 5.5em; overflow: hidden"
                  v-text="tweet.tweet.text"
                ></v-card-text>
              </div>

              <v-avatar class="ma-3" size="125" tile>
                <v-img :src="tweet.tweet.media_url" />
              </v-avatar>
            </div>
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

export interface TweetPopupData {
  screen_names: string[]
  tweets: Tweet[]
  loading: boolean
  error: string | null
}

export default Vue.extend({
  props: {
    item: {
      type: Object as () => PixivItem,
      required: false,
      default: null,
    },
  },
  data(): TweetPopupData {
    return {
      screen_names: [],
      tweets: [],
      loading: true,
      error: null,
    }
  },
  watch: {
    item(newItem: PixivItem | null) {
      if (newItem == null) {
        return
      }
      this.getTweets()
    },
  },
  created() {
    this.getTweets()
  },
  methods: {
    getTweets() {
      if (this.item == null) {
        return
      }
      this.loading = true
      this.$axios
        .get(`/api/tweet/${this.item.id}`)
        .then((response) => {
          this.$emit('tweet-found')
          this.screen_names = response.data.screen_names
          this.tweets = response.data.tweets
          this.error = null
        })
        .catch((error) => {
          if (error.response.status === 404) {
            this.error = 'ツイートが見つかりませんでした'
          } else {
            this.error = String(error)
          }
          this.$emit('tweet-not-found')
          this.screen_names = []
          this.tweets = []
        })
        .finally(() => {
          this.loading = false
        })
    },
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
  },
})
</script>
