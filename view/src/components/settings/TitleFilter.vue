<template>
  <v-container>
    <h2>グローバルタイトルフィルター</h2>
    <v-text-field v-model="input" label="テキスト">
      <template #append>
        <v-btn icon @click="add()">
          <v-icon>mdi-plus-circle-outline</v-icon>
        </v-btn>
      </template>
    </v-text-field>
    <v-chip
      v-for="item of getItems()"
      :key="item"
      close
      @click:close="remove(item)"
      >{{ item }}</v-chip
    >
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'TitleFilterSetting',
  data(): {
    input: string
  } {
    return {
      input: '',
    }
  },
  methods: {
    add(): void {
      this.$accessor.settings.addFilter({ type: 'TITLE', value: this.input })
      this.input = ''
    },
    remove(item: string): void {
      this.$accessor.settings.removeFilter({ type: 'TITLE', value: item })
    },
    getItems() {
      return this.$accessor.settings.filters
        .filter((f) => f.type === 'TITLE')
        .map((f) => f.value)
    },
  },
})
</script>
