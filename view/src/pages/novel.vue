<template>
  <NovelList />
</template>

<script lang="ts">
import Vue from 'vue'
import NovelList from '@/components/items/novels/NovelList.vue'

export default Vue.extend({
  name: 'NovelPage',
  components: {
    NovelList,
  },
})
</script>
