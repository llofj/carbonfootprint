const state = {
  show: false,
  content: '',
  type: 'info'
}

const mutations = {
  SHOW_MESSAGE(state, { content, type = 'info' }) {
    state.show = true
    state.content = content
    state.type = type
  },
  HIDE_MESSAGE(state) {
    state.show = false
  }
}

const actions = {
  showMessage({ commit }, { content, type = 'info' }) {
    commit('SHOW_MESSAGE', { content, type })
    setTimeout(() => {
      commit('HIDE_MESSAGE')
    }, 5000)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 