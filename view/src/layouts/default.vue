<template>
  <v-app>
    <v-main>
      <v-tabs
        v-model="selected"
        fixed-tabs
        show-arrows
        :icons-and-text="!isXsBreakpoint"
        :class="{ 'sticky-header': isHeaderSticky }"
      >
        <v-tab v-for="t of types" :key="t.value">
          <div class="hidden-xs-only">{{ t.name }}</div>
          <v-icon>{{ t.icon }}</v-icon>
        </v-tab>
        <DarkModeSwitch />
      </v-tabs>
      <Nuxt />
      <WebSocketStatusSnackbar />
      <GlobalSnackbar />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import DarkModeSwitch from '@/components/utils/DarkModeSwitch.vue'
import WebSocketStatusSnackbar from '@/components/utils/WebSocketStatusSnackbar.vue'
import GlobalSnackbar from '@/components/utils/GlobalSnackbar.vue'

export default Vue.extend({
  name: 'DefaultLayout',
  components: {
    DarkModeSwitch,
    WebSocketStatusSnackbar,
    GlobalSnackbar,
  },
  data(): {
    selected: number
    types: { icon: `mdi-${string}`; name: string; value: string }[]
  } {
    return {
      selected: -1,
      types: [
        {
          icon: 'mdi-home',
          name: 'おすすめ',
          value: 'recommended',
        },
        {
          icon: 'mdi-image',
          name: 'イラスト',
          value: 'illust',
        },
        {
          icon: 'mdi-book-open',
          name: 'マンガ',
          value: 'manga',
        },
        {
          icon: 'mdi-text',
          name: '小説',
          value: 'novel',
        },
        {
          icon: 'mdi-paperclip',
          name: 'あとで見る',
          value: 'later',
        },
        {
          icon: 'mdi-cog',
          name: '設定',
          value: 'settings',
        },
      ],
    }
  },
  computed: {
    isHeaderSticky(): boolean {
      return this.$accessor.settings.headerSticky
    },
    isXsBreakpoint(): boolean {
      return this.$vuetify.breakpoint.name === 'xs'
    },
  },
  watch: {
    selected(val) {
      this.$nuxt.$router.push({
        name: this.types[val].value,
      })
    },
    '$route.path': {
      handler(path) {
        console.log(path)
        const index = this.types.findIndex((t) => t.value === path.slice(1))
        if (index !== -1) {
          this.selected = index
        }
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {
    this.selected = this.types.findIndex(
      (type) => type.value === this.$route.path.split('/')[1]
    )
    if (this.selected === -1) {
      this.selected = 0
    }

    this.$accessor.viewed.migration()
  },
})
</script>

<style>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 5;
}
</style>
