<template>
  <v-container>
    <h2>イラストポップアップでのボタン位置</h2>
    <v-select
      v-model="actionsPosition"
      :items="actionsPositionItems"
      @change="changeActionsPosition"
    ></v-select>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { ActionPosition } from '@/store/settings'

export default Vue.extend({
  name: 'ActionsPositionSetting',
  data(): {
    actionsPosition: ActionPosition
    actionsPositionItems: { text: string; value: ActionPosition }[]
  } {
    return {
      actionsPosition: 'RIGHT',
      actionsPositionItems: [
        { text: '左側', value: 'LEFT' },
        { text: '右側', value: 'RIGHT' },
      ],
    }
  },
  computed: {
    isActivePagination(): boolean {
      return (
        this.$accessor.settings.viewType === 'PAGINATION' ||
        this.$accessor.settings.novelViewType === 'PAGINATION'
      )
    },
  },
  watch: {
    actionsPosition() {
      this.$accessor.settings.setActionPosition(this.actionsPosition)
    },
  },
  mounted() {
    this.actionsPosition = this.$accessor.settings.actionPosition
  },
})
</script>
