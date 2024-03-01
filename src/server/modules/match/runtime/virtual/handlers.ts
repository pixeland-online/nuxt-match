import type { MatchHandler, MatchMeta } from "../../../../types/match";

export const handlers: Record<
  string,
  { resolve: () => Promise<MatchHandler<any>>; meta: MatchMeta }
> = {};
