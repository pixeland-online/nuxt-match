interface State {
  players: Record<string, { x: number; y: number }>;
  destroyTimeLife: number;
}

export default defineMatchHandler<State>({
  init(options) {
    return {
      state: { players: {}, destroyTimeLife: 10 },
      tickrate: 1,
    };
  },
  update(state, dispatcher, tick, messages) {
    if (Object.entries(state.players).length == 0) {
      state.destroyTimeLife--;
    }

    if (state.destroyTimeLife == 0) {
      console.log("destroy match", tick);
      return null;
    } else {
      console.log("update match", tick);
    }

    return state;
  },
  join(state, dispatcher, tick, clients) {
    console.log("join", tick, clients);

    for (let client of clients) {
      state.players[client] = { x: 0, y: 0 };
    }

    state.destroyTimeLife = 10;

    return state;
  },
  join_attempt(state, dispatcher, tick, client) {
    console.log("join_attempt", tick, client);

    return true; // check limit room or only vip, more ideas
  },
  leave(state, dispatcher, tick, clients) {
    console.log("leave", tick, clients);

    for (let client of clients) {
      delete state.players[client];
    }

    return state;
  },
});
