<template>
  <div>
    <ItemPaginationList
      v-if="type === 'PAGINATION'"
      :items="items"
      :loading="loading"
      :vieweds="vieweds"
      :is-load-more-available="isLoadMoreAvailable"
      @open="open"
      @intersect-item="onItemViewing"
      @load-more="loadMore"
    />
    <ItemVirtualList
      v-if="type === 'VIRTUAL_SCROLL'"
      :items="items"
      :loading="loading"
      :vieweds="vieweds"
      :is-load-more-available="isLoadMoreAvailable"
      @open="open"
      @intersect-item="onItemViewing"
      @load-more="loadMore"
    />
    <ItemGridList
      v-if="type === 'GRID_LIST'"
      :items="items"
      :loading="loading"
      :vieweds="vieweds"
      :is-load-more-available="isLoadMoreAvailable"
      @open="open"
      @intersect-item="onItemViewing"
      @load-more="loadMore"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ViewType } from '@/store/settings'
import ItemPaginationList from '@/components/items/lists/ItemPaginationList.vue'
import ItemVirtualList from '@/components/items/lists/ItemVirtualList.vue'
import ItemGridList from '@/components/items/lists/ItemGridList.vue'
import { PixivItem } from '@/types/pixiv-item'

export default Vue.extend({
  components: {
    ItemPaginationList,
    ItemVirtualList,
    ItemGridList,
  },
  props: {
    type: {
      type: String as () => ViewType,
      required: true,
    },
    items: {
      type: Array as () => PixivItem[],
      required: true,
    },
    vieweds: {
      type: Array as () => number[] | undefined,
      required: false,
      // eslint-disable-next-line unicorn/no-useless-undefined
      default: () => undefined,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    isLoadMoreAvailable: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    open(item: PixivItem): void {
      this.$emit('open', item)
    },
    onItemViewing(item: PixivItem): void {
      this.$emit('intersect-item', item)
    },
    loadMore(): void {
      this.$emit('load-more')
    },
  },
})
</script>
