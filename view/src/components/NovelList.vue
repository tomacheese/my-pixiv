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
    fetcher: Fetcher | null
    items: PixivItem[]
    vieweds: number[] | undefined
    selectType: ViewType
    page: number
    loading: boolean
  } {
    return {
      fetcher: null,
      items: [],
      vieweds: [],
      selectType: 'PAGINATION',
      page: 1,
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

      if (!this.fetcher) {
        this.fetcher = new Fetcher(
          this.$config,
          this.$axios,
          this.$accessor.settings.filters,
          'NOVEL'
        )
      }
      if (!this.recommended) {
        this.items = await this.fetcher.getItems(
          this.$accessor.settings.specificTargets('NOVEL')
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
      if (!window) {
        return
      }

      this.loading = true
      let change = false
      setTimeout(() => {
        if (!change) {
          window.open(
            `https://www.pixiv.net/novel/show.php?id=${item.id}`,
            '_blank'
          )
        }
        this.loading = false
      }, 700)
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
