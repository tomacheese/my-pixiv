import createPersistedState from 'vuex-persistedstate'

export default ({ store }: any) => {
  createPersistedState({
    key: 'vuex',
    paths: ['settings', 'viewed', 'itemMute'],
    storage: window.localStorage,
  })(store)
}
