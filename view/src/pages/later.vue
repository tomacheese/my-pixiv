<template>
  <div>
    <v-tabs
      v-model="selected"
      fixed-tabs
      color="orange"
      :class="{ 'sticky-later-header': isHeaderSticky }"
    >
      <v-tab v-for="t of types" :key="t.value">{{ t.name }}</v-tab>
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
export default Vue.extend({
  name: 'LaterPage',
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
.sticky-later-header {
  position: sticky;
  top: 48px;
  z-index: 5;
}
</style>
