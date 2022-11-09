import { actionTree, getterTree, mutationTree } from 'typed-vuex'

interface Auth {
  password: string
}

export const state = (): Auth => ({
  password: '',
})

export type RootState = ReturnType<typeof state>

export const getters = getterTree(state, {
  password: (state) => state.password,
})

export const mutations = mutationTree(state, {
  setPassword(state, password: string) {
    state.password = password
  },
})

export const actions = actionTree({ state, getters, mutations }, {})
