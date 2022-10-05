<template>
  <div>
    <div v-longclick="() => addMute()" class="item-muting-wrapper">
      <slot />
    </div>
    <v-dialog v-model="isOpen" class="item-muting-selection">
      <v-card :loading="isLoading">
        <v-card-title>ミュート種別選択</v-card-title>
        <v-card-subtitle
          >ミュート対象にする種別を選んでください。</v-card-subtitle
        >

        <v-card-text>
          <v-list>
            <v-list-item two-line @click="addItemMute()">
              <v-list-item-icon>
                <v-icon v-if="item.type">mdi-image</v-icon>
                <v-icon v-else>mdi-text</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>{{
                  item.type ? 'イラスト・マンガ' : '小説'
                }}</v-list-item-title>

                <v-list-item-subtitle>
                  {{ item.title }} ({{ item.id }})
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item two-line @click="addAuthorMute()">
              <v-list-item-icon>
                <v-icon>mdi-account</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>作者</v-list-item-title>

                <v-list-item-subtitle>
                  {{ item.user.name }} ({{ item.id }})
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-if="snackbarType === 'ADDED_ITEM'"
      v-model="isSnackbar"
      color="success"
    >
      <v-icon>mdi-check</v-icon>
      この作品をミュートしました。
    </v-snackbar>
    <v-snackbar
      v-if="snackbarType === 'ADDED_AUTHOR'"
      v-model="isSnackbar"
      color="success"
    >
      <v-icon>mdi-check</v-icon>
      この作者をミュートしました。
    </v-snackbar>
    <v-snackbar
      v-if="snackbarType === 'ALREADY_ADDED'"
      v-model="isSnackbar"
      color="warning"
    >
      <v-icon>mdi-warning</v-icon>
      すでにミュートされています。
    </v-snackbar>
    <v-snackbar
      v-if="snackbarType === 'FAILED'"
      v-model="isSnackbar"
      color="error"
    >
      <v-icon>mdi-alert</v-icon>
      ミュートに失敗しました。
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { PixivItem } from '@/types/pixivItem'

type SnackBarType = 'ADDED_ITEM' | 'ADDED_AUTHOR' | 'ALREADY_ADDED' | 'FAILED'

export default Vue.extend({
  name: 'ItemMuting',
  props: {
    item: {
      type: Object as () => PixivItem,
      required: true,
    },
  },
  data(): {
    isOpen: boolean
    isLoading: boolean
    isSnackbar: boolean
    snackbarType: SnackBarType | null
  } {
    return {
      isOpen: false,
      isLoading: false,
      isSnackbar: false,
      snackbarType: null,
    }
  },
  methods: {
    addMute(): void {
      this.isOpen = true
    },
    addItemMute(): void {
      this.isLoading = true

      const targetType = this.item.type ? 'ILLUST' : 'NOVEL'
      if (
        this.$accessor.settings.muted.some(
          (m) => m.targetId === this.item.id && m.targetType === targetType
        )
      ) {
        this.snackbarType = 'ALREADY_ADDED'
        this.isSnackbar = true
        this.isLoading = false
        return
      }

      this.$accessor.settings.addMuteItem({
        targetType,
        targetId: this.item.id,
      })
      this.$nuxt.$emit('update-mutes')

      this.isLoading = false
      this.isOpen = false

      this.snackbarType = 'ADDED_ITEM'
      this.isSnackbar = true
    },
    addAuthorMute(): void {
      this.isLoading = true

      this.$accessor.settings.addMuteItem({
        targetType: 'USER',
        targetId: this.item.user.id,
      })
      this.$nuxt.$emit('update-mutes')

      this.isLoading = false
      this.isOpen = false

      this.snackbarType = 'ADDED_AUTHOR'
      this.isSnackbar = true
    },
  },
})
</script>
