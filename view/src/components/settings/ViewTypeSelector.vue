<template>
  <v-container>
    <h2>表示種別</h2>

    <v-row align="center">
      <v-col cols="6">
        <v-subheader> イラスト・マンガ </v-subheader>
      </v-col>
      <v-col cols="6">
        <v-select
          v-model="viewType"
          :items="viewTypes"
          item-text="text"
          item-value="key"
          return-object
          @change="changeViewType"
        ></v-select>
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col cols="6">
        <v-subheader> 小説 </v-subheader>
      </v-col>
      <v-col cols="6">
        <v-select
          v-model="novelViewType"
          :items="viewTypes"
          item-text="text"
          item-value="key"
          return-object
          @change="changeNovelViewType"
        ></v-select>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { ViewType } from '@/store/settings'

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
  data(): {
    viewType: IViewType | null
    novelViewType: IViewType | null
    viewTypes: IViewType[]
  } {
    return {
      viewType: ViewTypeMap[0],
      novelViewType: ViewTypeMap[0],
      viewTypes: ViewTypeMap,
    }
  },
  mounted() {
    const viewType = ViewTypeMap.find(
      (v) => v.key === this.$accessor.settings.viewType
    )
    if (viewType) {
      this.viewType = viewType
    }
    const novelViewType = ViewTypeMap.find(
      (v) => v.key === this.$accessor.settings.novelViewType
    )
    if (novelViewType) {
      this.novelViewType = novelViewType
    }
  },
  methods: {
    changeViewType(): void {
      if (!this.viewType) {
        return
      }
      this.$accessor.settings.setViewType(this.viewType?.key ?? 'PAGINATION')
    },
    changeNovelViewType(): void {
      if (!this.novelViewType) {
        return
      }
      this.$accessor.settings.setNovelViewType(
        this.novelViewType?.key ?? 'PAGINATION'
      )
    },
  },
})
</script>
