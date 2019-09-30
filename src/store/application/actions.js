// export function someAction (/* context */) {
// }

export const addnum = ({
  commit
}, data) => {
  commit('SET_NUM', data)
}
