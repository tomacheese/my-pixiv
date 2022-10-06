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
import { TweetPopupProp } from './TweetPopup.vue'
import { PixivItem } from '@/types/pixivItem'

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
      type: Object as () => PixivItem,
      required: false,
      default: null,
    },
    fullscreen: {
      type: Boolean,
      required: false,
      default: false,
    },
    tweetStatus: {
      type: Object as () => TweetStatus,
      required: false,
      default: null,
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
      case 'LEFT':
        this.actionPosition = false
        break
      case 'RIGHT':
        this.actionPosition = true
        break
    }
  },
  methods: {
    openPage(item: PixivItem) {
      if (!window) {
        return
      }

      this.isLoadingOpenPage = true
      let change = false
      setTimeout(() => {
        this.$emit('close-popup')
        if (!change) {
          window.open(`https://www.pixiv.net/artworks/${item.id}`, '_blank')
        }
        this.isLoadingOpenPage = false
      }, this.$accessor.settings.appCheckTimeout)
      window.location.href = `pixiv://illusts/${item.id}`
      window.onblur = function () {
        change = true
      }
      window.onfocus = function () {
        change = false
      }
    },
    getTweetFoundColor(): string {
      switch (this.tweetStatus) {
        case 'EXACT_TWEET_FOUND':
          return 'primary'
        case 'TWEET_FOUND':
          return 'secondary'
        case 'ACCOUNT_FOUND':
          if (this.isShadowBanned) {
            return 'orange'
          }
          if (this.isCheckingShadowBanned) {
            return 'grey'
          }
          return 'red'
        case 'FAILED':
          return 'error'
        default:
          return 'gray'
      }
    },
    addHeart() {
      if (this.item == null) {
        return
      }
      this.$axios
        .get<TweetPopupProp>(`/api/like/illust/${this.item.id}`)
        .then(() => {
          this.$emit('like', true)
        })
        .catch((error) => {
          if (error.response.data.detail) {
            alert('Likeに失敗: ' + error.response.data.detail)
            return
          }
          alert('Likeに失敗: ' + error)
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
