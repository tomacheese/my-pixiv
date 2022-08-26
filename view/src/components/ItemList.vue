<template>
  <v-container ref="itemlist">
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <v-pagination
      v-model="page"
      :length="Math.ceil(items.length / 10)"
      :total-visible="11"
      class="my-3"
    ></v-pagination>
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
      :length="Math.ceil(items.length / 10)"
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
  } {
    return {
      page: 1,
    }
  },
  methods: {
    getItems(): PixivItem[] {
      return this.items.slice((this.page - 1) * 10, this.page * 10)
    },
    changePage() {
      ;(this.$refs.itemlist as HTMLElement).scrollIntoView()
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
