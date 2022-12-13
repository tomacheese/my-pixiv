<!-- eslint-disable vue/no-v-html -->
<template>
  <ItemLongPress :item="item">
    <v-card @click="open(item)">
      <div
        class="d-flex flex-no-wrap justify-space-between"
        style="min-height: 200px"
      >
        <div class="wrap-text">
          <v-card-title class="text-h5">{{ item.title }}</v-card-title>

          <v-card-subtitle>
            <div class="grey--text">{{ item.create_date }}</div>
            <div class="item-card-tags hidden-scrollbar">
              <v-chip :color="item.is_bookmarked ? 'warning' : ''">
                <v-icon>mdi-heart</v-icon>
                {{ item.total_bookmarks }}
              </v-chip>
              <v-chip v-if="isPixivNovelItem(item)">
                <v-icon>mdi-format-text</v-icon>
                {{ getTextLength(item) }}
              </v-chip>
              <v-chip
                v-for="tag of tags"
                :key="item.id + '-' + tag.name"
                :color="getTagColor(item.searchTags, tag.name)"
                class="ma-1"
                @click.stop="addMuteTag(tag.name)"
                >{{ tag.name }}</v-chip
              >
            </div>
          </v-card-subtitle>

          <v-card-text
            style="height: 5.2em; overflow-y: scroll"
            class="hidden-scrollbar"
            ><span v-html="item.caption"></span
          ></v-card-text>
        </div>

        <v-badge overlap :content="'NEW'" offset-x="30" :value="isViewed">
          <v-avatar
            class="ma-3"
            size="125"
            tile
            :class="{ 'hidden-md-and-down': isPixivNovelItem(item) }"
          >
            <v-img :src="imageUrl">
              <template #placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular
                    indeterminate
                    color="grey lighten-5"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>
          </v-avatar>
        </v-badge>
      </div>
    </v-card>
  </ItemLongPress>
</template>

<script lang="ts">
import { filterNull } from 'my-pixiv-types'
import Vue from 'vue'
import ItemLongPress from './ItemLongPress.vue'
import {
  isPixivNovelItem,
  PixivItem,
  PixivItemWithSearchTag,
} from '@/types/pixiv-item'

export default Vue.extend({
  components: { ItemLongPress },
  props: {
    item: {
      type: Object as () => PixivItemWithSearchTag,
      required: true,
    },
    isViewed: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    imageUrl(): string {
      const size =
        this.$accessor.settings.imageSizes.illustList ?? 'square_medium'
      return this.item.image_urls[size] ?? ''
    },
    tags(): PixivItem['tags'] {
      const tag = this.item.tags
      return filterNull([
        tag.some((t) => t.name === 'R-18')
          ? { name: 'R-18', translated_name: null }
          : null,
        ...tag.filter((t) => t.name !== 'R-18'),
      ])
    },
  },
  methods: {
    getTagColor(searchTags: string[], tag: string): string {
      if (tag === 'R-18') {
        return 'error'
      }
      return searchTags && searchTags.includes(tag) ? 'green' : ''
    },
    open(item: PixivItem): void {
      this.$emit('open', item)
    },
    addMuteTag(text: string) {
      if (!confirm(`「${text}」をミュートタグに追加しますか？`)) {
        return
      }
      if (
        this.$accessor.settings.isFiltered({
          type: 'TAG',
          value: text,
        })
      ) {
        this.$nuxt.$emit('snackbar', {
          message: `「${text}」は既にミュートタグに追加されています`,
          color: 'error',
        })
        return
      }
      this.$accessor.settings.addFilter({
        type: 'TAG',
        value: text,
      })
      this.$nuxt.$emit('snackbar', {
        message: `「${text}」をミュートタグに追加しました。`,
        color: 'success',
      })
    },
    isPixivNovelItem(item: PixivItem): boolean {
      return isPixivNovelItem(item)
    },
    getTextLength(item: PixivItem): number {
      if (!isPixivNovelItem(item)) {
        return 0
      }
      return item.text_length
    },
  },
})
</script>

<style scoped>
.item-card-tags {
  height: 37px;
  overflow-y: scroll;
}

.hidden-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.hidden-scrollbar::-webkit-scrollbar {
  display: none;
}

.wrap-text {
  word-break: break-all;
  white-space: normal;
}
</style>
