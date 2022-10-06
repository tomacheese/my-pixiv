<template>
  <v-snackbar v-model="snackbar" :timeout="timeout" :color="color">
    {{ message }}
    <v-btn text @click="snackbar = false">Close</v-btn>
  </v-snackbar>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {
      snackbar: false,
      message: '',
      timeout: 3000,
      color: 'success',
    }
  },
  mounted() {
    this.$nuxt.$on(
      'snackbar',
      (input: { message: string; color: string; timeout: number }) => {
        this.message = input.message
        this.color = input.color || 'success'
        this.timeout = input.timeout || 3000
        this.snackbar = true
      }
    )
  },
})
</script>
