<template>
  <v-container v-if="isActivePagination">
    <h2>ページネーションの設定</h2>
    <v-row align="center">
      <v-col cols="6">
        <v-subheader> 1ページあたりの表示件数 </v-subheader>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="paginationLimit"
          type="number"
          min="1"
          max="100"
          @change="changePaginationLimit"
        ></v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ViewTypeSelectSetting',
  data(): {
    paginationLimit: number
  } {
    return {
      paginationLimit: 10,
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
  mounted() {
    this.paginationLimit = this.$accessor.settings.paginationLimit
  },
  methods: {
    changePaginationLimit(): void {
      if (!this.paginationLimit) {
        return
      }
      this.$accessor.settings.setPaginationLimit(this.paginationLimit)
    },
  },
})
</script>
