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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { TargetType } from '@/store/settings'
import IllustList from '@/components/items/illusts/IllustList.vue'
import NovelList from '@/components/items/novels/NovelList.vue'
import { isPixivIllustItem, isPixivNovelItem } from '@/types/pixivItem'

export default Vue.extend({
  name: 'LaterPage',
  components: {
    IllustList,
    NovelList,
  },
  data(): {
    selected: number
    types: { name: string; value: TargetType }[]
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
      loading: false,
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
