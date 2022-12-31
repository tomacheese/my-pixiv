<template>
  <v-form>
    <v-select
      v-model="targetType"
      :items="targetTypes"
      attach
      chips
      label="検索対象"
      multiple
    ></v-select>
    <v-text-field v-model="tag" label="タグをカンマかスペース区切りで入力" />
    <v-text-field
      v-model="ignores"
      label="除外する文字列をカンマかスペース区切りで入力"
    />
    <v-text-field v-model="minLikeCount" label="最低すき！数" type="number" />
    <v-text-field v-model="searchItemCount" label="検索件数" type="number" />
    <v-btn v-if="!item" color="success" block @click="add()">追加</v-btn>
    <v-btn v-else color="success" block @click="update()">更新</v-btn>
  </v-form>
</template>

<script lang="ts">
import Vue from 'vue'
import { Target, TargetType } from '@/store/settings'

const targetTypeMap: {
  [key: string]: TargetType
} = {
  イラスト: 'ILLUST',
  マンガ: 'MANGA',
  小説: 'NOVEL',
}

export default Vue.extend({
  name: 'AddTargetSearchSetting',
  props: {
    item: {
      type: Object as () => Target | undefined,
      required: false,
      default: undefined,
    },
  },
  data(): {
    targetType: string[]
    tag: string
    ignores: string
    minLikeCount: string
    searchItemCount: string
    targetTypes: string[]
  } {
    return {
      targetType: Object.keys(targetTypeMap),
      tag: '',
      ignores: '',
      minLikeCount: '0',
      searchItemCount: '150',
      targetTypes: Object.keys(targetTypeMap),
    }
  },
  watch: {
    item: {
      handler() {
        this.init()
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      if (!this.item) {
        return
      }
      this.targetType = this.item.targetType.map(
        (t) =>
          Object.keys(targetTypeMap).find((k) => targetTypeMap[k] === t) || ''
      )
      this.tag = this.item.tag.join(' ')
      this.ignores = this.item.ignores.join(' ')
      this.minLikeCount = this.item.minLikeCount.toString()
    },
    add(): void {
      this.$accessor.settings.addTarget({
        targetType: this.targetType.map((t) => targetTypeMap[t]),
        tag: this.tag.split(/[ ,]/),
        ignores:
          this.ignores.trim().length > 0 ? this.ignores.split(/[ ,]/) : [],
        minLikeCount: Number.parseInt(this.minLikeCount),
        searchItemCount: Number.parseInt(this.searchItemCount),
      })
    },
    update(): void {
      this.$emit('updated', {
        targetType: this.targetType.map((t) => targetTypeMap[t]),
        tag: this.tag.split(/[ ,]/),
        ignores:
          this.ignores.trim().length > 0 ? this.ignores.split(/[ ,]/) : [],
        minLikeCount: Number.parseInt(this.minLikeCount),
        searchItemCount: Number.parseInt(this.searchItemCount),
      })
    },
  },
})
</script>
