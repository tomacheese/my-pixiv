import Vue from 'vue'
import { longClickDirective } from 'vue-long-click'
const longClickInstance = longClickDirective({ delay: 500, interval: 500 })
Vue.directive('longclick', longClickInstance)
