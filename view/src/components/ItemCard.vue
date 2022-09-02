<!-- eslint-disable vue/no-v-html -->
<template>
  <v-card :id="observName" @click="open(item)">
    <div
      class="d-flex flex-no-wrap justify-space-between"
      style="height: 200px"
    >
      <div>
        <v-card-title class="text-h5" v-text="item.title"></v-card-title>

        <v-card-subtitle>
          <div class="grey--text">{{ item.create_date }}</div>
          <div class="item-card-tags hidden-scrollbar">
            <v-chip :color="item.is_bookmarked ? 'warning' : ''">
              <v-icon>mdi-heart</v-icon>
              {{ item.total_bookmarks }}
            </v-chip>
            <v-chip
              v-for="tag of item.tags"
              :key="item.id + '-' + tag.name"
              :color="getTagColor(item.searchTags, tag.name)"
              class="ma-1"
              v-text="tag.name"
            ></v-chip>
          </div>
        </v-card-subtitle>

        <v-card-text
          style="height: 5.2em; overflow-y: scroll"
          class="hidden-scrollbar"
          v-html="item.caption"
        ></v-card-text>
      </div>

      <v-badge overlap :content="'NEW'" offset-x="30" :value="isViewed">
        <v-avatar class="ma-3" size="125" tile>
          <v-img :src="item.image_urls.square_medium" />
        </v-avatar>
      </v-badge>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { PixivItem } from '@/types/pixivItem'
export default Vue.extend({
  props: {
    item: {
      type: Object as () => PixivItem,
      required: true,
    },
    isViewed: {
      type: Boolean,
      required: true,
    },
  },
  data(): {
    observName: string
    isIntersecting: boolean
  } {
    return {
      observName: '',
      isIntersecting: false,
    }
  },
  watch: {
    item() {
      const element = document.getElementById(this.observName)
      if (!element) {
        return
      }
      if (this.isViewing(element)) {
        this.$emit('intersect', this.item)
      }
    },
    isIntersecting(value: boolean) {
      if (value) {
        this.$emit('intersect', this.item)
      }
    },
  },
  created() {
    this.observName = this.item.id.toString()
  },
  mounted() {
    if (!window) {
      return
    }
    const element = document.getElementById(this.observName)
    if (!element) {
      return
    }
    if (this.isViewing(element)) {
      this.$emit('intersect', this.item)
    }
    const handler = (entries: { isIntersecting: boolean }[]) => {
      this.isIntersecting = entries[0].isIntersecting
    }
    const observer = new window.IntersectionObserver(handler, {
      threshold: 1.0,
    })
    observer.observe(element)
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
    isViewing(element: Element) {
      const rect = element.getBoundingClientRect()
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      )
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
