<template>
  <div>
    <VLongPress :on-long-press="onLongPress">
      <slot />
    </VLongPress>
    <v-dialog v-model="isOpen" class="item-muting-selection">
      <v-card :loading="isLoading">
        <v-card-title>ミュート種別選択</v-card-title>
        <v-card-subtitle
          >ミュート対象にする種別を選んでください。</v-card-subtitle
        >

        <v-card-text>
          <v-list>
            <v-list-item two-line @click="addItemMute()">
              <v-list-item-icon>
                <v-icon v-if="isPixivIllustItem">mdi-image</v-icon>
                <v-icon v-else>mdi-text</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>{{
                  isPixivIllustItem ? 'イラスト・マンガ' : '小説'
                }}</v-list-item-title>

                <v-list-item-subtitle>
                  {{ item.title }} ({{ item.id }})
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item two-line @click="addAuthorMute()">
              <v-list-item-icon>
                <v-icon>mdi-account</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>作者</v-list-item-title>

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
import {
  isPixivIllustItem,
  isPixivNovelItem,
  isSeriesItem,
  PixivItem,
} from '@/types/pixivItem'
import { MuteTargetType } from '@/plugins/websocket/item-mute'
import VLongPress from '@/components/utils/VLongPress.vue'

type SnackBarType =
  | 'ADDED_ITEM'
  | 'ADDED_AUTHOR'
  | 'ADDED_SERIES'
  | 'ALREADY_ADDED'
  | 'FAILED'
interface SnackBarView {
  icon: `mdi-${string}`
  message: string
  color: 'success' | 'warning' | 'error'
}

export default Vue.extend({
  name: 'ItemMuting',
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
        ALREADY_ADDED: {
          icon: 'mdi-warning',
          message: 'すでにミュートされています。',
          color: 'warning',
        },
        FAILED: {
          icon: 'mdi-alert',
          message: 'ミュートに失敗しました。',
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
        this.snackbarType = 'ALREADY_ADDED'
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
