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
    <v-dialog v-model="overlay.isOpened">
      <v-card v-if="overlay.target">
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn icon @click="addHeart()">
            <v-icon>mdi-heart</v-icon>
          </v-btn>

          <v-btn icon @click="openPage(overlay.target)">
            <v-icon>mdi-details</v-icon>
          </v-btn>

          <v-btn icon @click="overlay.isOpened = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
        <v-card-text>
          <v-pagination
            v-model="dialogPage"
            :length="
              overlay.target.meta_pages.length === 0
                ? 1
                : overlay.target.meta_pages.length
            "
            class="mt-3"
          ></v-pagination>
          <div class="text-center">
            <img :src="getImage(overlay.target)" style="overflow: scroll" />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn icon @click="addHeart()">
            <v-icon>mdi-heart</v-icon>
          </v-btn>

          <v-btn icon @click="openPage(overlay.target)">
            <v-icon>mdi-details</v-icon>
          </v-btn>

          <v-btn icon @click="overlay.isOpened = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
        target.targetType.includes('ILLUST')
      )) {
        promises.push(
          new Promise<void>((resolve) => {
            this.fetchIllusts(target.tag.join(' ')).then((items) => {
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
    async fetchIllusts(str: string): Promise<PixivItem[]> {
      const res = await this.$axios.get(`/api/illusts/` + str).catch((err) => {
        alert(`[fetchIllusts|${str}] Error: ${err}`)
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
        for (const metaPage of item.meta_pages) {
          metaPage.image_urls.large =
            this.$config.baseURL + 'api/images?url=' + metaPage.image_urls.large
          metaPage.image_urls.medium =
            this.$config.baseURL +
            'api/images?url=' +
            metaPage.image_urls.medium
          metaPage.image_urls.square_medium =
            this.$config.baseURL +
            'api/images?url=' +
            metaPage.image_urls.square_medium
        }
      }
      return data
    },
    getItems(): PixivItem[] {
      return this.items.slice((this.page - 1) * 10, this.page * 10)
    },
    open(i: number) {
      this.overlay.isOpened = true
      this.overlay.target = this.getItems()[i]
      this.dialogPage = 1
    },
    openPage(item: PixivItem) {
      if (!window) {
        return
      }
      this.overlay.isOpened = false
      window.open(`https://www.pixiv.net/artworks/${item.id}`, '_blank')
    },
    getImage(item: PixivItem): string {
      if (item.meta_pages.length === 0) {
        return item.image_urls.large
      }
      return item.meta_pages[this.dialogPage - 1].image_urls.large
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
