import createPersistedState from 'vuex-persistedstate'

export default ({ store }: any) => {
  createPersistedState({
    key: 'vuex',
    paths: ['settings', 'viewed'],
    storage: window.localStorage
  })(store)
}
