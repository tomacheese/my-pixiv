<template>
  <div>
    <ViewTypeSelector />
    <PaginationSettings v-if="isActivePagination()" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ViewTypeSelector from '@/components/settings/view/ViewTypeSelector.vue'
import PaginationSettings from '@/components/settings/view/PaginationSettings.vue'

export default Vue.extend({
  name: 'ViewSettings',
  components: {
    ViewTypeSelector,
    PaginationSettings,
  },
  methods: {
    isActivePagination(): boolean {
      return (
        this.$accessor.settings.viewType === 'PAGINATION' ||
        this.$accessor.settings.novelViewType === 'PAGINATION'
      )
    },
  },
})
</script>
