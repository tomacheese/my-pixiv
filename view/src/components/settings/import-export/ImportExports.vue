<template>
  <div>
    <ExportForm />
    <ImportForm />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ExportForm from '@/components/settings/import-export/ExportForm.vue'
import ImportForm from '@/components/settings/import-export/ImportForm.vue'

export default Vue.extend({
  name: 'ImportExportSettings',
  components: {
    ExportForm,
    ImportForm,
  },
})
</script>
