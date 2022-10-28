<template>
  <v-progress-linear
    v-if="loading"
    :value="((loaded + failed) / total) * 100"
    :query="total === 0"
    height="20"
  >
    <template #default>
      <span v-if="total === 0">Loading...</span>
      <span v-else>
        {{ loaded + failed }} / {{ total }}
        {{ failed > 0 ? `(${failed} failed)` : '' }}
      </span>
    </template>
  </v-progress-linear>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'VLoadProgress',
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    loaded: {
      type: Number,
      required: true,
    },
    failed: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
})
</script>
