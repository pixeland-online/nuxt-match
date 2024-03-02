import type { ClientRaw } from "./client";
import type { Match } from "./match";

export type DispatcherData = string;

export class Dispatcher {
  #match: Match;

  constructor(match: Match) {
    this.#match = match;
  }

  broadcast<T extends DispatcherData>(
    data: T,
    clients: Array<ClientRaw["clientId"]> = []
  ) {
    let targets = this.#match.clients;

    if (clients.length > 0) {
      targets = targets.filter((target) =>
        clients.includes(target.raw.clientId)
      );
    }

    for (let target of targets) {
      target.send(data);
    }
  }
}
