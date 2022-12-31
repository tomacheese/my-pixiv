<template>
  <div :id="observName">
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { PixivItem } from '@/types/pixiv-item'

export default Vue.extend({
  props: {
    item: {
      type: Object as () => PixivItem,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  },
  data(): {
    observName: string
    isIntersecting: boolean
  } {
    return {
      observName: '',
      isIntersecting: false,
    }
  },
  watch: {
    item() {
      // eslint-disable-next-line unicorn/prefer-query-selector
      const element = document.getElementById(this.observName)
      if (!element) {
        return
      }
      if (this.isViewing(element)) {
        this.$emit('intersect', this.item)
      }
    },
    isIntersecting(value: boolean) {
      if (value) {
        this.$emit('intersect', this.item)
      }
    },
    loading(value: boolean) {
      if (value) {
        return
      }
      // eslint-disable-next-line unicorn/prefer-query-selector
      const element = document.getElementById(this.observName)
      if (!element) {
        return
      }
      if (!this.isViewing(element)) {
        return
      }
      this.$emit('intersect', this.item)
    },
  },
  created() {
    this.observName = this.item.id.toString()
  },
  mounted() {
    this.register()
  },
  methods: {
    register() {
      if (!window) {
        return
      }
      // eslint-disable-next-line unicorn/prefer-query-selector
      const element = document.getElementById(this.observName)
      if (!element) {
        return
      }
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const handler = (entries: { isIntersecting: boolean }[]) => {
        this.isIntersecting = entries[0].isIntersecting
      }
      const observer = new window.IntersectionObserver(handler, {
        threshold: 1,
      })
      observer.observe(element)
    },
    isViewing(element: Element) {
      const rect = element.getBoundingClientRect()
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      )
    },
  },
})
</script>
