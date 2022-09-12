<template>
  <v-app>
    <v-main>
      <v-tabs v-model="selected" fixed-tabs>
        <v-tab v-for="t of types" :key="t.value" v-text="t.name" />
        <dark-mode-switch />
      </v-tabs>
      <Nuxt />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'DefaultLayout',
  data() {
    return {
      selected: -1,
      types: [
        {
          name: 'おすすめ',
          value: 'recommended',
        },
        {
          name: 'イラスト',
          value: 'illust',
        },
        {
          name: 'マンガ',
          value: 'manga',
        },
        {
          name: '小説',
          value: 'novel',
        },
        {
          name: '設定',
          value: 'settings',
        },
      ],
    }
  },
  watch: {
    selected(val) {
      this.$nuxt.$router.push({
        name: this.types[val].value,
      })
    },
  },
  mounted() {
    this.selected = this.types.findIndex(
      (type) => type.value === this.$route.path.split('/')[1]
    )
    if (this.selected === -1) {
      this.selected = 0
    }
  },
})
</script>
