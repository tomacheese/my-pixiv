<template>
  <v-container>
    <v-pagination
      v-model="page"
      :length="Math.ceil(getFilteredItems().length / getPaginationLimit())"
      :total-visible="11"
      class="my-3"
    ></v-pagination>
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
      <v-col v-for="(item, i) in getItems()" :key="i" cols="12">
        <ItemWrapper :item="item" :loading="loading" @intersect="onItemViewing">
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
      :length="Math.ceil(getFilteredItems().length / getPaginationLimit())"
      :total-visible="11"
      class="my-3"
      @input="changePage"
    ></v-pagination>
    <v-btn
      v-if="
        page === Math.ceil(getFilteredItems().length / getPaginationLimit()) &&
        isLoadMoreAvailable
      "
      block
      large
      class="my-5"
      :loading="loading"
      @click="loadMore()"
      >さらに読み込む</v-btn
    >
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import ItemWrapper from '@/components/items/ItemWrapper.vue'
import ItemCard from '@/components/items/ItemCard.vue'
import { PixivItem } from '@/types/pixiv-item'

export default Vue.extend({
  components: {
    ItemWrapper,
    ItemCard,
  },
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
    this.isExcludeR18 = this.$accessor.settings.excludeR18
  },
  methods: {
    getPaginationLimit() {
      return this.$accessor.settings.paginationLimit
    },
    getFilteredItems() {
      return this.items
        .filter((item) => (this.isOnlyNew ? !this.isViewed(item) : true))
        .filter((item) => (this.isExcludeLiked ? !this.isLiked(item) : true))
        .filter((item) => (this.isExcludeR18 ? !this.isR18(item) : true))
    },
    getItems(): PixivItem[] {
      return this.getFilteredItems().slice(
        (this.page - 1) * this.getPaginationLimit(),
        this.page * this.getPaginationLimit()
      )
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
    loadMore(): void {
      this.$emit('load-more')
    },
  },
})
</script>
