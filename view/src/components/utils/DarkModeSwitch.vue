<template>
  <div>
    <v-switch v-model="theme" :prepend-icon="themeIcon" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {
      theme: false,
    }
  },
  computed: {
    themeIcon(): string {
      return this.theme ? 'mdi-weather-night' : 'mdi-weather-sunny'
    },
  },
  watch: {
    theme() {
      this.$vuetify.theme.dark = this.theme
      this.$accessor.settings.setDarkMode(this.theme)
    },
  },
  mounted() {
    this.theme = this.$accessor.settings.darkMode
  },
})
</script>
