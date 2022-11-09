<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" sm="4" md="3" lg="2">
        <v-list>
          <v-list-item-group v-model="selectedIndex">
            <v-list-item v-for="category of categories" :key="category.name">
              <v-list-item-icon>
                <v-icon>{{ category.icon }}</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title class="wrap-text">{{
                  category.name
                }}</v-list-item-title>

                <v-list-item-subtitle class="hidden-sm-and-up">
                  {{ category.shortDescription }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>

      <v-col v-if="selectedCategory" class="hidden-xs-only">
        <h1>{{ selectedCategory.name }}</h1>
        <p class="mb-3" v-text="selectedCategory.description" />

        <div v-for="(value, v) of selectedCategory.values" :key="v">
          <component :is="value.component" />

          <v-divider
            v-if="v !== selectedCategory.values.length - 1"
            class="my-3"
          />
        </div>
      </v-col>
    </v-row>

    <v-dialog v-if="selectedCategory" v-model="isOpen" fullscreen>
      <v-card>
        <v-card-actions>
          <v-card-title>{{ selectedCategory.name }}</v-card-title>
          <v-spacer />
          <v-btn icon @click="isOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>

        <v-card-text class="white--text">
          <p class="mb-3" v-text="selectedCategory.description" />

          <div v-for="(value, v) of selectedCategory.values" :key="v">
            <component :is="value.component" />

            <v-divider
              v-if="v !== selectedCategory.values.length - 1"
              class="my-3"
            />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue/types/umd'
import AddTargetSearch from '@/components/settings/search-target/AddTargetSearch.vue'
import ListTargets from '@/components/settings/search-target/ListTargets.vue'
import ViewSetting from '@/components/settings/view/ViewSettings.vue'
import GlobalFilter from '@/components/settings/global-filter/GlobalFilter.vue'
import MutedItemSettings from '@/components/settings/item-mutes/MutedItemSettings.vue'
import ImportExportForm from '@/components/settings/import-export/ImportExports.vue'
import ViewedSettings from '@/components/settings/viewed/ViewedSettings.vue'
import SyncSettings from '@/components/settings/sync-settings/SyncSettings.vue'
import AuthSettings from '@/components/settings/auth/AuthSettings.vue'
import OtherSettings from '@/components/settings/other/OtherSettings.vue'
import DebugInfo from '@/components/settings/debug/DebugInfo.vue'
import MyPixivInfo from '@/components/settings/mypixiv/MyPixivInfo.vue'

interface SettingItem {
  component: Component
}

interface Category {
  name: string
  tabName: string
  icon: `mdi-${string}`
  shortDescription: string
  description: string
  values: SettingItem[]
}

export default Vue.extend({
  name: 'SettingsPage',
  data(): {
    selectedIndex: number
    categories: Category[]
    isOpen: boolean
  } {
    return {
      selectedIndex: -1,
      categories: [
        {
          name: '検索設定',
          tabName: 'search',
          icon: 'mdi-magnify',
          shortDescription: '検索対象アイテムの登録・一覧表示・解除',
          description:
            'イラスト・マンガ・小説タブで一括検索する際に使用する検索設定の登録・一覧表示・解除が行えます。',
          values: [
            {
              component: AddTargetSearch,
            },
            {
              component: ListTargets,
            },
          ],
        },
        {
          name: '表示設定',
          tabName: 'view',
          icon: 'mdi-view-list',
          shortDescription:
            '一覧表示の表示種別・イラストポップアップのボタン位置',
          description:
            'おすすめタブ・各検索タブにおける表示について設定できます。',
          values: [
            {
              component: ViewSetting,
            },
          ],
        },
        {
          name: 'グローバルフィルタ設定',
          tabName: 'global-filter',
          icon: 'mdi-filter',
          shortDescription: 'おすすめにも適用されるフィルタ設定',
          description:
            'おすすめタブ・各検索タブなどすべてのタブにおいて、アイテムを一覧表示する際にタイトルやタグなどをもとに除外（フィルタリング）する設定を行えます。',
          values: [
            {
              component: GlobalFilter,
            },
          ],
        },
        {
          name: 'アイテムミュート設定',
          tabName: 'item-mutes',
          icon: 'mdi-volume-off',
          shortDescription: '非表示にするアイテムの登録・一覧表示・解除',
          description:
            'おすすめタブ・各検索タブなどすべてのタブにおいて、特定のアイテムを除外（フィルタリング）するアイテムの登録・一覧表示・解除が行えます。',
          values: [
            {
              component: MutedItemSettings,
            },
          ],
        },
        {
          name: '既読情報',
          tabName: 'viewed',
          icon: 'mdi-bookmark',
          shortDescription: '既読情報の一覧表示・解除',
          description:
            '各検索タブで既読にしたアイテムの一覧表示・解除が行えます。',
          values: [
            {
              component: ViewedSettings,
            },
          ],
        },
        {
          name: 'インポート・エクスポート',
          tabName: 'import-export',
          icon: 'mdi-import',
          shortDescription: '設定のインポート・エクスポート',
          description: '設定のインポート・エクスポートが行えます。',
          values: [
            {
              component: ImportExportForm,
            },
          ],
        },
        {
          name: '設定の同期',
          tabName: 'sync-settings',
          icon: 'mdi-sync',
          shortDescription: '他の端末と設定を同期',
          description: '他の端末と設定を同期することができます。',
          values: [
            {
              component: SyncSettings,
            },
          ],
        },
        {
          name: '認証',
          tabName: 'auth',
          icon: 'mdi-lock',
          shortDescription: '認証に関する設定',
          description: '認証に関する設定を行えます。',
          values: [
            {
              component: AuthSettings,
            },
          ],
        },
        {
          name: 'その他',
          tabName: 'other',
          icon: 'mdi-cog',
          shortDescription: 'その他の設定',
          description: 'その他の設定が行えます。',
          values: [
            {
              component: OtherSettings,
            },
          ],
        },
        {
          name: 'デバッグ情報',
          tabName: 'debug',
          icon: 'mdi-bug',
          shortDescription: 'デバッグ情報の表示',
          description: 'デバッグ情報の表示が行えます。',
          values: [
            {
              component: DebugInfo,
            },
          ],
        },
        {
          name: 'my-pixiv について',
          tabName: 'about',
          icon: 'mdi-information',
          shortDescription: 'my-pixiv に関する情報',
          description: 'my-pixiv に関する情報を確認できます。',
          values: [
            {
              component: MyPixivInfo,
            },
          ],
        },
      ],
      isOpen: false,
    }
  },
  computed: {
    selectedCategory(): Category | undefined {
      return this.categories[this.selectedIndex]
    },
  },
  watch: {
    selectedIndex(to: number, from: number) {
      if (this.$vuetify.breakpoint.name !== 'xs') {
        if (to === undefined) {
          this.$nextTick(() => {
            this.selectedIndex = from
          })
        }
        return
      }
      if (to === -1) {
        this.isOpen = false
      }
      this.isOpen = true
    },
    isOpen(to: boolean) {
      if (!to) {
        this.selectedIndex = -1
      }
    },
  },
  mounted() {
    if (this.$vuetify.breakpoint.name === 'xs') {
      return
    }
    this.selectedIndex = 0

    if (this.$route.query.category) {
      const category = this.categories.find(
        (category) => category.tabName === this.$route.query.category
      )
      if (category) {
        this.selectedIndex = this.categories.indexOf(category)
      }
    }
  },
})
</script>

<style>
.wrap-text {
  word-break: break-all;
  white-space: normal;
}
</style>
