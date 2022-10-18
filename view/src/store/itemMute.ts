import { actionTree, getterTree, mutationTree } from 'typed-vuex'
import { getClient } from '@/plugins/muteSync'

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
      item: { type: MuteTargetType; id: number }
    ) => {
      if (state.items.some((m) => m.id === item.id && m.type === item.type)) {
        return
      }
      const client = getClient()
      if (client !== null) {
        client.send(
          JSON.stringify({
            action: 'add-mute',
            item: {
              type: item.type,
              id: item.id,
            },
          })
        )
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
      item: { type: MuteTargetType; id: number }
    ) => {
      if (!state.items.some((m) => m.id === item.id && m.type === item.type)) {
        return
      }
      const client = getClient()
      if (client !== null) {
        client.send(
          JSON.stringify({
            action: 'remove-mute',
            item: {
              type: item.type,
              id: item.id,
            },
          })
        )
      }
      const items = state.items.filter(
        (m) => !(m.id === item.id && m.type === item.type)
      )
      commit('setItems', items)
    },
  }
)
