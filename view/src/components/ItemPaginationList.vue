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
    <v-switch
      v-if="vieweds !== undefined"
      v-model="isOnlyNew"
      label="New のみ表示"
    ></v-switch>
    <v-row>
      <v-col v-if="getItems().length === 0 && !loading" cols="12">
        <v-card>
          <v-card-title>該当するアイテムはありません。</v-card-title>
        </v-card>
      </v-col>
      <v-col v-for="(item, i) in getItems()" :key="i" cols="12">
        <ItemWrapper :item="item" @intersect="onItemViewing">
          <ItemCard
            :item="item"
            :is-viewed="vieweds !== undefined && !isViewed(item)"
            @open="open"
          />
        </ItemWrapper>
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
      type: Array as () => number[] | undefined,
      required: false,
      default: undefined,
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
  watch: {
    isOnlyNew() {
      this.$accessor.settings.setOnlyNew(this.isOnlyNew)
    },
  },
  mounted() {
    this.isOnlyNew = this.$accessor.settings.onlyNew
  },
  methods: {
    getItems(): PixivItem[] {
      return this.items
        .filter((item) => (this.isOnlyNew ? !this.isViewed(item) : true))
        .slice((this.page - 1) * 10, this.page * 10)
    },
    changePage() {
      setTimeout(() => {
        window.scroll({ top: 0, behavior: 'smooth' })
      }, 100)
    },
    open(item: PixivItem): void {
      this.$emit('open', item)
    },
    onItemViewing(item: PixivItem): void {
      this.$emit('intersect-item', item)
    },
    isViewed(item: PixivItem): boolean {
      if (!this.vieweds) {
        return false
      }
      return this.vieweds.includes(item.id)
    },
  },
})
</script>
