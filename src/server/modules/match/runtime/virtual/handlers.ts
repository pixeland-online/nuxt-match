import type { Match, MatchOptions } from "../../../../utils/match";

export const handlers: Record<
  string,
  { resolve: () => Promise<(name: string, options: MatchOptions) => Match> }
> = {};
