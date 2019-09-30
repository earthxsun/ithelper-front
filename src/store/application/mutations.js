export const SET_USERNAME = (state, data) => {
  state.username = data
}

export const SET_ROLE = (state, data) => {
  state.role = data
}

export const SET_TOKEN = (state, data) => {
  state.token = data
}

export const SET_FINGER = (state, data) => {
  state.finger = data
}

export const generateRoutes = (state, data) => {
  state.accessRoutes = data
}

export const clearState = (state) => {
  state.username = ''
  state.token = ''
  state.accessRoutes = []
}
