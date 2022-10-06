<template>
  <v-container fluid fill-height>
    <v-row justify="center">
      <v-card>
        <v-card-title v-if="error.statusCode == 404">
          お探しのページは見つかりませんでした。
        </v-card-title>
        <v-card-title v-if="error.statusCode != 404">
          何らかのエラーが発生しました。
        </v-card-title>
        <v-card-text>
          <pre
            style="background-color: rgba(255 255 255 10%)"
            v-text="error"
          ></pre>
        </v-card-text>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'EmptyLayout',
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
}
</script>
