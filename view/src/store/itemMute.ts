import { actionTree, getterTree, mutationTree } from 'typed-vuex'
import { getAPI } from '@/plugins/websocket'

export type MuteTargetType = 'ILLUST' | 'NOVEL' | 'USER'

export interface MuteItem {
  type: MuteTargetType
  id: number
}

interface ItemMute {
  items: MuteItem[]
}

export const state = (): ItemMute => ({
  items: [],
})

export type RootState = ReturnType<typeof state>

export const getters = getterTree(state, {
  allMutes: (state) => state,
  items: (state) => state.items,
  isMuted: (state) => (itemId: number, targetType: MuteTargetType) => {
    return state.items.some((m) => m.id === itemId && m.type === targetType)
  },
})

export const mutations = mutationTree(state, {
  setAllMutes: (state, itemMute: Partial<ItemMute>) => {
    if (itemMute.items !== undefined) state.items = itemMute.items
  },
  setItems: (state, items: MuteItem[]) => {
    state.items = items
  },
})

export const actions = actionTree(
  { state, getters, mutations },
  {
    addMute: (
      { commit, state },
      param: {
        item: { type: MuteTargetType; id: number }
        isSync: boolean
      }
    ) => {
      const item = param.item
      if (state.items.some((m) => m.id === item.id && m.type === item.type)) {
        return
      }
      const api = getAPI()
      if (param.isSync && api !== null) {
        api.itemMute.add(item)
      }
      commit('setItems', [
        ...state.items,
        {
          type: item.type,
          id: item.id,
        },
      ])
    },
    removeMute: (
      { commit, state },
      param: {
        item: { type: MuteTargetType; id: number }
        isSync: boolean
      }
    ) => {
      const item = param.item
      if (!state.items.some((m) => m.id === item.id && m.type === item.type)) {
        return
      }
      const api = getAPI()
      if (param.isSync && api !== null) {
        api.itemMute.remove(item)
      }
      const items = state.items.filter(
        (m) => !(m.id === item.id && m.type === item.type)
      )
      commit('setItems', items)
    },
  }
)
