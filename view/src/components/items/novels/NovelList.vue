<template>
  <v-container fluid>
    <VLoadProgress
      :loading="loading"
      :loaded="count.loaded"
      :failed="count.failed"
      :total="count.total"
    >
    </VLoadProgress>
    <v-alert v-if="count.failed !== 0" type="warning" dense text
      >一部の検索が失敗したため、すべての結果が表示されていません。</v-alert
    >
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
import { PixivItem, PixivItemWithSearchTag } from '@/types/pixivItem'
import { Fetcher } from '@/plugins/fetcher'
import { ViewType } from '@/store/settings'
import { openPixivNovel } from '@/utils/pixiv'
import VLoadProgress from '@/components/utils/VLoadProgress.vue'
import ItemList from '@/components/items/lists/ItemList.vue'

export default Vue.extend({
  name: 'NovelList',
  components: {
    VLoadProgress,
    ItemList,
  },
  props: {
    recommended: {
      type: Boolean,
      required: false,
      default: false,
    },
    later: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data(): {
    fetcher: Fetcher | null
    items: PixivItem[] | PixivItemWithSearchTag[]
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
    this.selectType = this.$accessor.settings.novelViewType

    // 既読情報は検索結果画面のみで使用
    if (!this.recommended && !this.later) {
      this.vieweds = this.$accessor.viewed.novels
    } else {
      this.vieweds = undefined
    }

    await this.fetch()

    this.$nuxt.$on('update-mutes', () => {
      if (!this.fetcher) {
        return
      }
      this.items = this.items.filter((item) => {
        return !this.fetcher?.isMutedItem(item)
      })
    })
    this.$nuxt.$on('update-laters', async () => {
      if (!this.fetcher) {
        return
      }
      if (!this.later) {
        return
      }
      await this.fetch()
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
      if (this.recommended) {
        this.items = await this.fetcher.getFetchRecommended()
      } else if (this.later) {
        this.items = this.fetcher.getFetchLater()
      } else {
        const targets = this.$accessor.settings.specificTargets('NOVEL')
        this.count.total = targets.length
        await Promise.all(
          targets.map(async (target) => {
            const items = await this.fetcher
              ?.getFetchItemPromise(target)
              .catch(() => null)
            if (!items) {
              this.count.failed++
              return
            }
            this.items = this.fetcher?.sortItems([
              ...(this.items as PixivItemWithSearchTag[]),
              ...items,
            ]) as PixivItemWithSearchTag[]
            this.count.loaded++
          })
        )
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
      if (this.loading) {
        return
      }
      if (this.recommended) {
        return
      }
      this.$accessor.viewed.addNovel({
        itemId: item.id,
        isSync: this.$accessor.settings.isAutoSyncVieweds,
      })
    },
  },
})
</script>
