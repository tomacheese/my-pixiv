<template>
  <v-container fluid>
    <ItemList
      :items="items"
      :loading="loading"
      :vieweds="vieweds"
      :type="selectType"
      :is-load-more-available="isLoadMoreAvailable()"
      @open="open"
      @intersect-item="onItemViewing"
      @load-more="loadMore"
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
import { TargetType, ViewType } from '@/store/settings'

export default Vue.extend({
  name: 'IllustList',
  props: {
    targetType: {
      type: String as () => TargetType,
      required: true,
    },
    recommended: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data(): {
    fetcher: Fetcher | null
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
      fetcher: null,
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

    this.selectType = this.$accessor.settings.viewType

    if (!this.recommended) {
      this.vieweds = this.$accessor.viewed.illusts
    } else {
      this.vieweds = undefined
    }
  },
  methods: {
    async fetch() {
      this.loading = true

      if (!this.fetcher) {
        this.fetcher = new Fetcher(
          this.$config,
          this.$axios,
          this.$accessor.settings.filters,
          this.targetType
        )
      }
      if (!this.recommended) {
        this.items = await this.fetcher.getItems(
          this.$accessor.settings.specificTargets(this.targetType)
        )
      } else {
        this.items = await this.fetcher.getFetchRecommended()
      }

      this.loading = false
    },
    loadMore() {
      if (!this.fetcher) {
        return
      }
      if (!this.recommended) {
        return
      }
      this.loading = true

      this.fetcher
        .getFetchRecommended(true)
        .then((items) => {
          this.items = [...this.items, ...items].filter((item, index, self) => {
            return self.map((item) => item.id).indexOf(item.id) === index
          })
        })
        .finally(() => {
          this.loading = false
        })
    },
    isLoadMoreAvailable(): boolean {
      if (!this.fetcher) {
        return false
      }
      return this.fetcher.isLoadMoreAvailable()
    },
    open(item: PixivItem): void {
      this.overlay.isIllustOpened = true
      this.overlay.target = item
    },
    close() {
      this.overlay.isIllustOpened = false
      this.overlay.target = null
    },
    onItemViewing(item: PixivItem) {
      if (this.recommended) {
        return
      }
      this.$accessor.viewed.addIllust(item)
    },
  },
})
</script>
