<template>
  <div>
    <ItemPaginationList
      v-if="selectType === 'PAGINATION'"
      :items="items"
      :loading="loading"
      :vieweds="vieweds"
      @open="open"
      @intersect-item="onItemViewing"
    />
    <ItemVirtualList
      v-if="selectType === 'VIRTUAL_SCROLL'"
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
    items: {
      type: Array as () => PixivItem[],
      required: true,
    },
    vieweds: {
      type: Array as () => number[],
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  },
  data(): {
    selectType: ViewType
  } {
    return {
      selectType: 'PAGINATION',
    }
  },
  created() {
    this.selectType = this.$accessor.settings.viewType
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
