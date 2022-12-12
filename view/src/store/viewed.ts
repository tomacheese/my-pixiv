import { actionTree, getterTree, mutationTree } from 'typed-vuex'
import { ViewedItem } from 'my-pixiv-types'
import { getAPI } from '@/plugins/websocket'

interface Viewed {
  illusts: number[] | null
  novels: number[] | null
  items: ViewedItem[]
}

export const state = (): Viewed => ({
  illusts: null,
  novels: null,
  items: [],
})

export type RootState = ReturnType<typeof state>

export const getters = getterTree(state, {
  allVieweds: (state) => state,
  illusts: (state) => state.illusts,
  isIllustViewed: (state) => (illustId: number) => {
    return state.items.some(
      (item) => item.type === 'illust' && item.id === illustId
    )
  },
  novels: (state) => state.novels,
  isNovelViewed: (state) => (novelId: number) => {
    return state.items.some(
      (item) => item.type === 'novel' && item.id === novelId
    )
  },
})

export const mutations = mutationTree(state, {
  setAllVieweds: (
    state,
    vieweds: {
      items: ViewedItem[]
    }
  ) => {
    if (vieweds.items !== undefined) state.items = vieweds.items
  },
  migration: (state) => {
    // v2からv3へのマイグレーション
    if (state.illusts !== null) {
      console.log('migration illusts')
      state.items = state.items.filter((item) => item.type !== 'illust')
      state.items.push(
        ...state.illusts.map((illustId) => {
          return {
            type: 'illust',
            id: illustId,
            addedAt: new Date().toISOString(),
          } as ViewedItem
        })
      )
      state.illusts = null
      console.log(
        'illusts migration done. items:',
        state.items.filter((item) => item.type === 'illust').length
      )
    }
    if (state.novels !== null) {
      console.log('migrating novels')
      state.items = state.items.filter((item) => item.type !== 'novel')
      state.items.push(
        ...state.novels.map((novelId) => {
          return {
            type: 'novel',
            id: novelId,
            addedAt: new Date().toISOString(),
          } as ViewedItem
        })
      )
      state.novels = null
      console.log(
        'novels migration done. items:',
        state.items.filter((item) => item.type === 'novel').length
      )
    }
  },
  setItems: (state, items: ViewedItem[]) => {
    state.items = items
  },
})

export const actions = actionTree(
  { state, getters, mutations },
  {
    addIllust: (
      { commit, state },
      param: {
        itemId: number
        isSync: boolean
      }
    ) => {
      const itemId = param.itemId
      if (
        state.items.some((item) => item.type === 'illust' && item.id === itemId)
      ) {
        return
      }
      if (param.isSync) {
        const api = getAPI()
        if (param.isSync && api !== null) {
          api.viewed.add({
            type: 'illust',
            id: itemId,
            addedAt: new Date().toISOString(),
          })
        }
      }
      commit('setItems', [
        ...state.items,
        {
          type: 'illust',
          id: itemId,
          addedAt: new Date().toISOString(),
        },
      ])
    },
    addNovel: (
      { commit, state },
      param: {
        itemId: number
        isSync: boolean
      }
    ) => {
      const itemId = param.itemId
      if (
        state.items.some((item) => item.type === 'novel' && item.id === itemId)
      ) {
        return
      }
      if (param.isSync) {
        const api = getAPI()
        if (param.isSync && api !== null) {
          api.viewed.add({
            type: 'novel',
            id: itemId,
            addedAt: new Date().toISOString(),
          })
        }
      }
      commit('setItems', [
        ...state.items,
        {
          type: 'novel',
          id: itemId,
          addedAt: new Date().toISOString(),
        },
      ])
    },
  }
)
