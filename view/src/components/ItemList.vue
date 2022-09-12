<template>
  <div>
    <ItemPaginationList
      v-if="type === 'PAGINATION'"
      :items="items"
      :loading="loading"
      :vieweds="vieweds"
      @open="open"
      @intersect-item="onItemViewing"
    />
    <ItemVirtualList
      v-if="type === 'VIRTUAL_SCROLL'"
      :items="items"
      :loading="loading"
      :vieweds="vieweds"
      @open="open"
      @intersect-item="onItemViewing"
    />
    <ItemGridList
      v-if="type === 'GRID_LIST'"
      :items="items"
      :loading="loading"
      :vieweds="vieweds"
      @open="open"
      @intersect-item="onItemViewing"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { PixivItem } from '@/types/pixivItem'
import { ViewType } from '@/store/settings'
export default Vue.extend({
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
      default: () => undefined,
    },
    loading: {
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
  },
})
</script>
