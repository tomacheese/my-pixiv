<template>
  <div>
    <ViewTypeSelector />
    <IllustPopupSettings />
    <PaginationSettings v-if="isActivePagination()" />
    <HeaderSticky />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ViewTypeSelector from '@/components/settings/view/ViewTypeSelector.vue'
import PaginationSettings from '@/components/settings/view/PaginationSettings.vue'
import HeaderSticky from '@/components/settings/view/HeaderSticky.vue'
import IllustPopupSettings from '@/components/settings/view/IllustPopupSettings.vue'

export default Vue.extend({
  name: 'ViewSettings',
  components: {
    ViewTypeSelector,
    PaginationSettings,
    HeaderSticky,
    IllustPopupSettings,
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
