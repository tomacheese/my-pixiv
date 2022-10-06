<template>
  <div>
    <h2>タグ</h2>
    <p>タグに登録した文字列が含まれている場合、そのアイテムを表示しません。</p>

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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'TagFilterSetting',
  data(): {
    input: string
  } {
    return {
      input: '',
    }
  },
  methods: {
    add(): void {
      this.$accessor.settings.addFilter({ type: 'TAG', value: this.input })
      this.input = ''
    },
    remove(item: string): void {
      this.$accessor.settings.removeFilter({ type: 'TAG', value: item })
    },
    getItems() {
      return this.$accessor.settings.filters
        .filter((f) => f.type === 'TAG')
        .map((f) => f.value)
    },
  },
})
</script>
