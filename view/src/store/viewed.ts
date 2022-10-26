import { actionTree, getterTree, mutationTree } from 'typed-vuex'
import { getAPI } from '@/plugins/websocket'

interface Viewed {
  illusts: number[]
  novels: number[]
}

export const state = (): Viewed => ({
  illusts: [],
  novels: [],
})

export type RootState = ReturnType<typeof state>

export const getters = getterTree(state, {
  allVieweds: (state) => state,
  illusts: (state) => state.illusts,
  isIllustViewed: (state) => (illustId: number) => {
    return state.illusts.includes(illustId)
  },
  novels: (state) => state.novels,
  isNovelViewed: (state) => (novelId: number) => {
    return state.novels.includes(novelId)
  },
})

export const mutations = mutationTree(state, {
  setAllVieweds: (state, vieweds: Partial<Viewed>) => {
    if (vieweds.illusts !== undefined) state.illusts = vieweds.illusts
    if (vieweds.novels !== undefined) state.novels = vieweds.novels
  },
  setIllusts: (state, illusts: number[]) => {
    state.illusts = illusts
  },
  setNovels: (state, novels: number[]) => {
    state.novels = novels
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
      if (state.illusts.includes(itemId)) {
        return
      }
      if (param.isSync) {
        const api = getAPI()
        if (param.isSync && api !== null) {
          api.viewed.add({
            type: 'illust',
            id: itemId,
          })
        }
      }
      commit('setIllusts', [...state.illusts, itemId])
    },
    addNovel: (
      { commit, state },
      param: {
        itemId: number
        isSync: boolean
      }
    ) => {
      const itemId = param.itemId
      if (state.novels.includes(itemId)) {
        return
      }
      if (param.isSync) {
        const api = getAPI()
        if (param.isSync && api !== null) {
          api.viewed.add({
            type: 'novel',
            id: itemId,
          })
        }
      }
      commit('setNovels', [...state.novels, itemId])
    },
  }
)
