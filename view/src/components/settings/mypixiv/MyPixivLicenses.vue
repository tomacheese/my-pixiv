<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <template #activator="{ on, attrs }">
      <v-btn color="primary" dark v-bind="attrs" block class="my-3" v-on="on">
        利用しているライブラリ・ライセンスの一覧を表示する
      </v-btn>
    </template>
    <v-card>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>
      <v-card-title class="headline"
        >利用しているライブラリ・ライセンス</v-card-title
      >
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="item in items"
            :key="item.name"
            @click="open(item.repository)"
          >
            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.licenses }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'

interface Item {
  name: string
  licenses: string
  repository: string
  licenseUrl: string
}

type Licenses = {
  [key: string]: Omit<Item, 'name'>
}

export default Vue.extend({
  name: 'MyPixivLicenses',
  data(): {
    dialog: boolean
    items: Item[]
  } {
    return {
      dialog: false,
      items: [],
    }
  },
  mounted() {
    const rawLicenses: Licenses = this.$config.licenses
    this.items = Object.keys(rawLicenses).map((name) => ({
      name,
      ...rawLicenses[name],
    }))
  },
  methods: {
    open(url: string) {
      window.open(url, '_blank')
    },
  },
})
</script>
