import createPersistedState from "vuex-persistedstate";

export default ({ store }: any) => {
  createPersistedState({
    key: "vuex",
    paths: ["settings"],
    storage: window.localStorage,
  })(store);
};
