import type { UUID } from "node:crypto";

export type MatchMeta = {
  description: string;
};
export type MatchState = {};
export type MatchOptions = Record<string, any>;
export type MatchHandler<T extends MatchState> = (
  options: MatchOptions
) => Match<T>;

export type MatchConfig<T extends MatchState> = {
  init: (options: MatchOptions) => {
    state: T;
    tickrate: number;
    label: string;
  };
  update: (state: T, tick: number) => T | null;
  join: (state: T, tick: number) => T;
  join_attempt: (state: T, tick: number) => boolean;
  leave: (state: T, tick: number) => T;
  terminate: (state: T, tick: number) => T;
};

export type MathMessage = {};

export type Match<T extends MatchState> = {
  uuid: UUID;
  state: T;
  tick: number;
  label: string;
  config: MatchConfig<T>;
  runner: NodeJS.Timeout;
};
