import { getAccessorType } from 'typed-vuex'

import * as settings from '@/store/settings'
import * as viewed from '@/store/viewed'
import * as itemMute from '@/store/itemMute'

export const state = () => {
  return {}
}
export const getters = {}
export const mutations = {}
export const actions = {}

export const accessorType = getAccessorType({
  state,
  getters,
  mutations,
  actions,
  modules: {
    settings,
    viewed,
    itemMute,
  },
})
