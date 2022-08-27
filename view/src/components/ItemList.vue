<template>
  <v-container>
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <v-pagination
      v-model="page"
      :length="
        Math.ceil(
          items.filter((item) => (isOnlyNew ? !isViewed(item) : true)).length /
            10
        )
      "
      :total-visible="11"
      class="my-3"
    ></v-pagination>
    <v-switch v-model="isOnlyNew" label="New のみ表示"></v-switch>
    <v-row>
      <v-col v-for="(item, i) in getItems()" :key="i" cols="12">
        <ItemCard
          :item="item"
          :is-viewed="!isViewed(item)"
          @open="open"
          @intersect="onItemViewing"
        />
      </v-col>
    </v-row>
    <v-pagination
      v-model="page"
      :length="
        Math.ceil(
          items.filter((item) => (isOnlyNew ? !isViewed(item) : true)).length /
            10
        )
      "
      :total-visible="11"
      class="my-3"
      @input="changePage"
    ></v-pagination>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { PixivItem } from '@/types/pixivItem'
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
    page: number
    isOnlyNew: boolean
  } {
    return {
      page: 1,
      isOnlyNew: false,
    }
  },
  methods: {
    getItems(): PixivItem[] {
      return this.items
        .filter((item) => (this.isOnlyNew ? !this.isViewed(item) : true))
        .slice((this.page - 1) * 10, this.page * 10)
    },
    changePage() {
      window.scroll({ top: 0, behavior: 'smooth' })
    },
    open(item: PixivItem): void {
      this.$emit('open', item)
    },
    onItemViewing(item: PixivItem): void {
      this.$emit('intersect-item', item)
    },
    isViewed(item: PixivItem): boolean {
      return this.vieweds.includes(item.id)
    },
  },
})
</script>
