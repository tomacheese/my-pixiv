<template>
  <div>
    <v-tabs
      v-model="selected"
      fixed-tabs
      color="orange"
      :class="{ 'sticky-recommended-header': isHeaderSticky }"
    >
      <v-tab v-for="t of types" :key="t.value">{{ t.name }}</v-tab>
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
export default Vue.extend({
  name: 'RecommendedPage',
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
})
</script>

<style>
.sticky-recommended-header {
  position: sticky;
  top: 48px;
  z-index: 10000;
}
</style>
