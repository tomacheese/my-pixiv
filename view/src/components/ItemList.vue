<!-- eslint-disable vue/no-v-html -->
<template>
  <v-container ref="itemlist">
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <v-pagination
      v-model="page"
      :length="Math.ceil(items.length / 10)"
      class="mt-3"
    ></v-pagination>
    <v-row>
      <v-col v-for="(item, i) in getItems()" :key="i" cols="12">
        <v-card @click="open(item)">
          <div class="d-flex flex-no-wrap justify-space-between">
            <div>
              <v-card-title class="text-h5" v-text="item.title"></v-card-title>

              <v-card-subtitle>
                <div class="grey--text">{{ item.create_date }}</div>
                <v-chip :color="item.is_bookmarked ? 'warning' : ''">
                  <v-icon>mdi-heart</v-icon>
                  {{ item.total_bookmarks }}
                </v-chip>
                <v-chip
                  v-for="tag of item.tags"
                  :key="i + '' + tag.name"
                  :color="getTagColor(item.searchTags, tag.name)"
                  class="ma-1"
                  v-text="tag.name"
                ></v-chip>
              </v-card-subtitle>

              <v-card-text
                style="height: 5.5em; overflow: hidden"
                v-html="item.caption"
              ></v-card-text>
            </div>

            <v-avatar class="ma-3" size="125" tile>
              <v-img :src="item.image_urls.square_medium" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-pagination
      v-model="page"
      :length="Math.ceil(items.length / 10)"
      class="mt-3"
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
    getTagColor(searchTags: string[], tag: string): string {
      if (tag === 'R-18') {
        return 'error'
      }
      return searchTags.includes(tag) ? 'green' : ''
    },
    open(item: PixivItem): void {
      this.$emit('open', item)
    },
    changePage() {
      ;(this.$refs.itemlist as HTMLElement).scrollIntoView()
    },
  },
})
</script>
