<template>
  <IllustList target-type="MANGA" />
</template>

<script lang="ts">
import Vue from 'vue'
import IllustList from '@/components/items/illusts/IllustList.vue'

export default Vue.extend({
  name: 'MangaPage',
  components: {
    IllustList,
  },
})
</script>
