<template>
  <div>
    <v-tabs
      v-model="selected"
      fixed-tabs
      color="orange"
      :class="{ 'sticky-later-header': isHeaderSticky }"
    >
      <v-tab v-for="t of types" :key="t.value">
        <v-badge :content="getCount(t.value)" :value="getCount(t.value)">
          {{ t.name }}
        </v-badge>
      </v-tab>
    </v-tabs>
    <v-container fluid>
      <v-text-field
        v-model="url"
        class="mx-2"
        append-outer-icon="mdi-plus"
        filled
        label="URL"
        type="text"
        hide-details
        dense
        :loading="loading"
        @click:append-outer="addUrl"
      ></v-text-field>
      <IllustList
        v-if="types[selected].value === 'ILLUST'"
        target-type="ILLUST"
        :later="true"
      />
      <NovelList
        v-else-if="types[selected].value === 'NOVEL'"
        target-type="NOVEL"
        :later="true"
      />
    </v-container>
    <v-snackbar v-model="isSnackbar" :timeout="3000" :color="snackbarColor">
      <v-icon>{{
        snackbarColor === 'success' ? 'mdi-check' : 'mdi-alert'
      }}</v-icon>
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { TargetType } from '@/store/settings'
import IllustList from '@/components/items/illusts/IllustList.vue'
import NovelList from '@/components/items/novels/NovelList.vue'
import { isPixivIllustItem, isPixivNovelItem } from '@/types/pixiv-item'

export default Vue.extend({
  name: 'LaterPage',
  components: {
    IllustList,
    NovelList,
  },
  data(): {
    selected: number
    types: { name: string; value: TargetType }[]
    url: string
    loading: boolean
    isSnackbar: boolean
    snackbarMessage: string
    snackbarColor: string
  } {
    return {
      selected: 0,
      types: [
        {
          name: 'イラスト',
          value: 'ILLUST',
        },
        {
          name: '小説',
          value: 'NOVEL',
        },
      ],
      url: '',
      loading: false,
      isSnackbar: false,
      snackbarMessage: '',
      snackbarColor: '',
    }
  },
  computed: {
    isHeaderSticky(): boolean {
      return this.$accessor.settings.headerSticky
    },
  },
  methods: {
    getCount(type: TargetType): number {
      return this.$accessor.settings.later.filter((item) =>
        type === 'ILLUST' ? isPixivIllustItem(item) : isPixivNovelItem(item)
      ).length
    },
    addUrl(): void {
      if (this.loading) {
        return
      }
      this.loading = true
      const illustRegex = /https:\/\/www\.pixiv\.net\/artworks\/(\d+)/
      const novelRegex = /https:\/\/www\.pixiv\.net\/novel\/show\.php\?id=(\d+)/
      const illustMatch = this.url.match(illustRegex)
      const novelMatch = this.url.match(novelRegex)
      if (illustMatch) {
        this.$api.illust
          .get(Number.parseInt(illustMatch[1]))
          .then((item) => {
            if (
              this.$accessor.settings.later.some(
                (laterItem) =>
                  laterItem.id === item.data.id && isPixivIllustItem(laterItem)
              )
            ) {
              this.snackbarMessage = `イラスト「${item.data.title}」は既に追加されています`
              this.snackbarColor = 'error'
              return
            }
            this.$accessor.settings.addLater(item.data)
            this.snackbarMessage = `イラスト「${item.data.title}」を追加しました`
            this.snackbarColor = 'success'
          })
          .catch((error) => {
            this.snackbarMessage = `イラストの追加に失敗: ${error.message}`
            this.snackbarColor = 'error'
          })
          .finally(() => {
            this.isSnackbar = true
            this.loading = false
          })
      } else if (novelMatch) {
        this.$api.novel
          .get(Number.parseInt(novelMatch[1]))
          .then((item) => {
            if (
              this.$accessor.settings.later.some(
                (laterItem) =>
                  laterItem.id === item.data.id && isPixivNovelItem(laterItem)
              )
            ) {
              this.snackbarMessage = `小説「${item.data.title}」は既に追加されています`
              this.snackbarColor = 'error'
              return
            }
            this.$accessor.settings.addLater(item.data)
            this.snackbarMessage = `小説「${item.data.title}」を追加しました`
            this.snackbarColor = 'success'
          })
          .catch((error) => {
            this.snackbarMessage = `小説の追加に失敗: ${error.message}`
            this.snackbarColor = 'error'
          })
          .finally(() => {
            this.isSnackbar = true
            this.loading = false
          })
      } else {
        this.snackbarMessage = 'URLが正しくありません'
        this.snackbarColor = 'error'
        this.isSnackbar = true
        this.loading = false
      }
      this.url = ''
    },
  },
})
</script>

<style>
.sticky-later-header {
  position: sticky;
  top: 48px;
  z-index: 5;
}
</style>
