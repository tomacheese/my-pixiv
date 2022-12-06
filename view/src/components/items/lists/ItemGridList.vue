<template>
  <div>
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
    <v-card v-if="getItems().length === 0 && !loading">
      <v-card-title>該当するアイテムはありません。</v-card-title>
    </v-card>
    <MagicGrid ref="magic-grid" :animate="true" :use-min="true" :gap="10">
      <ItemWrapper
        v-for="item of getItems()"
        :key="item.id"
        :item="item"
        :loading="loading"
        @intersect="onItemViewing"
      >
        <ItemLongPress :item="item">
          <v-badge
            overlap
            :content="'NEW'"
            offset-x="30"
            :value="vieweds !== undefined && !isViewed(item)"
          >
            <v-card @click="open(item)">
              <v-img
                width="240px"
                :height="calcHeight(item)"
                :src="item.image_urls.medium"
                class="white--text align-end"
                gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              >
                <v-card-title>{{ item.title }}</v-card-title>
                <template #placeholder>
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                  >
                    <v-progress-circular
                      indeterminate
                      color="grey lighten-5"
                    ></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </v-card>
          </v-badge>
        </ItemLongPress>
      </ItemWrapper>
    </MagicGrid>
    <v-btn
      v-if="isLoadMoreAvailable"
      block
      large
      class="my-5"
      :loading="loading"
      @click="loadMore()"
      >さらに読み込む</v-btn
    >
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { isPixivNovelItem, PixivItem } from '@/types/pixivItem'
import MagicGrid from '@/components/utils/MagicGrid.vue'
import ItemWrapper from '@/components/items/ItemWrapper.vue'
import ItemLongPress from '@/components/items/ItemLongPress.vue'

export default Vue.extend({
  components: { MagicGrid, ItemWrapper, ItemLongPress },
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
      required: false,
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
      this.$nextTick(() => {
        ;(this.$refs['magic-grid'] as any).update()
      })
    },
    isExcludeLiked() {
      this.$accessor.settings.setExcludeLiked(this.isExcludeLiked)
    },
    isExcludeR18() {
      this.$accessor.settings.setExcludeR18(this.isExcludeR18)
    },
    items() {
      this.$nextTick(() => {
        ;(this.$refs['magic-grid'] as any).update()
      })
    },
    loading(value: boolean) {
      if (value) {
        return
      }
      this.$nextTick(() => {
        ;(this.$refs['magic-grid'] as any).update()
      })
    },
  },
  mounted() {
    this.isOnlyNew = this.$accessor.settings.onlyNew
    this.isExcludeLiked = this.$accessor.settings.excludeLiked
    this.isExcludeR18 = this.$accessor.settings.excludeR18
  },
  methods: {
    getItems(): PixivItem[] {
      return this.items
        .filter((item) => (this.isOnlyNew ? !this.isViewed(item) : true))
        .filter((item) => (this.isExcludeLiked ? !this.isLiked(item) : true))
        .filter((item) => (this.isExcludeR18 ? !this.isR18(item) : true))
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
    calcHeight(item: PixivItem): string {
      if (isPixivNovelItem(item)) return '338px'
      return `${(item.height / item.width) * 240}px`
    },
    loadMore(): void {
      this.$emit('load-more')
    },
  },
})
</script>
