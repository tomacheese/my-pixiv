<template>
  <v-container>
    <h2>表示種別</h2>
    <v-select
      v-model="viewType"
      :items="viewTypes"
      item-text="text"
      item-value="key"
      return-object
      @change="changeViewType"
    ></v-select>
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
]

export default Vue.extend({
  name: 'ViewTypeSelectSetting',
  data(): {
    viewType: IViewType | null
    viewTypes: IViewType[]
  } {
    return {
      viewType: ViewTypeMap[0],
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
  },
  methods: {
    changeViewType(): void {
      if (!this.viewType) {
        return
      }
      this.$accessor.settings.setViewType(this.viewType?.key ?? 'PAGINATION')
    },
  },
})
</script>
