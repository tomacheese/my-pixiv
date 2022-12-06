<template>
  <IllustList target-type="ILLUST" />
</template>

<script lang="ts">
import Vue from 'vue'
import IllustList from '@/components/items/illusts/IllustList.vue'

export default Vue.extend({
  name: 'IllustPage',
  components: {
    IllustList,
  },
})
</script>
