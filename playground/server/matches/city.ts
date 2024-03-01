interface State {
  players: Record<string, { x: number; y: number }>;
  destroyTimeLeft: number;
}

export default defineMatch<State>({
  init(options) {
    return {
      state: { players: {}, destroyTimeLeft: 10 },
      tickrate: 1,
      label: "city",
    };
  },
  update(state, tick, messages) {
    for (let { sender, data } of messages) {
      if (data.text() == "ping") {
        // Example Broadcast Target Client (sender): dispatcher.broadcast("pong", [sender])
        // Example Broadcast All CLient: dispatcher.broadcast("pong")
        // Implement dispatcher so that there are no duplicate messages sent,
        // that is, if the recipient has duplicates, then they will not be sent.
        // This will allow optimizations such as player movement
        // Example:
        // for (let i = 0; i < 10; i++) {
        //   dispatcher.broadcast("pong", [sender])
        // }
        // During the current tick, 1 message will be sent to recipients and not 10 times
        // Since 1 argument is strictly checked for duplicates, even strings, numbers or objects
      }
    }

    if (Object.entries(state.players).length == 0) {
      state.destroyTimeLeft--;
    }

    if (state.destroyTimeLeft == 0) {
      console.log("destroy match");
      return null; // destroy match
    } else {
      console.log("update match");
    }

    return state;
  },
  join(state, tick, clients) {
    console.log("join", clients);

    for (let client of clients) {
      state.players[client] = { x: 0, y: 0 };
      // Example Broadcast: dispatcher.broadcast("player.join", client)
    }

    state.destroyTimeLeft = 10; // Restored 10 sec time

    return state;
  },
  join_attempt(state, tick, client) {
    return true;
  },
  leave(state, tick, clients) {
    console.log("leave", clients);

    for (let client of clients) {
      delete state.players[client];
      // Example Broadcast: dispatcher.broadcast("player.leave", client)
    }

    return state;
  },
  terminate(state, tick) {
    return state;
  },
  request(state, tick, data) {
    return { state };
  },
});
