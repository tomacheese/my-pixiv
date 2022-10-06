<template>
  <div>
    <h2 class="my-3">検索の追加</h2>
    <TargetSearchForm />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import TargetSearchForm from '@/components/settings/search-target/TargetSearchForm.vue'

export default Vue.extend({
  name: 'AddTargetSearchSetting',
  components: {
    TargetSearchForm,
  },
})
</script>
