import { randomUUID, type UUID } from "node:crypto";
import type { Peer, Message } from "crossws";
import type {
  Match,
  MatchConfig,
  MatchHandler,
  MatchOptions,
  MatchState,
} from "../types/match";

//@ts-ignore
import { handlers } from "#internal/pixeland/virtual/handlers";

const matches: Record<UUID, Match<any>> = {};

export function defineMatch<T extends MatchState>(config: MatchConfig<T>) {
  const handler: MatchHandler<T> = (name, options) => {
    const { state, tickrate, label } = config.init(options);

    const runner = setInterval(() => {
      const join = match.context.clients
        .filter((client) => client.status == "JOIN")
        .map((client) => client.peer.id);
      const leave = match.context.clients
        .filter((client) => client.status == "LEAVE")
        .map((client) => client.peer.id);

      if (join.length > 0) {
        config.join(match.state, match.tick, join);

        for (let id of join) {
          const client = match.context.clients.find(
            (client) => client.peer.id == id
          );

          if (client) {
            client.status = "IDLE";
          }
        }
      }

      if (leave.length > 0) {
        config.leave(match.state, match.tick, leave);

        match.context.clients = match.context.clients.filter(
          (client) => !leave.includes(client.peer.id)
        );
      }

      const result = config.update(
        match.state,
        match.tick,
        match.context.queues
          .slice(0, match.context.queues.length)
          .map((queue) => ({ sender: queue.peer.id, data: queue.message }))
      );

      if (!result) {
        clearInterval(match.runner);
        delete matches[match.context.uuid];
      }

      match.tick++;
    }, 1000 / Math.max(1, Math.min(60, tickrate)));

    const match: Match<T> = {
      context: { uuid: randomUUID(), name, clients: [], queues: [] }, // TODO Replace to dispatcher
      state,
      tick: 0,
      label,
      config,
      runner,
    };

    matches[match.context.uuid] = match;

    return match;
  };

  return handler;
}

// TODO Replace arguments (no use callback)
// Example find matches
export function serverMatchFind<T extends MatchState>(
  callback: (match: Match<T>) => boolean
) {
  return Object.entries(matches)
    .filter(([_, match]) => callback(match))
    .map(([_, match]) => ({
      uuid: match.context.uuid,
      name: match.context.name,
      clients: match.context.clients.length,
    }));
}

export async function serverMatchCreate<T extends MatchState>(
  name: string,
  options: MatchOptions = {}
) {
  if (!handlers[name]) {
    throw new Error("No found handler match");
  }

  const target = handlers[name];
  const handler = await target.resolve();
  const match = handler(name, options) as Match<T>;

  return match;
}

export function serverMatchRequest(id: UUID, data: any) {
  if (!matches[id]) {
    throw new Error("No found instance match");
  }

  const match = matches[id];
  const result = match.config.request(match.state, match.tick, data);

  return result.response || undefined;
}

export function serverMatchMessage(id: UUID, peer: Peer, message: Message) {
  if (!matches[id]) {
    throw new Error("No found instance match");
  }

  const match = matches[id];
  match.context.queues.push({ peer, message });
}

export function serverMatchJoinAttempt(id: UUID, peer: Peer) {
  if (!matches[id]) {
    throw new Error("No found instance match");
  }

  const match = matches[id];
  return match.config.join_attempt(match.state, match.tick, peer.id);
}

export function serverMatchJoin(id: UUID, peer: Peer) {
  if (!matches[id]) {
    throw new Error("No found instance match");
  }

  const match = matches[id];
  match.context.clients.push({ peer, status: "JOIN" });
}

export function serverMatchLeave(id: UUID, peer: Peer) {
  if (!matches[id]) {
    throw new Error("No found instance match");
  }

  const match = matches[id];
  const target = match.context.clients.find(
    (client) => client.peer.id == peer.id
  );

  if (target) {
    if (target.status == "IDLE") {
      target.status = "LEAVE";
    } else if (target.status == "JOIN") {
      match.context.clients = match.context.clients.filter(
        (client) => client.peer.id != target.peer.id
      );
    }
  }
}
