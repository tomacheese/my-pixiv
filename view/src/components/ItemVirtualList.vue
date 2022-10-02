<template>
  <v-container>
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <v-switch
      v-if="vieweds !== undefined"
      v-model="isOnlyNew"
      label="New のみ表示"
    ></v-switch>
    <v-row>
      <v-col v-if="getItems.length === 0 && !loading" cols="12">
        <v-card>
          <v-card-title>該当するアイテムはありません。</v-card-title>
        </v-card>
      </v-col>
      <v-virtual-scroll
        v-if="getItems.length > 0"
        :bench="10"
        :items="getItems"
        item-height="210"
        style="overflow-y: hidden"
      >
        <template #default="{ item }">
          <v-col cols="12">
            <ItemWrapper :item="item" @intersect="onItemViewing">
              <ItemCard
                :item="item"
                :is-viewed="vieweds !== undefined && !isViewed(item)"
                @open="open"
                @intersect="onItemViewing"
                @add-mute="addMute"
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
  } {
    return {
      page: 1,
      isOnlyNew: false,
    }
  },
  computed: {
    getItems(): PixivItem[] {
      return this.items.filter((item) =>
        this.isOnlyNew ? !this.isViewed(item) : true
      )
    },
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
    addMute(item: PixivItem): void {
      this.$emit('add-mute', item)
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
