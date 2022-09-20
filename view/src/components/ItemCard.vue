<!-- eslint-disable vue/no-v-html -->
<template>
  <v-card @click="open(item)">
    <div
      class="d-flex flex-no-wrap justify-space-between"
      style="height: 200px"
    >
      <div>
        <v-card-title class="text-h5">{{ item.title }}</v-card-title>

        <v-card-subtitle>
          <div class="grey--text">{{ item.create_date }}</div>
          <div class="item-card-tags hidden-scrollbar">
            <v-chip :color="item.is_bookmarked ? 'warning' : ''">
              <v-icon>mdi-heart</v-icon>
              {{ item.total_bookmarks }}
            </v-chip>
            <v-chip v-if="item.text_length">
              <v-icon>mdi-format-text</v-icon>
              {{ item.text_length }}
            </v-chip>
            <v-chip
              v-for="tag of item.tags"
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
          >{{ item.caption }}</v-card-text
        >
      </div>

      <v-badge overlap :content="'NEW'" offset-x="30" :value="isViewed">
        <v-avatar
          class="ma-3"
          size="125"
          tile
          :class="{ 'hidden-md-and-down': !item.type }"
        >
          <v-img :src="item.image_urls.square_medium" />
        </v-avatar>
      </v-badge>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { PixivItem, PixivItemWithSearchTag } from '@/types/pixivItem'
export default Vue.extend({
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
      alert('コピーしました。')
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
</style>
