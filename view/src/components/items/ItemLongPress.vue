<template>
  <div>
    <VLongPress :on-long-press="onLongPress">
      <slot />
    </VLongPress>
    <v-dialog v-model="isOpen" class="item-muting-selection">
      <v-card :loading="isLoading">
        <v-card-title>アイテムオプション</v-card-title>
        <v-card-subtitle
          >このアイテムに対する操作を選んでください</v-card-subtitle
        >

        <v-card-text>
          <v-list>
            <v-list-item v-if="!isLater" two-line @click="addLater()">
              <v-list-item-icon>
                <v-icon>mdi-paperclip-plus</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>あとで見る</v-list-item-title>
                <v-list-item-subtitle>
                  このアイテムをあとで見るリストに追加します
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-else two-line @click="removeLater()">
              <v-list-item-icon>
                <v-icon>mdi-paperclip-remove</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>あとで見るから削除</v-list-item-title>
                <v-list-item-subtitle>
                  このアイテムをあとで見るリストから削除します
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item two-line @click="addItemMute()">
              <v-list-item-icon>
                <v-icon v-if="isPixivIllustItem">mdi-image-remove</v-icon>
                <v-icon v-else>mdi-text-box-remove-outline</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title
                  >{{
                    isPixivIllustItem ? 'イラスト・マンガ' : '小説'
                  }}をミュート</v-list-item-title
                >

                <v-list-item-subtitle>
                  {{ item.title }} ({{ item.id }})
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item two-line @click="addAuthorMute()">
              <v-list-item-icon>
                <v-icon>mdi-account-remove</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>作者をミュート</v-list-item-title>

                <v-list-item-subtitle>
                  {{ item.user.name }} ({{ item.id }})
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              v-if="isPixivNovelItem && isSeries"
              two-line
              @click="addNovelSeriesMute()"
            >
              <v-list-item-icon>
                <v-icon>mdi-format-list-text</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>小説シリーズ</v-list-item-title>

                <v-list-item-subtitle>
                  {{ seriesTitle }} ({{ seriesId }})
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item v-if="isShareable" two-line @click="shareItem()">
              <v-list-item-icon>
                <v-icon>mdi-share-variant</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>共有</v-list-item-title>
                <v-list-item-subtitle>
                  このアイテムを共有します
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-else two-line @click="copyItemUrl()">
              <v-list-item-icon>
                <v-icon>mdi-content-copy</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>URLをコピー</v-list-item-title>
                <v-list-item-subtitle>
                  このアイテムのURLをコピーします
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-if="snackbarType !== null"
      v-model="isSnackbar"
      :color="snackbarMap[snackbarType].color"
    >
      <v-icon>{{ snackbarMap[snackbarType].icon }}</v-icon>
      {{ snackbarMap[snackbarType].message }}
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { MuteTargetType } from 'my-pixiv-types'
import VLongPress from '@/components/utils/VLongPress.vue'
import {
  PixivItem,
  isPixivIllustItem,
  isPixivNovelItem,
  isSeriesItem,
} from '@/types/pixiv-item'

type SnackBarType =
  | 'ADDED_LATER'
  | 'REMOVED_LATER'
  | 'ADDED_ITEM'
  | 'ADDED_AUTHOR'
  | 'ADDED_SERIES'
  | 'COPIED'
  | 'ALREADY_MUTE_ADDED'
  | 'FAILED'
interface SnackBarView {
  icon: `mdi-${string}`
  message: string
  color: 'success' | 'warning' | 'error'
}

export default Vue.extend({
  name: 'ItemLongPress',
  components: {
    VLongPress,
  },
  props: {
    item: {
      type: Object as () => PixivItem,
      required: true,
    },
  },
  data(): {
    isOpen: boolean
    isLoading: boolean
    isSnackbar: boolean
    snackbarType: SnackBarType | null
    snackbarMap: { [key in SnackBarType]: SnackBarView }
    pressTimer: NodeJS.Timeout | null
  } {
    return {
      isOpen: false,
      isLoading: false,
      isSnackbar: false,
      snackbarType: null,
      snackbarMap: {
        ADDED_LATER: {
          icon: 'mdi-check',
          message: 'この作品をあとで見るリストに追加しました。',
          color: 'success',
        },
        REMOVED_LATER: {
          icon: 'mdi-check',
          message: 'この作品をあとで見るリストから削除しました。',
          color: 'success',
        },
        ADDED_ITEM: {
          icon: 'mdi-check',
          message: 'この作品をミュートしました。',
          color: 'success',
        },
        ADDED_AUTHOR: {
          icon: 'mdi-check',
          message: 'この作者をミュートしました。',
          color: 'success',
        },
        ADDED_SERIES: {
          icon: 'mdi-check',
          message: 'このシリーズをミュートしました。',
          color: 'success',
        },
        COPIED: {
          icon: 'mdi-check',
          message: 'URLをコピーしました。',
          color: 'success',
        },
        ALREADY_MUTE_ADDED: {
          icon: 'mdi-warning',
          message: 'すでにミュートされています。',
          color: 'warning',
        },
        FAILED: {
          icon: 'mdi-alert',
          message: '操作に失敗しました。',
          color: 'error',
        },
      },
      pressTimer: null,
    }
  },
  computed: {
    isPixivIllustItem(): boolean {
      return isPixivIllustItem(this.item)
    },
    isPixivNovelItem(): boolean {
      return isPixivNovelItem(this.item)
    },
    isSeries(): boolean {
      return isSeriesItem(this.item.series)
    },
    isLater(): boolean {
      return this.$accessor.settings.isLater(this.item)
    },
    isShareable(): boolean {
      return 'share' in navigator
    },
    seriesTitle(): string {
      if (!isSeriesItem(this.item.series)) return ''
      return this.item.series.title
    },
    seriesId(): number {
      if (!isSeriesItem(this.item.series)) return 0
      return this.item.series.id
    },
  },
  methods: {
    addLater(): void {
      if (this.$accessor.settings.isLater(this.item)) {
        this.snackbarType = 'FAILED'
        this.isSnackbar = true
        return
      }
      this.$accessor.settings.addLater(this.item)
      this.snackbarType = 'ADDED_LATER'
      this.isSnackbar = true
      this.isOpen = false
      this.$nuxt.$emit('update-laters')
    },
    removeLater(): void {
      if (!this.$accessor.settings.isLater(this.item)) {
        this.snackbarType = 'FAILED'
        this.isSnackbar = true
        return
      }
      this.$accessor.settings.removeLater(this.item)
      this.snackbarType = 'REMOVED_LATER'
      this.isSnackbar = true
      this.isOpen = false
      this.$nuxt.$emit('update-laters')
    },
    addItemMute(): void {
      const targetType = isPixivIllustItem(this.item) ? 'ILLUST' : 'NOVEL'
      this.addMute(targetType, this.item.id)
    },
    addAuthorMute(): void {
      this.addMute('USER', this.item.user.id)
    },
    addNovelSeriesMute(): void {
      this.addMute('NOVEL_SERIES', this.seriesId)
    },
    addMute(type: MuteTargetType, id: number): void {
      this.isLoading = true

      if (this.$accessor.itemMute.isMuted(this.item.id, type)) {
        this.snackbarType = 'ALREADY_MUTE_ADDED'
        this.isSnackbar = true
        this.isLoading = false
        return
      }

      this.$accessor.itemMute.addMute({
        item: {
          type,
          id,
        },
        isSync: this.$accessor.settings.isAutoSyncMutes,
      })
      this.$nuxt.$emit('update-mutes')

      this.isLoading = false
      this.isOpen = false

      switch (type) {
        case 'ILLUST':
        case 'NOVEL':
          this.snackbarType = 'ADDED_ITEM'
          break
        case 'USER':
          this.snackbarType = 'ADDED_AUTHOR'
          break
        case 'NOVEL_SERIES':
          this.snackbarType = 'ADDED_SERIES'
          break
      }
      this.isSnackbar = true
    },
    shareItem(): void {
      navigator.share({
        url: this.getShareUrl(),
      })
      this.isOpen = false
    },
    copyItemUrl(): void {
      const url = this.getShareUrl()
      if (!navigator.clipboard) {
        const textarea = document.createElement('textarea')
        textarea.value = url
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      } else {
        navigator.clipboard.writeText(url)
      }
      this.snackbarType = 'COPIED'
      this.isSnackbar = true
      this.isOpen = false
    },
    getShareUrl(): string {
      if (isPixivIllustItem(this.item)) {
        return `https://www.pixiv.net/artworks/${this.item.id}`
      } else if (isPixivNovelItem(this.item)) {
        return `https://www.pixiv.net/novel/show.php?id=${this.item.id}`
      }
      return ''
    },
    onLongPress() {
      this.isOpen = true
    },
  },
})
</script>

<style scoped>
.item-muting-wrapper {
  user-select: none;
}
</style>
