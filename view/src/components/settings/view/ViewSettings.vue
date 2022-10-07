<template>
  <div>
    <ViewTypeSelector />
    <PaginationSettings v-if="isActivePagination()" />
    <ActionsPosition />
    <HeaderSticky />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ViewTypeSelector from '@/components/settings/view/ViewTypeSelector.vue'
import PaginationSettings from '@/components/settings/view/PaginationSettings.vue'
import ActionsPosition from '@/components/settings/view/ActionsPosition.vue'
import HeaderSticky from '@/components/settings/view/HeaderSticky.vue'

export default Vue.extend({
  name: 'ViewSettings',
  components: {
    ViewTypeSelector,
    PaginationSettings,
    ActionsPosition,
    HeaderSticky,
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
