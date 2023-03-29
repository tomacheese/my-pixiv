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
import IllustList from '@/components/items/illusts/IllustList.vue'
import NovelList from '@/components/items/novels/NovelList.vue'

export default Vue.extend({
  name: 'RecommendedPage',
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
    isXsBreakpoint(): boolean {
      return this.$vuetify.breakpoint.name === 'xs'
    },
  },
})
</script>

<style>
.sticky-recommended-header {
  position: sticky;
  top: 72px;
  z-index: 5;
}

/* xs breakpoint: 48px */
@media screen and (max-width: 599px) {
  .sticky-recommended-header {
    top: 48px;
  }
}

/* other breakpoint: 72px */
@media screen and (min-width: 600px) {
  .sticky-recommended-header {
    top: 72px;
  }
}
</style>
