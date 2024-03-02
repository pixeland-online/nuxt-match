//@ts-ignore
import { handlers } from "#internal/pixeland/virtual/handlers";
import {
  type MatchOptions,
  type MatchState,
  type MatchHandler,
  Match,
} from "./match";
import type { UUID } from "crypto";
import type { Peer, Message } from "crossws";

export function defineMatchHandler<T extends MatchState>(
  handler: MatchHandler<T>
) {
  return (name: string, options: MatchOptions) => {
    return new Match(name, handler, options);
  };
}

export async function serverMatchCreate(
  name: string,
  options: MatchOptions = {}
) {
  if (!handlers[name]) {
    throw new Error("No found handler match");
  }

  const handler = handlers[name];
  const create = (await handler.resolve()) as (
    name: string,
    options: MatchOptions
  ) => Match;
  const match = create(name, options);

  return match;
}

export function eventMatchJoin(matchId: UUID, peer: Peer) {
  const match = Match.instances.find((match) => match.id == matchId);

  if (!match) {
    throw new Error("No found instance match");
  }

  match.join(peer);
}

export function eventMatchLeave(matchId: UUID, peer: Peer) {
  const match = Match.instances.find((match) => match.id == matchId);

  if (!match) {
    throw new Error("No found instance match");
  }

  match.leave(peer);
}

export function eventMatchMessage(matchId: UUID, peer: Peer, message: Message) {
  const match = Match.instances.find((match) => match.id == matchId);

  if (!match) {
    throw new Error("No found instance match");
  }

  match.message(peer, message);
}
