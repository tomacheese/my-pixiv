<template>
  <v-container fluid>
    <ItemList :items="items" :loading="loading" @open="open"></ItemList>
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
    page: number
    loading: boolean
  } {
    return {
      items: [],
      page: 1,
      loading: false,
    }
  },
  async created() {
    await this.fetch()
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
  },
})
</script>
