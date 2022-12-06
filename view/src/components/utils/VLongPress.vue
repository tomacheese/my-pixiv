<template>
  <div
    class="long-press-wrapper"
    @pointerdown="startPress"
    @pointerup="endPress"
    @pointermove="endPress"
    @pointercancel="endPress"
    @click="endPress"
    @contextmenu.prevent
  >
    <slot />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    onLongPress: {
      type: Function as PropType<() => void>,
      required: true,
    },
    delay: {
      type: Number,
      default: 500,
    },
  },
  data(): {
    pressTimer: NodeJS.Timeout | null
  } {
    return {
      pressTimer: null,
    }
  },
  methods: {
    startPress(): void {
      this.pressTimer = setTimeout(() => {
        this.onLongPress()
      }, this.delay)
    },
    endPress(): void {
      if (!this.pressTimer) return
      clearTimeout(this.pressTimer)
      this.pressTimer = null
    },
  },
})
</script>

<style scoped>
.long-press-wrapper {
  user-select: none;

  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-user-select: none;
}
</style>
