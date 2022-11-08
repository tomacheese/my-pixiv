<template>
  <v-card-text>
    <v-btn color="primary" icon @click="remove()">
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-btn color="primary" icon @click="edit()">
      <v-icon>mdi-pencil</v-icon>
    </v-btn>

    <v-chip
      v-for="(t, v) of item.targetType"
      :key="'type-' + i + '-' + v"
      class="ma-1"
      >{{ getTypeName(t) }}</v-chip
    >
    <v-chip
      v-for="(t, v) of item.tag"
      :key="'tag-' + i + '-' + v"
      class="ma-1"
      color="success"
      >{{ t }}</v-chip
    >
    <v-chip
      v-for="(t, v) of item.ignores"
      :key="'ignore-' + i + '-' + v"
      class="ma-1"
      color="warning"
      >{{ t }}</v-chip
    >
    <v-chip class="ma-1" color="primary">
      <v-icon class="mr-1">mdi-heart</v-icon>
      {{ item.minLikeCount ?? 0 }}
    </v-chip>
    <v-chip class="ma-1" color="primary">
      <v-icon class="mr-1">mdi-file-document-multiple</v-icon>
      {{ item.searchItemCount ?? 150 }}
    </v-chip>
  </v-card-text>
</template>

<script lang="ts">
import Vue from 'vue'
import { Target } from '@/store/settings'
export default Vue.extend({
  name: 'TargetSearchItem',
  props: {
    item: {
      type: Object as () => Target,
      required: true,
    },
    i: {
      type: Number,
      required: true,
    },
  },
  methods: {
    getTypeName(type: string): string {
      switch (type) {
        case 'ILLUST':
          return 'イラスト'
        case 'MANGA':
          return 'マンガ'
        case 'NOVEL':
          return '小説'
        default:
          return ''
      }
    },
    remove(): void {
      if (!confirm('このアイテムを削除します。よろしいですか？')) {
        return
      }
      this.$accessor.settings.removeTarget(this.item)
    },
    edit(): void {
      this.$emit('edit', this.item, this.i)
    },
  },
})
</script>
