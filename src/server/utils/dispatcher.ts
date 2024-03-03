import type { ClientRaw } from "./client";
import type { Match } from "./match";

export class Dispatcher {
  #match: Match;

  constructor(match: Match) {
    this.#match = match;
  }

  broadcast(
    message: string,
    clients: Array<ClientRaw["clientId"]> = [],
    key?: string
  ) {
    let targets = this.#match.clients;

    if (clients.length > 0) {
      targets = targets.filter((target) => clients.includes(target.id));
    }

    for (let target of targets) {
      target.send(message, key);
    }
  }
}
