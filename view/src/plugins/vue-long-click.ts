import Vue from 'vue'
import { longClickDirective } from 'vue-long-click'
const longClickInstance = longClickDirective({ delay: 1000, interval: 500 })
Vue.directive('longclick', longClickInstance)
