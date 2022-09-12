<template>
  <v-container fluid>
    <ItemList
      :items="items"
      :loading="loading"
      :vieweds="vieweds"
      :type="selectType"
      @open="open"
      @intersect-item="onItemViewing"
    ></ItemList>
    <v-dialog
      v-model="overlay.isIllustOpened"
      :fullscreen="overlay.isFullscreen"
    >
      <IllustPopup
        :item="overlay.target"
        :fullscreen="overlay.isFullscreen"
        @change-fullscreen="overlay.isFullscreen = !overlay.isFullscreen"
        @close-popup="close()"
      ></IllustPopup>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { PixivItem } from '@/types/pixivItem'
import { Fetcher } from '@/plugins/fetcher'
import { ViewType } from '@/store/settings'

export default Vue.extend({
  name: 'NovelList',
  props: {
    recommended: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data(): {
    items: PixivItem[]
    vieweds: number[] | undefined
    selectType: ViewType
    page: number
    overlay: {
      isIllustOpened: boolean
      target: PixivItem | null
      isFullscreen: boolean
    }
    loading: boolean
  } {
    return {
      items: [],
      vieweds: [],
      selectType: 'PAGINATION',
      page: 1,
      overlay: {
        isIllustOpened: false,
        target: null,
        isFullscreen: false,
      },
      loading: false,
    }
  },
  watch: {
    targetType() {
      this.fetch()
    },
  },
  async created() {
    await this.fetch()

    this.selectType = this.$accessor.settings.novelViewType

    if (!this.recommended) {
      this.vieweds = this.$accessor.viewed.novels
    } else {
      this.vieweds = undefined
    }
  },
  methods: {
    async fetch() {
      this.loading = true

      const fetcher = new Fetcher(
        this.$config,
        this.$axios,
        this.$accessor.settings.filters,
        'NOVEL'
      )
      if (!this.recommended) {
        this.items = await fetcher.getItems(
          this.$accessor.settings.specificTargets('NOVEL')
        )
      } else {
        this.items = await fetcher.getFetchRecommended()
      }

      this.loading = false
    },
    open(item: PixivItem): void {
      if (!window) {
        return
      }

      let change = false
      setTimeout(() => {
        if (!change) {
          window.open(
            `https://www.pixiv.net/novel/show.php?id=${item.id}`,
            '_blank'
          )
        }
      }, 625)
      window.location.href = `pixiv://novels/${item.id}`
      window.onblur = function () {
        change = true
      }
      window.onfocus = function () {
        change = false
      }
    },
    onItemViewing(item: PixivItem) {
      if (this.recommended) {
        return
      }
      this.$accessor.viewed.addNovel(item)
    },
  },
})
</script>
