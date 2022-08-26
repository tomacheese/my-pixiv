import { actionTree, getterTree, mutationTree } from 'typed-vuex'
import { PixivItem } from '@/types/pixivItem'

interface Viewed {
  illusts: number[]
  novels: number[]
}

export const state = (): Viewed => ({
  illusts: [],
  novels: []
})

export type RootState = ReturnType<typeof state>

export const getters = getterTree(state, {
  illusts: (state) => state.illusts,
  isIllustViewed: (state) => (illustId: number) => {
    return state.illusts.includes(illustId)
  },
  novels: (state) => state.novels,
  isNovelViewed: (state) => (novelId: number) => {
    return state.novels.includes(novelId)
  }
})

export const mutations = mutationTree(state, {
  setIllusts: (state, illusts: number[]) => {
    state.illusts = illusts
  },
  setNovels: (state, novels: number[]) => {
    state.novels = novels
  }
})

export const actions = actionTree(
  { state, getters, mutations },
  {
    addIllust: ({ commit, state }, item: PixivItem) => {
      if (state.illusts.includes(item.id)) {
        return
      }
      commit('setIllusts', [...state.illusts, item.id])
    },
    addNovel: ({ commit, state }, item: PixivItem) => {
      if (state.novels.includes(item.id)) {
        return
      }
      commit('setNovels', [...state.novels, item.id])
    }
  }
)
