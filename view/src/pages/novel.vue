<!-- eslint-disable vue/no-v-html -->
<template>
  <v-container>
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <v-pagination
      v-model="page"
      :length="Math.ceil(items.length / 10)"
      :total-visible="10"
      class="mt-3"
    ></v-pagination>
    <v-row>
      <v-col v-for="(item, i) in getItems()" :key="i" cols="12">
        <v-card v-if="!isFilter(item)" @click="open(i)">
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
                  :color="getTagColor(item.searchTag, tag.name)"
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
      :total-visible="10"
      class="mt-3"
    ></v-pagination>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { PixivItem } from '@/types/pixivItem'

export default Vue.extend({
  name: 'IllustPage',
  data(): {
    items: PixivItem[]
    page: number
    dialogPage: number
    overlay: {
      isOpened: boolean
      target: PixivItem | null
    }
    loading: boolean
  } {
    return {
      items: [],
      page: 1,
      dialogPage: 1,
      overlay: {
        isOpened: false,
        target: null,
      },
      loading: false,
    }
  },
  async created() {
    await this.fetch()
  },
  methods: {
    async fetch() {
      this.loading = true
      const promises = []
      for (const target of this.$accessor.settings.targets.filter((target) =>
        target.targetType.includes('NOVEL')
      )) {
        promises.push(
          new Promise<void>((resolve) => {
            this.fetchNovels(target.tag.join(' ')).then((items) => {
              const results = items
                .filter((item: PixivItem) => {
                  if (target.ignores.length === 0) {
                    return true
                  }
                  return target.ignores.some(
                    (ignore) =>
                      !item.title.includes(ignore) &&
                      !item.caption.includes(ignore) &&
                      !item.tags.some((tag) => tag.name === ignore)
                  )
                })
                .filter(
                  (item: PixivItem) =>
                    item.total_bookmarks >= target.minLikeCount
                )
                .map((item) => {
                  return {
                    ...item,
                    searchTag: target.tag,
                  }
                })
              this.items = [...this.items, ...results].sort(
                (a, b) =>
                  new Date(b.create_date).getTime() -
                  new Date(a.create_date).getTime()
              )
              resolve()
            })
          })
        )
        await Promise.all(promises).finally(() => {
          this.loading = false
        })
      }
    },
    async fetchNovels(str: string): Promise<PixivItem[]> {
      const res = await this.$axios.get(`/api/novels/` + str).catch((err) => {
        alert(`Error: ${err}`)
        return null
      })
      if (res === null) {
        return []
      }
      const data = res.data

      for (const item of data) {
        item.image_urls.large =
          this.$config.baseURL + 'api/images?url=' + item.image_urls.large
        item.image_urls.medium =
          this.$config.baseURL + 'api/images?url=' + item.image_urls.medium
        item.image_urls.square_medium =
          this.$config.baseURL +
          'api/images?url=' +
          item.image_urls.square_medium
      }
      return data
    },
    getItems(): PixivItem[] {
      return this.items.slice((this.page - 1) * 10, this.page * 10)
    },
    open(i: number) {
      if (!window) {
        return
      }
      this.overlay.isOpened = false
      window.open(
        `https://www.pixiv.net/novel/show.php?id=${this.getItems()[i].id}`,
        '_blank'
      )
    },
    isFilter(item: PixivItem) {
      return this.$accessor.settings.filters.some((filter) => {
        if (filter.type === 'TITLE') {
          return item.title.includes(filter.value)
        } else if (filter.type === 'TAG') {
          return item.tags.some((tag) => tag.name.includes(filter.value))
        }
        return false
      })
    },
    getTagColor(searchTag: string[], tag: string) {
      if (tag === 'R-18') {
        return 'error'
      }
      return searchTag.includes(tag) ? 'green' : ''
    },
  },
})
</script>
