import { actionTree, getterTree, mutationTree } from 'typed-vuex'

export type TargetType = 'ILLUST' | 'MANGA' | 'NOVEL'

export type ViewType = 'PAGINATION' | 'VIRTUAL_SCROLL' | 'GRID_LIST'

export interface Target {
  targetType: TargetType[]
  tag: string[]
  ignores: string[]
  minLikeCount: number
}

export interface Filter {
  type: 'TITLE' | 'AUTHOR' | 'TAG' | 'ALL'
  value: string
}

export type MuteTargetType = 'ILLUST' | 'NOVEL' | 'USER'

export interface MuteItem {
  targetType: MuteTargetType
  targetId: number
}

interface Settings {
  isDarkMode: boolean
  isOnlyNew: boolean
  isAutoSyncVieweds: boolean
  viewType: ViewType
  novelViewType: ViewType
  paginationLimit: number
  appCheckTimeout: number
  targets: Target[]
  filters: Filter[]
  muted: MuteItem[]
}

export const state = (): Settings => ({
  isDarkMode: false,
  isOnlyNew: false,
  isAutoSyncVieweds: false,
  viewType: 'PAGINATION',
  novelViewType: 'PAGINATION',
  paginationLimit: 10,
  appCheckTimeout: 700,
  targets: [],
  filters: [],
  muted: [],
})

export type RootState = ReturnType<typeof state>

export const getters = getterTree(state, {
  settings: (state) => state,
  darkMode: (state) => state.isDarkMode,
  onlyNew: (state) => state.isOnlyNew,
  autoSyncVieweds: (state) => state.isAutoSyncVieweds,
  viewType: (state) => state.viewType,
  novelViewType: (state) => state.novelViewType,
  paginationLimit: (state) => state.paginationLimit,
  appCheckTimeout: (state) => state.appCheckTimeout,
  targets: (state) => state.targets,
  specificTargets: (state) => (targetType: TargetType) => {
    return state.targets.filter((target) =>
      target.targetType.includes(targetType)
    )
  },
  filters: (state) => state.filters,
  muted: (state) => state.muted,
})

export const mutations = mutationTree(state, {
  setAllSettings: (state, settings: Settings) => {
    if (settings.isDarkMode !== undefined)
      state.isDarkMode = settings.isDarkMode
    if (settings.isOnlyNew !== undefined) state.isOnlyNew = settings.isOnlyNew
    if (settings.isAutoSyncVieweds !== undefined)
      state.isAutoSyncVieweds = settings.isAutoSyncVieweds
    if (settings.viewType !== undefined) state.viewType = settings.viewType
    if (settings.novelViewType !== undefined)
      state.novelViewType = settings.novelViewType
    if (settings.paginationLimit !== undefined)
      state.paginationLimit = settings.paginationLimit
    if (settings.appCheckTimeout !== undefined)
      state.appCheckTimeout = settings.appCheckTimeout
    if (settings.targets !== undefined) state.targets = settings.targets
    if (settings.filters !== undefined) state.filters = settings.filters
    if (settings.muted !== undefined) state.muted = settings.muted
  },
  setDarkMode(state, isDarkMode: boolean) {
    state.isDarkMode = isDarkMode
  },
  setOnlyNew(state, isOnlyNew: boolean) {
    state.isOnlyNew = isOnlyNew
  },
  setAutoSyncVieweds(state, isAutoSyncVieweds: boolean) {
    state.isAutoSyncVieweds = isAutoSyncVieweds
  },
  setViewType(state, viewType: ViewType) {
    state.viewType = viewType
  },
  setNovelViewType(state, novelViewType: ViewType) {
    state.novelViewType = novelViewType
  },
  setPaginationLimit(state, paginationLimit: number) {
    state.paginationLimit = paginationLimit
  },
  setAppCheckTimeout(state, appCheckTimeout: number) {
    state.appCheckTimeout = appCheckTimeout
  },
  setTargets: (state, targets: Target[]) => {
    state.targets = targets
  },
  setFilters(state, filters: Filter[]) {
    state.filters = filters
  },
  setMuted(state, muted: MuteItem[]) {
    state.muted = muted
  },
})

export const actions = actionTree(
  { state, getters, mutations },
  {
    setAllSettings: ({ commit }, settings: Settings) => {
      commit('setAllSettings', settings)
    },
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
    addMuteItem({ state, commit }, muteItem: MuteItem) {
      commit('setMuted', [...state.muted, muteItem])
    },
    removeMuteItem({ state, commit }, muteItem: MuteItem) {
      commit(
        'setMuted',
        state.muted.filter(
          (m) =>
            m.targetType !== muteItem.targetType ||
            m.targetId !== muteItem.targetId
        )
      )
    },
  }
)
