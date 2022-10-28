<template>
  <v-container fluid>
    <VLoadProgress
      :loading="loading"
      :loaded="count.loaded"
      :failed="count.failed"
      :total="count.total"
    ></VLoadProgress>
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
import { openPixivNovel } from '@/utils/pixiv'

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
    count: {
      loaded: number
      failed: number
      total: number
    }
    loading: boolean
  } {
    return {
      fetcher: null,
      items: [],
      vieweds: [],
      selectType: 'PAGINATION',
      page: 1,
      count: {
        loaded: 0,
        failed: 0,
        total: 0,
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
    this.$nuxt.$on('update-mutes', () => {
      if (!this.fetcher) {
        return
      }
      this.items = this.items.filter((item) => {
        return !this.fetcher?.isMutedItem(item)
      })
    })
  },
  methods: {
    async fetch() {
      this.loading = true
      if (!this.fetcher) {
        this.fetcher = new Fetcher(
          this.$config,
          this.$api,
          this.$accessor,
          'NOVEL'
        )
      }
      if (!this.recommended) {
        const targets = this.$accessor.settings.specificTargets('NOVEL')
        this.count.total = targets.length
        await Promise.all(
          targets.map(async (target) => {
            const items = await this.fetcher?.getFetchItemPromise(target)
            if (!items) {
              this.count.failed++
              return
            }
            this.items = [...this.items, ...items]
            this.count.loaded++
          })
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
      this.loading = true
      openPixivNovel(this.$accessor, item.id).then(() => {
        this.loading = false
      })
    },
    onItemViewing(item: PixivItem) {
      if (this.recommended) {
        return
      }
      this.$accessor.viewed.addNovel({
        itemId: item.id,
        isSync: true,
      })
    },
  },
})
</script>
