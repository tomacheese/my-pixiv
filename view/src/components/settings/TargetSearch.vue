<template>
  <v-container>
    <h2>検索設定</h2>
    <v-container>
      <v-form>
        <v-select
          v-model="targetType"
          :items="targetTypes"
          attach
          chips
          label="検索対象"
          multiple
        ></v-select>
        <v-text-field
          v-model="tag"
          label="タグをカンマかスペース区切りで入力"
        />
        <v-text-field
          v-model="ignores"
          label="除外する文字列をカンマかスペース区切りで入力"
        />
        <v-text-field
          v-model="minLikeCount"
          label="最低すき！数"
          type="number"
        />
        <v-btn v-if="editing === null" color="success" block @click="add()"
          >追加</v-btn
        >
        <v-btn v-else color="orange lighten-1" block @click="update()"
          >更新</v-btn
        >
      </v-form>
    </v-container>
    <v-card v-for="(item, i) of getItems()" :key="i">
      <v-card-text>
        <v-btn
          color="primary"
          icon
          :disabled="editing !== null"
          @click="remove(i)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-btn color="primary" icon @click="edit(i)">
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
          <v-icon>mdi-heart</v-icon>
          {{ item.minLikeCount }}
        </v-chip>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { TargetType } from '@/store/settings'

const targetTypeMap: {
  [key: string]: TargetType
} = {
  イラスト: 'ILLUST',
  マンガ: 'MANGA',
  小説: 'NOVEL',
}

export default Vue.extend({
  name: 'TargetSearchSetting',
  data(): {
    targetType: string[]
    tag: string
    ignores: string
    minLikeCount: string
    targetTypes: string[]
    editing: number | null
  } {
    return {
      targetType: ['イラスト', 'マンガ', '小説'],
      tag: '',
      ignores: '',
      minLikeCount: '0',
      targetTypes: ['イラスト', 'マンガ', '小説'],
      editing: null,
    }
  },
  methods: {
    add(): void {
      this.$accessor.settings.addTarget({
        targetType: this.targetType.map((t) => targetTypeMap[t]),
        tag: this.tag.split(/[ ,]/),
        ignores:
          this.ignores.trim().length !== 0 ? this.ignores.split(/[ ,]/) : [],
        minLikeCount: parseInt(this.minLikeCount),
      })
    },
    remove(i: number): void {
      this.$accessor.settings.removeTarget(this.$accessor.settings.targets[i])
    },
    edit(i: number): void {
      this.editing = i

      this.targetType = this.$accessor.settings.targets[i].targetType.map(
        (t) => {
          return this.getTypeName(t)
        }
      ) as string[]
      this.tag = this.$accessor.settings.targets[i].tag.join(' ')
      this.ignores = this.$accessor.settings.targets[i].ignores.join(' ')
      this.minLikeCount =
        this.$accessor.settings.targets[i].minLikeCount.toString()
    },
    update() {
      if (this.editing === null) {
        return
      }
      this.$accessor.settings.updateTarget({
        index: this.editing,
        target: {
          targetType: this.targetType.map((t) => targetTypeMap[t]),
          tag: this.tag.split(/[ ,]/),
          ignores:
            this.ignores.trim().length !== 0 ? this.ignores.split(/[ ,]/) : [],
          minLikeCount: parseInt(this.minLikeCount),
        },
      })
      this.editing = null
      this.tag = ''
      this.ignores = ''
      this.minLikeCount = '0'
    },
    getItems() {
      return this.$accessor.settings.targets
    },
    getTypeName(value: string) {
      return Object.keys(targetTypeMap).find((k) => targetTypeMap[k] === value)
    },
  },
})
</script>
