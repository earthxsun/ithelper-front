const state = {
  num: 1
}

const mutations = {
  SET_NUM: (state, data) => {
    state.num += data
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
