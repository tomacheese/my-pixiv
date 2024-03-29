<template>
  <v-card-actions>
    <div v-if="!actionPosition">
      <v-btn icon @click="close()">
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <v-btn icon :loading="isLoadingOpenPage" @click="openPage(item)">
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>

      <v-btn icon :color="getTweetFoundColor()" @click="openTwitter()">
        <v-icon>mdi-twitter</v-icon>
      </v-btn>

      <v-btn icon :color="isLiked ? 'green' : ''" @click="addHeart()">
        <v-icon>mdi-heart</v-icon>
      </v-btn>

      <v-btn icon @click="changeFullScreen()">
        <v-icon>mdi-{{ fullscreen ? 'fullscreen-exit' : 'fullscreen' }}</v-icon>
      </v-btn>
    </div>

    <v-spacer></v-spacer>

    <div v-if="actionPosition">
      <v-btn icon @click="changeFullScreen()">
        <v-icon>mdi-{{ fullscreen ? 'fullscreen-exit' : 'fullscreen' }}</v-icon>
      </v-btn>

      <v-btn icon :color="isLiked ? 'green' : ''" @click="addHeart()">
        <v-icon>mdi-heart</v-icon>
      </v-btn>

      <v-btn icon :color="getTweetFoundColor()" @click="openTwitter()">
        <v-icon>mdi-twitter</v-icon>
      </v-btn>

      <v-btn icon :loading="isLoadingOpenPage" @click="openPage(item)">
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>

      <v-btn icon @click="close()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
  </v-card-actions>
</template>

<script lang="ts">
import Vue from 'vue'
import { openPixivIllust } from '@/utils/pixiv'
import { WebSocketAPIError } from '@/plugins/websocket'
import { PixivItem } from '@/types/pixiv-item'

export type TweetStatus =
  | 'LOADING'
  | 'EXACT_TWEET_FOUND'
  | 'TWEET_FOUND'
  | 'ACCOUNT_FOUND'
  | 'FAILED'

export default Vue.extend({
  name: 'IllustPopupActions',
  props: {
    item: {
      type: Object as () => PixivItem | undefined,
      required: false,
      default: undefined,
    },
    fullscreen: {
      type: Boolean,
      required: false,
      default: false,
    },
    tweetStatus: {
      type: String as () => TweetStatus | undefined,
      required: false,
      default: undefined,
    },
    isLiked: {
      type: Boolean,
      required: false,
      default: false,
    },
    isShadowBanned: {
      type: Boolean,
      required: false,
      default: false,
    },
    isCheckingShadowBanned: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data(): {
    isLoadingOpenPage: boolean
    actionPosition: boolean
  } {
    return {
      isLoadingOpenPage: false,
      actionPosition: true,
    }
  },
  mounted() {
    switch (this.$accessor.settings.actionPosition) {
      case 'LEFT': {
        this.actionPosition = false
        break
      }
      case 'RIGHT': {
        this.actionPosition = true
        break
      }
    }
  },
  methods: {
    openPage(item?: PixivItem) {
      if (!item) {
        return
      }
      this.isLoadingOpenPage = true
      openPixivIllust(this.$accessor, item.id).then(() => {
        this.$emit('close-popup')
        this.isLoadingOpenPage = false
      })
    },
    getTweetFoundColor(): string {
      switch (this.tweetStatus) {
        case 'EXACT_TWEET_FOUND': {
          return '#1da1f2'
        }
        case 'TWEET_FOUND': {
          return 'teal'
        }
        case 'ACCOUNT_FOUND': {
          if (this.isShadowBanned) {
            return 'orange'
          }
          if (this.isCheckingShadowBanned) {
            return 'grey'
          }
          return 'red'
        }
        case 'FAILED': {
          return 'error'
        }
        default: {
          return 'gray'
        }
      }
    },
    addHeart() {
      if (!this.item) {
        return
      }

      if (this.$api.getReadyState() !== WebSocket.OPEN) {
        this.$api.reconnect()
      }
      this.$api.illust
        .addLike(this.item.id)
        .then(() => {
          this.$emit('like', true)
        })
        .catch((error) => {
          if (error instanceof WebSocketAPIError) {
            this.$nuxt.$emit('snackbar', {
              message: `Likeに失敗: ${error.data.error.message}`,
              color: 'error',
            })
            return
          }
          this.$nuxt.$emit('snackbar', {
            message: `Likeに失敗: ${error}`,
            color: 'error',
          })
        })
    },
    close() {
      this.$emit('close-popup')
    },
    changeFullScreen() {
      this.$emit('change-fullscreen')
    },
    openTwitter() {
      this.$emit('open-twitter')
    },
  },
})
</script>
