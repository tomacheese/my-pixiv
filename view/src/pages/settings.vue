<template>
  <v-container>
    <TargetSearch />
    <TitleFilter />
    <TagFilter />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import TitleFilter from '@/components/settings/TitleFilter.vue'
import TagFilter from '@/components/settings/TagFilter.vue'
import TargetSearch from '@/components/settings/TargetSearch.vue'
export default Vue.extend({
  name: 'SettingsPage',
  components: { TitleFilter, TagFilter, TargetSearch },
})
</script>
