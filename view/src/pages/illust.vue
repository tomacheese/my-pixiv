<template>
  <v-container fluid>
    <ItemList
      :items="items"
      :loading="loading"
      :vieweds="vieweds"
      @open="open"
      @intersect-item="onItemViewing"
    ></ItemList>
    <v-dialog v-model="overlay.isIllustOpened">
      <IllustPopup :item="overlay.target" @close-popup="close()"></IllustPopup>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { PixivItem, PixivItemWithSearchTag } from '@/types/pixivItem'
import { Fetcher } from '@/plugins/fetcher'
import { TargetType } from '@/store/settings'

export default Vue.extend({
  name: 'IllustPage',
  data(): {
    items: PixivItemWithSearchTag[]
    vieweds: number[]
    page: number
    overlay: {
      isIllustOpened: boolean
      target: PixivItem | null
    }
    loading: boolean
  } {
    return {
      items: [],
      vieweds: [],
      page: 1,
      overlay: {
        isIllustOpened: false,
        target: null,
      },
      loading: false,
    }
  },
  async created() {
    await this.fetch()

    this.vieweds = this.$accessor.viewed.illusts
  },
  methods: {
    async fetch() {
      this.loading = true

      const targetType: TargetType = 'ILLUST'
      const fetcher = new Fetcher(
        this.$config,
        this.$axios,
        this.$accessor.settings.filters,
        targetType
      )
      this.items = await fetcher.getItems(
        this.$accessor.settings.specificTargets(targetType)
      )

      this.loading = false
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
      console.log('onItemViewing', item.title)
      this.$accessor.viewed.addIllust(item)
    },
  },
})
</script>
