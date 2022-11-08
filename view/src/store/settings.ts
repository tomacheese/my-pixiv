import { actionTree, getterTree, mutationTree } from 'typed-vuex'

export type TargetType = 'ILLUST' | 'MANGA' | 'NOVEL'

export type ViewType = 'PAGINATION' | 'VIRTUAL_SCROLL' | 'GRID_LIST'

export interface Target {
  targetType: TargetType[]
  tag: string[]
  ignores: string[]
  minLikeCount: number
  searchItemCount: number
}

export interface Filter {
  type: 'TITLE' | 'CAPTION' | 'TAG'
  value: string
}

export type ActionPosition = 'LEFT' | 'RIGHT'

export type GetTweetTiming = 'POPUP_OPEN' | 'IMAGE_LOADED'

interface Settings {
  isDarkMode: boolean
  isOnlyNew: boolean
  isAutoSyncVieweds: boolean
  isAutoSyncMutes: boolean
  viewType: ViewType
  novelViewType: ViewType
  paginationLimit: number
  appCheckTimeout: number
  actionPosition: ActionPosition
  headerSticky: boolean
  getTweetTiming: GetTweetTiming
  targets: Target[]
  filters: Filter[]
}

export const state = (): Settings => ({
  isDarkMode: false,
  isOnlyNew: false,
  isAutoSyncVieweds: false,
  isAutoSyncMutes: false,
  viewType: 'PAGINATION',
  novelViewType: 'PAGINATION',
  paginationLimit: 10,
  appCheckTimeout: 700,
  actionPosition: 'RIGHT',
  headerSticky: false,
  getTweetTiming: 'POPUP_OPEN',
  targets: [],
  filters: [],
})

export type RootState = ReturnType<typeof state>

export const getters = getterTree(state, {
  settings: (state) => state,
  darkMode: (state) => state.isDarkMode,
  onlyNew: (state) => state.isOnlyNew,
  autoSyncVieweds: (state) => state.isAutoSyncVieweds,
  autoSyncMutes: (state) => state.isAutoSyncMutes,
  viewType: (state) => state.viewType,
  novelViewType: (state) => state.novelViewType,
  paginationLimit: (state) => state.paginationLimit,
  appCheckTimeout: (state) => state.appCheckTimeout,
  actionPosition: (state) => state.actionPosition,
  headerSticky: (state) => state.headerSticky,
  getTweetTiming: (state) => state.getTweetTiming,
  targets: (state) => state.targets,
  specificTargets: (state) => (targetType: TargetType) => {
    return state.targets.filter((target) =>
      target.targetType.includes(targetType)
    )
  },
  filters: (state) => state.filters,
})

export const mutations = mutationTree(state, {
  setAllSettings: (state, settings: Settings) => {
    if (settings.isDarkMode !== undefined)
      state.isDarkMode = settings.isDarkMode
    if (settings.isOnlyNew !== undefined) state.isOnlyNew = settings.isOnlyNew
    if (settings.isAutoSyncVieweds !== undefined)
      state.isAutoSyncVieweds = settings.isAutoSyncVieweds
    if (settings.isAutoSyncMutes !== undefined)
      state.isAutoSyncMutes = settings.isAutoSyncMutes
    if (settings.viewType !== undefined) state.viewType = settings.viewType
    if (settings.novelViewType !== undefined)
      state.novelViewType = settings.novelViewType
    if (settings.paginationLimit !== undefined)
      state.paginationLimit = settings.paginationLimit
    if (settings.appCheckTimeout !== undefined)
      state.appCheckTimeout = settings.appCheckTimeout
    if (settings.actionPosition !== undefined)
      state.actionPosition = settings.actionPosition
    if (settings.headerSticky !== undefined)
      state.headerSticky = settings.headerSticky
    if (settings.getTweetTiming !== undefined)
      state.getTweetTiming = settings.getTweetTiming
    if (settings.targets !== undefined) state.targets = settings.targets
    if (settings.filters !== undefined) state.filters = settings.filters
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
  setAutoSyncMutes(state, isAutoSyncMutes: boolean) {
    state.isAutoSyncMutes = isAutoSyncMutes
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
  setActionPosition(state, actionPosition: ActionPosition) {
    state.actionPosition = actionPosition
  },
  setHeaderSticky(state, headerSticky: boolean) {
    state.headerSticky = headerSticky
  },
  setGetTweetTiming(state, getTweetTiming: GetTweetTiming) {
    state.getTweetTiming = getTweetTiming
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
  }
)
