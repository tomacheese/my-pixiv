<template>
  <v-app>
    <v-main>
      <v-tabs v-model="selected" fixed-tabs>
        <v-tab v-for="t of types" :key="t.value">{{ t.name }}</v-tab>
        <DarkModeSwitch />
      </v-tabs>
      <Nuxt />
      <GlobalSnackbar />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import DarkModeSwitch from '@/components/DarkModeSwitch.vue'
import GlobalSnackbar from '@/components/GlobalSnackbar.vue'

export default Vue.extend({
  name: 'DefaultLayout',
  components: {
    DarkModeSwitch,
    GlobalSnackbar,
  },
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
