<template>
  <v-container>
    <h2>ミュート対象に追加</h2>

    <v-form ref="addForm" class="my-3">
      <div class="my-2">
        <v-select
          v-model="targetType"
          :items="targetTypes"
          item-text="name"
          item-value="key"
          return-object
          label="アイテム種別"
        ></v-select>
        <v-text-field
          v-model="id"
          label="ミュート対象のアイテムID"
          placeholder="例: 1234567890"
          :rules="[(v) => !!v || '必須項目です']"
          @blur="checkUrl()"
        ></v-text-field>
      </div>
      <v-btn color="success" block @click="add()">追加</v-btn>
    </v-form>

    <h2>ミュート対象一覧</h2>

    <v-pagination v-model="page" :length="pageCount" circle></v-pagination>

    <v-list class="my-3">
      <v-list-item v-for="(item, i) of getItems()" :key="i" @click="open(item)">
        <v-list-item-icon>
          <v-icon>{{ getTypeIcon(item.type) }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content v-if="getDetails(item)">
          <v-list-item-title v-if="item.type !== 'USER'" class="wrap-text"
            >{{ getDetails(item, 'title') }}
          </v-list-item-title>
          <v-list-item-title v-else
            >{{ getDetails(item, 'name') }}
          </v-list-item-title>

          <v-list-item-subtitle v-if="item.type !== 'USER'">
            {{ getTypeName(item.type) }} ―
            {{ getDetails(item, 'user').name }}</v-list-item-subtitle
          >
          <v-list-item-subtitle v-else>{{
            getTypeName(item.type)
          }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-content v-else-if="getDetails(item) === undefined">
          <v-list-item-title>読み込み中</v-list-item-title>
          <v-list-item-subtitle>
            {{ getTypeName(item.type) }} ― {{ item.id }}</v-list-item-subtitle
          >
        </v-list-item-content>
        <v-list-item-content v-else>
          <v-list-item-title>読み込み失敗</v-list-item-title>
          <v-list-item-subtitle>
            {{ getTypeName(item.type) }} ― {{ item.id }}</v-list-item-subtitle
          >
        </v-list-item-content>
        <v-list-item-action>
          <v-btn icon @click.stop="remove(item)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>

      <v-list-item v-if="items.length === 0">
        <v-list-item-content>
          <v-list-item-subtitle class="text-center"
            >ミュート対象がありません</v-list-item-subtitle
          >
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-pagination v-model="page" :length="pageCount" circle></v-pagination>

    <v-switch
      v-model="isAutoSyncMutes"
      label="WebSocketを使用したリアルタイムミュート更新"
      @change="onAutoSyncMutesChange"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { PixivItem } from '@/types/pixivItem'
import { MuteItem, MuteTargetType } from '@/store/itemMute'
import { GetIllustResponse } from '@/plugins/websocket/illust'
import { GetNovelResponse } from '@/plugins/websocket/novel'
import { GetUserResponse } from '@/plugins/websocket/user'

const targetsMap: {
  [key in MuteTargetType]: string
} = {
  ILLUST: 'イラスト・マンガ',
  NOVEL: '小説',
  USER: 'ユーザー',
}

export default Vue.extend({
  name: 'MutedItemSettings',
  data(): {
    id: string
    targetType: { key: string; name: string }
    targetTypes: { key: string; name: string }[]
    page: number
    pageCount: number
    items: MuteItem[]
    details: { [key: string]: PixivItem | null }
    isAutoSyncMutes: boolean
  } {
    return {
      id: '',
      targetType: {
        key: 'ILLUST',
        name: 'イラスト・マンガ',
      },
      targetTypes: Object.keys(targetsMap).map((key) => ({
        key,
        name: targetsMap[key as MuteTargetType],
      })),
      page: 1,
      pageCount: 1,
      items: [],
      details: {},
      isAutoSyncMutes: false,
    }
  },
  mounted() {
    this.fetch()

    this.isAutoSyncMutes = this.$accessor.settings.isAutoSyncMutes

    setInterval(() => {
      if (!this.isAutoSyncMutes || !this.$accessor.settings.isAutoSyncMutes) {
        return
      }
      this.fetch()
    }, 1000)
  },
  methods: {
    fetch() {
      this.items = this.$accessor.itemMute.items.map((item) => ({
        ...item,
        detail: undefined,
      }))
    },
    add() {
      if (
        !(
          this.$refs.addForm as unknown as {
            validate: () => boolean
          }
        ).validate()
      ) {
        return
      }
      if (
        this.items.some(
          (item) =>
            item.id === parseInt(this.id) && item.type === this.targetType.key
        )
      ) {
        this.$nuxt.$emit('snackbar', {
          message: `既に追加されています`,
          color: 'error',
        })
        return
      }
      this.$accessor.itemMute.addMute({
        item: {
          type: this.targetType.key as MuteTargetType,
          id: parseInt(this.id),
        },
        isSync: this.$accessor.settings.isAutoSyncMutes,
      })
      this.id = ''
      this.targetType = {
        key: 'ILLUST',
        name: 'イラスト・マンガ',
      }

      this.fetch()
    },
    remove(item: MuteItem) {
      this.$accessor.itemMute.removeMute({
        item,
        isSync: this.$accessor.settings.isAutoSyncMutes,
      })
      this.fetch()
    },
    open(item: MuteItem) {
      switch (item.type) {
        case 'ILLUST':
          window.open(`https://www.pixiv.net/artworks/${item.id}`, '_blank')
          break
        case 'NOVEL':
          window.open(
            `https://www.pixiv.net/novel/show.php?id=${item.id}`,
            '_blank'
          )
          break
        case 'USER':
          window.open(`https://www.pixiv.net/users/${item.id}`, '_blank')
          break
      }
    },
    getDetails(item: MuteItem, key?: keyof PixivItem) {
      const detail = this.details[item.id]
      if (!key) {
        return detail
      }
      if (!detail) {
        return undefined
      }
      return detail[key]
    },
    getItems(): MuteItem[] {
      const items = this.items.slice((this.page - 1) * 10, this.page * 10)
      for (const item of items) {
        const detail = this.details[item.id]
        if (detail !== undefined || detail === null) {
          continue
        }
        const apiMethod = this.getApiMethod(item.type)
        apiMethod
          .get(item.id)
          .then(
            (res: GetIllustResponse | GetNovelResponse | GetUserResponse) => {
              this.details[item.id] = res.item
            }
          )
          .catch((err) => {
            this.items = this.items.map((i) => {
              if (i.id === item.id) {
                this.details[i.id] = null
              }
              return i
            })
            console.error(err)
          })
      }
      return items
    },
    getApiMethod(type: MuteTargetType) {
      switch (type) {
        case 'ILLUST':
          return this.$api.illust
        case 'NOVEL':
          return this.$api.novel
        case 'USER':
          return this.$api.user
      }
    },
    getTypeName(type: MuteTargetType): string {
      return targetsMap[type]
    },
    getTypeIcon(type: MuteTargetType): string {
      switch (type) {
        case 'ILLUST':
          return 'mdi-image'
        case 'NOVEL':
          return 'mdi-book-open-page-variant'
        case 'USER':
          return 'mdi-account'
      }
    },
    checkUrl() {
      const illustUrlRegex = /https:\/\/www\.pixiv\.net\/artworks\/(\d+)/
      const novelUrlRegex =
        /https:\/\/www\.pixiv\.net\/novel\/show\.php\?id=(\d+)/
      const userUrlRegex = /https:\/\/www\.pixiv\.net\/users\/(\d+)/
      const illustUrlMatch = illustUrlRegex.exec(this.id)
      const novelUrlMatch = novelUrlRegex.exec(this.id)
      const userUrlMatch = userUrlRegex.exec(this.id)
      if (illustUrlMatch) {
        this.targetType = {
          key: 'ILLUST',
          name: 'イラスト・マンガ',
        }
        this.id = illustUrlMatch[1]
      } else if (novelUrlMatch) {
        this.targetType = {
          key: 'NOVEL',
          name: '小説',
        }
        this.id = novelUrlMatch[1]
      } else if (userUrlMatch) {
        this.targetType = {
          key: 'USER',
          name: 'ユーザー',
        }
        this.id = userUrlMatch[1]
      }
    },
    onAutoSyncMutesChange(val: boolean) {
      if (
        !confirm(
          `リアルタイムミュート更新を${
            val ? '有効' : '無効'
          }にしますか？\n「はい」をクリックすると、ページが再読み込みされます。`
        )
      ) {
        this.$nextTick(() => {
          this.isAutoSyncMutes = !val
        })
        return
      }
      this.$accessor.settings.setAutoSyncMutes(val)
      this.$nextTick(() => {
        location.reload()
      })
    },
  },
})
</script>
