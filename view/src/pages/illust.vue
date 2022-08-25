<template>
  <v-container fluid>
    <ItemList :items="items" :loading="loading" @open="open"></ItemList>
    <v-dialog v-model="overlay.isOpened">
      <IllustPopup
        :item="overlay.target"
        @close-popup="overlay.isOpened = false"
      ></IllustPopup>
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
    page: number
    overlay: {
      isOpened: boolean
      target: PixivItem | null
    }
    loading: boolean
  } {
    return {
      items: [],
      page: 1,
      overlay: {
        isOpened: false,
        target: null,
      },
      loading: false,
    }
  },
  async created() {
    await this.fetch()
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
      if (!window) {
        return
      }
      this.overlay.isOpened = true
      this.overlay.target = item
    },
  },
})
</script>
