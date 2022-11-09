import createPersistedState from 'vuex-persistedstate'

export default ({ store }: any) => {
  createPersistedState({
    key: 'vuex',
    paths: ['settings', 'viewed', 'itemMute', 'auth'],
    storage: window.localStorage,
  })(store)
}
