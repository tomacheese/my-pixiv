<template>
  <div>
    <h3 class="my-3">登録済みの検索一覧</h3>

    <v-card v-for="(item, i) of items" :key="i">
      <TargetSearchItem :item="item" :i="i" @edit="onEdit" />
    </v-card>

    <v-card v-if="items.length === 0">
      <v-card-subtitle class="text-center">
        登録されている検索はありません。
      </v-card-subtitle>
    </v-card>

    <v-dialog v-model="isEditing" fullscreen>
      <v-card>
        <v-card-actions>
          <v-spacer />
          <v-btn icon @click="isEditing = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>

        <v-card-title>検索の編集</v-card-title>

        <v-card-text>
          <TargetSearchForm :item="editingItem" @updated="onUpdated" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Target, TargetType } from '@/store/settings'
import TargetSearchItem from '@/components/settings/search-target/TargetSearchItem.vue'
import TargetSearchForm from '@/components/settings/search-target/TargetSearchForm.vue'

const targetTypeMap: {
  [key: string]: TargetType
} = {
  イラスト: 'ILLUST',
  マンガ: 'MANGA',
  小説: 'NOVEL',
}

export default Vue.extend({
  name: 'TargetSearchSetting',
  components: {
    TargetSearchItem,
    TargetSearchForm,
  },
  data(): {
    isEditing: boolean
    editingItem?: Target
    editingIndex: number
  } {
    return {
      isEditing: false,
      editingItem: undefined,
      editingIndex: -1,
    }
  },
  computed: {
    items() {
      return this.$accessor.settings.targets
    },
  },
  methods: {
    onEdit(item: Target, index: number) {
      this.editingItem = item
      this.editingIndex = index
      this.isEditing = true
    },
    onUpdated(target: Target): void {
      console.log('updated')
      this.$accessor.settings.updateTarget({
        index: this.editingIndex,
        target,
      })
      this.isEditing = false
    },
    getTypeName(value: string) {
      return Object.keys(targetTypeMap).find((k) => targetTypeMap[k] === value)
    },
  },
})
</script>
