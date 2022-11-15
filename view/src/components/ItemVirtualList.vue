<template>
  <v-container>
    <v-row>
      <v-col>
        <v-switch
          v-if="vieweds !== undefined"
          v-model="isOnlyNew"
          label="New のみ表示"
        ></v-switch>
      </v-col>
      <v-col>
        <v-switch
          v-model="isExcludeLiked"
          label="いいね！済みを非表示"
        ></v-switch>
      </v-col>
      <v-col>
        <v-switch v-model="isExcludeR18" label="R18を非表示"></v-switch>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-if="getItems().length === 0 && !loading" cols="12">
        <v-card>
          <v-card-title>該当するアイテムはありません。</v-card-title>
        </v-card>
      </v-col>
      <v-virtual-scroll
        v-if="getItems().length > 0"
        :bench="10"
        :items="getItems()"
        item-height="210"
        style="overflow-y: hidden"
      >
        <template #default="{ item }">
          <v-col cols="12">
            <ItemWrapper
              :item="item"
              :loading="loading"
              @intersect="onItemViewing"
            >
              <ItemCard
                :item="item"
                :is-viewed="vieweds !== undefined && !isViewed(item)"
                @open="open"
                @intersect="onItemViewing"
              />
            </ItemWrapper>
          </v-col>
        </template>
      </v-virtual-scroll>
      <!-- バーチャルスクロールでは、さらに読み込むボタン押下後にアイテムがロードされない不具合があるので実装しない -->
    </v-row>
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
    isLoadMoreAvailable: {
      type: Boolean,
      required: true,
    },
  },
  data(): {
    page: number
    isOnlyNew: boolean
    isExcludeLiked: boolean
    isExcludeR18: boolean
  } {
    return {
      page: 1,
      isOnlyNew: false,
      isExcludeLiked: false,
      isExcludeR18: false,
    }
  },
  watch: {
    isOnlyNew() {
      this.$accessor.settings.setOnlyNew(this.isOnlyNew)
    },
    isExcludeLiked() {
      this.$accessor.settings.setExcludeLiked(this.isExcludeLiked)
    },
    isExcludeR18() {
      this.$accessor.settings.setExcludeR18(this.isExcludeR18)
    },
  },
  mounted() {
    this.isOnlyNew = this.$accessor.settings.onlyNew
    this.isExcludeLiked = this.$accessor.settings.excludeLiked
  },
  methods: {
    getItems(): PixivItem[] {
      return this.items
        .filter((item) => (this.isOnlyNew ? !this.isViewed(item) : true))
        .filter((item) => (this.isExcludeLiked ? !this.isLiked(item) : true))
        .filter((item) => (this.isExcludeR18 ? !this.isR18(item) : true))
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
    isLiked(item: PixivItem): boolean {
      return item.is_bookmarked
    },
    isR18(item: PixivItem): boolean {
      return item.tags.some((tag) => tag.name === 'R-18')
    },
  },
})
</script>
