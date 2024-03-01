export default defineMatch({
  init(options) {
    return { state: { players: [] }, tickrate: 1, label: "city" };
  },
  update(state, tick) {
    console.log("update", tick);

    if (tick >= 10) {
      return null;
    }

    return state;
  },
  join(state, tick) {
    return state;
  },
  join_attempt(state, tick) {
    return true;
  },
  leave(state, tick) {
    return state;
  },
  terminate(state, tick) {
    return state;
  },
});
