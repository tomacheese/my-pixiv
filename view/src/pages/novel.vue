<template>
  <v-container fluid>
    <ItemList
      :items="items"
      :loading="loading"
      :vieweds="vieweds"
      @open="open"
      @intersect-item="onItemViewing"
    ></ItemList>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { PixivItem, PixivItemWithSearchTag } from '@/types/pixivItem'
import { Fetcher } from '@/plugins/fetcher'
import { TargetType } from '@/store/settings'

export default Vue.extend({
  name: 'NovelPage',
  data(): {
    items: PixivItemWithSearchTag[]
    vieweds: number[]
    page: number
    loading: boolean
  } {
    return {
      items: [],
      vieweds: [],
      page: 1,
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

      const targetType: TargetType = 'NOVEL'
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
      if (!window) {
        return
      }
      window.open(
        `https://www.pixiv.net/novel/show.php?id=${item.id}`,
        '_blank'
      )
    },
    onItemViewing(item: PixivItem) {
      this.$accessor.viewed.addNovel(item)
    },
    getVieweds(): number[] {
      return this.$accessor.viewed.novels
    },
  },
})
</script>
