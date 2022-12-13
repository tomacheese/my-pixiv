import createPersistedState from 'vuex-persistedstate'

/**
 * LocalStorage を使った Vuex の永続化
 */
export default ({ store }: any) => {
  createPersistedState({
    key: 'vuex',
    paths: ['settings', 'viewed', 'itemMute', 'auth'],
    storage: window.localStorage,
  })(store)
}
