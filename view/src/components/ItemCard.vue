<!-- eslint-disable vue/no-v-html -->
<template>
  <ItemMuting :item="item">
    <v-card class="disable-tap-expand" @click="open(item)">
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
                @click.stop="copyToClipboard(tag.name)"
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
            <v-img :src="item.image_urls.square_medium">
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
  </ItemMuting>
</template>

<script lang="ts">
import Vue from 'vue'
import ItemMuting from './ItemMuting.vue'
import {
  isPixivNovelItem,
  PixivItem,
  PixivItemWithSearchTag,
} from '@/types/pixivItem'

export default Vue.extend({
  components: { ItemMuting },
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
    tags(): PixivItem['tags'] {
      const tag = this.item.tags
      return [
        tag.some((t) => t.name === 'R-18') ? { name: 'R-18' } : null,
        ...tag.filter((t) => t.name !== 'R-18'),
      ].filter((t) => t) as PixivItem['tags']
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
    copyToClipboard(text: string) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()

      this.$nuxt.$emit('snackbar', {
        message: `コピーしました。`,
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
.disable-tap-expand {
  touch-action: manipulation;
}

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
