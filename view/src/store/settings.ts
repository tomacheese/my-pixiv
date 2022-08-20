import { actionTree, getterTree, mutationTree } from 'typed-vuex'

export type TargetType = 'ILLUST' | 'NOVEL'

interface Target {
  targetType: TargetType[]
  tag: string[]
  ignores: string[]
  minLikeCount: number
}

interface Filter {
  type: 'TITLE' | 'AUTHOR' | 'TAG' | 'ALL'
  value: string
}

interface Settings {
  isDarkMode: boolean
  targets: Target[]
  filters: Filter[]
}

export const state = (): Settings => ({
  isDarkMode: false,
  targets: [],
  filters: [],
})

export type RootState = ReturnType<typeof state>

export const getters = getterTree(state, {
  darkMode: (state) => state.isDarkMode,
  targets: (state) => state.targets,
  filters: (state) => state.filters,
})

export const mutations = mutationTree(state, {
  setDarkMode(state, isDarkMode: boolean) {
    state.isDarkMode = isDarkMode
  },
  setTargets: (state, targets: Target[]) => {
    state.targets = targets
  },
  setFilters(state, filters: Filter[]) {
    state.filters = filters
  },
})

export const actions = actionTree(
  { state, getters, mutations },
  {
    addTarget({ state, commit }, target: Target) {
      commit('setTargets', [...state.targets, target])
    },
    updateTarget({ state, commit }, params: { index: number; target: Target }) {
      commit(
        'setTargets',
        state.targets.map((t, i) => (i === params.index ? params.target : t))
      )
    },
    removeTarget({ state, commit }, target: Target) {
      commit(
        'setTargets',
        state.targets.filter((t) => t !== target)
      )
    },
    addFilter({ state, commit }, filter: Filter) {
      if (filter.value.trim().length === 0) {
        return
      }
      if (
        state.filters.some(
          (f) => f.type === filter.type && f.value === filter.value
        )
      ) {
        return
      }
      commit('setFilters', [...state.filters, filter])
    },
    removeFilter({ state, commit }, filter: Filter) {
      commit(
        'setFilters',
        state.filters.filter(
          (f) => f.type !== filter.type || f.value !== filter.value
        )
      )
    },
  }
)
