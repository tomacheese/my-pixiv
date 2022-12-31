<template>
  <div>
    <h2 class="my-3">表示種別</h2>
    <p>
      技術的な問題により、バーチャルスクロールを選んだ場合はおすすめタブで「さらに読み込む」ボタンを利用できません。
    </p>
    <v-list>
      <v-menu v-for="(item, i) in items" :key="i" offset-y>
        <template #activator="{ on, attrs }">
          <v-list-item v-bind="attrs" v-on="on">
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.text }}</v-list-item-title>

              <v-list-item-subtitle>
                <b>{{ getViewType(item.key)?.text }}</b>
                を選択しています。ここをクリックして変更
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </template>
        <v-list>
          <v-list-item
            v-for="(viewType, v) in viewTypes"
            :key="v"
            @click="changeViewType(item.key, viewType)"
          >
            <v-list-item-title>{{ viewType.text }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-list>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ViewType } from '@/store/settings'

type ItemType = 'ILLUST' | 'NOVEL'

const items: {
  key: ItemType
  icon: `mdi-${string}`
  text: string
}[] = [
  {
    key: 'ILLUST',
    icon: 'mdi-image',
    text: 'イラスト・マンガ',
  },
  {
    key: 'NOVEL',
    icon: 'mdi-text',
    text: '小説',
  },
]

type IViewType = {
  key: ViewType
  text: string
}

const ViewTypeMap: IViewType[] = [
  {
    key: 'PAGINATION',
    text: 'ページネーション',
  },
  {
    key: 'VIRTUAL_SCROLL',
    text: 'バーチャルスクロール',
  },
  {
    key: 'GRID_LIST',
    text: 'グリッドリスト',
  },
]

export default Vue.extend({
  name: 'ViewTypeSelectSetting',
  computed: {
    viewTypes(): IViewType[] {
      return ViewTypeMap
    },
    items() {
      return items
    },
  },
  methods: {
    getViewType(key: ItemType): IViewType | undefined {
      switch (key) {
        case 'ILLUST': {
          return ViewTypeMap.find(
            (v) => v.key === this.$accessor.settings.viewType
          )
        }
        case 'NOVEL': {
          return ViewTypeMap.find(
            (v) => v.key === this.$accessor.settings.novelViewType
          )
        }
      }
    },
    changeViewType(key: ItemType, viewType: IViewType) {
      switch (key) {
        case 'ILLUST': {
          this.$accessor.settings.setViewType(viewType.key)
          break
        }
        case 'NOVEL': {
          this.$accessor.settings.setNovelViewType(viewType.key)
          break
        }
      }
    },
  },
})
</script>
