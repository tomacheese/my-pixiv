<template>
  <div>
    <TitleFilter />
    <v-divider class="mb-3" />
    <CaptionFilter />
    <v-divider class="mb-3" />
    <TagFilter />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import TitleFilter from '@/components/settings/global-filter/TitleFilter.vue'
import CaptionFilter from '@/components/settings/global-filter/CaptionFilter.vue'
import TagFilter from '@/components/settings/global-filter/TagFilter.vue'

export default Vue.extend({
  name: 'GlobalFilter',
  components: {
    TitleFilter,
    CaptionFilter,
    TagFilter,
  },
})
</script>
