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
        v-text="'@' + screen_name"
      ></v-chip>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col v-for="(tweet, i) in data.tweets" :key="i" cols="12">
          <v-card @click="open(tweet)">
            <div class="d-flex flex-no-wrap justify-space-between">
              <div>
                <v-card-subtitle
                  class="text-h5"
                  v-text="getUserText(tweet.tweet.user)"
                ></v-card-subtitle>

                <v-card-subtitle>
                  <v-chip class="ma-1" v-text="tweet.similarity"></v-chip>
                </v-card-subtitle>

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

export interface TweetPopupProp {
  screen_names: string[]
  tweets: Tweet[]
  error: string | null
}

export interface TweetPopupData {
  loading: boolean
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
    }
  },
})
</script>
