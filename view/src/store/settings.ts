import { ImageUrls } from 'my-pixiv-types'
import { actionTree, getterTree, mutationTree } from 'typed-vuex'
import { isPixivIllustItem, PixivItem } from '@/types/pixiv-item'

/**
 * 対象種別
 */
export type TargetType = 'ILLUST' | 'MANGA' | 'NOVEL'

export type ViewType = 'PAGINATION' | 'VIRTUAL_SCROLL' | 'GRID_LIST'

/**
 * 検索ターゲット情報
 */
export interface Target {
  targetType: TargetType[]
  tag: string[]
  ignores: string[]
  minLikeCount: number
  searchItemCount: number
}

/**
 * フィルター
 */
export interface Filter {
  type: 'TITLE' | 'CAPTION' | 'TAG'
  value: string
}

/**
 * 画像サイズ
 */
export interface ImageSizes {
  illustList: keyof ImageUrls
  illustGridList: keyof ImageUrls
  illustPopup: keyof ImageUrls
}

/**
 * アクションボタンの位置
 */
export type ActionPosition = 'LEFT' | 'RIGHT'

/**
 * ツイート取得タイミング
 */
export type GetTweetTiming = 'POPUP_OPEN' | 'IMAGE_LOADED'

interface Settings {
  isDarkMode: boolean
  isOnlyNew: boolean
  isExcludeLiked: boolean
  isExcludeR18: boolean
  isAutoSyncVieweds: boolean
  isAutoSyncMutes: boolean
  illustPopupMaxHeight: number
  viewType: ViewType
  novelViewType: ViewType
  paginationLimit: number
  appCheckTimeout: number
  actionPosition: ActionPosition
  headerSticky: boolean
  getTweetTiming: GetTweetTiming
  imageSizes: ImageSizes
  targets: Target[]
  filters: Filter[]
  later: PixivItem[]
}

export const state = (): Settings => ({
  isDarkMode: false,
  isOnlyNew: false,
  isExcludeLiked: false,
  isExcludeR18: false,
  isAutoSyncVieweds: false,
  isAutoSyncMutes: false,
  illustPopupMaxHeight: 100,
  viewType: 'PAGINATION',
  novelViewType: 'PAGINATION',
  paginationLimit: 10,
  appCheckTimeout: 700,
  actionPosition: 'RIGHT',
  headerSticky: false,
  getTweetTiming: 'POPUP_OPEN',
  imageSizes: {
    illustList: 'square_medium',
    illustGridList: 'medium',
    illustPopup: 'original',
  },
  targets: [],
  filters: [],
  later: [],
})

export type RootState = ReturnType<typeof state>

export const getters = getterTree(state, {
  settings: (state) => state,
  darkMode: (state) => state.isDarkMode,
  onlyNew: (state) => state.isOnlyNew,
  excludeLiked: (state) => state.isExcludeLiked,
  excludeR18: (state) => state.isExcludeR18,
  autoSyncVieweds: (state) => state.isAutoSyncVieweds,
  autoSyncMutes: (state) => state.isAutoSyncMutes,
  illustPopupMaxHeight: (state) => state.illustPopupMaxHeight,
  viewType: (state) => state.viewType,
  novelViewType: (state) => state.novelViewType,
  paginationLimit: (state) => state.paginationLimit,
  appCheckTimeout: (state) => state.appCheckTimeout,
  actionPosition: (state) => state.actionPosition,
  headerSticky: (state) => state.headerSticky,
  getTweetTiming: (state) => state.getTweetTiming,
  imageSizes: (state) => state.imageSizes,
  targets: (state) => state.targets,
  specificTargets: (state) => (targetType: TargetType) => {
    return state.targets.filter((target) =>
      target.targetType.includes(targetType)
    )
  },
  filters: (state) => state.filters,
  isFiltered: (state) => (filter: Filter) => {
    return state.filters.some(
      (f) => f.type === filter.type && f.value === filter.value
    )
  },
  later: (state) => state.later,
  isLater: (state) => (item: PixivItem) => {
    return state.later.some(
      (later) =>
        later.id === item.id &&
        isPixivIllustItem(item) === isPixivIllustItem(later)
    )
  },
})

export const mutations = mutationTree(state, {
  setAllSettings: (state, settings: Settings) => {
    if (settings.isDarkMode !== undefined)
      state.isDarkMode = settings.isDarkMode
    if (settings.isOnlyNew !== undefined) state.isOnlyNew = settings.isOnlyNew
    if (settings.isExcludeLiked !== undefined)
      state.isExcludeLiked = settings.isExcludeLiked
    if (settings.isExcludeR18 !== undefined)
      state.isExcludeR18 = settings.isExcludeR18
    if (settings.isAutoSyncVieweds !== undefined)
      state.isAutoSyncVieweds = settings.isAutoSyncVieweds
    if (settings.isAutoSyncMutes !== undefined)
      state.isAutoSyncMutes = settings.isAutoSyncMutes
    if (settings.illustPopupMaxHeight !== undefined)
      state.illustPopupMaxHeight = settings.illustPopupMaxHeight
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
    if (settings.imageSizes !== undefined)
      state.imageSizes = settings.imageSizes
    if (settings.targets !== undefined) state.targets = settings.targets
    if (settings.filters !== undefined) state.filters = settings.filters
    if (settings.later !== undefined) state.later = settings.later
  },
  setDarkMode(state, isDarkMode: boolean) {
    state.isDarkMode = isDarkMode
  },
  setOnlyNew(state, isOnlyNew: boolean) {
    state.isOnlyNew = isOnlyNew
  },
  setExcludeLiked(state, isExcludeLiked: boolean) {
    state.isExcludeLiked = isExcludeLiked
  },
  setExcludeR18(state, isExcludeR18: boolean) {
    state.isExcludeR18 = isExcludeR18
  },
  setAutoSyncVieweds(state, isAutoSyncVieweds: boolean) {
    state.isAutoSyncVieweds = isAutoSyncVieweds
  },
  setAutoSyncMutes(state, isAutoSyncMutes: boolean) {
    state.isAutoSyncMutes = isAutoSyncMutes
  },
  setIllustPopupMaxHeight(state, illustPopupMaxHeight: number) {
    state.illustPopupMaxHeight = illustPopupMaxHeight
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
  setImageSizes(state, imageSizes: ImageSizes) {
    state.imageSizes = imageSizes
  },
  setTargets: (state, targets: Target[]) => {
    state.targets = targets
  },
  setFilters(state, filters: Filter[]) {
    state.filters = filters
  },
  setLater(state, later: PixivItem[]) {
    state.later = later
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
    addLater({ state, commit }, item: PixivItem) {
      commit('setLater', [...state.later, item])
    },
    removeLater({ state, commit }, item: PixivItem) {
      commit(
        'setLater',
        state.later.filter((i) => i !== item)
      )
    },
  }
)
