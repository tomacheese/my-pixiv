<template>
  <v-container>
    <h2>ヘッダーの固定</h2>
    <v-switch
      v-model="isHeaderSticky"
      :label="isHeaderSticky ? 'ヘッダーを固定する' : 'ヘッダーを固定しない'"
    ></v-switch>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'HeaderSticky',
  data(): {
    isHeaderSticky: boolean
  } {
    return {
      isHeaderSticky: false,
    }
  },
  watch: {
    isHeaderSticky() {
      this.$accessor.settings.setHeaderSticky(this.isHeaderSticky)
    },
  },
  mounted() {
    this.isHeaderSticky = this.$accessor.settings.headerSticky
  },
})
</script>
