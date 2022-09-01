<template>
  <v-container>
    <TargetSearch />
    <ViewTypeSelector />
    <TitleFilter />
    <TagFilter />
    <ImportExportForm />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import TitleFilter from '@/components/settings/TitleFilter.vue'
import TagFilter from '@/components/settings/TagFilter.vue'
import TargetSearch from '@/components/settings/TargetSearch.vue'
import ImportExportForm from '@/components/settings/ImportExportForm.vue'
import ViewTypeSelector from '@/components/settings/ViewTypeSelector.vue'

export default Vue.extend({
  name: 'SettingsPage',
  components: {
    ViewTypeSelector,
    TitleFilter,
    TagFilter,
    TargetSearch,
    ImportExportForm,
  },
})
</script>
