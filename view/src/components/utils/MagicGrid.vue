<!-- https://github.com/e-oj/vue-magic-grid -->

<template>
  <div :class="[wrapper]">
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

interface Column {
  height: number
  top: number
  index: number
}

export default Vue.extend({
  name: 'MagicGrid',

  props: {
    wrapper: {
      type: String, // Required. Class or id of the container.
      default: 'wrapper',
    },
    gap: {
      type: Number, // Optional. Space between items. Default: 32px
      default: 32,
    },
    maxCols: {
      type: Number, // Maximum number of colums. Default: Infinite
      default: 5,
    },
    maxColWidth: {
      type: Number,
      default: 280,
    },
    animate: {
      type: Boolean, // Animate item positioning. Default: false.
      default: true,
    },
    useMin: {
      type: Boolean, // Place items in lower column
      default: false,
    },
  },

  data(): {
    started: boolean
    items?: HTMLCollection
  } {
    return {
      started: false,
      items: undefined,
    }
  },

  mounted() {
    this.waitUntilReady()
  },

  methods: {
    update() {
      console.log('[DEBUG] update()')
      this.started = false
      this.items = undefined
      this.waitUntilReady()
    },

    waitUntilReady() {
      console.log('[DEBUG] waitUntilReady()', this.isReady())

      if (this.isReady()) {
        this.started = true
        this.positionItems()

        window.addEventListener('resize', () => {
          setTimeout(() => this.positionItems(), 200)
        })
      } else this.getReady()
    },

    isReady(): boolean {
      console.log(
        '[DEBUG] isReady()',
        !!this.$el,
        !!this.items,
        this.items ? this.items?.length : undefined,
        this.items && this.items.length > 0
          ? this.items[0].getBoundingClientRect().width
          : undefined
      )
      return (
        this.$el &&
        !!this.items &&
        this.items.length > 0 &&
        this.items[0].getBoundingClientRect().width > 0
      )
    },

    getReady() {
      console.log('[DEBUG] getReady()')
      const interval = setInterval(() => {
        this.items = this.$el.children

        if (this.isReady()) {
          console.log('[DEBUG] ready')
          clearInterval(interval)
          this.init()
        }
      }, 100)
    },

    init() {
      console.log('[DEBUG] init()', this.isReady(), this.started)
      if (!this.isReady() || this.started) return
      ;(this.$el as HTMLElement).style.position = 'relative'

      Array.prototype.forEach.call(this.items, (item) => {
        item.style.position = 'absolute'
        item.style.maxWidth = this.maxColWidth + 'px'
        if (this.animate) item.style.transition = 'top, left 0.2s ease'
      })

      this.waitUntilReady()
    },

    colWidth() {
      if (!this.items) {
        return 0 // ほんとに？
      }
      return this.items[0].getBoundingClientRect().width + this.gap
    },

    setup(): {
      cols: Column[]
      wSpace: number
    } {
      console.log(
        '[DEBUG] setup::this.$el.getBoundingClientRect().width:',
        this.$el.getBoundingClientRect().width
      )
      const width = this.$el.getBoundingClientRect().width
      let numberCols = Math.floor(width / this.colWidth()) || 1
      const cols = []

      if (this.maxCols && numberCols > this.maxCols) {
        numberCols = this.maxCols
      }

      for (let index = 0; index < numberCols; index++) {
        cols[index] = {
          height: 0,
          top: 0,
          index,
        }
      }

      const wSpace = width - numberCols * this.colWidth() + this.gap

      return {
        cols,
        wSpace,
      }
    },

    nextCol(cols: Column[], index: number) {
      if (this.useMin) return this.getMin(cols)

      return cols[index % cols.length]
    },

    positionItems() {
      const { cols, wSpace: _wSpace } = this.setup()

      const wSpace = Math.floor(_wSpace / 2)

      if (!this.items) {
        return
      }

      for (let index = 0; index < this.items.length; index++) {
        const item = this.items[index] as HTMLElement
        const min = this.nextCol(cols, index)
        const left = min.index * this.colWidth() + wSpace

        item.style.left = left + 'px'
        item.style.top = min.height + min.top + 'px'

        min.height += min.top + item.getBoundingClientRect().height
        min.top = this.gap
      }

      ;(this.$el as HTMLElement).style.height = this.getMax(cols).height + 'px'
    },

    getMax(cols: any[]) {
      let max = cols[0]

      for (const col of cols) {
        if (col.height > max.height) max = col
      }

      return max
    },

    getMin(cols: any[]) {
      let min = cols[0]

      for (const col of cols) {
        if (col.height < min.height) min = col
      }

      return min
    },
  },
})
</script>
