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
    console.log("messages", tick, messages);

    // Example ping/pong
    for (let { client, message } of messages) {
      if (message.text() == "ping") {
        dispatcher.broadcast("pong", [client]);
      }
    }

    if (Object.entries(state.players).length == 0) {
      state.destroyTimeLife--;
    }

    if (state.destroyTimeLife == 0) {
      console.log("destroy match", tick);
      return null;
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
  signal(state, dispatcher, tick, data) {
    // example api signal close
    if (data == "close") {
      return { state: null };
    }

    return { state };
  },
});
