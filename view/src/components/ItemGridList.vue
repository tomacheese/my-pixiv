<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <v-switch
      v-if="vieweds !== undefined"
      v-model="isOnlyNew"
      label="New のみ表示"
    ></v-switch>
    <v-card v-if="getItems.length === 0 && !loading">
      <v-card-title>該当するアイテムはありません。</v-card-title>
    </v-card>
    <MagicGrid ref="magic-grid" :animate="true" :use-min="true" :gap="10">
      <ItemWrapper
        v-for="item of getItems"
        :key="item.id"
        :item="item"
        @intersect="onItemViewing"
      >
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
              <v-card-title v-text="item.title"></v-card-title>
            </v-img>
          </v-card>
        </v-badge>
      </ItemWrapper>
    </MagicGrid>
    <v-btn
      v-if="isLoadMoreAvailable"
      block
      large
      class="my-5"
      @click="loadMore()"
      >さらに読み込む</v-btn
    >
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import MagicGrid from './MagicGrid.vue'
import { PixivItem } from '@/types/pixivItem'
export default Vue.extend({
  components: { MagicGrid },
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
      this.$nextTick(() => {
        ;(this.$refs['magic-grid'] as any).update()
      })
    },
    items() {
      this.$nextTick(() => {
        ;(this.$refs['magic-grid'] as any).update()
      })
    },
  },
  mounted() {
    this.isOnlyNew = this.$accessor.settings.onlyNew
  },
  methods: {
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
    calcHeight(item: PixivItem): string {
      if (item.height === undefined) return '338px'
      return `${(item.height / item.width) * 240}px`
    },
    loadMore(): void {
      this.$emit('load-more')
    },
  },
})
</script>
