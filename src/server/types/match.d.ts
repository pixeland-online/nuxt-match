import type { UUID } from "node:crypto";
import type { Peer, Message } from "crossws";

export type MatchMeta = {
  description: string;
};

export type MatchState = {};

export type MatchOptions = Record<string, any>;

export type MatchHandler<T extends MatchState> = (
  name: string,
  options: MatchOptions
) => Match<T>;

export type MatchClient = {
  peer: Peer;
  status: "JOIN" | "LEAVE" | "IDLE";
};

export type MatchContext = {
  uuid: UUID;
  name: string;
  clients: MatchClient[];
  queues: MatchQueue[];
};

export type MatchConfig<T extends MatchState> = {
  init: (options: MatchOptions) => {
    state: T;
    tickrate: number;
    label: string;
  };
  update: (
    state: T,
    tick: number,
    messages: { sender: Peer["id"]; data: Message }[]
  ) => T | null;
  join: (state: T, tick: number, clients: Peer["id"][]) => T;
  join_attempt: (state: T, tick: number, client: Peer["id"]) => boolean;
  leave: (state: T, tick: number, clients: Peer["id"][]) => T;
  terminate: (state: T, tick: number) => T;
  request: (state: T, tick, data: any) => { state: T; response?: any };
};

// TODO Logic message
export type MatchQueue = {
  message: Message;
  peer: Peer;
};

export type Match<T extends MatchState> = {
  context: MatchContext;
  state: T;
  tick: number;
  label: string;
  config: MatchConfig<T>;
  runner: NodeJS.Timeout;
};
