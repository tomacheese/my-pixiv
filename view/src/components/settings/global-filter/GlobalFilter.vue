<template>
  <div>
    <TitleFilter />
    <v-divider class="mb-3" />
    <TagFilter />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import TitleFilter from '@/components/settings/global-filter/TitleFilter.vue'
import TagFilter from '@/components/settings/global-filter/TagFilter.vue'

export default Vue.extend({
  name: 'GlobalFilter',
  components: {
    TitleFilter,
    TagFilter,
  },
})
</script>
