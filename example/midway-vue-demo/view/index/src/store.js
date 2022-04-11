import { createStore as _createStore } from 'vuex';
const moduleB = {
  state: () => ({
    bb:11,
  }),

}
export function createStore() {
  return _createStore({
    state () {
      return {
        count: 0
      }
    },
    mutations: {
      increment (state) {
        state.count++
      }
    },
    modules:{moduleB}
  })
}
