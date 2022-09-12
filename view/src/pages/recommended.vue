<template>
  <div>
    <v-tabs v-model="selected" fixed-tabs color="orange">
      <v-tab v-for="t of types" :key="t.value" v-text="t.name" />
    </v-tabs>
    <v-container fluid>
      <IllustList
        v-if="types[selected].value === 'ILLUST'"
        target-type="ILLUST"
        :recommended="true"
      />
      <NovelList
        v-else-if="types[selected].value === 'NOVEL'"
        target-type="NOVEL"
        :recommended="true"
      />
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { TargetType } from '@/store/settings'
import { PixivItem } from '@/types/pixivItem'
export default Vue.extend({
  name: 'RecommendedPage',
  data(): {
    selected: number
    types: { name: string; value: TargetType }[]
    items: PixivItem[]
    loading: boolean
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
      items: [],
      loading: false,
    }
  },
})
</script>
