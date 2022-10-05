<template>
  <v-container>
    <h2>アイテムミュート設定</h2>

    <v-btn color="success" block class="ma-3" @click="isOpen = true"
      >設定を開く</v-btn
    >

    <v-dialog v-model="isOpen" fullscreen transition="dialog-bottom-transition">
      <v-card v-if="isOpen">
        <v-toolbar flat dark color="primary">
          <v-btn icon dark @click="isOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>ミュート設定</v-toolbar-title>
        </v-toolbar>

        <v-card-title>ミュート対象に追加</v-card-title>

        <v-card-text>
          <v-form ref="addForm">
            <v-select
              v-model="targetType"
              :items="targetTypes"
              item-text="name"
              item-value="key"
              return-object
              label="アイテム種別"
            ></v-select>
            <v-text-field
              v-model="targetId"
              label="ミュート対象のアイテムID"
              placeholder="例: 1234567890"
              :rules="[(v) => !!v || '必須項目です']"
              @blur="checkUrl()"
            ></v-text-field>
            <v-btn color="success" block @click="add()">追加</v-btn>
          </v-form>
        </v-card-text>

        <v-card-title>ミュート対象一覧</v-card-title>

        <v-card-text>
          <v-pagination
            v-model="page"
            :length="pageCount"
            circle
          ></v-pagination>

          <v-list>
            <v-list-item
              v-for="(item, i) of getItems()"
              :key="i"
              @click="open(item)"
            >
              <v-list-item-icon>
                <v-icon>{{ getTypeIcon(item.targetType) }}</v-icon>
              </v-list-item-icon>

              <v-list-item-content v-if="item.detail">
                <v-list-item-title v-if="item.targetType !== 'USER'"
                  >{{ item.detail.title }}
                </v-list-item-title>
                <v-list-item-title v-else
                  >{{ item.detail.name }}
                </v-list-item-title>

                <v-list-item-subtitle v-if="item.targetType !== 'USER'">
                  {{ getTypeName(item.targetType) }} ―
                  {{ item.detail.user.name }}</v-list-item-subtitle
                >
                <v-list-item-subtitle v-else>
                  {{ item.detail.id }}</v-list-item-subtitle
                >
              </v-list-item-content>
              <v-list-item-content v-else-if="item.detail === undefined">
                <v-list-item-title>読み込み中</v-list-item-title>
                <v-list-item-subtitle>
                  {{ getTypeName(item.targetType) }} ―
                  {{ item.targetId }}</v-list-item-subtitle
                >
              </v-list-item-content>
              <v-list-item-content v-else>
                <v-list-item-title>読み込み失敗</v-list-item-title>
                <v-list-item-subtitle>
                  {{ getTypeName(item.targetType) }} ―
                  {{ item.targetId }}</v-list-item-subtitle
                >
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon @click.stop="remove(item)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>

          <v-pagination
            v-model="page"
            :length="pageCount"
            circle
          ></v-pagination>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { PixivItem } from '@/types/pixivItem'
import { MuteItem, MuteTargetType } from '@/store/settings'

const targetsMap: {
  [key in MuteTargetType]: string
} = {
  ILLUST: 'イラスト・マンガ',
  NOVEL: '小説',
  USER: 'ユーザー',
}

type Item = MuteItem & {
  detail?: PixivItem | null
}

export default Vue.extend({
  name: 'MutedItemSettings',
  data(): {
    isOpen: boolean
    targetId: string
    targetType: { key: string; name: string }
    targetTypes: { key: string; name: string }[]
    page: number
    pageCount: number
    items: Item[]
  } {
    return {
      isOpen: false,
      targetId: '',
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
    }
  },
  mounted() {
    this.fetch()
  },
  methods: {
    fetch() {
      this.items = this.$accessor.settings.muted
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
            item.targetId === parseInt(this.targetId) &&
            item.targetType === this.targetType.key
        )
      ) {
        alert('既に追加されています')
        return
      }
      this.$accessor.settings.addMuteItem({
        targetType: this.targetType.key as MuteTargetType,
        targetId: parseInt(this.targetId),
      })
      this.targetId = ''
      this.targetType = {
        key: 'ILLUST',
        name: 'イラスト・マンガ',
      }

      this.fetch()
    },
    remove(item: Item) {
      this.$accessor.settings.removeMuteItem(item)
      this.fetch()
    },
    open(item: Item) {
      switch (item.targetType) {
        case 'ILLUST':
          window.open(
            `https://www.pixiv.net/artworks/${item.targetId}`,
            '_blank'
          )
          break
        case 'NOVEL':
          window.open(
            `https://www.pixiv.net/novel/show.php?id=${item.targetId}`,
            '_blank'
          )
          break
        case 'USER':
          window.open(`https://www.pixiv.net/users/${item.targetId}`, '_blank')
          break
      }
    },
    getItems(): Item[] {
      const items = this.items.slice((this.page - 1) * 10, this.page * 10)
      for (const item of items) {
        if (item.detail !== undefined || item.detail === null) {
          continue
        }
        this.$axios
          .get(`/api/${item.targetType.toLocaleLowerCase()}/${item.targetId}`)
          .then((res) => {
            this.items = this.items.map((i) =>
              i.targetId === item.targetId ? { ...i, detail: res.data } : i
            )
          })
          .catch((err) => {
            this.items = this.items.map((i) => {
              if (i.targetId === item.targetId) {
                i.detail = null
              }
              return i
            })
            console.error(err)
          })
      }
      return items
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
      const illustUrlMatch = illustUrlRegex.exec(this.targetId)
      const novelUrlMatch = novelUrlRegex.exec(this.targetId)
      const userUrlMatch = userUrlRegex.exec(this.targetId)
      if (illustUrlMatch) {
        this.targetType = {
          key: 'ILLUST',
          name: 'イラスト・マンガ',
        }
        this.targetId = illustUrlMatch[1]
      } else if (novelUrlMatch) {
        this.targetType = {
          key: 'NOVEL',
          name: '小説',
        }
        this.targetId = novelUrlMatch[1]
      } else if (userUrlMatch) {
        this.targetType = {
          key: 'USER',
          name: 'ユーザー',
        }
        this.targetId = userUrlMatch[1]
      }
    },
  },
})
</script>
