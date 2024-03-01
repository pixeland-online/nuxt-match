export default definePixelandMatch({
  init(options) {
    return { state: { players: [] }, tickrate: 20, label: 'city' }
  },
  update(state, tick) {
    console.log('update', tick)

    if (tick >= 1000) {
      return null
    }

    return state
  },
  join(state, tick) {
    return state
  },
  join_attempt(state, tick) {
    return true
  },
  leave(state, tick) {
    return state
  },
  terminate(state, tick) {
    return state
  },
})